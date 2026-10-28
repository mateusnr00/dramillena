// Renderiza a página inicial no servidor, com o mesmo HTML e visual do site
// original, preenchido com a configuração editada no painel.
// Todo texto vindo do painel passa por esc() (ou fmt(), que escapa antes
// de aplicar os marcadores *destaque* e |quebra).

const ASSET_VERSION = '4';

export function esc(s) {
  return String(s ?? '').replace(/[&<>"']/g, c => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
  ));
}

export function fmt(s) {
  return esc(s).replace(/\*([^*]+)\*/g, '<em>$1</em>').replace(/\|/g, '<br/>');
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

// Para usar dentro de url('...') em style="".
function cssUrl(u) {
  return esc(safeUrl(u).replace(/['"()\\\s]/g, c => '%' + c.charCodeAt(0).toString(16).padStart(2, '0')));
}

function absUrl(origin, u) {
  const s = safeUrl(u);
  if (!s) return '';
  return s.startsWith('/') ? origin + s : s;
}

function list(arr) {
  return Array.isArray(arr) ? arr.filter(Boolean) : [];
}

const WA_ICON = '<path d="M17.5 14.4l-2.2-1.1c-.3-.2-.7-.1-.9.2l-.7.9c-.2.2-.5.3-.8.2-1.4-.5-2.7-1.7-3.4-3-.2-.3-.1-.6.1-.8l.8-.6c.3-.2.4-.6.2-.9L9.5 6.6c-.2-.3-.6-.5-1-.4-1.8.3-3 1.9-2.8 3.7.5 4.1 4 7.4 8.1 7.6 1.8.1 3.4-1.2 3.7-3 .1-.4-.1-.8-.4-1.1z"/><path d="M12 22a10 10 0 1110-10c0 1.6-.4 3.2-1.1 4.6l1 4.4-4.5-1c-1.4.6-2.9 1-4.4 1zm0-18a8 8 0 00-7 12L4 19l3.1-1A8 8 0 1012 4z"/>';
const wa = (size) => `<svg${size ? ` width="${size}" height="${size}"` : ''} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">${WA_ICON}</svg>`;
const CHECK = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M20 6L9 17l-5-5"/></svg>';
const STAR = '<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2l3 7h7l-5.5 4.5L18 21l-6-4-6 4 1.5-7.5L2 9h7z"/></svg>';
const ARROW = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M5 12h14M13 5l7 7-7 7"/></svg>';

function head(cfg, origin) {
  const s = cfg.settings;
  const title = plain(s.seoTitle) || plain(s.nome);
  const desc = plain(s.seoDescription);
  const og = absUrl(origin, s.ogImage || cfg.millena.foto);
  const ig = String(s.instagram || '').replace(/^@/, '');
  const business = {
    '@context': 'https://schema.org',
    '@type': 'MedicalBusiness',
    name: plain(s.nome) + ' - Harmonização Facial',
    description: desc,
    url: origin + '/',
    image: og || undefined,
    telephone: s.whatsapp ? '+' + digits(s.whatsapp) : undefined,
    email: s.email || undefined,
    address: s.cidade ? { '@type': 'PostalAddress', addressLocality: plain(s.cidade), addressCountry: 'BR' } : undefined,
    sameAs: ig ? [`https://www.instagram.com/${ig}/`] : undefined,
    priceRange: '$$$'
  };
  return `
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
<meta name="theme-color" content="#1a1614" />
<title>${esc(title)}</title>
<meta name="description" content="${esc(desc)}" />
<link rel="canonical" href="${esc(origin)}/" />
<meta property="og:type" content="website" />
<meta property="og:title" content="${esc(title)}" />
<meta property="og:description" content="${esc(desc)}" />
${og ? `<meta property="og:image" content="${esc(og)}" />` : ''}
<meta property="og:url" content="${esc(origin)}/" />
<meta property="og:locale" content="pt_BR" />
<meta name="twitter:card" content="summary_large_image" />
<link rel="icon" href="/favicon.svg" type="image/svg+xml" />
<link rel="apple-touch-icon" href="/apple-touch-icon.png" />
<script type="application/ld+json">${JSON.stringify(business).replace(/</g, '\\u003c')}</script>
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,400;0,9..144,500;1,9..144,300;1,9..144,400&family=Outfit:wght@200;300;400;500;600&display=swap" rel="stylesheet" />
${safeUrl(cfg.hero.antes) ? `<link rel="preload" as="image" href="${esc(safeUrl(cfg.hero.antes))}" />` : ''}
<link rel="stylesheet" href="/css/site.css?v=${ASSET_VERSION}" />`;
}

function hero(cfg) {
  const h = cfg.hero;
  const s = cfg.settings;
  const trust = list(h.trust);
  return `
<header class="hero">
  <div class="ba" id="ba" role="img" aria-label="Antes e depois de harmonização facial. Arraste para comparar.">
    <div class="ba__layer ba__before" style="background-image: url('${cssUrl(h.antes)}');"></div>
    <div class="ba__layer ba__after" style="background-image: url('${cssUrl(h.depois)}');"></div>
    <div class="ba__labels">
      <span>Antes</span>
      <span>Depois</span>
    </div>
    <div class="ba__handle"></div>
  </div>
  <div class="hero__overlay"></div>

  <div class="hero__content">
    <div class="hero__eyebrow reveal">${esc(h.eyebrow)}</div>
    <h1 class="hero__title reveal">${fmt(h.title)}</h1>
    <p class="hero__sub reveal">${esc(h.sub)}</p>

    <div class="hero__cta reveal">
      <a href="${esc(waLink(s))}" class="btn btn--wa wa-link" data-track="hero_wa" target="_blank" rel="noopener">
        ${wa(22)}
        ${esc(h.ctaPrimary)}
      </a>
      <a href="#agendar" class="btn btn--ghost" data-track="hero_agendar">
        ${esc(h.ctaSecondary)}
        ${ARROW}
      </a>
    </div>
${trust.length ? `
    <div class="hero__trust reveal">
${trust.map(t => `      <div class="hero__trust-item">
        <strong>${esc(t.num)}</strong>
        <span>${esc(t.label)}</span>
      </div>`).join('\n')}
    </div>` : ''}

    ${h.note ? `<p class="hero__note">${esc(h.note)}</p>` : ''}
  </div>
</header>`;
}

function millena(cfg) {
  const m = cfg.millena;
  const foto = safeUrl(m.foto);
  return `
<section id="millena" class="millena">
  <div class="millena-wrap">
    <div class="millena__photo reveal">
      ${foto ? `<img src="${esc(foto)}" alt="${esc(plain(cfg.settings.nome))}, cirurgiã-dentista especialista em harmonização facial" loading="lazy" decoding="async" width="1200" height="1600" />` : ''}
      ${m.badge ? `<div class="millena__badge">
        ${CHECK}
        <span><strong>${esc(m.badge)}</strong></span>
      </div>` : ''}
    </div>

    <div class="reveal">
      <h2 class="millena__title">${fmt(m.title)}</h2>
      <div class="millena__bio">
        ${m.bio1 ? `<p>${esc(m.bio1)}</p>` : ''}
        ${m.bio2 ? `<p>${esc(m.bio2)}</p>` : ''}
      </div>

      <ul class="millena__credentials">
${list(m.credentials).map(c => `        <li>
          ${CHECK}
          <span>${esc(c)}</span>
        </li>`).join('\n')}
      </ul>

      <div class="section-wa reveal">
        <a href="${esc(waLink(cfg.settings, 'Olá, gostaria de conversar com a Dra. Millena'))}" class="wa-link" target="_blank" rel="noopener" data-track="sobre_wa">
          ${wa()}
          ${esc(m.cta)}
        </a>
      </div>
    </div>
  </div>
</section>`;
}

function galeria(cfg) {
  const g = cfg.galeria;
  const items = list(g.items).filter(i => safeUrl(i.before) && safeUrl(i.after));
  if (!items.length) return '';
  const cats = [];
  items.forEach(i => {
    const c = plain(i.categoria);
    if (c && !cats.some(x => x.slug === slug(c))) cats.push({ slug: slug(c), label: c });
  });
  return `
<section id="galeria" class="galeria">
  <div class="section__head reveal">
    <h2 class="section__title">${fmt(g.title)}</h2>
    ${g.intro ? `<p class="section__intro">${esc(g.intro)}</p>` : ''}
  </div>
${cats.length > 1 ? `
  <div class="galeria__filters">
    <button class="galeria__filter active" data-filter="all">Todos</button>
${cats.map(c => `    <button class="galeria__filter" data-filter="${esc(c.slug)}">${esc(c.label)}</button>`).join('\n')}
  </div>` : ''}

  <div class="galeria__grid${items.length === 1 ? ' galeria__grid--one' : ''}">
${items.map(i => `    <div class="gcase reveal" data-cat="${esc(slug(i.categoria))}" role="img" aria-label="${esc(plain(i.titulo) || 'Resultado')}: antes e depois. Arraste para comparar.">
      <div class="gcase__before" style="background-image: url('${cssUrl(i.before)}');"></div>
      <div class="gcase__after" style="background-image: url('${cssUrl(i.after)}');"></div>
      <div class="gcase__labels"><span>Antes</span><span>Depois</span></div>
      <div class="gcase__handle"></div>
      <div class="gcase__meta"><strong>${esc(i.titulo)}</strong><span>${esc(i.categoria)}</span></div>
    </div>`).join('\n\n')}
  </div>

  ${g.disclaimer ? `<p class="galeria__disclaimer">${esc(g.disclaimer)}</p>` : ''}

  ${g.cta ? `<div class="galeria__cta">
    <a href="#agendar" class="galeria__cta-link" data-track="galeria_cta">${esc(g.cta)}</a>
  </div>` : ''}
</section>`;
}

function procedimentos(cfg) {
  const p = cfg.procedimentos;
  const items = list(p.items);
  if (!items.length) return '';
  return `
<section id="procedimentos" class="procedimentos">
  <div class="section__head reveal">
    <h2 class="section__title">${fmt(p.title)}</h2>
  </div>

  <div class="proc-grid">
${items.map(it => {
    const ic = safeUrl(it.icon);
    return `    <div class="proc reveal">
      ${ic ? `<img class="proc__icon" src="${esc(ic)}" alt="" loading="lazy" decoding="async" width="72" height="72" />` : ''}
      <h3 class="proc__title">${esc(it.title)}</h3>
      <p class="proc__desc">${esc(it.desc)}</p>
    </div>`;
  }).join('\n')}
  </div>

  <div class="section-wa reveal">
    <a href="${esc(waLink(cfg.settings, 'Olá, gostaria de saber mais sobre os procedimentos'))}" class="wa-link" target="_blank" rel="noopener" data-track="proc_wa">
      ${wa()}
      ${esc(p.cta)}
    </a>
  </div>
</section>`;
}

function depoimentos(cfg) {
  const d = cfg.depoimentos;
  const items = list(d.items);
  if (!items.length) return '';
  return `
<section id="depoimentos" class="depoimentos">
  <div class="section__head reveal">
    <h2 class="section__title">${fmt(d.title)}</h2>
  </div>

  <div class="testi-grid">
${items.map(t => `    <div class="testi reveal">
      <div class="testi__stars" aria-label="5 estrelas">${STAR.repeat(5)}</div>
      <p class="testi__quote">"${esc(t.texto)}"</p>
      <div class="testi__author">
        <div class="testi__avatar" aria-hidden="true">${esc(plain(t.nome).charAt(0))}</div>
        <div>
          <div class="testi__name">${esc(t.nome)}</div>
          <div class="testi__role">${esc(t.role)}</div>
        </div>
      </div>
    </div>`).join('\n\n')}
  </div>

  <div class="section-wa reveal">
    <a href="${esc(waLink(cfg.settings, 'Olá, quero ser a próxima a contar minha história'))}" class="wa-link" target="_blank" rel="noopener" data-track="depoimentos_wa">
      ${wa()}
      ${esc(d.cta)}
    </a>
  </div>
</section>`;
}

function form(cfg) {
  const f = cfg.form;
  const s = cfg.settings;
  return `
<section id="agendar" class="lead">
  <div class="lead__intro reveal">
    <h2 class="lead__title">${fmt(f.title)}</h2>
    <p class="lead__desc">${esc(f.desc)}</p>
  </div>

  <div class="lead__cta-hero reveal">
    <a href="${esc(waLink(s, 'Olá, gostaria de agendar minha avaliação com a Dra. Millena'))}" class="lead__wa wa-link" target="_blank" rel="noopener" data-track="lead_hero_wa">
      ${wa()}
      <span>
        <strong>${esc(f.waTitle)}</strong>
        <em>${esc(f.waSub)}</em>
      </span>
    </a>
    <div class="lead__or"><span>ou</span></div>
  </div>

  <div class="form reveal">
    <div class="form__head">
      <h3>${fmt(f.formTitle)}</h3>
      <p>${esc(f.formSub)}</p>
    </div>

    <form id="leadForm" novalidate>
      <div class="field">
        <label for="nome">Como você se chama?</label>
        <input id="nome" type="text" placeholder="Seu nome" required autocomplete="name" maxlength="80" />
      </div>

      <div class="field">
        <label for="telefone">Seu WhatsApp</label>
        <input id="telefone" type="tel" placeholder="(11) 99999-9999" required autocomplete="tel" inputmode="tel" maxlength="16" />
      </div>

      <p class="form__err" id="formErr" role="alert"></p>

      <button type="submit" class="form__submit">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M17.5 14.4l-2.2-1.1c-.3-.2-.7-.1-.9.2l-.7.9c-.2.2-.5.3-.8.2-1.4-.5-2.7-1.7-3.4-3-.2-.3-.1-.6.1-.8l.8-.6c.3-.2.4-.6.2-.9L9.5 6.6c-.2-.3-.6-.5-1-.4-1.8.3-3 1.9-2.8 3.7.5 4.1 4 7.4 8.1 7.6 1.8.1 3.4-1.2 3.7-3 .1-.4-.1-.8-.4-1.1z"/></svg>
        ${esc(f.submit)}
      </button>

      <p class="form__legal">${esc(f.legal)}</p>
    </form>

    <div class="form__success" id="success" role="status">
      <div class="form__success-icon">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M20 6L9 17l-5-5"/></svg>
      </div>
      <h4>Perfeito!</h4>
      <p>Já estamos te levando pro WhatsApp da Millena. Se não abrir sozinho, clique no botão abaixo.</p>
      <a href="${esc(waLink(s))}" class="btn btn--wa wa-link" id="successWa" target="_blank" rel="noopener" data-track="form_success_wa">
        Abrir WhatsApp
      </a>
    </div>
  </div>
</section>`;
}

function footer(cfg) {
  const s = cfg.settings;
  const ig = String(s.instagram || '').replace(/^@/, '');
  return `
<footer>
  <div class="foot__brand">Millena <em>Curty</em></div>
  <p class="foot__tag">${esc(cfg.footer.tag)}</p>

  <div class="foot__cols">
    <div class="foot__col">
      <h5>Contato</h5>
      <ul>
        <li><a href="${esc(waLink(s))}" target="_blank" rel="noopener" class="wa-link" data-track="footer_wa">WhatsApp</a></li>
        ${ig ? `<li><a href="https://www.instagram.com/${esc(ig)}/" target="_blank" rel="noopener" data-track="footer_instagram">Instagram</a></li>` : ''}
        ${s.email ? `<li><a href="mailto:${esc(s.email)}" data-track="footer_email">${esc(s.email)}</a></li>` : ''}
      </ul>
    </div>
    <div class="foot__col">
      <h5>Navegação</h5>
      <ul>
        <li><a href="#procedimentos">Procedimentos</a></li>
        <li><a href="#galeria">Resultados</a></li>
        <li><a href="#millena">Sobre</a></li>
        <li><a href="#depoimentos">Depoimentos</a></li>
        <li><a href="#agendar">Agendar</a></li>
      </ul>
    </div>
  </div>

  <div class="foot__bottom">
    <span>© ${new Date().getFullYear()} ${esc(plain(s.nome))}</span>
    <span>${s.cro ? esc(s.cro) + ' · ' : 'CRO · '}Cirurgiã-Dentista</span>
  </div>
</footer>`;
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
  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>${head(cfg, origin)}
</head>
<body>
<a class="skip" href="#millena">Pular para o conteúdo</a>

<div class="progress" id="progress"></div>

<nav class="nav" id="nav" aria-label="Principal">
  <div class="nav__logo">Millena <span>Curty</span></div>
  <div class="nav__menu">
    <a href="#procedimentos">Procedimentos</a>
    <a href="#galeria">Resultados</a>
    <a href="#millena">Sobre</a>
    <a href="#depoimentos">Depoimentos</a>
  </div>
  <a href="#agendar" class="nav__cta" data-track="nav_cta">Agendar</a>
</nav>
${hero(cfg)}

<div class="fade" style="--from: var(--ink); --to: var(--paper); --fade-h: 160px;" aria-hidden="true"></div>
${millena(cfg)}

<div class="fade" style="--from: var(--paper); --to: var(--bg); --fade-h: 80px;" aria-hidden="true"></div>
${galeria(cfg)}

<div class="fade" style="--from: var(--bg); --to: var(--paper); --fade-h: 80px;" aria-hidden="true"></div>
${procedimentos(cfg)}

<div class="fade" style="--from: var(--paper); --to: var(--ink); --fade-h: 160px;" aria-hidden="true"></div>
${depoimentos(cfg)}

<div class="fade" style="--from: var(--ink); --to: var(--bg-deep); --fade-h: 160px;" aria-hidden="true"></div>
${form(cfg)}

<div class="fade" style="--from: var(--bg-deep); --to: var(--ink); --fade-h: 160px;" aria-hidden="true"></div>
${footer(cfg)}

<a href="${esc(waLink(s))}" class="wa-float wa-link" target="_blank" rel="noopener" aria-label="Falar no WhatsApp" data-track="float_wa">
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">${WA_ICON}</svg>
</a>
${consent(cfg)}
<script>window.__SITE__=${JSON.stringify(client).replace(/</g, '\\u003c')}</script>
<script src="/js/site.js?v=${ASSET_VERSION}" defer></script>
</body>
</html>`;
}
