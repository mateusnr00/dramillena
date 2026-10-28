(function () {
  'use strict';

  var SITE = window.__SITE__ || {};
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

  // =================================================================
  // Rastreamento próprio (anônimo, sem cookies): visitas, cliques e leads
  // =================================================================
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

  // =================================================================
  // Pixel da Meta e Google Analytics (só com ID configurado e após aceite)
  // =================================================================
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

  var consentBox = document.querySelector('[data-consent]');
  if (consentBox) {
    var choice = get('localStorage', 'mc_consent');
    if (choice === 'yes') loadMarketing();
    else if (!choice) consentBox.hidden = false;
    consentBox.addEventListener('click', function (ev) {
      if (ev.target.closest('[data-consent-yes]')) { set('localStorage', 'mc_consent', 'yes'); consentBox.hidden = true; loadMarketing(); }
      if (ev.target.closest('[data-consent-no]')) { set('localStorage', 'mc_consent', 'no'); consentBox.hidden = true; }
    });
  }

  // Cliques em botões e links importantes
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

  var scrolled75 = false;

  // =================================================================
  // Barra de progresso e menu
  // =================================================================
  var nav = document.getElementById('nav');
  var progressBar = document.getElementById('progress');
  var ticking = false;
  function onScrollUI() {
    ticking = false;
    var y = window.scrollY;
    nav.classList.toggle('scrolled', y > 30);
    var max = document.documentElement.scrollHeight - window.innerHeight;
    var p = max > 0 ? y / max : 0;
    progressBar.style.width = Math.min(100, p * 100) + '%';
    if (!scrolled75 && p > 0.75) { scrolled75 = true; send('scroll', '75'); }
  }
  window.addEventListener('scroll', function () {
    if (!ticking) { ticking = true; requestAnimationFrame(onScrollUI); }
  }, { passive: true });
  onScrollUI();

  // =================================================================
  // Revelar ao rolar
  // =================================================================
  if ('IntersectionObserver' in window && !reduceMotion) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
    document.querySelectorAll('.reveal').forEach(function (el) { io.observe(el); });
  } else {
    document.querySelectorAll('.reveal').forEach(function (el) { el.classList.add('in'); });
  }

  // =================================================================
  // Antes e depois: mouse e toque, detectando a intenção do gesto
  // =================================================================
  function makeBA(el) {
    var dragging = false;
    var sX = 0, sY = 0, intent = null, moved = false;

    function setPos(clientX) {
      var r = el.getBoundingClientRect();
      var x = Math.max(0, Math.min(r.width, clientX - r.left));
      el.style.setProperty('--pos', ((x / r.width) * 100) + '%');
      moved = true;
    }
    function done() {
      if (moved && intent === 'h') send('click', 'antes_depois');
      dragging = false; intent = null; moved = false;
    }

    el.addEventListener('mousedown', function (e) {
      dragging = true;
      intent = 'h';
      setPos(e.clientX);
      e.preventDefault();
    });
    window.addEventListener('mousemove', function (e) {
      if (dragging && intent === 'h') setPos(e.clientX);
    });
    window.addEventListener('mouseup', function () { if (dragging) done(); });

    el.addEventListener('touchstart', function (e) {
      var t = e.touches[0];
      sX = t.clientX; sY = t.clientY;
      intent = null;
      dragging = true;
    }, { passive: true });

    window.addEventListener('touchmove', function (e) {
      if (!dragging) return;
      var t = e.touches[0];
      if (intent === null) {
        var dx = Math.abs(t.clientX - sX);
        var dy = Math.abs(t.clientY - sY);
        if (dx < 10 && dy < 10) return;
        intent = dx > dy ? 'h' : 'v';
        if (intent === 'v') { dragging = false; return; }
      }
      if (intent === 'h') {
        if (e.cancelable) e.preventDefault();
        setPos(t.clientX);
      }
    }, { passive: false });

    window.addEventListener('touchend', function () { if (dragging) done(); });
    window.addEventListener('touchcancel', function () { dragging = false; intent = null; });

    // Teclado: setas movem a comparação.
    el.tabIndex = 0;
    el.addEventListener('keydown', function (e) {
      if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
      var cur = parseFloat(getComputedStyle(el).getPropertyValue('--pos')) || 55;
      el.style.setProperty('--pos', Math.max(0, Math.min(100, cur + (e.key === 'ArrowLeft' ? -5 : 5))) + '%');
      e.preventDefault();
    });

    el.style.setProperty('--pos', '55%');
  }

  document.querySelectorAll('.ba, .gcase').forEach(makeBA);

  // Abertura do hero: uma passada suave e para.
  var ba = document.getElementById('ba');
  if (ba && !reduceMotion) {
    var userTouched = false;
    var cancel = function () { userTouched = true; };
    ['mousedown', 'touchstart'].forEach(function (ev) { ba.addEventListener(ev, cancel, { once: true }); });

    var keyframes = [
      { t: 0, pos: 50 },
      { t: 1100, pos: 78 },
      { t: 2200, pos: 28 },
      { t: 3100, pos: 55 }
    ];
    var startAt = performance.now() + 700;
    var intro = function (now) {
      if (userTouched) return;
      var elapsed = now - startAt;
      if (elapsed < 0) { requestAnimationFrame(intro); return; }
      if (elapsed >= keyframes[keyframes.length - 1].t) {
        ba.style.setProperty('--pos', keyframes[keyframes.length - 1].pos + '%');
        return;
      }
      var a, b;
      for (var i = 0; i < keyframes.length - 1; i++) {
        if (elapsed >= keyframes[i].t && elapsed < keyframes[i + 1].t) { a = keyframes[i]; b = keyframes[i + 1]; break; }
      }
      var segT = (elapsed - a.t) / (b.t - a.t);
      var eased = segT < 0.5 ? 2 * segT * segT : 1 - Math.pow(-2 * segT + 2, 2) / 2;
      ba.style.setProperty('--pos', (a.pos + (b.pos - a.pos) * eased) + '%');
      requestAnimationFrame(intro);
    };
    requestAnimationFrame(intro);
  }

  // =================================================================
  // Filtros da galeria
  // =================================================================
  document.querySelectorAll('.galeria__filter').forEach(function (btn) {
    btn.addEventListener('click', function () {
      document.querySelectorAll('.galeria__filter').forEach(function (b) { b.classList.remove('active'); });
      btn.classList.add('active');
      var f = btn.dataset.filter;
      document.querySelectorAll('.gcase').forEach(function (c) {
        c.style.display = f === 'all' || c.dataset.cat === f ? '' : 'none';
      });
      send('click', 'filtro_' + f);
    });
  });

  // =================================================================
  // Formulário: salva o lead e leva para o WhatsApp
  // =================================================================
  var form = document.getElementById('leadForm');
  var tel = document.getElementById('telefone');
  var nomeEl = document.getElementById('nome');
  var err = document.getElementById('formErr');

  tel.addEventListener('input', function (e) {
    var v = e.target.value.replace(/\D/g, '').slice(0, 11);
    if (v.length > 6) v = '(' + v.slice(0, 2) + ') ' + v.slice(2, 7) + '-' + v.slice(7);
    else if (v.length > 2) v = '(' + v.slice(0, 2) + ') ' + v.slice(2);
    else if (v.length > 0) v = '(' + v;
    e.target.value = v;
    tel.removeAttribute('aria-invalid');
  });
  nomeEl.addEventListener('input', function () { nomeEl.removeAttribute('aria-invalid'); });

  var started = false;
  form.addEventListener('focusin', function () {
    if (!started) { started = true; send('click', 'form_inicio'); }
  });

  function shake(i) {
    i.setAttribute('aria-invalid', 'true');
    if (i.animate && !reduceMotion) {
      i.animate([{ transform: 'translateX(0)' }, { transform: 'translateX(-6px)' }, { transform: 'translateX(6px)' }, { transform: 'translateX(0)' }], { duration: 300 });
    }
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var nome = nomeEl.value.trim();
    var phone = tel.value.replace(/\D/g, '');
    err.textContent = '';
    if (nome.length < 2) { shake(nomeEl); err.textContent = 'Conte pra gente o seu nome.'; nomeEl.focus(); return; }
    if (phone.length < 10) { shake(tel); err.textContent = 'Confira o WhatsApp com DDD.'; tel.focus(); return; }

    beacon('/api/lead', {
      nome: nome, telefone: phone, procedimento: '',
      visitor: visitor, session: session, ref: ref,
      source: utm.source || '', medium: utm.medium || '', campaign: utm.campaign || ''
    });
    pixel('Lead', { content_name: 'Form Submit' });
    gtagEvent('generate_lead', {});

    var msg = 'Olá! Sou ' + nome + ' e gostaria de agendar uma avaliação com a Dra. Millena.';
    var waUrl = 'https://wa.me/' + (SITE.waNumber || '') + '?text=' + encodeURIComponent(msg);
    document.getElementById('successWa').setAttribute('href', waUrl);

    form.style.display = 'none';
    document.getElementById('success').classList.add('active');

    // Abre o WhatsApp em seguida. Se o navegador bloquear, o botão continua lá.
    setTimeout(function () {
      var w = window.open(waUrl, '_blank');
      if (!w) location.href = waUrl;
    }, 1200);
  });

  // =================================================================
  // Rolagem suave para as âncoras
  // =================================================================
  document.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var h = a.getAttribute('href');
      if (h.length > 1) {
        var t = document.querySelector(h);
        if (t) {
          e.preventDefault();
          var y = t.getBoundingClientRect().top + window.scrollY - 20;
          window.scrollTo({ top: y, behavior: reduceMotion ? 'auto' : 'smooth' });
        }
      }
    });
  });
})();
