import { getUser } from '../../src/auth.js';
import { hasDb } from '../../src/db.js';
import { json, handleError } from '../../src/http.js';

// Estado da sessão + diagnóstico da configuração da Cloudflare.
export async function onRequestGet({ request, env }) {
  const setup = {
    db: hasDb(env),
    media: Boolean(env.MEDIA),
    secret: Boolean(env.AUTH_SECRET && env.AUTH_SECRET.length >= 16),
    adminEnv: Boolean(env.ADMIN_EMAIL && env.ADMIN_PASSWORD)
  };
  if (!setup.db || !setup.secret) return json({ user: null, setup });
  try {
    return json({ user: await getUser(request, env), setup });
  } catch (err) {
    return handleError(err);
  }
}
