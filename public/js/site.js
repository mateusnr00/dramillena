(function () {
  'use strict';

  var SITE = window.__SITE__ || {};
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function get(kind, key) {
    try { return window[kind].getItem(key); } catch (e) { return null; }
  }
  function set(kind, key, val) {
    try { window[kind].setItem(key, val); } catch (e) { /* modo privado */ }
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
  if (!utm.source && params.get('fbclid')) { utm.source = 'facebook'; utm.medium = utm.medium || 'paid'; }
  if (!utm.source && params.get('gclid')) { utm.source = 'google'; utm.medium = utm.medium || 'cpc'; }
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

  function beacon(url, data) {
    var body = JSON.stringify(data);
    try {
      if (navigator.sendBeacon && navigator.sendBeacon(url, new Blob([body], { type: 'application/json' }))) return;
    } catch (e) { /* tenta fetch */ }
    try { fetch(url, { method: 'POST', body: body, keepalive: true, headers: { 'content-type': 'application/json' } }); } catch (e) { /* ignora */ }
  }
  function send(type, label) {
    beacon('/api/track', {
      type: type, label: label || '', visitor: visitor, session: session,
      path: location.pathname, ref: ref,
      source: utm.source || '', medium: utm.medium || '', campaign: utm.campaign || ''
    });
  }
  send('pageview');

  /* =================================================================
     Pixel da Meta e Google Analytics (só com ID configurado e após aceite)
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

  document.addEventListener('click', function (ev) {
    var el = ev.target.closest('a, button');
    if (!el) return;
    var label = el.getAttribute('data-track');
    var href = el.getAttribute('href') || '';
    if (/wa\.me/i.test(href)) {
      send('whatsapp', label || 'whatsapp');
      pixel('Contact', { source: label || 'whatsapp' });
      gtagEvent('contact_whatsapp', { label: label || 'whatsapp' });
    } else if (label) {
      send('click', label);
    }
  }, true);

  $$('details[data-track-open]').forEach(function (d) {
    d.addEventListener('toggle', function () { if (d.open) send('click', d.getAttribute('data-track-open')); });
  });

  /* =================================================================
     Navegação
     ================================================================= */
  var nav = $('[data-nav]');
  var burger = $('[data-burger]');
  var menu = $('[data-menu]');
  function isOpen() { return document.documentElement.classList.contains('menu-open'); }
  function setMenu(open) {
    document.documentElement.classList.toggle('menu-open', open);
    burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
    document.documentElement.style.overflow = open ? 'hidden' : '';
    menu.hidden = !open;
  }
  burger.addEventListener('click', function () { setMenu(!isOpen()); });
  menu.addEventListener('click', function (ev) { if (ev.target.closest('a')) setMenu(false); });
  document.addEventListener('keydown', function (ev) { if (ev.key === 'Escape' && isOpen()) { setMenu(false); burger.focus(); } });

  var scrolled75 = false;
  var ticking = false;
  function onScroll() {
    ticking = false;
    nav.classList.toggle('is-scrolled', window.scrollY > 8);
    var max = document.documentElement.scrollHeight - window.innerHeight;
    if (!scrolled75 && max > 0 && window.scrollY / max > 0.75) { scrolled75 = true; send('scroll', '75'); }
  }
  window.addEventListener('scroll', function () {
    if (!ticking) { ticking = true; requestAnimationFrame(onScroll); }
  }, { passive: true });
  onScroll();

  /* =================================================================
     Antes e depois
     ================================================================= */
  $$('[data-ba]').forEach(function (el) {
    var range = $('.ba__range', el);
    var dragging = false, decided = false, moved = false, sX = 0, sY = 0;

    function setPos(pct) {
      pct = Math.max(0, Math.min(100, pct));
      el.style.setProperty('--pos', pct + '%');
      if (range) range.value = String(Math.round(pct));
    }
    function fromX(x) {
      var r = el.getBoundingClientRect();
      setPos(((x - r.left) / r.width) * 100);
      moved = true;
    }
    el.addEventListener('pointerdown', function (e) {
      if (e.button !== 0) return;
      el.dataset.touched = '1';
      dragging = true; moved = false;
      decided = e.pointerType === 'mouse';
      sX = e.clientX; sY = e.clientY;
      if (decided) { fromX(e.clientX); el.setPointerCapture(e.pointerId); }
    });
    el.addEventListener('pointermove', function (e) {
      if (!dragging) return;
      if (!decided) {
        var dx = Math.abs(e.clientX - sX), dy = Math.abs(e.clientY - sY);
        if (dx < 8 && dy < 8) return;
        if (dy > dx) { dragging = false; return; }
        decided = true;
        try { el.setPointerCapture(e.pointerId); } catch (err) { /* ignora */ }
      }
      fromX(e.clientX);
    });
    function end() {
      if (dragging && moved) send('click', 'antes_depois');
      dragging = false;
    }
    el.addEventListener('pointerup', end);
    el.addEventListener('pointercancel', function () { dragging = false; });
    if (range) range.addEventListener('input', function () { el.dataset.touched = '1'; setPos(Number(range.value)); });
  });

  // O único movimento automático da página: uma passada suave no antes e
  // depois do topo, para mostrar que dá para arrastar.
  var heroBa = $('.hero [data-ba]');
  if (heroBa && !reduceMotion) {
    var frames = [[0, 50], [1000, 72], [2000, 32], [2800, 50]];
    var start = performance.now() + 900;
    var tick = function (now) {
      if (heroBa.dataset.touched) return;
      var t = now - start;
      if (t < 0) { requestAnimationFrame(tick); return; }
      if (t >= frames[frames.length - 1][0]) { heroBa.style.setProperty('--pos', '50%'); return; }
      for (var i = 0; i < frames.length - 1; i++) {
        if (t >= frames[i][0] && t < frames[i + 1][0]) {
          var k = (t - frames[i][0]) / (frames[i + 1][0] - frames[i][0]);
          k = k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2;
          heroBa.style.setProperty('--pos', (frames[i][1] + (frames[i + 1][1] - frames[i][1]) * k) + '%');
          break;
        }
      }
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }

  /* =================================================================
     Filtro de resultados
     ================================================================= */
  var filters = $('.chips-filter');
  if (filters) {
    filters.addEventListener('click', function (ev) {
      var b = ev.target.closest('button');
      if (!b) return;
      var f = b.getAttribute('data-filter');
      $$('button', filters).forEach(function (x) { x.setAttribute('aria-pressed', String(x === b)); });
      $$('.result').forEach(function (r) { r.hidden = Boolean(f) && r.getAttribute('data-cat') !== f; });
      send('click', 'filtro_' + (f || 'todos'));
    });
  }

  /* =================================================================
     Depoimentos: setas
     ================================================================= */
  var rail = $('[data-rail]');
  if (rail) {
    var arrows = $$('[data-scroll]');
    var update = function () {
      var max = rail.scrollWidth - rail.clientWidth - 2;
      arrows.forEach(function (b) {
        b.disabled = b.getAttribute('data-scroll') === '-1' ? rail.scrollLeft <= 2 : rail.scrollLeft >= max;
      });
    };
    arrows.forEach(function (b) {
      b.addEventListener('click', function () {
        var card = $('.quote', rail);
        var step = card ? card.getBoundingClientRect().width + 24 : 400;
        rail.scrollBy({ left: Number(b.getAttribute('data-scroll')) * step, behavior: reduceMotion ? 'auto' : 'smooth' });
      });
    });
    rail.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    update();
  }

  /* =================================================================
     Mapa do rosto
     ================================================================= */
  var facemap = $('#mapa');
  if (facemap) {
    var panelEl = $('[data-panel]', facemap);
    var current = '0';
    var pick = function (i, fromUser) {
      if (i === current) return;
      current = i;
      var tpl = $('[data-zone-tpl="' + i + '"]', facemap);
      if (tpl) panelEl.innerHTML = tpl.innerHTML;
      $$('[data-zone]', facemap).forEach(function (b) { b.setAttribute('aria-pressed', String(b.getAttribute('data-zone') === i)); });
      if (!reduceMotion) { panelEl.classList.remove('is-changing'); void panelEl.offsetWidth; panelEl.classList.add('is-changing'); }
      if (fromUser) send('click', 'mapa_' + i);
    };
    facemap.addEventListener('click', function (ev) {
      var b = ev.target.closest('[data-zone]');
      if (!b) return;
      pick(b.getAttribute('data-zone'), true);
      // No celular o texto fica abaixo do desenho: leva a pessoa até ele.
      if (b.classList.contains('facemap__dot') && window.innerWidth < 860) {
        $('.facemap__tabs', facemap).scrollIntoView({ block: 'start', behavior: reduceMotion ? 'auto' : 'smooth' });
      }
    });
  }

  /* =================================================================
     Formulário: salva o lead e leva para o WhatsApp
     ================================================================= */
  var form = $('#leadForm');
  if (form) {
    var nomeEl = $('#nome');
    var tel = $('#telefone');
    var err = $('#formErr');

    tel.addEventListener('input', function () {
      var v = tel.value.replace(/\D/g, '').slice(0, 11);
      if (v.length > 6) v = '(' + v.slice(0, 2) + ') ' + v.slice(2, 7) + '-' + v.slice(7);
      else if (v.length > 2) v = '(' + v.slice(0, 2) + ') ' + v.slice(2);
      else if (v.length > 0) v = '(' + v;
      tel.value = v;
      tel.removeAttribute('aria-invalid');
    });
    nomeEl.addEventListener('input', function () { nomeEl.removeAttribute('aria-invalid'); });

    var started = false;
    form.addEventListener('focusin', function () {
      if (!started) { started = true; send('click', 'form_inicio'); }
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var nome = nomeEl.value.trim();
      var phone = tel.value.replace(/\D/g, '');
      var interesse = $('#interesse').value;
      err.textContent = '';
      if (nome.length < 2) { nomeEl.setAttribute('aria-invalid', 'true'); err.textContent = 'Escreva seu nome para continuar.'; nomeEl.focus(); return; }
      if (phone.length < 10) { tel.setAttribute('aria-invalid', 'true'); err.textContent = 'Confira o WhatsApp com DDD, por exemplo (11) 99999-9999.'; tel.focus(); return; }

      beacon('/api/lead', {
        nome: nome, telefone: phone, procedimento: interesse,
        visitor: visitor, session: session, ref: ref,
        source: utm.source || '', medium: utm.medium || '', campaign: utm.campaign || ''
      });
      pixel('Lead', { content_name: interesse });
      gtagEvent('generate_lead', { procedimento: interesse });

      var msg = 'Olá! Sou ' + nome + ' e gostaria de agendar uma avaliação com a Dra. Millena.' +
        (interesse && interesse !== 'Ainda não sei' ? ' Tenho interesse em ' + interesse + '.' : '');
      var waUrl = 'https://wa.me/' + (SITE.waNumber || '') + '?text=' + encodeURIComponent(msg);
      $('#successWa').setAttribute('href', waUrl);
      form.classList.add('is-sent');
      $('#success').hidden = false;

      setTimeout(function () {
        var w = window.open(waUrl, '_blank');
        if (!w) location.href = waUrl;
      }, 1000);
    });
  }
})();
