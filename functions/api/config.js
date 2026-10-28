import { requireUser } from '../../src/auth.js';
import { loadConfig, saveConfig } from '../../src/db.js';
import { json, error, readJson, sameOrigin, handleError } from '../../src/http.js';
import { DEFAULT_CONFIG } from '../../src/defaults.js';

export async function onRequestGet({ env }) {
  return json(await loadConfig(env));
}

export async function onRequestPut({ request, env }) {
  if (!sameOrigin(request)) return error('Origem inválida', 403);
  try {
    await requireUser(request, env);
    const body = await readJson(request, 512 * 1024);
    if (!body || typeof body !== 'object' || Array.isArray(body)) return error('Configuração inválida');
    // Só aceita as seções conhecidas.
    const clean = {};
    for (const key of Object.keys(DEFAULT_CONFIG)) {
      if (body[key] !== undefined) clean[key] = body[key];
    }
    await saveConfig(env, clean);
    return json({ ok: true, config: await loadConfig(env) });
  } catch (err) {
    return handleError(err);
  }
}

export async function onRequestDelete({ request, env }) {
  if (!sameOrigin(request)) return error('Origem inválida', 403);
  try {
    await requireUser(request, env);
    await saveConfig(env, {});
    return json({ ok: true, config: await loadConfig(env) });
  } catch (err) {
    return handleError(err);
  }
}
