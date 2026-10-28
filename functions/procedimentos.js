import { loadConfig } from '../src/db.js';
import { renderProcedimentos } from '../src/render.js';

export async function onRequestGet({ request, env }) {
  const cfg = await loadConfig(env);
  const origin = new URL(request.url).origin;
  return new Response(renderProcedimentos(cfg, { origin }), {
    headers: { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'public, max-age=0, must-revalidate' }
  });
}
