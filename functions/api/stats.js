import { requireUser } from '../../src/auth.js';
import { db } from '../../src/db.js';
import { spDay } from '../../src/analytics.js';
import { json, handleError } from '../../src/http.js';

const DAY = 24 * 3600 * 1000;
const CONTACT = "type IN ('whatsapp', 'lead')";
const SOURCE = `CASE
  WHEN source <> '' THEN source
  WHEN ref LIKE '%instagram%' THEN 'instagram'
  WHEN ref LIKE '%facebook%' OR ref LIKE 'fb.%' OR ref LIKE 'l.facebook%' THEN 'facebook'
  WHEN ref LIKE '%google%' THEN 'google'
  WHEN ref <> '' THEN ref
  ELSE 'direto' END`;

async function totals(d, from, to) {
  const row = await d.prepare(
    `SELECT
       COUNT(CASE WHEN type = 'pageview' THEN 1 END) AS pageviews,
       COUNT(DISTINCT CASE WHEN type = 'pageview' THEN session END) AS sessions,
       COUNT(DISTINCT CASE WHEN type = 'pageview' THEN visitor END) AS visitors,
       COUNT(CASE WHEN type = 'whatsapp' THEN 1 END) AS whatsapp,
       COUNT(CASE WHEN type = 'lead' THEN 1 END) AS leads,
       COUNT(DISTINCT CASE WHEN ${CONTACT} THEN session END) AS converted
     FROM events WHERE day >= ? AND day <= ?`
  ).bind(from, to).first();
  row.conversion = row.sessions ? row.converted / row.sessions : 0;
  return row;
}

export async function onRequestGet({ request, env }) {
  try {
    await requireUser(request, env);
    const days = Math.min(365, Math.max(1, Number(new URL(request.url).searchParams.get('days')) || 30));
    const now = Date.now();
    const to = spDay(now);
    const from = spDay(now - (days - 1) * DAY);
    const prevTo = spDay(now - days * DAY);
    const prevFrom = spDay(now - (2 * days - 1) * DAY);
    const d = await db(env);
    const range = [from, to];

    const [cur, prev, series, sources, ctas, devices, cities, campaigns, recent] = await Promise.all([
      totals(d, from, to),
      totals(d, prevFrom, prevTo),
      d.prepare(
        `SELECT day,
           COUNT(DISTINCT CASE WHEN type = 'pageview' THEN session END) AS sessions,
           COUNT(DISTINCT CASE WHEN ${CONTACT} THEN session END) AS contacts
         FROM events WHERE day >= ? AND day <= ? GROUP BY day ORDER BY day`
      ).bind(...range).all(),
      d.prepare(
        `SELECT ${SOURCE} AS name,
           COUNT(DISTINCT CASE WHEN type = 'pageview' THEN session END) AS sessions,
           COUNT(DISTINCT CASE WHEN ${CONTACT} THEN session END) AS contacts
         FROM events WHERE day >= ? AND day <= ? GROUP BY name ORDER BY sessions DESC LIMIT 8`
      ).bind(...range).all(),
      d.prepare(
        `SELECT label AS name, type, COUNT(*) AS n FROM events
         WHERE day >= ? AND day <= ? AND type IN ('whatsapp', 'click') AND label <> ''
         GROUP BY label, type ORDER BY n DESC LIMIT 10`
      ).bind(...range).all(),
      d.prepare(
        `SELECT device AS name, COUNT(DISTINCT session) AS n FROM events
         WHERE day >= ? AND day <= ? AND type = 'pageview' GROUP BY device ORDER BY n DESC`
      ).bind(...range).all(),
      d.prepare(
        `SELECT city AS name, COUNT(DISTINCT session) AS n FROM events
         WHERE day >= ? AND day <= ? AND type = 'pageview' AND city <> '' GROUP BY city ORDER BY n DESC LIMIT 6`
      ).bind(...range).all(),
      d.prepare(
        `SELECT campaign AS name,
           COUNT(DISTINCT CASE WHEN type = 'pageview' THEN session END) AS sessions,
           COUNT(DISTINCT CASE WHEN ${CONTACT} THEN session END) AS contacts
         FROM events WHERE day >= ? AND day <= ? AND campaign <> '' GROUP BY campaign ORDER BY sessions DESC LIMIT 8`
      ).bind(...range).all(),
      d.prepare('SELECT id, ts, nome, telefone, procedimento, status, source, ref FROM leads ORDER BY ts DESC LIMIT 5').all()
    ]);

    // Série completa, inclusive dias sem visitas.
    const byDay = Object.fromEntries(series.results.map(r => [r.day, r]));
    const fullSeries = [];
    for (let i = days - 1; i >= 0; i--) {
      const day = spDay(now - i * DAY);
      fullSeries.push({ day, sessions: byDay[day]?.sessions || 0, contacts: byDay[day]?.contacts || 0 });
    }

    return json({
      days, from, to,
      totals: cur,
      previous: prev,
      series: fullSeries,
      sources: sources.results,
      ctas: ctas.results,
      devices: devices.results,
      cities: cities.results,
      campaigns: campaigns.results,
      recentLeads: recent.results
    });
  } catch (err) {
    return handleError(err);
  }
}
