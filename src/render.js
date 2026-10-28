// Renderiza a página inicial no servidor a partir da configuração do painel.
// Todo texto vindo do painel passa por esc() (ou fmt(), que escapa antes
// de aplicar os marcadores *itálico* e |quebra).

const ASSET_VERSION = '14';

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
    sameAs: ig ? [`https://www.instagram.com/${ig}/`] : undefined
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
<meta name="theme-color" content="#ffffff" />
<meta name="color-scheme" content="light" />
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
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Bodoni+Moda:ital,opsz,wght@0,6..96,400..600;1,6..96,400..600&family=Inter:wght@400;500;600&display=swap" />
${safeUrl(cfg.hero.antes) ? `<link rel="preload" as="image" href="${esc(safeUrl(cfg.hero.antes))}" />` : ''}
<link rel="stylesheet" href="/css/site.css?v=${ASSET_VERSION}" />`;
}

const NAV = [['#sobre', 'Sobre'], ['#procedimentos', 'Tratamentos'], ['#resultados', 'Resultados'], ['#duvidas', 'Dúvidas']];

function brandName(cfg) {
  return plain(cfg.settings.nome).replace(/^Dra\.?\s*/i, '') || 'Millena Curty';
}

function fade(kind) {
  return `<div class="fade fade--${kind}" aria-hidden="true"></div>`;
}

function nav(cfg) {
  return `
<header class="nav" data-nav>
  <div class="wrap nav__inner">
    <a class="brand" href="#topo">${esc(brandName(cfg))}</a>
    <nav class="nav__links" aria-label="Seções">
      ${NAV.map(([h, t]) => `<a href="${h}">${t}</a>`).join('')}
    </nav>
    <a class="btn btn--dark btn--sm nav__cta" href="#agendar" data-track="nav_agendar">Agendar</a>
    <button class="nav__burger" type="button" aria-label="Abrir menu" aria-expanded="false" aria-controls="menu" data-burger><span></span><span></span></button>
  </div>
</header>
<div class="menu" id="menu" data-menu hidden>
  <nav aria-label="Menu">
    ${NAV.map(([h, t]) => `<a href="${h}">${t}</a>`).join('')}
    <a href="#agendar" data-track="menu_agendar">Agendar</a>
  </nav>
  <a class="menu__wa" href="${esc(waLink(cfg.settings))}" target="_blank" rel="noopener" data-track="menu_wa">${icon.wa} Falar no WhatsApp</a>
</div>`;
}

// Topo: tipografia gigante em preto, imagem de borda a borda.
function hero(cfg) {
  const h = cfg.hero;
  return `
<section class="hero" id="topo">
  <div class="hero__copy">
    ${h.eyebrow ? `<p class="hero__kicker">${esc(h.eyebrow)}</p>` : ''}
    <h1 class="hero__title">${fmt(h.title)}</h1>
    <p class="hero__sub">${esc(h.sub)}</p>
    <div class="hero__actions">
      <a class="btn btn--light" href="#agendar" data-track="hero_agendar">${esc(h.ctaPrimary)}</a>
      <a class="btn btn--outline-light" href="${esc(waLink(cfg.settings))}" target="_blank" rel="noopener" data-track="hero_wa">${icon.wa}<span>${esc(h.ctaSecondary)}</span></a>
    </div>
  </div>
  <figure class="hero__media">
    ${ba({ before: h.antes, after: h.depois, alt: 'Harmonização facial', cls: 'ba--bleed', eager: true, parallax: true })}
    ${h.note ? `<figcaption>${esc(h.note)}</figcaption>` : ''}
  </figure>
</section>`;
}

// Frase que acende palavra por palavra durante a rolagem (momento único de movimento).
function statement(cfg) {
  const t = plain(cfg.hero.frase);
  if (!t) return '';
  const words = t.split(/\s+/)
    .map(w => `<span>${esc(w)}</span>`).join(' ');
  return `
<section class="statement" aria-label="Filosofia">
  <div class="wrap">
    <p class="statement__text" data-words>${words}</p>
  </div>
</section>`;
}

function stats(cfg) {
  const items = list(cfg.hero.trust);
  if (!items.length) return '';
  return `
<section class="stats" aria-label="Números">
  <div class="wrap stats__grid">
    ${items.map(t => `<div class="stat"><strong>${esc(t.num)}</strong><span>${esc(t.label)}</span></div>`).join('')}
  </div>
</section>`;
}

function sobre(cfg) {
  const m = cfg.millena;
  const foto = safeUrl(m.foto);
  return `
<section class="sobre" id="sobre">
  <figure class="sobre__photo">
    ${foto ? `<img src="${esc(foto)}" alt="${esc(plain(cfg.settings.nome))}" loading="lazy" decoding="async" width="1200" height="1600" data-parallax="0.08" />` : ''}
  </figure>
  <div class="sobre__copy">
    <p class="label">${esc(m.badge || 'Quem cuida de você')}${cfg.settings.cro ? ` · ${esc(cfg.settings.cro)}` : ''}</p>
    <h2 class="display">${fmt(m.title)}</h2>
    ${m.bio1 ? `<p class="body-lg">${esc(m.bio1)}</p>` : ''}
    ${m.bio2 ? `<blockquote class="pull">${esc(String(m.bio2).replace(/^["“]|["”]$/g, ''))}</blockquote>` : ''}
    <ul class="checks">
      ${list(m.credentials).map(c => `<li>${icon.check}<span>${esc(c)}</span></li>`).join('')}
    </ul>
    <a class="btn btn--dark" href="${esc(waLink(cfg.settings, 'Olá, gostaria de conversar com a Dra. Millena'))}" target="_blank" rel="noopener" data-track="sobre_wa">${icon.wa}<span>${esc(m.cta)}</span></a>
  </div>
</section>`;
}

function metodo(cfg) {
  const m = cfg.metodo;
  const pilares = list(m && m.pilares);
  if (!m || !pilares.length) return '';
  return `
<section class="method" id="metodo">
  <div class="wrap">
    <p class="label">${esc(m.nome)}</p>
    <h2 class="display display--md">${fmt(m.frase)}</h2>
    <ul class="method__list">
      ${pilares.map(p => `<li><h3>${esc(p.titulo)}</h3><p>${esc(p.texto)}</p></li>`).join('')}
    </ul>
  </div>
</section>`;
}

// Procedimentos em vitrine horizontal, como as prateleiras de produto.
function procedimentos(cfg) {
  const p = cfg.procedimentos;
  const items = list(p.items);
  if (!items.length) return '';
  return `
<section class="shelf" id="procedimentos">
  <div class="wrap shelf__head">
    <h2 class="display display--md">${fmt(p.title)}</h2>
    <div class="arrows">
      <button type="button" class="arrow" data-scroll="-1" aria-label="Anterior">${icon.left}</button>
      <button type="button" class="arrow" data-scroll="1" aria-label="Próximo">${icon.right}</button>
    </div>
  </div>
  <ul class="shelf__rail" data-rail tabindex="0" aria-label="Tratamentos">
    ${items.map((it, i) => {
      const ic = safeUrl(it.icon);
      return `
    <li class="tile">
      <div class="tile__media">${ic ? `<img src="${esc(ic)}" alt="" loading="lazy" decoding="async" width="400" height="400" />` : ''}</div>
      <h3 class="tile__title">${esc(it.title)}</h3>
      <p class="tile__desc">${esc(it.desc)}</p>
      <a class="tile__link" href="${esc(waLink(cfg.settings, `Olá, gostaria de saber mais sobre ${plain(it.title)}.`))}" target="_blank" rel="noopener" data-track="proc_${i}_wa">Perguntar no WhatsApp</a>
    </li>`;
    }).join('')}
  </ul>
</section>`;
}

function processo(cfg) {
  const p = cfg.processo;
  const steps = list(p && p.steps);
  if (!steps.length) return '';
  return `
<section class="steps">
  <div class="wrap">
    <h2 class="display display--md">${fmt(p.title)}</h2>
    <ol class="steps__list">
      ${steps.map((s, i) => `<li><span class="steps__n">${i + 1}</span><h3>${esc(s.title)}</h3><p>${esc(s.desc)}</p></li>`).join('')}
    </ol>
  </div>
</section>`;
}

function resultados(cfg) {
  const g = cfg.galeria;
  const items = list(g.items).filter(i => safeUrl(i.before) && safeUrl(i.after));
  if (!items.length) return '';
  const cats = [];
  items.forEach(i => {
    const c = plain(i.categoria);
    if (c && !cats.some(x => x.slug === slug(c))) cats.push({ slug: slug(c), label: c });
  });
  return `
<section class="results" id="resultados">
  <div class="wrap">
    <div class="results__head">
      <h2 class="display display--md">${fmt(g.title)}</h2>
      ${g.intro ? `<p class="muted">${esc(g.intro)}</p>` : ''}
    </div>
    ${cats.length > 1 ? `<div class="chips-filter" role="group" aria-label="Filtrar por procedimento">
      <button type="button" aria-pressed="true" data-filter="">Todos</button>
      ${cats.map(c => `<button type="button" aria-pressed="false" data-filter="${esc(c.slug)}">${esc(c.label)}</button>`).join('')}
    </div>` : ''}
    <div class="results__grid${items.length === 1 ? ' results__grid--one' : ''}">
      ${items.map(i => `
      <figure class="result" data-cat="${esc(slug(i.categoria))}">
        ${ba({ before: i.before, after: i.after, alt: plain(i.titulo) || 'Resultado' })}
        <figcaption><span>${esc(i.titulo)}</span>${i.categoria ? `<small>${esc(i.categoria)}</small>` : ''}</figcaption>
      </figure>`).join('')}
    </div>
    ${g.disclaimer ? `<p class="fine">${esc(g.disclaimer)}</p>` : ''}
  </div>
</section>`;
}

function depoimentos(cfg) {
  const d = cfg.depoimentos;
  const items = list(d.items);
  if (!items.length) return '';
  return `
<section class="quotes" id="depoimentos">
  <div class="wrap shelf__head">
    <h2 class="display display--md">${fmt(d.title)}</h2>
    <div class="arrows">
      <button type="button" class="arrow" data-scroll="-1" aria-label="Depoimento anterior">${icon.left}</button>
      <button type="button" class="arrow" data-scroll="1" aria-label="Próximo depoimento">${icon.right}</button>
    </div>
  </div>
  <div class="quotes__rail" data-rail tabindex="0" aria-label="Depoimentos">
    ${items.map(t => `
    <figure class="quote">
      <div class="quote__stars" role="img" aria-label="5 estrelas">${icon.star.repeat(5)}</div>
      <blockquote>${esc(t.texto)}</blockquote>
      <figcaption><strong>${esc(t.nome)}</strong><span>${esc(t.role)}</span></figcaption>
    </figure>`).join('')}
  </div>
</section>`;
}

function faq(cfg) {
  const f = cfg.faq;
  const items = list(f && f.items);
  if (!items.length) return '';
  return `
<section class="faq" id="duvidas">
  <div class="wrap faq__grid">
    <div>
      <h2 class="display display--md">${fmt(f.title)}</h2>
      <a class="link-wa" href="${esc(waLink(cfg.settings, 'Olá, tenho uma dúvida sobre os procedimentos'))}" target="_blank" rel="noopener" data-track="faq_wa">${icon.wa}<span>Outra dúvida? Pergunte no WhatsApp</span></a>
    </div>
    <div class="faq__list">
      ${items.map((i, n) => `
      <details class="qa" data-track-open="faq_${n}">
        <summary><span>${esc(i.q)}</span><i aria-hidden="true">${icon.plus}</i></summary>
        <p>${esc(i.a)}</p>
      </details>`).join('')}
    </div>
  </div>
</section>`;
}

function agendar(cfg) {
  const f = cfg.form;
  const opts = [...list(cfg.procedimentos.items).map(p => plain(p.title)), 'Ainda não sei'];
  const waDirect = waLink(cfg.settings, 'Olá, gostaria de agendar minha avaliação com a Dra. Millena');
  return `
<section class="book" id="agendar">
  <div class="wrap">
    <div class="book__card">
      <div class="book__copy">
        <h2 class="h2">${fmt(f.title)}</h2>
        <p class="lead">${esc(f.desc)}</p>
        <ul class="book__facts">
          <li>${icon.check}<span>Escolha o dia e o horário aqui mesmo</span></li>
          <li>${icon.check}<span>A equipe confirma pelo WhatsApp</span></li>
          <li>${icon.check}<span>Avaliação sem compromisso</span></li>
        </ul>
        <a class="link-wa" href="${esc(waDirect)}" target="_blank" rel="noopener" data-track="lead_hero_wa">${icon.wa}<span>Prefiro falar direto no WhatsApp</span></a>
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

function footer(cfg) {
  const s = cfg.settings;
  const ig = String(s.instagram || '').replace(/^@/, '');
  return `
<footer class="foot">
  <div class="wrap">
    <p class="foot__brand">${esc(brandName(cfg))}</p>
    <div class="foot__cols">
      <p class="foot__tag">${esc(cfg.footer.tag)}</p>
      <nav class="foot__links" aria-label="Contato">
        <a href="${esc(waLink(s))}" target="_blank" rel="noopener" data-track="footer_wa">WhatsApp</a>
        ${ig ? `<a href="https://www.instagram.com/${esc(ig)}/" target="_blank" rel="noopener" data-track="footer_instagram">Instagram</a>` : ''}
        ${s.email ? `<a href="mailto:${esc(s.email)}" data-track="footer_email">${esc(s.email)}</a>` : ''}
      </nav>
      <nav class="foot__links" aria-label="Seções">
        ${NAV.map(([h, t]) => `<a href="${h}">${t}</a>`).join('')}
      </nav>
    </div>
    <div class="foot__bottom">
      <span>© ${new Date().getFullYear()} ${esc(plain(s.nome))}${s.cro ? `, ${esc(s.cro)}` : ''}</span>
      <span>Cirurgiã-dentista. Os resultados variam de pessoa para pessoa.</span>
    </div>
  </div>
</footer>`;
}

function dock(cfg) {
  return `
<div class="dock" data-dock>
  <a class="btn btn--bronze" href="#agendar" data-track="dock_agendar">Agendar avaliação</a>
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
${statement(cfg)}
${fade('w2g')}
${sobre(cfg)}
${fade('g2w')}
${stats(cfg)}
${procedimentos(cfg)}
${fade('w2g')}
${resultados(cfg)}
${fade('g2w')}
${metodo(cfg)}
${fade('w2g')}
${processo(cfg)}
${fade('g2w')}
${depoimentos(cfg)}
${faq(cfg)}
${fade('w2g')}
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
