import { clearSessionCookie } from '../../src/auth.js';
import { json } from '../../src/http.js';

export function onRequestPost() {
  return json({ ok: true }, 200, { 'set-cookie': clearSessionCookie() });
}
