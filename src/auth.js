import { db } from './db.js';
import { HttpError } from './http.js';

const COOKIE = 'mc_session';
const TTL_MS = 7 * 24 * 60 * 60 * 1000;
// Limite máximo de iterações PBKDF2 aceito pelo runtime da Cloudflare.
const PBKDF2_ITER = 100000;
const MAX_ATTEMPTS = 8;
const ATTEMPT_WINDOW_MS = 15 * 60 * 1000;

const enc = new TextEncoder();

function toHex(buf) {
  return [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, '0')).join('');
}

function randomHex(bytes) {
  return toHex(crypto.getRandomValues(new Uint8Array(bytes)));
}

function safeEqual(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string' || a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

function secret(env) {
  const s = env.AUTH_SECRET;
  if (!s || s.length < 16) {
    throw new HttpError('Configure a variável AUTH_SECRET (mínimo 16 caracteres) na Cloudflare.', 500);
  }
  return s;
}

async function hmac(env, data) {
  const key = await crypto.subtle.importKey(
    'raw', enc.encode(secret(env)), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']
  );
  return toHex(await crypto.subtle.sign('HMAC', key, enc.encode(data)));
}

async function hashPassword(password, salt) {
  const key = await crypto.subtle.importKey('raw', enc.encode(password), 'PBKDF2', false, ['deriveBits']);
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', hash: 'SHA-256', salt: enc.encode(salt), iterations: PBKDF2_ITER },
    key, 256
  );
  return toHex(bits);
}

export async function createPasswordHash(password) {
  const salt = randomHex(16);
  return { salt, hash: await hashPassword(password, salt) };
}

function parseCookies(header) {
  const out = {};
  (header || '').split(';').forEach(part => {
    const i = part.indexOf('=');
    if (i > -1) out[part.slice(0, i).trim()] = decodeURIComponent(part.slice(i + 1).trim());
  });
  return out;
}

export async function createSessionCookie(env, userId, request) {
  const exp = Date.now() + TTL_MS;
  const payload = `${userId}.${exp}`;
  const token = `${payload}.${await hmac(env, payload)}`;
  const secure = new URL(request.url).protocol === 'https:' ? '; Secure' : '';
  return `${COOKIE}=${encodeURIComponent(token)}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${TTL_MS / 1000}${secure}`;
}

export function clearSessionCookie() {
  return `${COOKIE}=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0`;
}

// Retorna o usuário logado ou null.
export async function getUser(request, env) {
  const token = parseCookies(request.headers.get('cookie'))[COOKIE];
  if (!token) return null;
  const parts = token.split('.');
  if (parts.length !== 3) return null;
  const [userId, exp, sig] = parts;
  if (!Number(exp) || Number(exp) < Date.now()) return null;
  if (!safeEqual(sig, await hmac(env, `${userId}.${exp}`))) return null;
  const d = await db(env);
  return d.prepare('SELECT id, email, created_at FROM users WHERE id = ?').bind(userId).first();
}

export async function requireUser(request, env) {
  const user = await getUser(request, env);
  if (!user) throw new HttpError('Não autorizado', 401);
  return user;
}

async function attemptKey(request) {
  const ip = request.headers.get('cf-connecting-ip') || 'local';
  // Guarda só um hash do IP, nunca o IP em si.
  return toHex(await crypto.subtle.digest('SHA-256', enc.encode('login:' + ip))).slice(0, 32);
}

async function checkRateLimit(d, key) {
  const row = await d.prepare('SELECT count, first_ts FROM login_attempts WHERE key = ?').bind(key).first();
  if (row && Date.now() - row.first_ts < ATTEMPT_WINDOW_MS && row.count >= MAX_ATTEMPTS) {
    throw new HttpError('Muitas tentativas. Aguarde 15 minutos e tente de novo.', 429);
  }
}

async function registerFailure(d, key) {
  const now = Date.now();
  await d.prepare(
    `INSERT INTO login_attempts (key, count, first_ts) VALUES (?, 1, ?)
     ON CONFLICT(key) DO UPDATE SET
       count = CASE WHEN ? - first_ts > ? THEN 1 ELSE count + 1 END,
       first_ts = CASE WHEN ? - first_ts > ? THEN ? ELSE first_ts END`
  ).bind(key, now, now, ATTEMPT_WINDOW_MS, now, ATTEMPT_WINDOW_MS, now).run();
}

// Login. Se ainda não existe nenhum usuário, as credenciais ADMIN_EMAIL /
// ADMIN_PASSWORD definidas na Cloudflare criam a primeira conta.
export async function login(request, env, email, password) {
  email = String(email || '').trim().toLowerCase();
  password = String(password || '');
  if (!email || !password) throw new HttpError('Informe email e senha', 400);

  const d = await db(env);
  const key = await attemptKey(request);
  await checkRateLimit(d, key);

  let user = await d.prepare('SELECT id, salt, hash FROM users WHERE email = ?').bind(email).first();

  if (!user) {
    const { n } = await d.prepare('SELECT COUNT(*) AS n FROM users').first();
    const envEmail = String(env.ADMIN_EMAIL || '').trim().toLowerCase();
    if (n === 0 && envEmail && env.ADMIN_PASSWORD &&
        safeEqual(email, envEmail) && safeEqual(password, String(env.ADMIN_PASSWORD))) {
      const id = crypto.randomUUID();
      const { salt, hash } = await createPasswordHash(password);
      await d.prepare('INSERT INTO users (id, email, salt, hash, created_at) VALUES (?, ?, ?, ?, ?)')
        .bind(id, email, salt, hash, Date.now()).run();
      return { id, email };
    }
    await registerFailure(d, key);
    throw new HttpError('Email ou senha incorretos', 401);
  }

  if (!safeEqual(await hashPassword(password, user.salt), user.hash)) {
    await registerFailure(d, key);
    throw new HttpError('Email ou senha incorretos', 401);
  }
  await d.prepare('DELETE FROM login_attempts WHERE key = ?').bind(key).run();
  return { id: user.id, email };
}
