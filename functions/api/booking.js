import { db, loadConfig } from '../../src/db.js';
import { agendaRules, isValidSlot, takenSlots } from '../../src/agenda.js';
import { isBot, spDay, device, clip, geo } from '../../src/analytics.js';
import { json, error, readJson, sameOrigin, handleError } from '../../src/http.js';

// Pré-reserva feita pela paciente no site. A equipe confirma pelo WhatsApp.
export async function onRequestPost({ request, env }) {
  if (!sameOrigin(request)) return error('Origem inválida', 403);
  if (isBot(request)) return error('Não foi possível reservar', 400);
  try {
    const b = await readJson(request, 4096);
    const nome = clip(b.nome, 80);
    const telefone = String(b.telefone || '').replace(/\D/g, '').slice(0, 13);
    const date = String(b.date || '');
    const time = String(b.time || '');
    const interesse = clip(b.interesse);
    if (nome.length < 2 || telefone.length < 10) return error('Confira seu nome e WhatsApp');
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !/^\d{2}:\d{2}$/.test(time)) return error('Escolha um dia e um horário');

    const cfg = await loadConfig(env);
    const rules = agendaRules(cfg);
    if (!rules.ativo) return error('A agenda online está fechada no momento', 409);
    const d = await db(env);
    if (!isValidSlot(rules, await takenSlots(d), date, time)) {
      return error('Esse horário acabou de ser reservado. Escolha outro, por favor.', 409);
    }

    const ts = Date.now();
    const notas = `Pré-reserva pelo site: ${date.split('-').reverse().join('/')} às ${time}`;
    const src = {
      source: clip(b.source).toLowerCase(), medium: clip(b.medium).toLowerCase(), campaign: clip(b.campaign),
      ref: clip(b.ref).toLowerCase(), visitor: clip(b.visitor, 40), session: clip(b.session, 40)
    };
    let booking;
    try {
      booking = await d.prepare(
        'INSERT INTO bookings (created_at, date, time, nome, telefone, interesse) VALUES (?, ?, ?, ?, ?, ?)'
      ).bind(ts, date, time, nome, telefone, interesse).run();
    } catch (err) {
      if (/UNIQUE/i.test(String(err && err.message))) return error('Esse horário acabou de ser reservado. Escolha outro, por favor.', 409);
      throw err;
    }
    const { country, city } = geo(request);
    const res = await d.batch([
      d.prepare(
        `INSERT INTO leads (ts, nome, telefone, procedimento, source, medium, campaign, ref, notas, visitor, session)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      ).bind(ts, nome, telefone, interesse, src.source, src.medium, src.campaign, src.ref, notas, src.visitor, src.session),
      d.prepare(
        `INSERT INTO events (ts, day, type, label, visitor, session, path, ref, source, medium, campaign, device, country, city)
         VALUES (?, ?, 'lead', 'reserva', ?, ?, '/', ?, ?, ?, ?, ?, ?, ?)`
      ).bind(ts, spDay(ts), src.visitor, src.session, src.ref, src.source, src.medium, src.campaign, device(request), country, city)
    ]);
    await d.prepare('UPDATE bookings SET lead_id = ? WHERE id = ?').bind(res[0].meta.last_row_id, booking.meta.last_row_id).run();
    return json({ ok: true, id: booking.meta.last_row_id });
  } catch (err) {
    return handleError(err);
  }
}
