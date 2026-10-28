import { login, createSessionCookie } from '../../src/auth.js';
import { json, error, readJson, sameOrigin, handleError } from '../../src/http.js';

export async function onRequestPost({ request, env }) {
  if (!sameOrigin(request)) return error('Origem inválida', 403);
  try {
    const { email, password } = await readJson(request, 4096);
    const user = await login(request, env, email, password);
    return json({ ok: true, user: { id: user.id, email: user.email } }, 200, {
      'set-cookie': await createSessionCookie(env, user.id, request)
    });
  } catch (err) {
    return handleError(err);
  }
}
