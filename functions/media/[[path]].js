// Serve imagens e vídeos enviados pelo painel (bucket R2 ligado como MEDIA).
// Aceita pedidos parciais (Range), que o Safari exige para tocar vídeo.
export async function onRequestGet({ params, env, request }) {
  if (!env.MEDIA) return new Response('Not found', { status: 404 });
  const key = (Array.isArray(params.path) ? params.path : [params.path]).join('/');
  if (!key || key.includes('..')) return new Response('Not found', { status: 404 });

  const ranged = request.headers.has('range');
  const obj = await env.MEDIA.get(key, ranged ? { range: request.headers } : { onlyIf: request.headers });
  if (!obj) return new Response('Not found', { status: 404 });

  const headers = new Headers();
  obj.writeHttpMetadata(headers);
  headers.set('etag', obj.httpEtag);
  headers.set('accept-ranges', 'bytes');
  headers.set('cache-control', 'public, max-age=31536000, immutable');
  if (!('body' in obj) || !obj.body) return new Response(null, { status: 304, headers });

  if (ranged && obj.range) {
    const r = obj.range;
    const start = 'suffix' in r ? obj.size - r.suffix : (r.offset || 0);
    const length = 'suffix' in r ? r.suffix : (r.length !== undefined ? r.length : obj.size - start);
    headers.set('content-range', `bytes ${start}-${start + length - 1}/${obj.size}`);
    headers.set('content-length', String(length));
    return new Response(obj.body, { status: 206, headers });
  }
  return new Response(obj.body, { headers });
}
