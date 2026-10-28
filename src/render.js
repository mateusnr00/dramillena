// Renderiza a página inicial no servidor a partir da configuração do painel.
// Todo texto vindo do painel passa por esc() (ou fmt(), que escapa antes
// de aplicar os marcadores *itálico* e |quebra).

const ASSET_VERSION = '16';

export function esc(s) {
  return String(s ?? '').replace(/[&<>"']/g, c => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
  ));
}

export function fmt(s) {
  return esc(s).replace(/\*([^*]+)\*/g, '<em>$1</em>').replace(/\|/g, '<br />');
}

function plain(s) {
  return String(s ?? '').replace(/[*|]/g, ' ').replace(/\s+/g, ' ').trim();
}

function digits(s) {
  return String(s ?? '').replace(/\D/g, '');
}

function slug(s) {
  return plain(s).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

export function waLink(settings, message) {
  const text = message || settings.whatsappMsg || '';
  return `https://wa.me/${digits(settings.whatsapp)}${text ? '?text=' + encodeURIComponent(text) : ''}`;
}

function safeUrl(u) {
  const s = String(u ?? '').trim();
  if (/^https?:\/\//i.test(s) || (s.startsWith('/') && !s.startsWith('//'))) return s;
  if (/^[\w.-]+\.(webp|png|jpe?g|avif|gif|svg)$/i.test(s)) return '/' + s;
  return '';
}

function absUrl(origin, u) {
  const s = safeUrl(u);
  if (!s) return '';
  return s.startsWith('/') ? origin + s : s;
}

function list(arr) {
  return Array.isArray(arr) ? arr.filter(Boolean) : [];
}

const icon = {
  wa: '<svg viewBox="0 0 24 24" aria-hidden="true" fill="currentColor"><path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91C21.95 6.45 17.5 2 12.04 2zm0 18.15c-1.48 0-2.93-.4-4.2-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.26 8.26 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.25-8.24 4.54 0 8.24 3.7 8.24 8.24 0 4.55-3.7 8.24-8.24 8.24zm4.52-6.17c-.25-.12-1.47-.72-1.69-.81-.23-.08-.39-.12-.56.12-.17.25-.64.81-.78.97-.14.17-.29.19-.54.06-.25-.12-1.05-.39-1.99-1.23-.74-.66-1.23-1.47-1.38-1.72-.14-.25-.02-.38.11-.51.11-.11.25-.29.37-.43.13-.15.17-.25.25-.42.08-.17.04-.31-.02-.43-.06-.12-.56-1.34-.76-1.84-.2-.48-.41-.42-.56-.43h-.48c-.17 0-.43.06-.66.31-.22.25-.86.85-.86 2.07 0 1.22.89 2.4 1.01 2.56.12.17 1.75 2.67 4.23 3.74.59.26 1.05.41 1.41.52.59.19 1.13.16 1.56.1.48-.07 1.47-.6 1.67-1.18.21-.58.21-1.07.14-1.18-.06-.11-.22-.17-.47-.29z"/></svg>',
  check: '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>',
  plus: '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>',
  star: '<svg viewBox="0 0 24 24" aria-hidden="true" fill="currentColor"><path d="M12 2.8l2.8 5.9 6.4.8-4.7 4.4 1.2 6.4L12 17.2l-5.7 3.1 1.2-6.4-4.7-4.4 6.4-.8z"/></svg>',
  left: '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M15 6l-6 6 6 6"/></svg>',
  right: '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M9 6l6 6-6 6"/></svg>'
};

function ba({ before, after, alt, cls = '', eager = false, parallax = false }) {
  const b = safeUrl(before);
  const a = safeUrl(after);
  if (!b || !a) return '';
  const load = eager ? 'loading="eager" fetchpriority="high"' : 'loading="lazy"';
  return `
    <div class="ba ${cls}" data-ba style="--pos:50%">
      <img class="ba__img" src="${esc(b)}" alt="${esc(alt)}, antes" ${load} decoding="async" width="664" height="890"${parallax ? ' data-parallax="0.12"' : ''} />
      <img class="ba__img ba__after" src="${esc(a)}" alt="${esc(alt)}, depois" ${load} decoding="async" width="664" height="890"${parallax ? ' data-parallax="0.12"' : ''} />
      <span class="ba__tag ba__tag--l" aria-hidden="true">Antes</span>
      <span class="ba__tag ba__tag--r" aria-hidden="true">Depois</span>
      <span class="ba__line" aria-hidden="true"><span class="ba__knob">${icon.left}${icon.right}</span></span>
      <input class="ba__range" type="range" min="0" max="100" value="50" aria-label="Comparar antes e depois: ${esc(alt)}" />
    </div>`;
}

function head(cfg, origin) {
  const s = cfg.settings;
  const title = plain(s.seoTitle) || plain(s.nome);
  const desc = plain(s.seoDescription);
  const og = absUrl(origin, s.ogImage || cfg.millena.foto);
  const ig = String(s.instagram || '').replace(/^@/, '');
  const ld = obj => `<script type="application/ld+json">${JSON.stringify(obj).replace(/</g, '\\u003c')}</script>`;
  const business = {
    '@context': 'https://schema.org',
    '@type': 'MedicalBusiness',
    name: plain(s.nome),
    description: desc,
    url: origin + '/',
    image: og || undefined,
    telephone: s.whatsapp ? '+' + digits(s.whatsapp) : undefined,
    email: s.email || undefined,
    address: s.cidade ? { '@type': 'PostalAddress', addressLocality: plain(s.cidade), addressCountry: 'BR' } : undefined,
    sameAs: ig ? [`https://www.instagram.com/${ig}/`] : undefined,
    founder: { '@type': 'Person', name: plain(s.nome), jobTitle: plain(cfg.millena.badge) || undefined }
  };
  const faqItems = list(cfg.faq && cfg.faq.items);
  const faq = faqItems.length ? {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqItems.map(i => ({ '@type': 'Question', name: plain(i.q), acceptedAnswer: { '@type': 'Answer', text: plain(i.a) } }))
  } : null;
  return `
<meta charset="utf-8" />
<script>document.documentElement.classList.add('js')</script>
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
<meta name="theme-color" content="#10100F" />
<meta name="color-scheme" content="dark light" />
<title>${esc(title)}</title>
<meta name="description" content="${esc(desc)}" />
<link rel="canonical" href="${esc(origin)}/" />
<meta property="og:type" content="website" />
<meta property="og:locale" content="pt_BR" />
<meta property="og:title" content="${esc(title)}" />
<meta property="og:description" content="${esc(desc)}" />
<meta property="og:url" content="${esc(origin)}/" />
${og ? `<meta property="og:image" content="${esc(og)}" />` : ''}
<meta name="twitter:card" content="summary_large_image" />
<link rel="icon" href="/favicon.svg" type="image/svg+xml" />
<link rel="apple-touch-icon" href="/apple-touch-icon.png" />
${ld(business)}
${faq ? ld(faq) : ''}
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link rel="preload" as="style" href="https://fonts.googleapis.com/css2?family=Newsreader:ital,opsz,wght@0,6..72,300;0,6..72,400;1,6..72,300&family=Manrope:wght@400;500;600&family=DM+Mono:wght@400&display=swap" />
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Newsreader:ital,opsz,wght@0,6..72,300;0,6..72,400;1,6..72,300&family=Manrope:wght@400;500;600&family=DM+Mono:wght@400&display=swap" media="print" onload="this.media='all'" />
<noscript><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Newsreader:ital,opsz,wght@0,6..72,300;0,6..72,400;1,6..72,300&family=Manrope:wght@400;500;600&family=DM+Mono:wght@400&display=swap" /></noscript>
${safeUrl(cfg.hero.foto || cfg.millena.foto) ? `<link rel="preload" as="image" href="${esc(safeUrl(cfg.hero.foto || cfg.millena.foto))}" fetchpriority="high" />` : ''}
<link rel="stylesheet" href="/css/site.css?v=${ASSET_VERSION}" />`;
}

// Capítulos da página, na ordem em que aparecem.
const CHAPTERS = [
  ['#topo', 'Introdução'],
  ['#filosofia', 'Filosofia'],
  ['#sobre', 'A profissional'],
  ['#explorer', 'Face Explorer'],
  ['#tratamentos', 'Tratamentos'],
  ['#ciencia', 'Ciência'],
  ['#confianca', 'Confiança'],
  ['#espaco', 'O espaço'],
  ['#agendar', 'Agendamento']
];
const NAV = [['#filosofia', 'Filosofia'], ['#tratamentos', 'Tratamentos'], ['#sobre', 'A profissional'], ['#confianca', 'Confiança']];

function brandName(cfg) {
  return plain(cfg.settings.nome).replace(/^Dra\.?\s*/i, '') || 'Millena Curty';
}

// Título em linhas mascaradas: cada "|" vira uma linha que sobe por trás de uma máscara.
function lines(s) {
  return String(s || '').split('|').map((part, i) =>
    `<span class="ln" style="--i:${i}"><span>${fmt(part)}</span></span>`).join('');
}

// Marca discreta do capítulo: número e nome, como no índice de um livro.
function chap(id) {
  const n = CHAPTERS.findIndex(c => c[0] === '#' + id);
  if (n < 0) return '';
  return `<p class="chap"><span>${String(n + 1).padStart(2, '0')}</span>${esc(CHAPTERS[n][1])}</p>`;
}

function nav(cfg) {
  return `
<header class="nav" data-nav>
  <a class="nav__brand" href="#topo">${esc(brandName(cfg))}</a>
  <nav class="nav__links" aria-label="Seções">
    ${NAV.map(([h, t]) => `<a href="${h}">${t}</a>`).join('')}
  </nav>
  <div class="nav__end">
    <a class="nav__cta" href="#agendar" data-track="nav_agendar">Agendar</a>
    <button class="nav__menu" type="button" aria-expanded="false" aria-controls="menu" aria-label="Abrir menu" data-burger><span>Menu</span><i aria-hidden="true"></i></button>
  </div>
</header>
<div class="menu" id="menu" data-menu hidden>
  <nav class="menu__list" aria-label="Capítulos">
    ${CHAPTERS.map(([h, t], i) => `<a href="${h}"><span>${String(i + 1).padStart(2, '0')}</span>${t}</a>`).join('')}
  </nav>
  <div class="menu__foot">
    <a href="${esc(waLink(cfg.settings))}" target="_blank" rel="noopener" data-track="menu_wa">${icon.wa}<span>Falar no WhatsApp</span></a>
    ${cfg.settings.instagram ? `<a href="https://www.instagram.com/${esc(String(cfg.settings.instagram).replace(/^@/, ''))}/" target="_blank" rel="noopener">Instagram</a>` : ''}
  </div>
</div>`;
}

// 01. Abertura: fundo quase preto, o retrato surge com uma luz lateral.
function hero(cfg) {
  const h = cfg.hero;
  const foto = safeUrl(h.foto || cfg.millena.foto);
  return `
<section class="hero" id="topo" data-hero>
  <figure class="hero__media" aria-hidden="${foto ? 'false' : 'true'}">
    ${foto ? `<img class="hero__img" src="${esc(foto)}" alt="${esc(plain(cfg.settings.nome))}" width="1200" height="1600" fetchpriority="high" decoding="async" data-hero-img />` : ''}
    <span class="hero__light" aria-hidden="true"></span>
  </figure>
  <div class="hero__inner">
    ${h.eyebrow ? `<p class="hero__eyebrow">${esc(h.eyebrow)}</p>` : ''}
    <h1 class="hero__title">${lines(h.title)}</h1>
    <p class="hero__sub">${esc(h.sub)}</p>
    <p class="hero__sign">${esc(plain(cfg.settings.nome))}</p>
    <div class="hero__actions">
      <a class="btn btn--light" href="#agendar" data-track="hero_agendar">${esc(h.ctaPrimary)}</a>
      <a class="link" href="#filosofia" data-track="hero_filosofia">${esc(h.ctaSecondary)}</a>
    </div>
  </div>
  <a class="hero__scroll" href="#filosofia" aria-label="Ir para a filosofia"><span></span></a>
</section>`;
}

// 02. Filosofia: composição editorial assimétrica em fundo claro.
function filosofia(cfg) {
  const f = cfg.filosofia || {};
  const pilares = list(cfg.metodo && cfg.metodo.pilares);
  return `
<section class="ch ch--light philo" id="filosofia">
  <div class="wrap">
    ${chap('filosofia')}
    <h2 class="t-display philo__title" data-reveal>${lines(f.title)}</h2>
    <div class="philo__body">
      ${f.lead ? `<p class="t-lead">${esc(f.lead)}</p>` : ''}
      ${f.texto ? `<p class="t-body">${esc(f.texto)}</p>` : ''}
    </div>
    ${pilares.length ? `<dl class="philo__pillars">
      ${pilares.map(p => `<div><dt>${esc(p.titulo)}</dt><dd>${esc(p.texto)}</dd></div>`).join('')}
    </dl>` : ''}
  </div>
</section>`;
}

// 03. A profissional: retrato com protagonismo e credenciais reais.
function sobre(cfg) {
  const m = cfg.millena;
  const s = cfg.settings;
  const foto = safeUrl(m.foto);
  const creds = list(m.credentials);
  return `
<section class="ch ch--dark pro" id="sobre">
  <figure class="pro__photo" data-reveal="img">
    ${foto ? `<img src="${esc(foto)}" alt="Retrato de ${esc(plain(s.nome))}" loading="lazy" decoding="async" width="1200" height="1600" data-depth="0.06" />` : ''}
  </figure>
  <div class="pro__copy">
    ${chap('sobre')}
    <h2 class="t-display pro__name" data-reveal>${lines(m.title)}</h2>
    <p class="pro__role">${esc(m.badge)}${s.cro ? `<span>${esc(s.cro)}</span>` : ''}</p>
    ${m.bio1 ? `<p class="t-body">${esc(m.bio1)}</p>` : ''}
    ${m.bio2 ? `<blockquote class="pro__quote">${esc(String(m.bio2).replace(/^["“]|["”]$/g, ''))}</blockquote>` : ''}
    ${creds.length ? `<ul class="pro__creds">${creds.map(c => `<li>${esc(c)}</li>`).join('')}</ul>` : ''}
    <a class="link link--light" href="${esc(waLink(s, 'Olá, gostaria de conversar com a Dra. Millena'))}" target="_blank" rel="noopener" data-track="sobre_wa">${esc(m.cta)}</a>
  </div>
</section>`;
}

/* ---------- 04. Face Explorer ---------- */
// Desenho de estudo de proporções: contorno, terços e traços em linha fina.
// As regiões são áreas de conversa na avaliação, não pontos de aplicação.
const REGION_SPOTS = [
  { key: /superior|testa|fronte/i, x: 200, y: 112, zoom: [200, 120, 1.7] },
  { key: /malar|maçã|maca/i, x: 118, y: 270, zoom: [140, 270, 1.9] },
  { key: /l[aá]bio/i, x: 200, y: 396, zoom: [200, 396, 2.1] },
  { key: /mento|queixo/i, x: 200, y: 462, zoom: [200, 455, 2.1] },
  { key: /mandib/i, x: 86, y: 382, zoom: [120, 400, 1.8] }
];

function faceSvg() {
  const contour = [0, 1, 2, 3].map(n => {
    const rx = 44 - n * 10, ry = 26 - n * 6;
    return `<ellipse cx="128" cy="276" rx="${rx}" ry="${ry}" /><ellipse cx="272" cy="276" rx="${rx}" ry="${ry}" />`;
  }).join('');
  return `
<svg class="face" viewBox="0 0 400 540" role="img" aria-label="Estudo de proporções do rosto, em linhas">
  <defs>
    <radialGradient id="glow"><stop offset="0" stop-color="#D5C9B5" stop-opacity=".55" /><stop offset="1" stop-color="#D5C9B5" stop-opacity="0" /></radialGradient>
    <clipPath id="head"><path d="M200 40C300 40 352 120 352 232C352 332 322 402 272 450C246 476 222 492 200 492C178 492 154 476 128 450C78 402 48 332 48 232C48 120 100 40 200 40Z" /></clipPath>
  </defs>
  <g class="face__zoom" data-zoom>
    <g class="face__guides">
      <line x1="12" y1="40" x2="388" y2="40" /><line x1="12" y1="190" x2="388" y2="190" />
      <line x1="12" y1="340" x2="388" y2="340" /><line x1="12" y1="492" x2="388" y2="492" />
      <line x1="200" y1="16" x2="200" y2="520" />
      <text x="388" y="118" text-anchor="end">1/3</text><text x="388" y="268" text-anchor="end">1/3</text><text x="388" y="420" text-anchor="end">1/3</text>
    </g>
    <g class="face__regions" clip-path="url(#head)">
      <rect data-region-shape="0" x="40" y="40" width="320" height="150" fill="url(#glow)" />
      <ellipse data-region-shape="1" cx="128" cy="276" rx="70" ry="48" fill="url(#glow)" />
      <ellipse data-region-shape="1" cx="272" cy="276" rx="70" ry="48" fill="url(#glow)" />
      <ellipse data-region-shape="2" cx="200" cy="398" rx="62" ry="32" fill="url(#glow)" />
      <ellipse data-region-shape="3" cx="200" cy="470" rx="56" ry="34" fill="url(#glow)" />
      <path data-region-shape="4" d="M52 300C60 360 90 410 128 450C154 476 178 492 200 492C222 492 246 476 272 450C310 410 340 360 348 300" fill="none" stroke="url(#glow)" stroke-width="40" />
    </g>
    <g class="face__contours" clip-path="url(#head)">${contour}</g>
    <g class="face__lines">
      <path class="face__outline" d="M200 40C300 40 352 120 352 232C352 332 322 402 272 450C246 476 222 492 200 492C178 492 154 476 128 450C78 402 48 332 48 232C48 120 100 40 200 40Z" />
      <path d="M96 186Q136 164 178 180M222 180Q264 164 304 186" />
      <path d="M112 224Q142 206 172 224Q142 238 112 224ZM228 224Q258 206 288 224Q258 238 228 224Z" />
      <circle cx="142" cy="223" r="6" /><circle cx="258" cy="223" r="6" />
      <path d="M200 206C198 250 192 290 186 316Q182 330 194 334Q200 338 206 334Q218 330 214 316" />
      <path d="M160 394Q180 380 200 388Q220 380 240 394M160 394Q200 424 240 394M168 395Q200 402 232 395" />
      <path d="M176 466Q200 476 224 466" />
    </g>
  </g>
</svg>`;
}

function explorer(cfg) {
  const e = cfg.explorer || {};
  const regioes = list(e.regioes);
  if (!regioes.length) return '';
  const used = new Set();
  const spots = regioes.map((r, i) => {
    let idx = REGION_SPOTS.findIndex((sp, n) => !used.has(n) && sp.key.test(plain(r.nome)));
    if (idx < 0) idx = REGION_SPOTS.findIndex((sp, n) => !used.has(n));
    if (idx >= 0) used.add(idx);
    return idx;
  });
  return `
<section class="ch ch--dark explorer" id="explorer" data-explorer>
  <div class="wrap">
    <div class="explorer__head">
      ${chap('explorer')}
      <h2 class="t-display" data-reveal>${lines(e.title)}</h2>
      ${e.intro ? `<p class="t-body">${esc(e.intro)}</p>` : ''}
    </div>
    <div class="explorer__grid">
      <div class="explorer__stage" data-stage>
        <div class="explorer__tilt" data-tilt>
          ${faceSvg()}
          ${regioes.map((r, i) => {
            const sp = REGION_SPOTS[spots[i]];
            if (!sp) return '';
            return `<button type="button" class="spot" style="--x:${(sp.x / 400 * 100).toFixed(2)}%;--y:${(sp.y / 540 * 100).toFixed(2)}%" data-spot="${i}" data-shape="${spots[i]}" data-zoom-to="${sp.zoom.join(',')}" aria-label="${esc(plain(r.nome))}"><span></span></button>`;
          }).join('')}
        </div>
        <p class="explorer__note">Desenho ilustrativo. Não representa pontos de aplicação nem prevê resultados.</p>
      </div>
      <div class="explorer__panel">
        <div class="explorer__tabs" role="tablist" aria-label="Regiões do rosto">
          ${regioes.map((r, i) => `<button type="button" role="tab" id="rg-tab-${i}" aria-controls="rg-${i}" aria-selected="${i === 0}" tabindex="${i === 0 ? 0 : -1}" data-tab="${i}">${esc(r.nome)}</button>`).join('')}
        </div>
        ${regioes.map((r, i) => `
        <div class="explorer__card" role="tabpanel" id="rg-${i}" aria-labelledby="rg-tab-${i}" data-card="${i}"${i === 0 ? '' : ' hidden'}>
          <h3>${esc(r.nome)}</h3>
          <p>${esc(r.texto)}</p>
          ${r.tratamentos ? `<p class="explorer__tags"><span>Tratamentos relacionados</span>${esc(r.tratamentos)}</p>` : ''}
          <a class="link link--light" href="${esc(waLink(cfg.settings, `Olá, gostaria de uma avaliação da região: ${plain(r.nome)}.`))}" target="_blank" rel="noopener" data-track="explorer_${i}_wa">Solicitar avaliação desta região</a>
        </div>`).join('')}
      </div>
    </div>
  </div>
</section>`;
}

// 05. Tratamentos: índice tipográfico que se abre por toque ou clique.
function tratamentos(cfg) {
  const p = cfg.procedimentos;
  const items = list(p.items);
  if (!items.length) return '';
  return `
<section class="ch ch--light treat" id="tratamentos">
  <div class="wrap">
    <div class="treat__head">
      ${chap('tratamentos')}
      <h2 class="t-display" data-reveal>${lines(p.title)}</h2>
      ${p.intro ? `<p class="t-body">${esc(p.intro)}</p>` : ''}
    </div>
    <div class="treat__list">
      ${items.map((it, i) => {
        const foto = safeUrl(it.foto);
        return `
      <details class="tr" name="tratamento" data-track-open="proc_${i}">
        <summary><span class="tr__name">${esc(it.title)}</span><i aria-hidden="true"></i></summary>
        <div class="tr__body">
          ${foto ? `<img src="${esc(foto)}" alt="" loading="lazy" decoding="async" />` : ''}
          <div>
            <p>${esc(it.desc)}</p>
            <a class="link" href="${esc(waLink(cfg.settings, `Olá, gostaria de saber mais sobre ${plain(it.title)}.`))}" target="_blank" rel="noopener" data-track="proc_${i}_wa">Perguntar sobre ${esc(plain(it.title).toLowerCase())}</a>
          </div>
        </div>
      </details>`;
      }).join('')}
    </div>
  </div>
</section>`;
}

/* ---------- 06. A ciência ---------- */
function wave(y, amp, ph) {
  const pts = [];
  for (let x = 0; x <= 480; x += 24) pts.push([x, y + Math.sin(x / 60 + ph) * amp]);
  return pts;
}
function layersSvg() {
  const bands = [
    { y: 48, a: 3, label: 'Pele', o: .9 },
    { y: 92, a: 6, label: 'Gordura', o: .55 },
    { y: 168, a: 8, label: 'Músculo', o: .35 },
    { y: 232, a: 4, label: 'Osso', o: .2 },
    { y: 290, a: 0 }
  ];
  const paths = [];
  for (let i = 0; i < bands.length - 1; i++) {
    const top = wave(bands[i].y, bands[i].a, i);
    const bot = wave(bands[i + 1].y, bands[i + 1].a, i + 1).reverse();
    const d = 'M' + top.map(p => p.join(' ')).join('L') + 'L' + bot.map(p => p.join(' ')).join('L') + 'Z';
    paths.push(`<path d="${d}" style="--o:${bands[i].o};--i:${i}" /><text x="12" y="${(bands[i].y + bands[i + 1].y) / 2 + 4}">${bands[i].label}</text>`);
  }
  return `<svg class="layers" viewBox="0 0 480 300" role="img" aria-label="Ilustração das camadas do rosto: pele, gordura, músculo e osso">${paths.join('')}</svg>`;
}
function collagenSvg() {
  // Gerador fixo: as fibras saem sempre iguais, sem depender de sorteio no navegador.
  let seed = 7;
  const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  const fibers = [];
  for (let n = 0; n < 56; n++) {
    const x1 = rnd() * 480, y1 = rnd() * 300;
    const ang = rnd() * Math.PI;
    const len = 80 + rnd() * 160;
    const x2 = x1 + Math.cos(ang) * len, y2 = y1 + Math.sin(ang) * len * .5;
    const cx = (x1 + x2) / 2 + (rnd() - .5) * 60, cy = (y1 + y2) / 2 + (rnd() - .5) * 60;
    fibers.push(`<path d="M${x1.toFixed(1)} ${y1.toFixed(1)}Q${cx.toFixed(1)} ${cy.toFixed(1)} ${x2.toFixed(1)} ${y2.toFixed(1)}" data-k="${rnd().toFixed(3)}" />`);
  }
  return `<svg class="collagen" viewBox="0 0 480 300" role="img" aria-label="Ilustração da rede de colágeno da pele" data-collagen>${fibers.join('')}</svg>`;
}

function ciencia(cfg) {
  const c = cfg.ciencia || {};
  const steps = list(cfg.processo && cfg.processo.steps);
  return `
<section class="ch ch--dark science" id="ciencia">
  <div class="wrap">
    <div class="science__head">
      ${chap('ciencia')}
      <h2 class="t-display" data-reveal>${lines(c.title)}</h2>
      ${c.intro ? `<p class="t-body">${esc(c.intro)}</p>` : ''}
    </div>
    <div class="plate">
      <figure class="plate__fig" data-reveal="draw">${layersSvg()}</figure>
      <div class="plate__text"><h3>Camadas</h3><p>${esc(c.camadas)}</p></div>
    </div>
    <div class="plate">
      <figure class="plate__fig">
        ${collagenSvg()}
        <label class="plate__range"><span>Hoje</span><input type="range" min="0" max="100" value="0" data-collagen-range aria-label="Passagem do tempo na rede de colágeno" /><span>Com o tempo</span></label>
      </figure>
      <div class="plate__text"><h3>Colágeno</h3><p>${esc(c.colageno)}</p><p class="plate__note">Representação ilustrativa.</p></div>
    </div>
    <div class="plate">
      <div class="plate__fig plate__fig--steps">
        <ol class="steps">${steps.map(st => `<li><strong>${esc(st.title)}</strong><span>${esc(st.desc)}</span></li>`).join('')}</ol>
      </div>
      <div class="plate__text"><h3>Avaliação individual</h3><p>${esc(c.avaliacao)}</p></div>
    </div>
  </div>
</section>`;
}

// 07. Resultados e confiança: depoimentos reais, caso com aviso, números e dúvidas.
function confianca(cfg) {
  const g = cfg.galeria;
  const d = cfg.depoimentos;
  const caso = list(g.items).find(i => safeUrl(i.before) && safeUrl(i.after));
  const quotes = list(d.items);
  const trust = list(cfg.hero.trust);
  const faqItems = list(cfg.faq && cfg.faq.items);
  return `
<section class="ch ch--light trust" id="confianca">
  <div class="wrap">
    <div class="trust__head">
      ${chap('confianca')}
      <h2 class="t-display" data-reveal>${lines(g.title)}</h2>
      ${g.intro ? `<p class="t-body">${esc(g.intro)}</p>` : ''}
    </div>
    ${trust.length ? `<dl class="facts">${trust.map(t => `<div><dt>${esc(t.num)}</dt><dd>${esc(t.label)}</dd></div>`).join('')}</dl>` : ''}
    <div class="trust__grid" id="resultados">
      ${caso ? `<figure class="trust__case">
        ${ba({ before: caso.before, after: caso.after, alt: plain(caso.titulo) || 'Caso' })}
        <figcaption>${esc(caso.titulo)}${g.disclaimer ? `<span>${esc(g.disclaimer)}</span>` : ''}</figcaption>
      </figure>` : ''}
      ${quotes.length ? `<div class="voices" id="depoimentos">
        <h3 class="voices__title">${esc(d.title)}</h3>
        <div class="voices__rail" data-rail tabindex="0" aria-label="Depoimentos">
          ${quotes.map((q, n) => `<figure class="voice"><blockquote>${esc(q.texto)}</blockquote><figcaption><strong>${esc(q.nome)}</strong><span>${esc(q.role)}</span><span class="voice__n">${n + 1} de ${quotes.length}</span></figcaption></figure>`).join('')}
        </div>
        <div class="voices__nav">
          <button type="button" class="arrow" data-scroll="-1" aria-label="Depoimento anterior">${icon.left}</button>
          <button type="button" class="arrow" data-scroll="1" aria-label="Próximo depoimento">${icon.right}</button>
        </div>
      </div>` : ''}
    </div>
    ${faqItems.length ? `<div class="faq" id="duvidas">
      <h3 class="faq__title">${esc(cfg.faq.title)}</h3>
      <div class="faq__list">
        ${faqItems.map((i, n) => `
        <details class="qa" data-track-open="faq_${n}">
          <summary><span>${esc(i.q)}</span><i aria-hidden="true"></i></summary>
          <p>${esc(i.a)}</p>
        </details>`).join('')}
      </div>
    </div>` : ''}
  </div>
</section>`;
}

// 08. O espaço: fotos do consultório quando existirem; até lá, uma composição de luz.
function espaco(cfg) {
  const e = cfg.espaco || {};
  const fotos = list(e.fotos).map(f => safeUrl(typeof f === 'string' ? f : f && f.src)).filter(Boolean);
  const itens = list(e.itens);
  return `
<section class="ch ch--dark space" id="espaco">
  <div class="wrap space__grid">
    <div class="space__visual${fotos.length ? ' space__visual--photos' : ''}" data-reveal="img">
      ${fotos.length
        ? fotos.slice(0, 3).map(f => `<img src="${esc(f)}" alt="Consultório da ${esc(plain(cfg.settings.nome))}" loading="lazy" decoding="async" />`).join('')
        : '<div class="room" aria-hidden="true"><span class="room__door"></span><span class="room__beam"></span><span class="room__floor"></span></div>'}
    </div>
    <div class="space__copy">
      ${chap('espaco')}
      <h2 class="t-display" data-reveal>${lines(e.title)}</h2>
      ${e.texto ? `<p class="t-body">${esc(e.texto)}</p>` : ''}
      ${itens.length ? `<ul class="space__list">${itens.map(i => `<li>${esc(i)}</li>`).join('')}</ul>` : ''}
    </div>
  </div>
</section>`;
}
function agendar(cfg) {
  const f = cfg.form;
  const opts = [...list(cfg.procedimentos.items).map(p => plain(p.title)), 'Ainda não sei'];
  const waDirect = waLink(cfg.settings, 'Olá, gostaria de agendar minha avaliação com a Dra. Millena');
  return `
<section class="ch ch--black finale" id="agendar">
  <div class="wrap">
    <div class="finale__head">
      ${chap('agendar')}
      <h2 class="finale__title" data-reveal>${lines(String(f.title || '').replace(/\.\s+/, '.|'))}</h2>
      <p class="t-lead">${esc(f.desc)}</p>
      <div class="finale__actions">
        <a class="btn btn--light" href="${esc(waDirect)}" target="_blank" rel="noopener" data-track="final_wa">${icon.wa}<span>Agendar minha avaliação</span></a>
        <a class="link link--light" href="#booker">Ou escolha um horário aqui</a>
      </div>
    </div>
    <div class="book__card" id="booker">
      <div class="book__copy">
        <h3>Pré-reserva online</h3>
        <p>Escolha o dia e o horário. A equipe confirma pelo WhatsApp.</p>
      </div>
      <div class="booker" data-booker>
        <ol class="booker__steps" aria-label="Etapas">
          <li data-step-dot="1" aria-current="step">Interesse</li>
          <li data-step-dot="2">Dia e horário</li>
          <li data-step-dot="3">Seus dados</li>
        </ol>

        <fieldset class="booker__step" data-step="1">
          <legend class="booker__q">O que você gostaria de avaliar?</legend>
          <div class="options">
            ${opts.map((o, i) => `<label class="option"><input type="radio" name="interesse" value="${esc(o)}"${i === opts.length - 1 ? ' checked' : ''} /><span>${esc(o)}</span></label>`).join('')}
          </div>
          <button type="button" class="btn btn--bronze btn--block" data-next>Ver horários livres</button>
        </fieldset>

        <fieldset class="booker__step" data-step="2" hidden>
          <legend class="booker__q">Escolha o melhor dia</legend>
          <div class="days" data-days role="radiogroup" aria-label="Dias disponíveis"><p class="booker__loading">Carregando horários…</p></div>
          <p class="booker__q booker__q--sm">Horários livres</p>
          <div class="times" data-times role="radiogroup" aria-label="Horários disponíveis"></div>
          <div class="booker__nav">
            <button type="button" class="btn btn--ghost" data-back>Voltar</button>
            <button type="button" class="btn btn--bronze" data-next disabled>Escolher este horário</button>
          </div>
        </fieldset>

        <form class="booker__step" data-step="3" id="leadForm" novalidate hidden>
          <p class="booker__summary" data-summary></p>
          <div class="field">
            <label for="nome">Nome</label>
            <input id="nome" name="nome" type="text" autocomplete="name" required maxlength="80" placeholder="Como podemos te chamar?" />
          </div>
          <div class="field">
            <label for="telefone">WhatsApp</label>
            <input id="telefone" name="telefone" type="tel" inputmode="tel" autocomplete="tel" required maxlength="16" placeholder="(11) 99999-9999" />
          </div>
          <p class="form__err" id="formErr" role="alert"></p>
          <div class="booker__nav">
            <button type="button" class="btn btn--ghost" data-back>Voltar</button>
            <button type="submit" class="btn btn--bronze">Confirmar pré-reserva</button>
          </div>
          <p class="form__legal">${esc(f.legal)}</p>
        </form>

        <div class="booker__done" data-done hidden role="status">
          <span class="booker__done-icon" aria-hidden="true">${icon.check}</span>
          <h3>Pré-reserva feita</h3>
          <p data-done-text></p>
          <a class="btn btn--wa" data-done-wa href="${esc(waDirect)}" target="_blank" rel="noopener" data-track="reserva_wa">${icon.wa}<span>Avisar no WhatsApp</span></a>
        </div>

        <div class="booker__closed" data-closed hidden>
          <p>A agenda online está indisponível agora. Fale com a equipe pelo WhatsApp e encontramos um horário para você.</p>
          <a class="btn btn--wa" href="${esc(waDirect)}" target="_blank" rel="noopener" data-track="agenda_fechada_wa">${icon.wa}<span>Falar no WhatsApp</span></a>
        </div>
      </div>
    </div>
  </div>
</section>`;
}

// 10. Rodapé editorial com as informações legais.
function footer(cfg) {
  const s = cfg.settings;
  const ig = String(s.instagram || '').replace(/^@/, '');
  return `
<footer class="foot">
  <div class="wrap">
    <div class="foot__top">
      <p class="foot__brand">${esc(plain(s.nome))}</p>
      <p class="foot__tag">${esc(cfg.footer.tag)}</p>
    </div>
    <div class="foot__cols">
      <div>
        <h3>Registro</h3>
        <p>${s.cro ? esc(s.cro) : 'Registro profissional informado na consulta'}</p>
      </div>
      <div>
        <h3>Local</h3>
        <p>${s.endereco ? `${esc(s.endereco)}<br />` : ''}${esc(s.cidade || '')}</p>
      </div>
      <nav aria-label="Contato">
        <h3>Contato</h3>
        <a href="${esc(waLink(s))}" target="_blank" rel="noopener" data-track="footer_wa">WhatsApp</a>
        ${ig ? `<a href="https://www.instagram.com/${esc(ig)}/" target="_blank" rel="noopener" data-track="footer_instagram">Instagram</a>` : ''}
        ${s.email ? `<a href="mailto:${esc(s.email)}" data-track="footer_email">${esc(s.email)}</a>` : ''}
      </nav>
      <nav aria-label="Informações">
        <h3>Informações</h3>
        <a href="/privacidade">Política de privacidade</a>
        <a href="#duvidas">Perguntas frequentes</a>
      </nav>
    </div>
    <div class="foot__bottom">
      <span>© ${new Date().getFullYear()} ${esc(plain(s.nome))}</span>
      <span>Responsável técnica: ${esc(plain(s.nome))}${s.cro ? `, ${esc(s.cro)}` : ''}. Os resultados variam de pessoa para pessoa.</span>
    </div>
  </div>
</footer>`;
}

function dock(cfg) {
  return `
<div class="dock" data-dock>
  <a class="btn btn--light" href="#agendar" data-track="dock_agendar">Agendar avaliação</a>
  <a class="dock__wa" href="${esc(waLink(cfg.settings))}" target="_blank" rel="noopener" aria-label="Falar no WhatsApp" data-track="dock_wa">${icon.wa}</a>
</div>`;
}

function consent(cfg) {
  if (!cfg.settings.pixelId && !cfg.settings.ga4Id) return '';
  return `
<div class="consent" data-consent hidden role="dialog" aria-label="Cookies">
  <p>Usamos cookies para entender como o site é usado e melhorar nossas campanhas.</p>
  <div><button type="button" data-consent-no>Recusar</button><button type="button" data-consent-yes>Aceitar</button></div>
</div>`;
}

export function renderPage(cfg, { origin }) {
  const s = cfg.settings;
  const client = {
    waNumber: digits(s.whatsapp),
    pixelId: digits(s.pixelId),
    ga4Id: String(s.ga4Id || '').replace(/[^A-Z0-9-]/gi, '')
  };
  return `<!doctype html>
<html lang="pt-BR">
<head>${head(cfg, origin)}
</head>
<body>
<a class="skip" href="#conteudo">Pular para o conteúdo</a>
${nav(cfg)}
<main id="conteudo">
${hero(cfg)}
${filosofia(cfg)}
${sobre(cfg)}
${explorer(cfg)}
${tratamentos(cfg)}
${ciencia(cfg)}
${confianca(cfg)}
${espaco(cfg)}
${agendar(cfg)}
</main>
${footer(cfg)}
${dock(cfg)}
${consent(cfg)}
<script>window.__SITE__=${JSON.stringify(client).replace(/</g, '\\u003c')}</script>
<script src="/js/site.js?v=${ASSET_VERSION}" defer></script>
</body>
</html>`;
}

// Política de privacidade (LGPD), no mesmo visual do site.
export function renderPrivacy(cfg, { origin }) {
  const s = cfg.settings;
  const nome = esc(plain(s.nome));
  const contato = s.email ? `<a href="mailto:${esc(s.email)}">${esc(s.email)}</a>` : `<a href="${esc(waLink(s))}">WhatsApp</a>`;
  return `<!doctype html>
<html lang="pt-BR">
<head>${head(cfg, origin)}
<meta name="robots" content="noindex" />
</head>
<body class="doc">
<main class="wrap doc__main">
  <a class="link" href="/">Voltar ao site</a>
  <h1 class="t-display">Política de privacidade</h1>
  <p class="t-lead">Como ${nome} trata os dados de quem visita este site, em linha com a Lei Geral de Proteção de Dados (Lei 13.709/2018).</p>
  <h2>Quais dados coletamos</h2>
  <p>Quando você faz uma pré-reserva ou deixa contato, guardamos o nome, o WhatsApp, o interesse escolhido e o horário. Também registramos estatísticas de uso anônimas, sem cookies: páginas vistas, cliques, origem da visita e tipo de aparelho.</p>
  <h2>Para que usamos</h2>
  <p>Para entrar em contato, confirmar o horário da avaliação e melhorar o site. Não vendemos nem compartilhamos seus dados com terceiros para fins comerciais.</p>
  <h2>Cookies de marketing</h2>
  <p>Ferramentas de anúncio (como Meta Pixel e Google Analytics) só são carregadas se você aceitar no aviso de cookies. Você pode recusar sem perder nenhuma função do site.</p>
  <h2>Seus direitos</h2>
  <p>Você pode pedir acesso, correção ou exclusão dos seus dados a qualquer momento pelo contato ${contato}.</p>
  <h2>Responsável</h2>
  <p>${nome}${s.cro ? `, ${esc(s.cro)}` : ''}${s.cidade ? `, ${esc(s.cidade)}` : ''}.</p>
</main>
</body>
</html>`;
}
