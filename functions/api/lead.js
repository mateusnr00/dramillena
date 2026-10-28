import { db } from '../../src/db.js';
import { isBot, spDay, device, clip, geo } from '../../src/analytics.js';
import { json, error, readJson, handleError } from '../../src/http.js';

// Recebe o formulário de agendamento do site.
export async function onRequestPost({ request, env }) {
  if (isBot(request)) return json({ ok: true });
  try {
    const b = await readJson(request, 4096);
    const nome = clip(b.nome, 80);
    const telefone = String(b.telefone || '').replace(/\D/g, '').slice(0, 13);
    if (nome.length < 2 || telefone.length < 10) return error('Dados inválidos');

    const d = await db(env);
    const ts = Date.now();
    const dup = await d.prepare('SELECT id FROM leads WHERE telefone = ? AND ts > ?').bind(telefone, ts - 10 * 60 * 1000).first();
    if (dup) return json({ ok: true, id: dup.id });

    const row = {
      procedimento: clip(b.procedimento),
      source: clip(b.source).toLowerCase(),
      medium: clip(b.medium).toLowerCase(),
      campaign: clip(b.campaign),
      ref: clip(b.ref).toLowerCase(),
      visitor: clip(b.visitor, 40),
      session: clip(b.session, 40)
    };
    const { country, city } = geo(request);
    const res = await d.batch([
      d.prepare(
        `INSERT INTO leads (ts, nome, telefone, procedimento, source, medium, campaign, ref, visitor, session)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      ).bind(ts, nome, telefone, row.procedimento, row.source, row.medium, row.campaign, row.ref, row.visitor, row.session),
      d.prepare(
        `INSERT INTO events (ts, day, type, label, visitor, session, path, ref, source, medium, campaign, device, country, city)
         VALUES (?, ?, 'lead', ?, ?, ?, '/', ?, ?, ?, ?, ?, ?, ?)`
      ).bind(ts, spDay(ts), row.procedimento, row.visitor, row.session, row.ref, row.source, row.medium, row.campaign, device(request), country, city)
    ]);
    return json({ ok: true, id: res[0].meta.last_row_id });
  } catch (err) {
    return handleError(err);
  }
}
