(function () {
  'use strict';

  var SITE = window.__SITE__ || {};
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function store(kind) {
    try { return window[kind]; } catch (e) { return null; }
  }
  function get(kind, key) {
    var s = store(kind);
    try { return s ? s.getItem(key) : null; } catch (e) { return null; }
  }
  function set(kind, key, val) {
    var s = store(kind);
    try { if (s) s.setItem(key, val); } catch (e) { /* modo privado */ }
  }
  function rid() {
    return Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
  }

  /* =================================================================
     Rastreamento próprio (anônimo, sem cookies): visitas, cliques e leads
     ================================================================= */
  var visitor = get('localStorage', 'mc_v') || rid();
  set('localStorage', 'mc_v', visitor);

  var session = get('sessionStorage', 'mc_s');
  var lastSeen = Number(get('localStorage', 'mc_t') || 0);
  if (!session || Date.now() - lastSeen > 30 * 60 * 1000) session = rid();
  set('sessionStorage', 'mc_s', session);
  set('localStorage', 'mc_t', String(Date.now()));

  var params = new URLSearchParams(location.search);
  var utm = {};
  try { utm = JSON.parse(get('sessionStorage', 'mc_utm') || '{}'); } catch (e) { utm = {}; }
  ['utm_source', 'utm_medium', 'utm_campaign'].forEach(function (k) {
    if (params.get(k)) utm[k.slice(4)] = params.get(k).slice(0, 80);
  });
  if (!utm.source && (params.get('fbclid'))) { utm.source = 'facebook'; utm.medium = utm.medium || 'paid'; }
  if (!utm.source && (params.get('gclid'))) { utm.source = 'google'; utm.medium = utm.medium || 'cpc'; }
  set('sessionStorage', 'mc_utm', JSON.stringify(utm));

  var ref = '';
  try {
    if (document.referrer) {
      var r = new URL(document.referrer);
      if (r.host !== location.host) ref = r.host.replace(/^www\./, '');
    }
  } catch (e) { /* ignora */ }
  if (ref) set('sessionStorage', 'mc_ref', ref);
  else ref = get('sessionStorage', 'mc_ref') || '';

  function send(type, label, extra) {
    var body = JSON.stringify(Object.assign({
      type: type,
      label: label || '',
      visitor: visitor,
      session: session,
      path: location.pathname,
      ref: ref,
      source: utm.source || '',
      medium: utm.medium || '',
      campaign: utm.campaign || '',
      w: window.innerWidth
    }, extra || {}));
    try {
      if (navigator.sendBeacon && navigator.sendBeacon('/api/track', new Blob([body], { type: 'application/json' }))) return;
    } catch (e) { /* fallback abaixo */ }
    try { fetch('/api/track', { method: 'POST', body: body, keepalive: true, headers: { 'content-type': 'application/json' } }); } catch (e) { /* ignora */ }
  }

  send('pageview');

  document.addEventListener('click', function (ev) {
    var el = ev.target.closest('a, button');
    if (!el) return;
    var label = el.getAttribute('data-track');
    var href = el.getAttribute('href') || '';
    if (/wa\.me|whatsapp/i.test(href)) {
      send('whatsapp', label || 'whatsapp');
      pixel('Contact', { content_name: label || 'whatsapp' });
      gtagEvent('contact_whatsapp', { label: label || 'whatsapp' });
    } else if (label) {
      send('click', label);
    }
  }, true);

  $$('details[data-track-open]').forEach(function (d) {
    d.addEventListener('toggle', function () { if (d.open) send('click', d.getAttribute('data-track-open')); });
  });

  var scrolled75 = false;
  window.addEventListener('scroll', function () {
    if (scrolled75) return;
    var max = document.documentElement.scrollHeight - window.innerHeight;
    if (max > 0 && window.scrollY / max > 0.75) { scrolled75 = true; send('scroll', '75'); }
  }, { passive: true });

  /* =================================================================
     Pixel da Meta e Google Analytics (só após consentimento)
     ================================================================= */
  function pixel(name, data) { if (window.fbq) window.fbq('track', name, data || {}); }
  function gtagEvent(name, data) { if (window.gtag) window.gtag('event', name, data || {}); }

  function loadMarketing() {
    if (SITE.pixelId && !window.fbq) {
      /* eslint-disable */
      !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');
      /* eslint-enable */
      window.fbq('init', SITE.pixelId);
      window.fbq('track', 'PageView');
    }
    if (SITE.ga4Id && !window.gtag) {
      var s = document.createElement('script');
      s.async = true;
      s.src = 'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(SITE.ga4Id);
      document.head.appendChild(s);
      window.dataLayer = window.dataLayer || [];
      window.gtag = function () { window.dataLayer.push(arguments); };
      window.gtag('js', new Date());
      window.gtag('config', SITE.ga4Id);
    }
  }

  var consentBox = $('[data-consent]');
  if (consentBox) {
    var choice = get('localStorage', 'mc_consent');
    if (choice === 'yes') loadMarketing();
    else if (!choice) consentBox.hidden = false;
    consentBox.addEventListener('click', function (ev) {
      if (ev.target.closest('[data-consent-yes]')) { set('localStorage', 'mc_consent', 'yes'); consentBox.hidden = true; loadMarketing(); }
      if (ev.target.closest('[data-consent-no]')) { set('localStorage', 'mc_consent', 'no'); consentBox.hidden = true; }
    });
  }

  /* =================================================================
     Navegação
     ================================================================= */
  var nav = $('[data-nav]');
  var burger = $('[data-burger]');
  var menu = $('[data-menu]');
  var dock = $('[data-dock]');
  var heroEl = $('.hero');
  var bookEl = $('#agendar');

  function isOpen() { return document.documentElement.classList.contains('menu-open'); }
  function setMenu(open) {
    document.documentElement.classList.toggle('menu-open', open);
    burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
    document.documentElement.style.overflow = open ? 'hidden' : '';
    if (open) { menu.hidden = false; void menu.offsetWidth; }
    else setTimeout(function () { if (!isOpen()) menu.hidden = true; }, 300);
  }
  if (burger) {
    burger.addEventListener('click', function () { setMenu(!isOpen()); });
    menu.addEventListener('click', function (ev) { if (ev.target.closest('a')) setMenu(false); });
    document.addEventListener('keydown', function (ev) { if (ev.key === 'Escape' && isOpen()) setMenu(false); });
  }

  var ticking = false;
  function onScroll() {
    ticking = false;
    var y = window.scrollY;
    nav.classList.toggle('is-scrolled', y > 8);
    if (dock && heroEl) {
      var pastHero = y > heroEl.offsetHeight * 0.75;
      var atBook = bookEl && bookEl.getBoundingClientRect().top < window.innerHeight * 0.85 && bookEl.getBoundingClientRect().bottom > 0;
      var on = pastHero && !atBook;
      dock.classList.toggle('is-on', on);
      dock.setAttribute('aria-hidden', String(!on));
      $$('a', dock).forEach(function (a) { a.tabIndex = on ? 0 : -1; });
    }
    words();
  }
  window.addEventListener('scroll', function () {
    if (!ticking) { ticking = true; requestAnimationFrame(onScroll); }
  }, { passive: true });

  /* =================================================================
     Revelar ao rolar
     ================================================================= */
  if ('IntersectionObserver' in window && !reduceMotion) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
    $$('.reveal').forEach(function (el) { io.observe(el); });
  } else {
    $$('.reveal').forEach(function (el) { el.classList.add('in'); });
  }

  /* =================================================================
     Manifesto: palavras acendem conforme a rolagem
     ================================================================= */
  var wordsEl = $('[data-words]');
  var wordSpans = wordsEl ? $$('span', wordsEl) : [];
  function words() {
    if (!wordsEl || reduceMotion) return;
    var rect = wordsEl.getBoundingClientRect();
    var vh = window.innerHeight;
    var p = (vh * 0.85 - rect.top) / (rect.height + vh * 0.35);
    p = Math.max(0, Math.min(1, p));
    var lit = Math.round(p * wordSpans.length);
    wordSpans.forEach(function (s, i) { s.classList.toggle('on', i < lit); });
  }
  onScroll();

  /* =================================================================
     Antes e depois
     ================================================================= */
  $$('[data-ba]').forEach(function (ba) {
    var range = $('.ba__range', ba);
    var dragging = false;
    var startX = 0, startY = 0, decided = false;

    function setPos(pct) {
      pct = Math.max(0, Math.min(100, pct));
      ba.style.setProperty('--pos', pct + '%');
      if (range) range.value = String(Math.round(pct));
    }
    function fromEvent(ev) {
      var r = ba.getBoundingClientRect();
      setPos(((ev.clientX - r.left) / r.width) * 100);
    }
    ba.addEventListener('pointerdown', function (ev) {
      if (ev.button !== 0) return;
      dragging = true; decided = ev.pointerType === 'mouse';
      startX = ev.clientX; startY = ev.clientY;
      if (decided) { ba.classList.add('is-dragging'); fromEvent(ev); ba.setPointerCapture(ev.pointerId); }
    });
    ba.addEventListener('pointermove', function (ev) {
      if (!dragging) return;
      if (!decided) {
        var dx = Math.abs(ev.clientX - startX), dy = Math.abs(ev.clientY - startY);
        if (dx < 6 && dy < 6) return;
        if (dy > dx) { dragging = false; return; }
        decided = true;
        ba.classList.add('is-dragging');
        try { ba.setPointerCapture(ev.pointerId); } catch (e) { /* ignora */ }
      }
      fromEvent(ev);
    });
    function end() {
      if (dragging && decided) send('click', 'antes_depois');
      dragging = false; ba.classList.remove('is-dragging');
    }
    ba.addEventListener('pointerup', end);
    ba.addEventListener('pointercancel', end);
    ba.addEventListener('click', function (ev) { fromEvent(ev); });
    if (range) range.addEventListener('input', function () { setPos(Number(range.value)); });
  });

  // Pequena demonstração no hero para mostrar que dá para arrastar.
  var heroBa = $('.hero [data-ba]');
  if (heroBa && !reduceMotion && 'IntersectionObserver' in window) {
    var demoDone = false;
    var demo = new IntersectionObserver(function (entries) {
      if (demoDone || !entries[0].isIntersecting) return;
      demoDone = true; demo.disconnect();
      var t0 = null;
      (function step(t) {
        if (heroBa.classList.contains('is-dragging')) return;
        if (!t0) t0 = t;
        var k = (t - t0) / 1800;
        if (k >= 1) { heroBa.style.setProperty('--pos', '50%'); return; }
        var v = 50 + Math.sin(k * Math.PI * 2) * 18 * (1 - k);
        heroBa.style.setProperty('--pos', v + '%');
        requestAnimationFrame(step);
      })(performance.now());
    }, { threshold: 0.6 });
    setTimeout(function () { demo.observe(heroBa); }, 900);
  }

  /* =================================================================
     Trilho de procedimentos + folhas
     ================================================================= */
  var rail = $('[data-rail]');
  if (rail) {
    var arrows = $$('[data-scroll]');
    var updateArrows = function () {
      var max = rail.scrollWidth - rail.clientWidth - 2;
      arrows.forEach(function (b) {
        b.disabled = b.getAttribute('data-scroll') === '-1' ? rail.scrollLeft <= 2 : rail.scrollLeft >= max;
      });
    };
    arrows.forEach(function (b) {
      b.addEventListener('click', function () {
        var card = $('.pcard', rail);
        var step = card ? card.getBoundingClientRect().width + 20 : 320;
        rail.scrollBy({ left: Number(b.getAttribute('data-scroll')) * step, behavior: reduceMotion ? 'auto' : 'smooth' });
      });
    });
    rail.addEventListener('scroll', updateArrows, { passive: true });
    window.addEventListener('resize', updateArrows);
    updateArrows();
  }

  $$('[data-open]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var d = document.getElementById(btn.getAttribute('data-open'));
      if (d && d.showModal) { d.showModal(); document.documentElement.style.overflow = 'hidden'; }
    });
  });
  $$('dialog.sheet').forEach(function (d) {
    d.addEventListener('click', function (ev) {
      if (ev.target === d || ev.target.closest('[data-close]')) d.close();
    });
    d.addEventListener('close', function () { document.documentElement.style.overflow = ''; });
  });

  /* =================================================================
     Filtro de resultados
     ================================================================= */
  var seg = $('.seg');
  if (seg) {
    seg.addEventListener('click', function (ev) {
      var b = ev.target.closest('button');
      if (!b) return;
      var f = b.getAttribute('data-filter');
      $$('button', seg).forEach(function (x) { x.setAttribute('aria-selected', String(x === b)); });
      $$('.result').forEach(function (r) { r.classList.toggle('is-hidden', Boolean(f) && r.getAttribute('data-cat') !== f); });
      send('click', 'filtro_' + (f || 'todos'));
    });
  }

  /* =================================================================
     Formulário de agendamento
     ================================================================= */
  var form = $('[data-lead]');
  if (form) {
    var tel = form.elements.telefone;
    var nome = form.elements.nome;
    var err = $('[data-err]', form);

    tel.addEventListener('input', function () {
      var d = tel.value.replace(/\D/g, '').slice(0, 11);
      var out = d;
      if (d.length > 2) out = '(' + d.slice(0, 2) + ') ' + d.slice(2);
      if (d.length > 7) out = '(' + d.slice(0, 2) + ') ' + d.slice(2, d.length - 4) + '-' + d.slice(-4);
      tel.value = out;
      tel.removeAttribute('aria-invalid');
    });
    nome.addEventListener('input', function () { nome.removeAttribute('aria-invalid'); });

    var started = false;
    form.addEventListener('focusin', function () {
      if (!started) { started = true; send('click', 'form_inicio'); }
    });

    form.addEventListener('submit', function (ev) {
      ev.preventDefault();
      var n = nome.value.trim();
      var t = tel.value.replace(/\D/g, '');
      var proc = (form.querySelector('input[name="procedimento"]:checked') || {}).value || '';
      err.textContent = '';
      if (n.length < 2) { nome.setAttribute('aria-invalid', 'true'); err.textContent = 'Conte pra gente o seu nome.'; nome.focus(); return; }
      if (t.length < 10) { tel.setAttribute('aria-invalid', 'true'); err.textContent = 'Confira o número de WhatsApp com DDD.'; tel.focus(); return; }

      var lead = JSON.stringify({
        nome: n, telefone: t, procedimento: proc,
        visitor: visitor, session: session, ref: ref,
        source: utm.source || '', medium: utm.medium || '', campaign: utm.campaign || ''
      });
      try {
        if (!(navigator.sendBeacon && navigator.sendBeacon('/api/lead', new Blob([lead], { type: 'application/json' })))) {
          fetch('/api/lead', { method: 'POST', body: lead, keepalive: true, headers: { 'content-type': 'application/json' } });
        }
      } catch (e) { /* segue para o WhatsApp mesmo assim */ }
      pixel('Lead', { content_name: proc });
      gtagEvent('generate_lead', { procedimento: proc });

      var msg = 'Olá, Dra. Millena! Meu nome é ' + n + '.' +
        (proc && proc !== 'Ainda não sei' ? ' Tenho interesse em ' + proc + '.' : '') +
        ' Gostaria de agendar uma avaliação.';
      var btn = form.querySelector('button[type="submit"]');
      btn.disabled = true;
      setTimeout(function () {
        location.href = 'https://wa.me/' + (SITE.waNumber || '') + '?text=' + encodeURIComponent(msg);
        setTimeout(function () { btn.disabled = false; }, 1500);
      }, 150);
    });
  }
})();
