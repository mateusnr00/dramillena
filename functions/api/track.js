import { db, hasDb } from '../../src/db.js';
import { isBot, spDay, device, clip, geo } from '../../src/analytics.js';
import { readJson } from '../../src/http.js';

const TYPES = new Set(['pageview', 'click', 'whatsapp', 'scroll']);
const ok = () => new Response(null, { status: 204 });

export async function onRequestPost({ request, env }) {
  if (!hasDb(env) || isBot(request)) return ok();
  try {
    const b = await readJson(request, 4096);
    if (!TYPES.has(b.type)) return ok();
    const ts = Date.now();
    const { country, city } = geo(request);
    await (await db(env)).prepare(
      `INSERT INTO events (ts, day, type, label, visitor, session, path, ref, source, medium, campaign, device, country, city)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).bind(
      ts, spDay(ts), b.type, clip(b.label, 60), clip(b.visitor, 40), clip(b.session, 40),
      clip(b.path, 120), clip(b.ref, 80).toLowerCase(), clip(b.source).toLowerCase(), clip(b.medium).toLowerCase(),
      clip(b.campaign), device(request), country, city
    ).run();
  } catch (err) {
    console.error('track', err);
  }
  return ok();
}
