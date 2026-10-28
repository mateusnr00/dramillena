import { requireUser } from '../../src/auth.js';
import { db } from '../../src/db.js';
import { json, error, readJson, sameOrigin, handleError } from '../../src/http.js';

const STATUS = ['pendente', 'confirmado', 'cancelado'];

// Agenda de pré-reservas (painel).
export async function onRequestGet({ request, env }) {
  try {
    await requireUser(request, env);
    const past = new URL(request.url).searchParams.get('past') === '1';
    const hoje = new Date(Date.now() - 3 * 3600 * 1000).toISOString().slice(0, 10); // dia em São Paulo
    const { results } = await (await db(env)).prepare(
      `SELECT * FROM bookings WHERE date ${past ? '<' : '>='} ?
       ORDER BY date ${past ? 'DESC' : 'ASC'}, time ${past ? 'DESC' : 'ASC'} LIMIT 300`
    ).bind(hoje).all();
    return json({ bookings: results });
  } catch (err) {
    return handleError(err);
  }
}

export async function onRequestPatch({ request, env }) {
  if (!sameOrigin(request)) return error('Origem inválida', 403);
  try {
    await requireUser(request, env);
    const { id, status } = await readJson(request, 4096);
    if (!id || !STATUS.includes(status)) return error('Dados inválidos');
    const d = await db(env);
    try {
      await d.prepare('UPDATE bookings SET status = ? WHERE id = ?').bind(status, id).run();
    } catch (err) {
      if (/UNIQUE/i.test(String(err && err.message))) return error('Esse horário já foi reservado por outra pessoa', 409);
      throw err;
    }
    const b = await d.prepare('SELECT * FROM bookings WHERE id = ?').bind(id).first();
    if (b && b.lead_id && status !== 'pendente') {
      await d.prepare('UPDATE leads SET status = ? WHERE id = ?').bind(status === 'confirmado' ? 'agendado' : 'perdido', b.lead_id).run();
    }
    return json({ ok: true, booking: b });
  } catch (err) {
    return handleError(err);
  }
}
