// Horários disponíveis para pré-reserva, no fuso de São Paulo (UTC-3).

const DAY_NAMES = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sab'];
const TZ_OFFSET = 3 * 3600 * 1000;

function toMin(hhmm) {
  const m = /^(\d{1,2}):(\d{2})$/.exec(String(hhmm || '').trim());
  return m ? Number(m[1]) * 60 + Number(m[2]) : null;
}

function fromMin(min) {
  return String(Math.floor(min / 60)).padStart(2, '0') + ':' + String(min % 60).padStart(2, '0');
}

// Data/hora "de parede" em São Paulo → timestamp UTC.
function spTs(date, time) {
  return Date.parse(`${date}T${time}:00Z`) + TZ_OFFSET;
}

export function agendaRules(cfg) {
  const a = cfg.agenda || {};
  const dias = String(a.dias || '').toLowerCase().split(/[,\s]+/).map(d => d.slice(0, 3)).filter(Boolean);
  return {
    ativo: Boolean(a.ativo) && a.ativo !== 'false',
    weekdays: new Set(dias.map(d => DAY_NAMES.indexOf(d.normalize('NFD').replace(/[̀-ͯ]/g, ''))).filter(i => i >= 0)),
    start: toMin(a.inicio) ?? 9 * 60,
    end: toMin(a.fim) ?? 18 * 60,
    step: Math.min(240, Math.max(15, Number(a.duracao) || 60)),
    leadMs: Math.max(0, Number(a.antecedenciaHoras) || 0) * 3600 * 1000,
    days: Math.min(60, Math.max(1, Number(a.diasFuturos) || 21)),
    blocked: new Set(String(a.bloqueios || '').split(/[,\s]+/).filter(d => /^\d{4}-\d{2}-\d{2}$/.test(d)))
  };
}

// Lista os próximos dias com os horários livres.
export function buildSlots(rules, taken, now = Date.now()) {
  const out = [];
  const todaySp = new Date(now - TZ_OFFSET);
  for (let i = 0; i < rules.days; i++) {
    const d = new Date(Date.UTC(todaySp.getUTCFullYear(), todaySp.getUTCMonth(), todaySp.getUTCDate() + i));
    const date = d.toISOString().slice(0, 10);
    if (!rules.weekdays.has(d.getUTCDay()) || rules.blocked.has(date)) continue;
    const times = [];
    for (let m = rules.start; m + rules.step <= rules.end; m += rules.step) {
      const time = fromMin(m);
      if (spTs(date, time) < now + rules.leadMs) continue;
      if (taken.has(`${date} ${time}`)) continue;
      times.push(time);
    }
    if (times.length) out.push({ date, weekday: d.getUTCDay(), times });
  }
  return out;
}

export function isValidSlot(rules, taken, date, time, now = Date.now()) {
  return buildSlots(rules, taken, now).some(d => d.date === date && d.times.includes(time));
}

export async function takenSlots(d) {
  const { results } = await d.prepare(
    "SELECT date, time FROM bookings WHERE status <> 'cancelado' AND date >= date('now', '-1 day')"
  ).all();
  return new Set(results.map(r => `${r.date} ${r.time}`));
}
