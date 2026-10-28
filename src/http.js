export function json(data, status = 200, headers = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'no-store',
      ...headers
    }
  });
}

export function error(message, status = 400) {
  return json({ error: message }, status);
}

export async function readJson(request, maxBytes = 256 * 1024) {
  const len = Number(request.headers.get('content-length') || 0);
  if (len > maxBytes) throw new HttpError('Conteúdo muito grande', 413);
  const text = await request.text();
  if (text.length > maxBytes) throw new HttpError('Conteúdo muito grande', 413);
  try {
    return text ? JSON.parse(text) : {};
  } catch {
    throw new HttpError('JSON inválido', 400);
  }
}

export class HttpError extends Error {
  constructor(message, status) {
    super(message);
    this.status = status;
  }
}

// Requisições que alteram dados precisam vir do próprio site (proteção CSRF,
// somada ao cookie SameSite=Strict).
export function sameOrigin(request) {
  const origin = request.headers.get('origin');
  if (!origin) return true;
  try {
    // Compara só o host: atrás de proxy o protocolo interno pode ser http.
    return new URL(origin).host === new URL(request.url).host;
  } catch {
    return false;
  }
}

export function handleError(err) {
  if (err instanceof HttpError) return error(err.message, err.status);
  console.error(err);
  return error(err && err.message ? err.message : 'Erro interno', 500);
}
