import { db, hasDb, loadConfig } from '../../src/db.js';
import { agendaRules, buildSlots, takenSlots } from '../../src/agenda.js';
import { json, handleError } from '../../src/http.js';

// Horários livres para pré-reserva (público).
export async function onRequestGet({ env }) {
  try {
    const cfg = await loadConfig(env);
    const rules = agendaRules(cfg);
    if (!rules.ativo || !hasDb(env)) return json({ ativo: false, days: [] });
    const taken = await takenSlots(await db(env));
    return json({ ativo: true, duracao: rules.step, days: buildSlots(rules, taken) });
  } catch (err) {
    return handleError(err);
  }
}
