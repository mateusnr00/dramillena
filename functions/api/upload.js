import { requireUser } from '../../src/auth.js';
import { json, error, sameOrigin, handleError } from '../../src/http.js';

const MAX_BYTES = 8 * 1024 * 1024;
const MAX_VIDEO_BYTES = 40 * 1024 * 1024;
const TYPES = { 'image/webp': 'webp', 'image/jpeg': 'jpg', 'image/png': 'png', 'image/avif': 'avif', 'image/gif': 'gif', 'video/mp4': 'mp4', 'video/webm': 'webm' };

export async function onRequestPost({ request, env }) {
  if (!sameOrigin(request)) return error('Origem inválida', 403);
  try {
    await requireUser(request, env);
    if (!env.MEDIA) return error('Armazenamento de imagens (R2, binding MEDIA) não configurado.', 500);
    const type = (request.headers.get('content-type') || '').split(';')[0].trim().toLowerCase();
    const ext = TYPES[type];
    if (!ext) return error('Envie uma imagem (WebP, JPG, PNG, AVIF, GIF) ou um vídeo (MP4, WebM).', 415);
    const isVideo = type.startsWith('video/');
    const buf = await request.arrayBuffer();
    if (!buf.byteLength) return error('Arquivo vazio');
    if (isVideo && buf.byteLength > MAX_VIDEO_BYTES) return error('Vídeo muito grande (máximo 40 MB).', 413);
    if (!isVideo && buf.byteLength > MAX_BYTES) return error('Imagem muito grande (máximo 8 MB).', 413);

    const rand = crypto.getRandomValues(new Uint8Array(6)).reduce((s, b) => s + b.toString(16).padStart(2, '0'), '');
    const key = `uploads/${Date.now()}-${rand}.${ext}`;
    await env.MEDIA.put(key, buf, { httpMetadata: { contentType: type } });
    return json({ ok: true, url: `/media/${key}` });
  } catch (err) {
    return handleError(err);
  }
}
