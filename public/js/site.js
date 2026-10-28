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

  var dockEl = $('[data-dock]');
  var bookEl = $('#agendar');
  if (dockEl && bookEl && 'IntersectionObserver' in window) {
    new IntersectionObserver(function (entries) {
      dockEl.classList.toggle('is-hidden', entries[0].isIntersecting);
    }, { threshold: 0.15 }).observe(bookEl);
  }

  /* =================================================================
     Agendamento em 3 passos: interesse, dia e horário, dados
     ================================================================= */
  var booker = $('[data-booker]');
  if (booker) {
    var steps = $$('[data-step]', booker);
    var dots = $$('[data-step-dot]', booker);
    var daysEl = $('[data-days]', booker);
    var timesEl = $('[data-times]', booker);
    var next2 = $('[data-step="2"] [data-next]', booker);
    var form = $('#leadForm');
    var nomeEl = $('#nome');
    var tel = $('#telefone');
    var err = $('#formErr');
    var slots = [];
    var choice = { interesse: '', date: '', time: '' };
    var WEEK = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sáb'];
    var WEEK_LONG = ['domingo', 'segunda-feira', 'terça-feira', 'quarta-feira', 'quinta-feira', 'sexta-feira', 'sábado'];
    var MONTHS = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];

    var longDate = function (date, weekday) {
      var p = date.split('-');
      return WEEK_LONG[weekday] + ', ' + Number(p[2]) + ' de ' + MONTHS[Number(p[1]) - 1];
    };

    var show = function (n) {
      steps.forEach(function (s) { s.hidden = s.getAttribute('data-step') !== String(n); });
      dots.forEach(function (d) {
        var k = Number(d.getAttribute('data-step-dot'));
        if (k === n) d.setAttribute('aria-current', 'step'); else d.removeAttribute('aria-current');
        d.classList.toggle('is-done', k < n);
      });
      var first = $('[data-step="' + n + '"] input, [data-step="' + n + '"] button', booker);
      if (first && n > 1) first.focus({ preventScroll: true });
      send('click', 'reserva_passo_' + n);
    };

    var closed = function () {
      steps.forEach(function (s) { s.hidden = true; });
      $('.booker__steps', booker).hidden = true;
      $('[data-closed]', booker).hidden = false;
    };

    var renderTimes = function () {
      timesEl.innerHTML = '';
      var day = slots.filter(function (d) { return d.date === choice.date; })[0];
      if (!day) { timesEl.innerHTML = '<p class="times__empty">Escolha um dia para ver os horários.</p>'; return; }
      day.times.forEach(function (t) {
        var l = document.createElement('label');
        l.className = 'time';
        l.innerHTML = '<input type="radio" name="time" value="' + t + '" /><span>' + t + '</span>';
        timesEl.appendChild(l);
      });
    };

    var renderDays = function () {
      daysEl.innerHTML = '';
      slots.forEach(function (d, i) {
        var p = d.date.split('-');
        var l = document.createElement('label');
        l.className = 'day';
        l.innerHTML = '<input type="radio" name="date" value="' + d.date + '"' + (i === 0 ? ' checked' : '') + ' />' +
          '<span><small>' + WEEK[d.weekday] + '</small><b>' + Number(p[2]) + '</b><small>' + MONTHS[Number(p[1]) - 1].slice(0, 3) + '</small></span>';
        l.querySelector('input').setAttribute('aria-label', longDate(d.date, d.weekday));
        daysEl.appendChild(l);
      });
      choice.date = slots.length ? slots[0].date : '';
      renderTimes();
    };

    var loaded = fetch('/api/slots', { headers: { accept: 'application/json' } })
      .then(function (r) { return r.ok ? r.json() : { ativo: false }; })
      .then(function (data) {
        slots = (data && data.days) || [];
        if (!data.ativo || !slots.length) { closed(); return false; }
        renderDays();
        return true;
      })
      .catch(function () { closed(); return false; });

    booker.addEventListener('change', function (ev) {
      var t = ev.target;
      if (t.name === 'interesse') choice.interesse = t.value;
      if (t.name === 'date') { choice.date = t.value; choice.time = ''; next2.disabled = true; renderTimes(); }
      if (t.name === 'time') { choice.time = t.value; next2.disabled = false; }
    });

    $$('[data-next]', booker).forEach(function (b) {
      b.addEventListener('click', function () {
        var cur = Number(b.closest('[data-step]').getAttribute('data-step'));
        if (cur === 1) {
          var sel = $('input[name="interesse"]:checked', booker);
          choice.interesse = sel ? sel.value : '';
          b.disabled = true;
          b.textContent = 'Carregando horários…';
          loaded.then(function (ok) {
            b.disabled = false;
            b.textContent = 'Ver horários livres';
            if (ok) show(2);
          });
        }
        if (cur === 2 && choice.time) {
          var day = slots.filter(function (d) { return d.date === choice.date; })[0];
          $('[data-summary]', booker).innerHTML = '<strong>' + longDate(choice.date, day.weekday) + ' às ' + choice.time + '</strong>' +
            (choice.interesse && choice.interesse !== 'Ainda não sei' ? 'Avaliação para ' + choice.interesse : 'Avaliação gratuita');
          show(3);
        }
      });
    });
    $$('[data-back]', booker).forEach(function (b) {
      b.addEventListener('click', function () {
        show(Number(b.closest('[data-step]').getAttribute('data-step')) - 1);
      });
    });

    tel.addEventListener('input', function () {
      var v = tel.value.replace(/\D/g, '').slice(0, 11);
      if (v.length > 6) v = '(' + v.slice(0, 2) + ') ' + v.slice(2, 7) + '-' + v.slice(7);
      else if (v.length > 2) v = '(' + v.slice(0, 2) + ') ' + v.slice(2);
      else if (v.length > 0) v = '(' + v;
      tel.value = v;
      tel.removeAttribute('aria-invalid');
    });
    nomeEl.addEventListener('input', function () { nomeEl.removeAttribute('aria-invalid'); });

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var nome = nomeEl.value.trim();
      var phone = tel.value.replace(/\D/g, '');
      err.textContent = '';
      if (nome.length < 2) { nomeEl.setAttribute('aria-invalid', 'true'); err.textContent = 'Escreva seu nome para continuar.'; nomeEl.focus(); return; }
      if (phone.length < 10) { tel.setAttribute('aria-invalid', 'true'); err.textContent = 'Confira o WhatsApp com DDD, por exemplo (11) 99999-9999.'; tel.focus(); return; }
      var btn = $('button[type="submit"]', form);
      btn.disabled = true;
      btn.textContent = 'Reservando…';

      fetch('/api/booking', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          nome: nome, telefone: phone, interesse: choice.interesse, date: choice.date, time: choice.time,
          visitor: visitor, session: session, ref: ref,
          source: utm.source || '', medium: utm.medium || '', campaign: utm.campaign || ''
        })
      }).then(function (r) {
        return r.json().catch(function () { return {}; }).then(function (data) { return { ok: r.ok, status: r.status, data: data }; });
      }).then(function (res) {
        if (!res.ok) {
          err.textContent = (res.data && res.data.error) || 'Não foi possível reservar agora. Tente de novo ou chame no WhatsApp.';
          if (res.status === 409) {
            fetch('/api/slots').then(function (r) { return r.json(); }).then(function (d) { slots = d.days || []; renderDays(); show(2); });
          }
          return;
        }
        pixel('Lead', { content_name: choice.interesse });
        gtagEvent('generate_lead', { procedimento: choice.interesse });
        var day = slots.filter(function (d) { return d.date === choice.date; })[0];
        var when = longDate(choice.date, day.weekday) + ' às ' + choice.time;
        $('[data-done-text]', booker).textContent = 'Reservamos ' + when + ' para você. A equipe vai confirmar pelo WhatsApp em até 1 hora, em horário comercial.';
        var msg = 'Olá! Sou ' + nome + ' e fiz uma pré-reserva pelo site para ' + when + '.' +
          (choice.interesse && choice.interesse !== 'Ainda não sei' ? ' Interesse: ' + choice.interesse + '.' : '');
        $('[data-done-wa]', booker).setAttribute('href', 'https://wa.me/' + (SITE.waNumber || '') + '?text=' + encodeURIComponent(msg));
        steps.forEach(function (s) { s.hidden = true; });
        $('.booker__steps', booker).hidden = true;
        $('[data-done]', booker).hidden = false;
      }).catch(function () {
        err.textContent = 'Sem conexão. Tente de novo ou chame no WhatsApp.';
      }).then(function () {
        btn.disabled = false;
        btn.textContent = 'Confirmar pré-reserva';
      });
    });
  }
})();
