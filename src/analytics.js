// Utilitários de rastreamento. Nada de IP ou cookie: só um id aleatório do
// navegador, a origem da visita e o tipo de dispositivo.

const BOT = /bot|crawl|spider|slurp|preview|facebookexternalhit|whatsapp|telegram|lighthouse|headless|pingdom|uptime/i;

export function isBot(request) {
  return BOT.test(request.headers.get('user-agent') || '');
}

// Dia no fuso de São Paulo (UTC-3, sem horário de verão).
export function spDay(ts = Date.now()) {
  return new Date(ts - 3 * 3600 * 1000).toISOString().slice(0, 10);
}

export function device(request) {
  const ua = request.headers.get('user-agent') || '';
  if (/iPad|Tablet/i.test(ua)) return 'tablet';
  if (/Mobi|Android|iPhone/i.test(ua)) return 'mobile';
  return 'desktop';
}

export function clip(v, n = 80) {
  return String(v ?? '').replace(/[\u0000-\u001f]/g, '').trim().slice(0, n);
}

export function geo(request) {
  const cf = request.cf || {};
  return { country: clip(cf.country, 2), city: clip(cf.city, 60) };
}
