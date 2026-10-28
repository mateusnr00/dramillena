// Renderiza a página inicial completa no servidor a partir da configuração.
// Todo texto vindo do painel passa por esc() (ou fmt(), que escapa antes
// de aplicar os marcadores *destaque* e |quebra).

const ASSET_VERSION = '3';

export function esc(s) {
  return String(s ?? '').replace(/[&<>"']/g, c => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
  ));
}

export function fmt(s) {
  return esc(s).replace(/\*([^*]+)\*/g, '<em>$1</em>').replace(/\|/g, '<br />');
}

function plain(s) {
  return String(s ?? '').replace(/[*|]/g, '').trim();
}

function digits(s) {
  return String(s ?? '').replace(/\D/g, '');
}

export function waLink(settings, message) {
  const text = message || settings.whatsappMsg || '';
  return `https://wa.me/${digits(settings.whatsapp)}${text ? '?text=' + encodeURIComponent(text) : ''}`;
}

function safeUrl(u) {
  const s = String(u ?? '').trim();
  if (/^(https?:)?\/\//i.test(s) || s.startsWith('/')) return s;
  if (/^[\w.-]+\.(webp|png|jpe?g|avif|gif|svg)$/i.test(s)) return '/' + s;
  return '';
}

function absUrl(origin, u) {
  const s = safeUrl(u);
  if (!s) return '';
  return s.startsWith('/') && !s.startsWith('//') ? origin + s : s;
}

function list(arr) {
  return Array.isArray(arr) ? arr.filter(Boolean) : [];
}

const icon = {
  wa: '<svg viewBox="0 0 24 24" aria-hidden="true" fill="currentColor"><path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91C21.95 6.45 17.5 2 12.04 2zm0 18.15c-1.48 0-2.93-.4-4.2-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.26 8.26 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.25-8.24 4.54 0 8.24 3.7 8.24 8.24 0 4.55-3.7 8.24-8.24 8.24zm4.52-6.17c-.25-.12-1.47-.72-1.69-.81-.23-.08-.39-.12-.56.12-.17.25-.64.81-.78.97-.14.17-.29.19-.54.06-.25-.12-1.05-.39-1.99-1.23-.74-.66-1.23-1.47-1.38-1.72-.14-.25-.02-.38.11-.51.11-.11.25-.29.37-.43.13-.15.17-.25.25-.42.08-.17.04-.31-.02-.43-.06-.12-.56-1.34-.76-1.84-.2-.48-.41-.42-.56-.43h-.48c-.17 0-.43.06-.66.31-.22.25-.86.85-.86 2.07 0 1.22.89 2.4 1.01 2.56.12.17 1.75 2.67 4.23 3.74.59.26 1.05.41 1.41.52.59.19 1.13.16 1.56.1.48-.07 1.47-.6 1.67-1.18.21-.58.21-1.07.14-1.18-.06-.11-.22-.17-.47-.29z"/></svg>',
  chevron: '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 6l6 6-6 6"/></svg>',
  plus: '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>',
  close: '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>',
  check: '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>',
  left: '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 6l-6 6 6 6"/></svg>',
  star: '<svg viewBox="0 0 24 24" aria-hidden="true" fill="currentColor"><path d="M12 2.8l2.8 5.9 6.4.8-4.7 4.4 1.2 6.4L12 17.2l-5.7 3.1 1.2-6.4-4.7-4.4 6.4-.8z"/></svg>',
  ig: '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/></svg>',
  clock: '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>',
  pin: '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"><path d="M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/></svg>',
  mail: '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"><rect x="3" y="5" width="18" height="14" rx="3"/><path d="M4 7l8 6 8-6"/></svg>'
};

function baSlider({ before, after, alt, priority = false, label = '' }) {
  const b = safeUrl(before);
  const a = safeUrl(after);
  if (!b || !a) return '';
  const load = priority ? 'loading="eager" fetchpriority="high"' : 'loading="lazy"';
  return `
    <div class="ba" data-ba style="--pos:50%">
      <img class="ba__img" src="${esc(b)}" alt="${esc(alt)} · antes" ${load} decoding="async" width="664" height="890" />
      <img class="ba__img ba__after" src="${esc(a)}" alt="${esc(alt)} · depois" ${load} decoding="async" width="664" height="890" />
      <span class="ba__tag ba__tag--l">Antes</span>
      <span class="ba__tag ba__tag--r">Depois</span>
      <span class="ba__line" aria-hidden="true"><span class="ba__knob">${icon.left}${icon.chevron}</span></span>
      <input class="ba__range" type="range" min="0" max="100" value="50" aria-label="Comparar antes e depois${label ? ': ' + esc(label) : ''}" />
    </div>`;
}

function head(cfg, origin) {
  const s = cfg.settings;
  const title = plain(s.seoTitle) || plain(s.nome);
  const desc = plain(s.seoDescription);
  const og = absUrl(origin, s.ogImage || cfg.sobre.foto);
  const sameAs = s.instagram ? [`https://www.instagram.com/${String(s.instagram).replace(/^@/, '')}/`] : [];

  const business = {
    '@context': 'https://schema.org',
    '@type': ['MedicalBusiness', 'Dentist'],
    name: plain(s.nome),
    description: desc,
    url: origin + '/',
    image: og || undefined,
    telephone: s.whatsapp ? '+' + digits(s.whatsapp) : undefined,
    email: s.email || undefined,
    address: s.endereco || s.cidade ? {
      '@type': 'PostalAddress',
      streetAddress: s.endereco || undefined,
      addressLocality: plain(s.cidade).split(',')[0] || undefined,
      addressCountry: 'BR'
    } : undefined,
    sameAs: sameAs.length ? sameAs : undefined,
    priceRange: '$$$'
  };
  const faq = list(cfg.faq.items).length ? {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: list(cfg.faq.items).map(i => ({
      '@type': 'Question',
      name: plain(i.q),
      acceptedAnswer: { '@type': 'Answer', text: plain(i.a) }
    }))
  } : null;
  const ld = obj => `<script type="application/ld+json">${JSON.stringify(obj).replace(/</g, '\\u003c')}</script>`;

  return `
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
<title>${esc(title)}</title>
<meta name="description" content="${esc(desc)}" />
<link rel="canonical" href="${esc(origin)}/" />
<meta name="theme-color" content="#fbfaf8" />
<meta property="og:type" content="website" />
<meta property="og:locale" content="pt_BR" />
<meta property="og:title" content="${esc(title)}" />
<meta property="og:description" content="${esc(desc)}" />
<meta property="og:url" content="${esc(origin)}/" />
${og ? `<meta property="og:image" content="${esc(og)}" />` : ''}
<meta name="twitter:card" content="summary_large_image" />
<link rel="icon" href="/favicon.svg" type="image/svg+xml" />
<link rel="apple-touch-icon" href="/apple-touch-icon.png" />
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Inter:wght@400;500;600;700&display=swap" />
<link rel="preload" as="image" href="${esc(safeUrl(cfg.hero.antes))}" fetchpriority="high" />
<link rel="stylesheet" href="/css/site.css?v=${ASSET_VERSION}" />
${ld(business)}
${faq ? ld(faq) : ''}`;
}

function nav(cfg) {
  const s = cfg.settings;
  const links = [
    ['#procedimentos', 'Procedimentos'],
    ['#resultados', 'Resultados'],
    ['#sobre', 'Sobre'],
    ['#depoimentos', 'Depoimentos'],
    ['#duvidas', 'Dúvidas']
  ];
  return `
<header class="nav" data-nav>
  <div class="nav__inner">
    <a class="brand" href="#topo" aria-label="${esc(plain(s.nome))}, início">Millena <em>Curty</em></a>
    <nav class="nav__links" aria-label="Seções">
      ${links.map(([h, t]) => `<a href="${h}">${t}</a>`).join('')}
    </nav>
    <a class="nav__cta" href="#agendar" data-track="nav_agendar">Agendar</a>
    <button class="nav__burger" type="button" aria-label="Abrir menu" aria-expanded="false" aria-controls="menu" data-burger>
      <span></span><span></span>
    </button>
  </div>
</header>
  <div class="menu" id="menu" data-menu hidden>
  <nav aria-label="Menu">
    ${links.map(([h, t]) => `<a href="${h}">${t}</a>`).join('')}
    <a href="#agendar" data-track="menu_agendar">Agendar avaliação</a>
  </nav>
  <a class="menu__wa" href="${esc(waLink(s))}" target="_blank" rel="noopener" data-track="menu_whatsapp">${icon.wa} Falar no WhatsApp</a>
</div>
`;
}

function hero(cfg) {
  const h = cfg.hero;
  const s = cfg.settings;
  return `
<section class="hero" id="topo">
  <div class="wrap hero__copy">
    <p class="eyebrow reveal">${esc(h.eyebrow)}</p>
    <h1 class="hero__title reveal">${fmt(h.title)}${h.titleMuted ? `<span class="hero__muted">${fmt(h.titleMuted)}</span>` : ''}</h1>
    <p class="hero__sub reveal">${esc(h.sub)}</p>
    <div class="actions reveal">
      <a class="btn btn--primary" href="#agendar" data-track="hero_agendar">${esc(h.ctaPrimary)}</a>
      <a class="link" href="${esc(waLink(s))}" target="_blank" rel="noopener" data-track="hero_whatsapp">${esc(h.ctaSecondary)} ${icon.chevron}</a>
    </div>
  </div>
  <div class="hero__stage reveal">
    <div class="hero__glow" aria-hidden="true"></div>
    ${baSlider({ before: h.antes, after: h.depois, alt: 'Resultado de harmonização facial', priority: true })}
    ${h.note ? `<p class="hero__note">${esc(h.note)}</p>` : ''}
  </div>
</section>`;
}

function stats(cfg) {
  const items = list(cfg.stats);
  if (!items.length) return '';
  return `
<section class="stats" aria-label="Números">
  <div class="wrap stats__grid">
    ${items.map(i => `
      <div class="stat reveal">
        <strong>${esc(i.num)}</strong>
        <span>${esc(i.label)}</span>
      </div>`).join('')}
  </div>
</section>`;
}

function manifesto(cfg) {
  const t = plain(cfg.manifesto && cfg.manifesto.text);
  if (!t) return '';
  const words = t.split(/\s+/).map(w => `<span>${esc(w)}</span>`).join(' ');
  return `
<section class="manifesto" aria-label="Filosofia">
  <div class="wrap">
    <p class="manifesto__text" data-words>${words}</p>
  </div>
</section>`;
}

function sobre(cfg) {
  const a = cfg.sobre;
  const foto = safeUrl(a.foto);
  return `
<section class="sobre section" id="sobre">
  <div class="wrap sobre__grid">
    <figure class="sobre__photo reveal">
      ${foto ? `<img src="${esc(foto)}" alt="${esc(plain(cfg.settings.nome))}" loading="lazy" decoding="async" width="1200" height="1600" />` : ''}
      ${cfg.settings.cro ? `<figcaption class="sobre__badge">${icon.check}<span>${esc(cfg.settings.cro)}</span></figcaption>` : ''}
    </figure>
    <div class="sobre__copy">
      <p class="eyebrow reveal">${esc(a.eyebrow)}</p>
      <h2 class="h2 reveal">${fmt(a.title)}</h2>
      <p class="body reveal">${esc(a.bio1)}</p>
      ${a.bio2 ? `<p class="body reveal">${esc(a.bio2)}</p>` : ''}
      <ul class="checks reveal">
        ${list(a.credentials).map(c => `<li><span class="checks__ico">${icon.check}</span>${esc(c)}</li>`).join('')}
      </ul>
      <a class="link reveal" href="${esc(waLink(cfg.settings, 'Olá, Dra. Millena! Gostaria de conversar com você.'))}" target="_blank" rel="noopener" data-track="sobre_whatsapp">Converse com a Dra. Millena ${icon.chevron}</a>
    </div>
  </div>
</section>`;
}

function procedimentos(cfg) {
  const p = cfg.procedimentos;
  const items = list(p.items);
  if (!items.length) return '';
  const s = cfg.settings;
  const cards = items.map((it, i) => {
    const ic = safeUrl(it.icon);
    return `
      <article class="pcard">
        <button class="pcard__hit" type="button" data-open="proc-${i}" data-track="proc_${i}" aria-haspopup="dialog">
          <span class="sr-only">Saiba mais sobre ${esc(it.title)}</span>
        </button>
        ${ic ? `<img class="pcard__icon" src="${esc(ic)}" alt="" loading="lazy" decoding="async" width="400" height="400" />` : ''}
        <h3 class="pcard__title">${esc(it.title)}</h3>
        <p class="pcard__short">${esc(it.short)}</p>
        <span class="pcard__plus" aria-hidden="true">${icon.plus}</span>
      </article>`;
  }).join('');

  const dialogs = items.map((it, i) => {
    const ic = safeUrl(it.icon);
    const facts = [['Duração', it.duracao], ['Resultado', it.resultado], ['Recuperação', it.recuperacao]].filter(f => f[1]);
    return `
    <dialog class="sheet" id="proc-${i}" aria-labelledby="proc-${i}-t">
      <div class="sheet__body">
        <button class="sheet__close" type="button" data-close aria-label="Fechar">${icon.close}</button>
        ${ic ? `<img class="sheet__icon" src="${esc(ic)}" alt="" loading="lazy" width="400" height="400" />` : ''}
        <p class="eyebrow">${esc(p.eyebrow || 'Procedimento')}</p>
        <h3 class="sheet__title" id="proc-${i}-t">${esc(it.title)}</h3>
        <p class="sheet__lead">${esc(it.short)}</p>
        <p class="body">${esc(it.desc)}</p>
        ${facts.length ? `<dl class="facts">${facts.map(([k, v]) => `<div><dt>${k}</dt><dd>${esc(v)}</dd></div>`).join('')}</dl>` : ''}
        <a class="btn btn--primary btn--block" href="${esc(waLink(s, `Olá, Dra. Millena! Gostaria de saber mais sobre ${plain(it.title)}.`))}" target="_blank" rel="noopener" data-track="proc_${i}_whatsapp">${icon.wa} Quero saber mais</a>
      </div>
    </dialog>`;
  }).join('');

  return `
<section class="procs section" id="procedimentos">
  <div class="wrap procs__head">
    <div>
      <p class="eyebrow reveal">${esc(p.eyebrow)}</p>
      <h2 class="h2 reveal">${fmt(p.title)}</h2>
    </div>
    <div class="arrows" aria-hidden="true">
      <button type="button" class="arrow" data-scroll="-1" tabindex="-1">${icon.left}</button>
      <button type="button" class="arrow" data-scroll="1" tabindex="-1">${icon.chevron}</button>
    </div>
  </div>
  <div class="rail" data-rail tabindex="0" aria-label="Procedimentos">
    ${cards}
  </div>
  ${dialogs}
</section>`;
}

function processo(cfg) {
  const p = cfg.processo;
  const steps = list(p.steps);
  if (!steps.length) return '';
  return `
<section class="steps section" id="como-funciona">
  <div class="wrap">
    <p class="eyebrow reveal">${esc(p.eyebrow)}</p>
    <h2 class="h2 reveal">${fmt(p.title)}</h2>
    <ol class="steps__grid">
      ${steps.map((st, i) => `
        <li class="step reveal" style="--d:${i * 80}ms">
          <span class="step__n">${String(i + 1).padStart(2, '0')}</span>
          <h3>${esc(st.title)}</h3>
          <p>${esc(st.desc)}</p>
        </li>`).join('')}
    </ol>
  </div>
</section>`;
}

function resultados(cfg) {
  const r = cfg.resultados;
  const items = list(r.items).filter(i => safeUrl(i.before) && safeUrl(i.after));
  if (!items.length) return '';
  const cats = [...new Set(items.map(i => plain(i.categoria)).filter(Boolean))];
  return `
<section class="results section dark" id="resultados">
  <div class="wrap">
    <div class="results__head">
      <p class="eyebrow reveal">${esc(r.eyebrow)}</p>
      <h2 class="h2 reveal">${fmt(r.title)}</h2>
      ${r.intro ? `<p class="body reveal">${esc(r.intro)}</p>` : ''}
    </div>
    ${cats.length > 1 ? `
    <div class="seg reveal" role="tablist" aria-label="Filtrar resultados">
      <button type="button" role="tab" aria-selected="true" data-filter="">Todos</button>
      ${cats.map(c => `<button type="button" role="tab" aria-selected="false" data-filter="${esc(c)}">${esc(c)}</button>`).join('')}
    </div>` : ''}
    <div class="results__grid${items.length === 1 ? ' results__grid--one' : ''}">
      ${items.map(i => `
        <figure class="result reveal" data-cat="${esc(plain(i.categoria))}">
          ${baSlider({ before: i.before, after: i.after, alt: plain(i.titulo) || 'Resultado', label: plain(i.titulo) })}
          <figcaption><strong>${esc(i.titulo)}</strong>${i.categoria ? `<span>${esc(i.categoria)}</span>` : ''}</figcaption>
        </figure>`).join('')}
    </div>
    ${r.disclaimer ? `<p class="fine">${esc(r.disclaimer)}</p>` : ''}
  </div>
</section>`;
}

function depoimentos(cfg) {
  const d = cfg.depoimentos;
  const items = list(d.items);
  if (!items.length) return '';
  const card = (t, hidden) => `
    <figure class="quote"${hidden ? ' aria-hidden="true"' : ''}>
      <div class="quote__stars" aria-label="5 estrelas">${icon.star.repeat(5)}</div>
      <blockquote>${esc(t.texto)}</blockquote>
      <figcaption>
        <span class="quote__avatar" aria-hidden="true">${esc(plain(t.nome).charAt(0))}</span>
        <span><strong>${esc(t.nome)}</strong><small>${esc(t.role)}</small></span>
      </figcaption>
    </figure>`;
  return `
<section class="testis section" id="depoimentos">
  <div class="wrap">
    <p class="eyebrow reveal">${esc(d.eyebrow)}</p>
    <h2 class="h2 reveal">${fmt(d.title)}</h2>
  </div>
  <div class="marquee" data-marquee>
    <div class="marquee__track" style="--n:${items.length}">
      ${items.map(t => card(t, false)).join('')}
      ${items.map(t => card(t, true)).join('')}
    </div>
  </div>
</section>`;
}

function faq(cfg) {
  const f = cfg.faq;
  const items = list(f.items);
  if (!items.length) return '';
  return `
<section class="faq section" id="duvidas">
  <div class="wrap wrap--narrow">
    <p class="eyebrow reveal">${esc(f.eyebrow)}</p>
    <h2 class="h2 reveal">${fmt(f.title)}</h2>
    <div class="faq__list reveal">
      ${items.map((i, n) => `
        <details class="qa" data-track-open="faq_${n}">
          <summary><span>${esc(i.q)}</span><i aria-hidden="true">${icon.plus}</i></summary>
          <div class="qa__a"><p>${esc(i.a)}</p></div>
        </details>`).join('')}
    </div>
  </div>
</section>`;
}

function agendar(cfg) {
  const a = cfg.agendar;
  const s = cfg.settings;
  const opts = [...list(cfg.procedimentos.items).map(p => plain(p.title)), 'Ainda não sei'];
  const ig = String(s.instagram || '').replace(/^@/, '');
  const contact = [
    s.whatsapp && `<li>${icon.wa}<a href="${esc(waLink(s))}" target="_blank" rel="noopener" data-track="agendar_whatsapp">WhatsApp</a></li>`,
    ig && `<li>${icon.ig}<a href="https://www.instagram.com/${esc(ig)}/" target="_blank" rel="noopener" data-track="agendar_instagram">@${esc(ig)}</a></li>`,
    s.horario && `<li>${icon.clock}<span>${esc(s.horario)}</span></li>`,
    (s.endereco || s.cidade) && `<li>${icon.pin}<span>${esc([s.endereco, s.cidade].filter(Boolean).join(' · '))}</span></li>`
  ].filter(Boolean).join('');

  return `
<section class="book section" id="agendar">
  <div class="wrap">
    <div class="book__card reveal">
      <div class="book__copy">
        <p class="eyebrow">${esc(a.eyebrow)}</p>
        <h2 class="h2">${fmt(a.title)}</h2>
        <p class="body">${esc(a.desc)}</p>
        <ul class="contact">${contact}</ul>
      </div>
      <form class="form" data-lead novalidate>
        <div class="field">
          <label for="f-nome">Nome</label>
          <input id="f-nome" name="nome" type="text" autocomplete="name" required maxlength="80" placeholder="Como podemos te chamar?" />
        </div>
        <div class="field">
          <label for="f-tel">WhatsApp</label>
          <input id="f-tel" name="telefone" type="tel" inputmode="tel" autocomplete="tel" required maxlength="16" placeholder="(11) 90000-0000" />
        </div>
        <fieldset class="field">
          <legend>Tenho interesse em</legend>
          <div class="chips">
            ${opts.map((o, i) => `<label class="chip"><input type="radio" name="procedimento" value="${esc(o)}"${i === opts.length - 1 ? ' checked' : ''} /><span>${esc(o)}</span></label>`).join('')}
          </div>
        </fieldset>
        <p class="form__err" role="alert" data-err></p>
        <button class="btn btn--light btn--block" type="submit">${icon.wa} ${esc(a.submit)}</button>
        <p class="form__legal">${esc(a.legal)}</p>
      </form>
    </div>
  </div>
</section>`;
}

function footer(cfg) {
  const s = cfg.settings;
  const ig = String(s.instagram || '').replace(/^@/, '');
  const year = new Date().getFullYear();
  return `
<footer class="foot">
  <div class="wrap">
    <div class="foot__top">
      <a class="brand" href="#topo">Millena <em>Curty</em></a>
      <p>Harmonização facial autoral.${s.cidade ? ' ' + esc(s.cidade) + '.' : ''}</p>
    </div>
    <div class="foot__cols">
      <div>
        <h4>Navegue</h4>
        <a href="#procedimentos">Procedimentos</a>
        <a href="#resultados">Resultados</a>
        <a href="#sobre">Sobre</a>
        <a href="#duvidas">Dúvidas</a>
      </div>
      <div>
        <h4>Contato</h4>
        <a href="${esc(waLink(s))}" target="_blank" rel="noopener" data-track="footer_whatsapp">WhatsApp</a>
        ${ig ? `<a href="https://www.instagram.com/${esc(ig)}/" target="_blank" rel="noopener" data-track="footer_instagram">Instagram</a>` : ''}
        ${s.email ? `<a href="mailto:${esc(s.email)}" data-track="footer_email">${esc(s.email)}</a>` : ''}
      </div>
      <div>
        <h4>Atendimento</h4>
        ${s.horario ? `<span>${esc(s.horario)}</span>` : ''}
        ${s.endereco ? `<span>${esc(s.endereco)}</span>` : ''}
        ${s.cidade ? `<span>${esc(s.cidade)}</span>` : ''}
      </div>
    </div>
    <div class="foot__bottom">
      <span>© ${year} ${esc(plain(s.nome))}${s.cro ? ' · ' + esc(s.cro) : ''}</span>
      <span>Os resultados variam de pessoa para pessoa. Este site não substitui uma consulta.</span>
    </div>
  </div>
</footer>`;
}

function dock(cfg) {
  return `
<div class="dock" data-dock aria-hidden="true">
  <a class="btn btn--primary" href="#agendar" tabindex="-1" data-track="dock_agendar">Agendar avaliação</a>
  <a class="dock__wa" href="${esc(waLink(cfg.settings))}" target="_blank" rel="noopener" tabindex="-1" aria-label="WhatsApp" data-track="dock_whatsapp">${icon.wa}</a>
</div>`;
}

function consent(cfg) {
  if (!cfg.settings.pixelId && !cfg.settings.ga4Id) return '';
  return `
<div class="consent" data-consent hidden role="dialog" aria-label="Cookies">
  <p>Usamos cookies para entender como o site é usado e melhorar nossas campanhas.</p>
  <div><button type="button" class="btn btn--ghost btn--sm" data-consent-no>Recusar</button><button type="button" class="btn btn--primary btn--sm" data-consent-yes>Aceitar</button></div>
</div>`;
}

export function renderPage(cfg, { origin }) {
  const s = cfg.settings;
  const client = {
    wa: waLink(s),
    waNumber: digits(s.whatsapp),
    pixelId: String(s.pixelId || '').replace(/\D/g, ''),
    ga4Id: String(s.ga4Id || '').replace(/[^A-Z0-9-]/gi, '')
  };
  return `<!doctype html>
<html lang="pt-BR" class="no-js">
<head>
<script>document.documentElement.classList.remove('no-js')</script>${head(cfg, origin)}
</head>
<body>
<a class="skip" href="#conteudo">Pular para o conteúdo</a>
${nav(cfg)}
<main id="conteudo">
${hero(cfg)}
${stats(cfg)}
${manifesto(cfg)}
${sobre(cfg)}
${procedimentos(cfg)}
${processo(cfg)}
${resultados(cfg)}
${depoimentos(cfg)}
${faq(cfg)}
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
