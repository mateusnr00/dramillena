import { requireUser, createPasswordHash } from '../../src/auth.js';
import { db } from '../../src/db.js';
import { json, error, readJson, sameOrigin, handleError } from '../../src/http.js';

async function list(d) {
  const { results } = await d.prepare('SELECT id, email, created_at FROM users ORDER BY created_at').all();
  return results;
}

export async function onRequestGet({ request, env }) {
  try {
    await requireUser(request, env);
    return json({ users: await list(await db(env)) });
  } catch (err) {
    return handleError(err);
  }
}

export async function onRequestPost({ request, env }) {
  if (!sameOrigin(request)) return error('Origem inválida', 403);
  try {
    await requireUser(request, env);
    const { email, password } = await readJson(request, 4096);
    const e = String(email || '').trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)) return error('Email inválido');
    if (String(password || '').length < 8) return error('A senha precisa ter pelo menos 8 caracteres');
    const d = await db(env);
    if (await d.prepare('SELECT 1 FROM users WHERE email = ?').bind(e).first()) return error('Esse email já tem acesso');
    const { salt, hash } = await createPasswordHash(String(password));
    await d.prepare('INSERT INTO users (id, email, salt, hash, created_at) VALUES (?, ?, ?, ?, ?)')
      .bind(crypto.randomUUID(), e, salt, hash, Date.now()).run();
    return json({ ok: true, users: await list(d) });
  } catch (err) {
    return handleError(err);
  }
}

// Troca a própria senha.
export async function onRequestPatch({ request, env }) {
  if (!sameOrigin(request)) return error('Origem inválida', 403);
  try {
    const me = await requireUser(request, env);
    const { password } = await readJson(request, 4096);
    if (String(password || '').length < 8) return error('A senha precisa ter pelo menos 8 caracteres');
    const { salt, hash } = await createPasswordHash(String(password));
    await (await db(env)).prepare('UPDATE users SET salt = ?, hash = ? WHERE id = ?').bind(salt, hash, me.id).run();
    return json({ ok: true });
  } catch (err) {
    return handleError(err);
  }
}

export async function onRequestDelete({ request, env }) {
  if (!sameOrigin(request)) return error('Origem inválida', 403);
  try {
    const me = await requireUser(request, env);
    const { id } = await readJson(request, 4096);
    if (!id) return error('Informe o usuário');
    if (id === me.id) return error('Você não pode remover o próprio acesso');
    const d = await db(env);
    const { n } = await d.prepare('SELECT COUNT(*) AS n FROM users').first();
    if (n <= 1) return error('É preciso manter pelo menos um usuário');
    await d.prepare('DELETE FROM users WHERE id = ?').bind(id).run();
    return json({ ok: true, users: await list(d) });
  } catch (err) {
    return handleError(err);
  }
}
