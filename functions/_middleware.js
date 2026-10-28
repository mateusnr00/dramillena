// Cabeçalhos de segurança para todas as respostas geradas pelas Functions.
export async function onRequest({ next }) {
  const res = await next();
  const out = new Response(res.body, res);
  out.headers.set('x-content-type-options', 'nosniff');
  out.headers.set('referrer-policy', 'strict-origin-when-cross-origin');
  out.headers.set('x-frame-options', 'SAMEORIGIN');
  out.headers.set('permissions-policy', 'camera=(), microphone=(), geolocation=()');
  return out;
}
