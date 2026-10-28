// Ponto de entrada na Vercel. Reaproveita as mesmas funções da Cloudflare
// (pasta functions/): monta o "env" com o banco Postgres (DATABASE_URL) e o
// Vercel Blob (BLOB_READ_WRITE_TOKEN) e chama o handler da rota pedida.
// O vercel.json manda para cá tudo o que não é arquivo estático.

import * as inicio from '../functions/index.js';
import * as doutora from '../functions/doutora.js';
import * as procedimentos from '../functions/procedimentos.js';
import * as agendar from '../functions/agendar.js';
import * as privacidade from '../functions/privacidade.js';
import * as robots from '../functions/robots.txt.js';
import * as sitemap from '../functions/sitemap.xml.js';
import * as booking from '../functions/api/booking.js';
import * as bookings from '../functions/api/bookings.js';
import * as config from '../functions/api/config.js';
import * as defaults from '../functions/api/defaults.js';
import * as lead from '../functions/api/lead.js';
import * as leads from '../functions/api/leads.js';
import * as login from '../functions/api/login.js';
import * as logout from '../functions/api/logout.js';
import * as me from '../functions/api/me.js';
import * as slots from '../functions/api/slots.js';
import * as stats from '../functions/api/stats.js';
import * as track from '../functions/api/track.js';
import * as upload from '../functions/api/upload.js';
import * as users from '../functions/api/users.js';
import { PgD1, pgDriver } from '../src/pg-d1.js';
import { blobBucket } from '../src/blob-r2.js';

const ROUTES = {
  '/': inicio,
  '/doutora': doutora,
  '/procedimentos': procedimentos,
  '/agendar': agendar,
  '/privacidade': privacidade,
  '/robots.txt': robots,
  '/sitemap.xml': sitemap,
  '/api/booking': booking,
  '/api/bookings': bookings,
  '/api/config': config,
  '/api/defaults': defaults,
  '/api/lead': lead,
  '/api/leads': leads,
  '/api/login': login,
  '/api/logout': logout,
  '/api/me': me,
  '/api/slots': slots,
  '/api/stats': stats,
  '/api/track': track,
  '/api/upload': upload,
  '/api/users': users
};

const SECURITY = {
  'x-content-type-options': 'nosniff',
  'referrer-policy': 'strict-origin-when-cross-origin',
  'x-frame-options': 'SAMEORIGIN',
  'permissions-policy': 'camera=(), microphone=(), geolocation=()'
};

// Uma conexão por instância da função, criada na primeira requisição.
let envPromise = null;
function vercelEnv() {
  if (!envPromise) {
    envPromise = (async () => {
      const p = process.env;
      const url = p.DATABASE_URL || p.POSTGRES_URL || '';
      return {
        DB: url ? new PgD1(await pgDriver(url)) : undefined,
        MEDIA: p.BLOB_READ_WRITE_TOKEN ? blobBucket(p.BLOB_READ_WRITE_TOKEN) : undefined,
        AUTH_SECRET: p.AUTH_SECRET,
        ADMIN_EMAIL: p.ADMIN_EMAIL,
        ADMIN_PASSWORD: p.ADMIN_PASSWORD
      };
    })().catch(err => { envPromise = null; throw err; });
  }
  return envPromise;
}

// Reconstrói a URL original: o vercel.json passa o caminho em ?__path=.
function originalRequest(request) {
  const url = new URL(request.url);
  const path = url.searchParams.get('__path');
  if (path === null) return request;
  url.searchParams.delete('__path');
  const host = request.headers.get('x-forwarded-host') || request.headers.get('host') || url.host;
  const proto = request.headers.get('x-forwarded-proto') || 'https';
  const fixed = new URL(proto + '://' + host + (path.startsWith('/') ? path : '/' + path) + url.search);
  const init = { method: request.method, headers: request.headers };
  if (!['GET', 'HEAD'].includes(request.method)) { init.body = request.body; init.duplex = 'half'; }
  return new Request(fixed, init);
}

function withHeaders(res) {
  const out = new Response(res.body, res);
  for (const [k, v] of Object.entries(SECURITY)) out.headers.set(k, v);
  return out;
}

export async function handle(request, env) {
  const req = originalRequest(request);
  const url = new URL(req.url);
  const path = url.pathname.replace(/\/+$/, '') || '/';

  // Arquivos enviados pelo painel: redireciona para o endereço público do Blob.
  if (path.startsWith('/media/')) {
    const key = decodeURIComponent(path.slice('/media/'.length));
    const target = env.MEDIA && !key.includes('..') ? await env.MEDIA.url(key) : null;
    if (!target) return withHeaders(new Response('Not found', { status: 404 }));
    return new Response(null, { status: 302, headers: { location: target, 'cache-control': 'public, max-age=86400' } });
  }

  const mod = ROUTES[path];
  const method = req.method === 'HEAD' ? 'Get' : req.method.charAt(0) + req.method.slice(1).toLowerCase();
  const fn = mod && (mod['onRequest' + method] || mod.onRequest);
  if (!mod) return withHeaders(new Response('Página não encontrada', { status: 404, headers: { 'content-type': 'text/plain; charset=utf-8' } }));
  if (!fn) return withHeaders(new Response('Método não permitido', { status: 405 }));
  const res = await fn({ request: req, env, params: {}, waitUntil: () => {}, next: () => new Response('Not found', { status: 404 }) });
  return withHeaders(res);
}

async function serve(request) {
  try {
    return await handle(request, await vercelEnv());
  } catch (err) {
    console.error(err);
    return new Response('Erro interno', { status: 500 });
  }
}

export const GET = serve;
export const HEAD = serve;
export const POST = serve;
export const PUT = serve;
export const PATCH = serve;
export const DELETE = serve;
