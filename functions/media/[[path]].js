// Serve imagens enviadas pelo painel (bucket R2 ligado como MEDIA).
export async function onRequestGet({ params, env, request }) {
  if (!env.MEDIA) return new Response('Not found', { status: 404 });
  const key = (Array.isArray(params.path) ? params.path : [params.path]).join('/');
  if (!key || key.includes('..')) return new Response('Not found', { status: 404 });

  const obj = await env.MEDIA.get(key, { onlyIf: request.headers });
  if (!obj) return new Response('Not found', { status: 404 });

  const headers = new Headers();
  obj.writeHttpMetadata(headers);
  headers.set('etag', obj.httpEtag);
  headers.set('cache-control', 'public, max-age=31536000, immutable');
  if (!('body' in obj) || !obj.body) return new Response(null, { status: 304, headers });
  return new Response(obj.body, { headers });
}
