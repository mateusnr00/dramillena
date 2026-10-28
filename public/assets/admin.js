(function () {
  'use strict';

  /* =================================================================
     Utilidades
     ================================================================= */
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  function h(tag, attrs) {
    var el = document.createElement(tag);
    var kids = Array.prototype.slice.call(arguments, 2);
    if (attrs) {
      Object.keys(attrs).forEach(function (k) {
        var v = attrs[k];
        if (v == null || v === false) return;
        if (k === 'class') el.className = v;
        else if (k === 'html') el.innerHTML = v;
        else if (k.slice(0, 2) === 'on') el.addEventListener(k.slice(2), v);
        else if (k === 'value') el.value = v;
        else el.setAttribute(k, v === true ? '' : v);
      });
    }
    kids.flat(Infinity).forEach(function (c) {
      if (c == null || c === false) return;
      el.appendChild(typeof c === 'string' || typeof c === 'number' ? document.createTextNode(String(c)) : c);
    });
    return el;
  }

  var ICONS = {
    chart: '<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>',
    inbox: '<path d="M3 13l3-8h12l3 8v6H3z"/><path d="M3 13h5l1 3h6l1-3h5"/>',
    home: '<path d="M4 11l8-7 8 7v9H4z"/>',
    person: '<circle cx="12" cy="8" r="4"/><path d="M4 21c0-4.4 3.6-7 8-7s8 2.6 8 7"/>',
    sparkle: '<path d="M12 3l2 6 6 2-6 2-2 6-2-6-6-2 6-2z"/>',
    steps: '<path d="M4 6h16M4 12h10M4 18h6"/>',
    photo: '<rect x="3" y="5" width="18" height="14" rx="3"/><circle cx="9" cy="10" r="2"/><path d="M21 16l-5-5-9 8"/>',
    quote: '<path d="M7 7h4v4c0 3-2 5-4 6M15 7h4v4c0 3-2 5-4 6"/>',
    help: '<circle cx="12" cy="12" r="9"/><path d="M9.5 9a2.5 2.5 0 1 1 3.5 2.3c-.6.3-1 .9-1 1.7M12 17h.01"/>',
    calendar: '<rect x="3" y="5" width="18" height="16" rx="3"/><path d="M3 10h18M8 3v4M16 3v4"/>',
    gear: '<circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M4.9 19.1L7 17M17 7l2.1-2.1"/>',
    users: '<circle cx="9" cy="8" r="3.5"/><path d="M2 20c0-3.6 3-6 7-6s7 2.4 7 6M16 4.5a3.5 3.5 0 0 1 0 7M18 14c2.4.6 4 2.6 4 6"/>',
    up: '<path d="M6 15l6-6 6 6"/>',
    down: '<path d="M6 9l6 6 6-6"/>',
    trash: '<path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/>',
    wa: '<path d="M4 20l1.3-4A8 8 0 1 1 8 18.7z"/>',
    note: '<path d="M5 4h14v16H5zM9 9h6M9 13h6M9 17h3"/>',
    download: '<path d="M12 4v11M7 10l5 5 5-5M5 20h14"/>',
    copy: '<rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V4H4v12h4"/>'
  };
  function ico(name) {
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' + (ICONS[name] || '') + '</svg>';
  }

  var toastTimer;
  function toast(msg, isError) {
    var t = $('#toast');
    t.textContent = msg;
    t.classList.toggle('is-error', Boolean(isError));
    t.classList.add('on');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { t.classList.remove('on'); }, 2600);
  }

  async function api(path, opts) {
    opts = opts || {};
    var init = { method: opts.method || 'GET', credentials: 'same-origin', headers: {} };
    if (opts.body !== undefined) {
      if (opts.raw) { init.body = opts.body; init.headers['content-type'] = opts.type; }
      else { init.body = JSON.stringify(opts.body); init.headers['content-type'] = 'application/json'; }
    }
    var res = await fetch(path, init);
    var data = null;
    try { data = await res.json(); } catch (e) { data = null; }
    if (res.status === 401 && path !== '/api/login') { showLogin(); throw new Error('Sessão expirada'); }
    if (!res.ok) throw new Error((data && data.error) || 'Erro ' + res.status);
    return data;
  }

  function clone(o) { return JSON.parse(JSON.stringify(o)); }
  function getPath(obj, path) { return path.split('.').reduce(function (o, k) { return o == null ? undefined : o[k]; }, obj); }
  function setPath(obj, path, val) {
    var ks = path.split('.');
    var o = obj;
    for (var i = 0; i < ks.length - 1; i++) { if (o[ks[i]] == null) o[ks[i]] = {}; o = o[ks[i]]; }
    o[ks[ks.length - 1]] = val;
  }
  var nf = new Intl.NumberFormat('pt-BR');
  function fmtDate(ts) {
    return new Date(ts).toLocaleString('pt-BR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }).replace('.', '');
  }
  function fmtPhone(t) {
    var d = String(t || '').replace(/\D/g, '');
    if (d.length === 13 && d.slice(0, 2) === '55') d = d.slice(2);
    if (d.length === 11) return '(' + d.slice(0, 2) + ') ' + d.slice(2, 7) + '-' + d.slice(7);
    if (d.length === 10) return '(' + d.slice(0, 2) + ') ' + d.slice(2, 6) + '-' + d.slice(6);
    return t;
  }
  function waFor(t) {
    var d = String(t || '').replace(/\D/g, '');
    if (d.length <= 11) d = '55' + d;
    return 'https://wa.me/' + d;
  }

  /* =================================================================
     Esquema do editor de conteúdo
     ================================================================= */
  var HINT = 'Use *palavra* para destacar em itálico e | para quebrar linha.';
  var CONTENT = {
    inicio: {
      title: 'Abertura', desc: 'O topo da página: retrato, título e números.', icon: 'home', color: '#d4b88a',
      groups: [
        { label: 'Abertura', fields: [
          { p: 'hero.foto', l: 'Retrato da abertura', t: 'image', s: 'Foto editorial vertical, de preferência com luz lateral e fundo neutro' },
          { p: 'hero.eyebrow', l: 'Chamada', s: 'Texto pequeno acima do título' },
          { p: 'hero.title', l: 'Título', s: 'Use | para quebrar linha. A segunda linha fica em itálico.' },
          { p: 'hero.sub', l: 'Frase abaixo do título', t: 'textarea' },
          { p: 'hero.ctaPrimary', l: 'Botão de agendar' },
          { p: 'hero.ctaSecondary', l: 'Link para a filosofia' }
        ] },
        { label: 'Números', hint: 'Aparecem no capítulo de confiança. Use só números reais.', list: 'hero.trust', itemLabel: function (it) { return (it.num || '') + ' ' + (it.label || ''); },
          blank: { num: '', label: '' },
          fields: [{ p: 'num', l: 'Número' }, { p: 'label', l: 'Descrição' }] }
      ]
    },
    filosofia: {
      title: 'Filosofia', desc: 'Capítulo 2: a forma de trabalhar da Dra. Millena.', icon: 'sparkle', color: '#d4b88a',
      groups: [
        { label: 'Filosofia', fields: [
          { p: 'filosofia.title', l: 'Título', s: 'Use | para quebrar linha' },
          { p: 'filosofia.lead', l: 'Frase de destaque', t: 'textarea' },
          { p: 'filosofia.texto', l: 'Texto', t: 'textarea' }
        ] },
        { label: 'Princípios', list: 'metodo.pilares', itemLabel: function (it) { return it.titulo; },
          blank: { titulo: '', texto: '' },
          fields: [{ p: 'titulo', l: 'Princípio' }, { p: 'texto', l: 'Descrição', t: 'textarea' }] }
      ]
    },
    explorer: {
      title: 'Face Explorer', desc: 'Capítulo 4: as regiões do rosto no desenho interativo.', icon: 'person', color: '#d4b88a',
      groups: [
        { label: 'Seção', fields: [
          { p: 'explorer.title', l: 'Título' },
          { p: 'explorer.intro', l: 'Introdução', t: 'textarea' }
        ] },
        { label: 'Regiões', hint: 'O ponto no desenho é escolhido pelo nome: terço superior, malar, lábios, mento e mandibular. Valide os textos com a Dra. Millena.', list: 'explorer.regioes',
          itemLabel: function (it) { return it.nome; },
          blank: { nome: '', texto: '', tratamentos: '' },
          fields: [
            { p: 'nome', l: 'Região' },
            { p: 'texto', l: 'Como é avaliada', t: 'textarea' },
            { p: 'tratamentos', l: 'Tratamentos relacionados', s: 'Separados por vírgula' }
          ] }
      ]
    },
    ciencia: {
      title: 'Ciência', desc: 'Capítulo 6: camadas, colágeno e avaliação.', icon: 'sparkle', color: '#d4b88a',
      groups: [
        { label: 'Ciência', fields: [
          { p: 'ciencia.title', l: 'Título' },
          { p: 'ciencia.intro', l: 'Introdução', t: 'textarea' },
          { p: 'ciencia.camadas', l: 'Texto sobre camadas', t: 'textarea' },
          { p: 'ciencia.colageno', l: 'Texto sobre colágeno', t: 'textarea' },
          { p: 'ciencia.avaliacao', l: 'Texto sobre avaliação', t: 'textarea' }
        ] }
      ]
    },
    espaco: {
      title: 'O espaço', desc: 'Capítulo 8: o consultório.', icon: 'home', color: '#d4b88a',
      groups: [
        { label: 'O espaço', fields: [
          { p: 'espaco.title', l: 'Título' },
          { p: 'espaco.texto', l: 'Texto', t: 'textarea' }
        ] },
        { label: 'Destaques', strings: 'espaco.itens', placeholder: 'Ex.: Uma paciente por horário' },
        { label: 'Fotos do consultório', hint: 'Até 3 fotos. Enquanto não houver fotos, aparece uma composição de luz no lugar.', list: 'espaco.fotos',
          itemLabel: function (it, i) { return 'Foto ' + ((i || 0) + 1); }, blank: { src: '' },
          fields: [{ p: 'src', l: 'Foto', t: 'image' }] }
      ]
    },
    sobre: {
      title: 'A profissional', desc: 'Capítulo 3: apresentação da Dra. Millena.', icon: 'person', color: '#d4b88a',
      groups: [
        { label: 'Apresentação', fields: [
          { p: 'millena.foto', l: 'Foto', t: 'image' },
          { p: 'millena.title', l: 'Nome', s: 'Use | para quebrar linha' },
          { p: 'millena.badge', l: 'Profissão', s: 'Ex.: Cirurgiã-dentista. O registro vem de Contato e marketing.' },
          { p: 'millena.bio1', l: 'Primeiro parágrafo', t: 'textarea' },
          { p: 'millena.bio2', l: 'Citação', t: 'textarea' },
          { p: 'millena.cta', l: 'Link do WhatsApp' }
        ] },
        { label: 'Formação e credenciais', hint: 'Só o que puder ser comprovado.', strings: 'millena.credentials', placeholder: 'Ex.: Especialista em Harmonização Orofacial' }
      ]
    },
    resultados: {
      title: 'Confiança', desc: 'Capítulo 7: caso de antes e depois e textos. Publique só com autorização da paciente.', icon: 'photo', color: '#d4b88a',
      groups: [
        { label: 'Seção', fields: [
          { p: 'galeria.title', l: 'Título' },
          { p: 'galeria.intro', l: 'Introdução', t: 'textarea' },
          { p: 'galeria.disclaimer', l: 'Aviso abaixo do caso', t: 'textarea' }
        ] },
        { label: 'Casos', hint: 'O primeiro caso aparece no site. Só com consentimento da paciente.', list: 'galeria.items',
          itemLabel: function (it) { return it.titulo || 'Caso'; },
          blank: { before: '', after: '', titulo: '', categoria: '' },
          fields: [
            { p: 'before', l: 'Antes', t: 'image' },
            { p: 'after', l: 'Depois', t: 'image' },
            { p: 'titulo', l: 'Título', s: 'Ex.: Ana, 34' },
            { p: 'categoria', l: 'Procedimento', s: 'Ex.: Lábios. Também vira o filtro.' }
          ] }
      ]
    },
    procedimentos: {
      title: 'Tratamentos', desc: 'Capítulo 5: a lista de tratamentos.', icon: 'sparkle', color: '#d4b88a',
      groups: [
        { label: 'Seção', fields: [{ p: 'procedimentos.title', l: 'Título' }, { p: 'procedimentos.intro', l: 'Introdução', t: 'textarea' }] },
        { label: 'Procedimentos', list: 'procedimentos.items', itemLabel: function (it) { return it.title; },
          blank: { title: 'Novo tratamento', desc: '', foto: '' },
          fields: [
            { p: 'foto', l: 'Foto (opcional)', t: 'image', s: 'Aparece quando o tratamento é aberto' },
            { p: 'title', l: 'Nome' },
            { p: 'desc', l: 'Descrição', t: 'textarea' }
          ] }
      ]
    },
    depoimentos: {
      title: 'Depoimentos', desc: 'O que as pacientes dizem.', icon: 'quote', color: '#d4b88a',
      groups: [
        { label: 'Seção', fields: [{ p: 'depoimentos.title', l: 'Título' }] },
        { label: 'Depoimentos', list: 'depoimentos.items', itemLabel: function (it) { return it.nome; },
          blank: { texto: '', nome: '', role: '' },
          fields: [{ p: 'texto', l: 'Depoimento', t: 'textarea' }, { p: 'nome', l: 'Nome' }, { p: 'role', l: 'Detalhe', s: 'Ex.: Cliente desde 2023' }] }
      ]
    },
    metodo: {
      title: 'Método', desc: 'O método com nome próprio e seus pilares.', icon: 'sparkle', color: '#d4b88a',
      groups: [
        { label: 'Método', fields: [
          { p: 'metodo.nome', l: 'Nome do método' },
          { p: 'metodo.frase', l: 'Frase principal' },
          { p: 'metodo.texto', l: 'Texto de apoio', t: 'textarea' }
        ] },
        { label: 'Pilares', list: 'metodo.pilares', itemLabel: function (it) { return it.titulo; },
          blank: { titulo: '', texto: '' },
          fields: [{ p: 'titulo', l: 'Pilar' }, { p: 'texto', l: 'Descrição', t: 'textarea' }] }
      ]
    },
    agenda: {
      title: 'Horários da agenda', desc: 'Quando a paciente pode pré-reservar pelo site.', icon: 'calendar', color: '#d4b88a',
      groups: [
        { label: 'Agenda online', hint: 'Cada pré-reserva bloqueia o horário e aparece em Agenda e em Leads. A equipe confirma pelo WhatsApp.', fields: [
          { p: 'agenda.ativo', l: 'Agenda online ligada', t: 'bool' },
          { p: 'agenda.dias', l: 'Dias de atendimento', s: 'Ex.: seg, ter, qua, qui, sex, sab' },
          { p: 'agenda.inicio', l: 'Primeiro horário', s: 'Ex.: 09:00' },
          { p: 'agenda.fim', l: 'Fim do expediente', s: 'Ex.: 18:00' },
          { p: 'agenda.duracao', l: 'Duração da avaliação', s: 'Em minutos. Ex.: 60', t: 'number' },
          { p: 'agenda.antecedenciaHoras', l: 'Antecedência mínima', s: 'Em horas. Ex.: 12', t: 'number' },
          { p: 'agenda.diasFuturos', l: 'Dias abertos', s: 'Quantos dias à frente aparecem. Ex.: 21', t: 'number' },
          { p: 'agenda.bloqueios', l: 'Dias bloqueados', t: 'textarea', s: 'Datas sem atendimento, separadas por vírgula. Ex.: 2026-12-24, 2026-12-25' }
        ] }
      ]
    },
    processo: {
      title: 'Etapas da avaliação', desc: 'Os passos que aparecem no capítulo de ciência.', icon: 'steps', color: '#d4b88a',
      groups: [
        { label: 'Seção', fields: [{ p: 'processo.title', l: 'Título' }] },
        { label: 'Etapas', list: 'processo.steps', itemLabel: function (it) { return it.title; },
          blank: { title: '', desc: '' },
          fields: [{ p: 'title', l: 'Etapa' }, { p: 'desc', l: 'Descrição', t: 'textarea' }] }
      ]
    },
    faq: {
      title: 'Dúvidas', desc: 'Perguntas frequentes. Também aparecem no Google.', icon: 'help', color: '#d4b88a',
      groups: [
        { label: 'Seção', fields: [{ p: 'faq.title', l: 'Título' }] },
        { label: 'Perguntas', list: 'faq.items', itemLabel: function (it) { return it.q; },
          blank: { q: '', a: '' },
          fields: [{ p: 'q', l: 'Pergunta' }, { p: 'a', l: 'Resposta', t: 'textarea' }] }
      ]
    },
    agendar: {
      title: 'Agendamento', desc: 'O formulário no fim da página.', icon: 'calendar', color: '#d4b88a',
      groups: [
        { label: 'Formulário', fields: [
          { p: 'form.title', l: 'Título do final', s: 'Cada frase com ponto vira uma linha' },
          { p: 'form.desc', l: 'Frase abaixo do título', t: 'textarea' },
          { p: 'form.waTitle', l: 'Botão do WhatsApp' },
          { p: 'form.waSub', l: 'Legenda do botão' },
          { p: 'form.formTitle', l: 'Título do formulário', s: HINT },
          { p: 'form.formSub', l: 'Subtítulo do formulário' },
          { p: 'form.submit', l: 'Botão de enviar' },
          { p: 'form.legal', l: 'Texto de privacidade', t: 'textarea' }
        ] },
        { label: 'Rodapé', fields: [{ p: 'footer.tag', l: 'Frase do rodapé', t: 'textarea' }] }
      ]
    },
    ajustes: {
      title: 'Contato e marketing', desc: 'WhatsApp, redes, Google e Meta.', icon: 'gear', color: '#d4b88a',
      groups: [
        { label: 'Contato', fields: [
          { p: 'settings.nome', l: 'Nome' },
          { p: 'settings.whatsapp', l: 'WhatsApp', s: 'Só números, com 55 e DDD. Ex.: 5511987654321' },
          { p: 'settings.whatsappMsg', l: 'Mensagem inicial', t: 'textarea', s: 'Texto que já aparece escrito no WhatsApp' },
          { p: 'settings.instagram', l: 'Instagram', s: 'Só o usuário, sem @' },
          { p: 'settings.email', l: 'Email' },
          { p: 'settings.cidade', l: 'Cidade' },
          { p: 'settings.endereco', l: 'Endereço', s: 'Aparece no rodapé. Deixe vazio para mostrar só a cidade.' },
          { p: 'settings.cro', l: 'Registro profissional', s: 'Ex.: CRO-SP 123456. Aparece na apresentação e no rodapé.' }
        ] },
        { label: 'Google', fields: [
          { p: 'settings.seoTitle', l: 'Título no Google' },
          { p: 'settings.seoDescription', l: 'Descrição no Google', t: 'textarea' },
          { p: 'settings.ogImage', l: 'Imagem ao compartilhar', t: 'image', s: 'Aparece no WhatsApp e redes sociais' }
        ] },
        { label: 'Anúncios', hint: 'Deixe vazio se não usar. Quando preenchido, o site pede consentimento de cookies (LGPD).', fields: [
          { p: 'settings.pixelId', l: 'Pixel da Meta', s: 'ID numérico do Pixel' },
          { p: 'settings.ga4Id', l: 'Google Analytics 4', s: 'Ex.: G-XXXXXXXXXX' }
        ] }
      ],
      danger: true
    }
  };

  var NAV = [
    { group: 'Acompanhamento', items: [
      { id: 'painel', title: 'Painel', desc: 'Visitas, contatos e de onde vêm as pacientes.', icon: 'chart', color: '#d4b88a' },
      { id: 'reservas', title: 'Agenda', desc: 'Pré-reservas feitas pelo site.', icon: 'calendar', color: '#d4b88a' },
      { id: 'leads', title: 'Leads', desc: 'Todas as pessoas que deixaram contato.', icon: 'inbox', color: '#d4b88a' }
    ] },
    { group: 'Conteúdo do site', items: ['inicio', 'filosofia', 'sobre', 'explorer', 'procedimentos', 'ciencia', 'processo', 'resultados', 'depoimentos', 'faq', 'espaco', 'agendar'].map(function (k) {
      return { id: k, title: CONTENT[k].title, desc: CONTENT[k].desc, icon: CONTENT[k].icon, color: CONTENT[k].color };
    }) },
    { group: 'Ajustes', items: [
      { id: 'agenda', title: CONTENT.agenda.title, desc: CONTENT.agenda.desc, icon: 'calendar', color: '#d4b88a' },
      { id: 'ajustes', title: CONTENT.ajustes.title, desc: CONTENT.ajustes.desc, icon: 'gear', color: '#d4b88a' },
      { id: 'usuarios', title: 'Usuários', desc: 'Quem pode entrar no painel.', icon: 'users', color: '#d4b88a' }
    ] }
  ];

  /* =================================================================
     Estado
     ================================================================= */
  var state = { me: null, config: null, draft: null, dirty: false, view: 'painel', days: 30, leadsFilter: '', leadsQ: '', newLeads: 0 };

  /* =================================================================
     Login
     ================================================================= */
  function showLogin(setup) {
    $('#app').hidden = true;
    $('#login').hidden = false;
    var box = $('#setup');
    var missing = [];
    if (setup) {
      if (!setup.db) missing.push('Banco de dados D1 ligado com o nome <b>DB</b>');
      if (!setup.media) missing.push('Bucket R2 ligado com o nome <b>MEDIA</b> (para enviar fotos)');
      if (!setup.secret) missing.push('Variável <b>AUTH_SECRET</b> com 16+ caracteres');
      if (!setup.adminEnv) missing.push('Variáveis <b>ADMIN_EMAIL</b> e <b>ADMIN_PASSWORD</b> (primeiro acesso)');
    }
    box.hidden = !missing.length;
    box.innerHTML = missing.length ? '<strong>Falta configurar na Cloudflare:</strong><ul>' + missing.map(function (m) { return '<li>' + m + '</li>'; }).join('') + '</ul>' : '';
    setTimeout(function () { $('#login-email').focus(); }, 50);
  }

  $('#login-form').addEventListener('submit', async function (ev) {
    ev.preventDefault();
    var btn = $('#login-btn');
    var err = $('#login-err');
    err.textContent = '';
    btn.disabled = true;
    btn.textContent = 'Entrando…';
    try {
      var r = await api('/api/login', { method: 'POST', body: { email: $('#login-email').value, password: $('#login-pass').value } });
      state.me = r.user;
      $('#login-pass').value = '';
      await start();
    } catch (e) {
      err.textContent = e.message;
    } finally {
      btn.disabled = false;
      btn.textContent = 'Entrar';
    }
  });

  $('#logout').addEventListener('click', async function () {
    if (state.dirty && !confirm('Há alterações não salvas. Sair mesmo assim?')) return;
    await api('/api/logout', { method: 'POST' }).catch(function () {});
    location.reload();
  });

  /* =================================================================
     App
     ================================================================= */
  async function start() {
    $('#login').hidden = true;
    $('#app').hidden = false;
    $('#me-email').textContent = state.me.email;
    state.config = await api('/api/config');
    state.draft = clone(state.config);
    renderNav();
    var fromHash = location.hash.slice(1);
    go(findItem(fromHash) ? fromHash : 'painel', true);
    refreshLeadBadge();
  }

  function findItem(id) {
    for (var g = 0; g < NAV.length; g++) for (var i = 0; i < NAV[g].items.length; i++) if (NAV[g].items[i].id === id) return NAV[g].items[i];
    return null;
  }

  function renderNav() {
    var nav = $('#side-nav');
    nav.innerHTML = '';
    NAV.forEach(function (g) {
      nav.appendChild(h('div', { class: 'side__group' }, g.group));
      g.items.forEach(function (it) {
        nav.appendChild(h('button', {
          type: 'button',
          class: 'side__item' + (state.view === it.id ? ' is-active' : ''),
          'data-id': it.id,
          onclick: function () { go(it.id); }
        },
        h('span', { class: 'side__ico', style: 'background:' + it.color, html: ico(it.icon) }),
        it.title,
        it.id === 'leads' && state.newLeads ? h('span', { class: 'side__badge' }, String(state.newLeads)) : null));
      });
    });
  }

  function go(id, force) {
    if (!force && id === state.view) { closeMenu(); return; }
    var leavingContent = CONTENT[state.view];
    if (!force && leavingContent && state.dirty && !CONTENT[id]) {
      if (!confirm('Há alterações não salvas. Descartar?')) return;
      state.draft = clone(state.config);
      setDirty(false);
    }
    state.view = id;
    history.replaceState(null, '', '#' + id);
    var it = findItem(id);
    $('#view-title').textContent = it.title;
    $('#view-desc').textContent = it.desc;
    $$('.side__item').forEach(function (b) { b.classList.toggle('is-active', b.getAttribute('data-id') === id); });
    closeMenu();
    window.scrollTo(0, 0);
    var view = $('#view');
    view.innerHTML = '';
    $('#top-actions').innerHTML = '';
    if (id === 'painel') renderDashboard(view);
    else if (id === 'leads') renderLeads(view);
    else if (id === 'reservas') renderBookings(view);
    else if (id === 'usuarios') renderUsers(view);
    else renderContent(view, CONTENT[id]);
  }

  function closeMenu() { $('#app').classList.remove('is-menu'); }
  $('#menu-btn').addEventListener('click', function () { $('#app').classList.toggle('is-menu'); });
  $('#scrim').addEventListener('click', closeMenu);
  window.addEventListener('scroll', function () { $('.top').classList.toggle('is-stuck', window.scrollY > 4); }, { passive: true });
  window.addEventListener('beforeunload', function (ev) { if (state.dirty) { ev.preventDefault(); ev.returnValue = ''; } });

  /* =================================================================
     Editor de conteúdo
     ================================================================= */
  function setDirty(d) {
    state.dirty = d;
    var st = $('#save-status');
    if (st) {
      st.className = 'status' + (d ? ' is-dirty' : '');
      st.textContent = d ? 'Alterações não salvas' : 'Tudo salvo';
    }
    var b = $('#save-btn');
    if (b) b.disabled = !d;
  }

  async function save() {
    if (!state.dirty) return;
    var st = $('#save-status');
    var b = $('#save-btn');
    if (st) { st.className = 'status is-saving'; st.textContent = 'Salvando…'; }
    if (b) b.disabled = true;
    try {
      var r = await api('/api/config', { method: 'PUT', body: state.draft });
      state.config = r.config;
      state.draft = clone(r.config);
      setDirty(false);
      toast('Site atualizado');
    } catch (e) {
      setDirty(true);
      toast(e.message, true);
    }
  }
  document.addEventListener('keydown', function (ev) {
    if ((ev.metaKey || ev.ctrlKey) && ev.key.toLowerCase() === 's' && CONTENT[state.view]) { ev.preventDefault(); save(); }
  });

  function renderContent(view, schema) {
    var actions = $('#top-actions');
    actions.appendChild(h('span', { class: 'status', id: 'save-status' }, 'Tudo salvo'));
    actions.appendChild(h('button', { class: 'btn btn--blue', id: 'save-btn', type: 'button', onclick: save, disabled: true }, 'Salvar'));
    setDirty(state.dirty);

    schema.groups.forEach(function (g) {
      var wrap = h('section', { class: 'group' });
      wrap.appendChild(h('div', { class: 'group__label' }, h('span', null, g.label)));
      if (g.fields && !g.list) wrap.appendChild(fieldRows(g.fields, state.draft, ''));
      if (g.list) wrap.appendChild(listEditor(g));
      if (g.strings) wrap.appendChild(stringsEditor(g));
      if (g.hint) wrap.appendChild(h('p', { class: 'group__hint' }, g.hint));
      view.appendChild(wrap);
    });

    if (schema.danger) {
      view.appendChild(h('section', { class: 'card' },
        h('div', { class: 'card__head' },
          h('div', null, h('div', { class: 'card__title' }, 'Restaurar textos originais'), h('div', { class: 'card__sub' }, 'Apaga todas as edições e volta ao conteúdo padrão do site.')),
          h('button', { class: 'btn btn--danger', type: 'button', onclick: async function () {
            if (!confirm('Isso apaga todas as edições do site. Continuar?')) return;
            try {
              var r = await api('/api/config', { method: 'DELETE' });
              state.config = r.config; state.draft = clone(r.config); setDirty(false);
              toast('Conteúdo restaurado'); go(state.view, true);
            } catch (e) { toast(e.message, true); }
          } }, 'Restaurar'))));
    }
  }

  function fieldRows(fields, target, prefix, onChange) {
    var rows = h('div', { class: 'rows' });
    fields.forEach(function (f) {
      var path = prefix + f.p;
      var id = 'f-' + path.replace(/\./g, '-') + '-' + Math.random().toString(36).slice(2, 6);
      var val = getPath(target, f.p);
      var update = function (v) { setPath(target, f.p, v); setDirty(true); if (onChange) onChange(); };
      var control;
      if (f.t === 'textarea') {
        control = h('textarea', { class: 'textarea', id: id, rows: 3, oninput: function (e) { update(e.target.value); } });
        control.value = val == null ? '' : val;
      } else if (f.t === 'bool') {
        control = h('label', { class: 'switch' },
          h('input', { type: 'checkbox', id: id, checked: val === true || val === 'true', onchange: function (e) { update(e.target.checked); } }),
          h('span', null, 'Ligada'));
      } else if (f.t === 'number') {
        control = h('input', { class: 'input', id: id, type: 'number', min: 0, value: val == null ? '' : val, oninput: function (e) { update(e.target.value === '' ? '' : Number(e.target.value)); } });
      } else if (f.t === 'image') {
        control = imageField(id, val, update);
      } else {
        control = h('input', { class: 'input', id: id, type: 'text', value: val == null ? '' : val, oninput: function (e) { update(e.target.value); } });
      }
      rows.appendChild(h('div', { class: 'row' },
        h('label', { for: id }, f.l, f.s ? h('small', null, f.s) : null),
        control));
    });
    return rows;
  }

  function imageField(id, val, update) {
    var thumb = h('div', { class: 'img-field__thumb' });
    var input = h('input', { class: 'input', id: id, type: 'text', value: val || '', placeholder: '/img/foto.webp', oninput: function (e) { update(e.target.value); paint(e.target.value); } });
    var file = h('input', { type: 'file', accept: 'image/*', hidden: true });
    var wrap = h('div', { class: 'img-field' }, thumb, h('div', { class: 'img-field__body' }, input,
      h('div', { class: 'img-field__btns' },
        h('button', { class: 'btn btn--ghost btn--sm', type: 'button', onclick: function () { file.click(); } }, 'Enviar imagem…'))), file);
    function paint(u) { thumb.style.backgroundImage = u ? 'url("' + String(u).replace(/"/g, '') + '")' : ''; }
    paint(val);
    file.addEventListener('change', async function () {
      var f = file.files && file.files[0];
      if (!f) return;
      wrap.classList.add('is-uploading');
      try {
        var blob = await shrink(f);
        var r = await api('/api/upload', { method: 'POST', raw: true, body: blob, type: blob.type });
        input.value = r.url; update(r.url); paint(r.url);
        toast('Imagem enviada. Lembre de salvar.');
      } catch (e) {
        toast(e.message, true);
      } finally {
        wrap.classList.remove('is-uploading');
        file.value = '';
      }
    });
    return wrap;
  }

  // Reduz a imagem no navegador antes de enviar (máx. 1800px, WebP).
  function shrink(file) {
    return new Promise(function (resolve) {
      if (!/^image\/(jpeg|png|webp)$/.test(file.type)) return resolve(file);
      var img = new Image();
      var url = URL.createObjectURL(file);
      img.onload = function () {
        var max = 1800;
        var scale = Math.min(1, max / Math.max(img.width, img.height));
        var c = document.createElement('canvas');
        c.width = Math.round(img.width * scale);
        c.height = Math.round(img.height * scale);
        c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
        URL.revokeObjectURL(url);
        c.toBlob(function (b) {
          if (b && b.type === 'image/webp' && b.size < file.size) resolve(b);
          else c.toBlob(function (j) { resolve(j && j.size < file.size ? j : file); }, 'image/jpeg', 0.86);
        }, 'image/webp', 0.85);
      };
      img.onerror = function () { URL.revokeObjectURL(url); resolve(file); };
      img.src = url;
    });
  }

  function listEditor(g) {
    var box = h('div', { class: 'items' });
    function arr() {
      var a = getPath(state.draft, g.list);
      if (!Array.isArray(a)) { a = []; setPath(state.draft, g.list, a); }
      return a;
    }
    function draw() {
      box.innerHTML = '';
      var a = arr();
      a.forEach(function (item, i) {
        var title = h('span', { class: 'item__title' }, (g.itemLabel(item, i) || '').trim() || 'Item ' + (i + 1));
        var head = h('div', { class: 'item__head' }, title,
          h('button', { class: 'icon-btn', type: 'button', title: 'Subir', 'aria-label': 'Subir', disabled: i === 0, html: ico('up'), onclick: function () { move(i, -1); } }),
          h('button', { class: 'icon-btn', type: 'button', title: 'Descer', 'aria-label': 'Descer', disabled: i === a.length - 1, html: ico('down'), onclick: function () { move(i, 1); } }),
          h('button', { class: 'icon-btn icon-btn--danger', type: 'button', title: 'Remover', 'aria-label': 'Remover', html: ico('trash'), onclick: function () {
            if (!confirm('Remover este item?')) return;
            a.splice(i, 1); setDirty(true); draw();
          } }));
        box.appendChild(h('div', { class: 'item' }, head, fieldRows(g.fields, item, g.list + '.' + i + '.', function () {
          title.textContent = (g.itemLabel(item, i) || '').trim() || 'Item ' + (i + 1);
        })));
      });
      box.appendChild(h('button', { class: 'add', type: 'button', onclick: function () { a.push(clone(g.blank)); setDirty(true); draw(); } }, '+ Adicionar'));
    }
    function move(i, d) {
      var a = arr();
      var x = a.splice(i, 1)[0];
      a.splice(i + d, 0, x);
      setDirty(true); draw();
    }
    draw();
    return box;
  }

  function stringsEditor(g) {
    var box = h('div', { class: 'rows' });
    var inner = h('div', { class: 'str-list', style: 'padding:14px 18px' });
    box.appendChild(inner);
    function arr() {
      var a = getPath(state.draft, g.strings);
      if (!Array.isArray(a)) { a = []; setPath(state.draft, g.strings, a); }
      return a;
    }
    function draw() {
      inner.innerHTML = '';
      var a = arr();
      a.forEach(function (s, i) {
        inner.appendChild(h('div', { class: 'str-item' },
          h('input', { class: 'input', type: 'text', value: s, placeholder: g.placeholder, 'aria-label': 'Item ' + (i + 1), oninput: function (e) { a[i] = e.target.value; setDirty(true); } }),
          h('button', { class: 'icon-btn', type: 'button', 'aria-label': 'Subir', disabled: i === 0, html: ico('up'), onclick: function () { a.splice(i - 1, 0, a.splice(i, 1)[0]); setDirty(true); draw(); } }),
          h('button', { class: 'icon-btn icon-btn--danger', type: 'button', 'aria-label': 'Remover', html: ico('trash'), onclick: function () { a.splice(i, 1); setDirty(true); draw(); } })));
      });
      inner.appendChild(h('button', { class: 'add', type: 'button', onclick: function () { a.push(''); setDirty(true); draw(); setTimeout(function () { var ins = $$('input', inner); if (ins.length) ins[ins.length - 1].focus(); }, 0); } }, '+ Adicionar'));
    }
    draw();
    return box;
  }

  /* =================================================================
     Painel de métricas
     ================================================================= */
  function labelName(l) {
    var procs = (state.config.procedimentos && state.config.procedimentos.items) || [];
    var faq = (state.config.faq && state.config.faq.items) || [];
    var fixed = {
      hero_wa: 'WhatsApp · topo da página', hero_agendar: 'Agendar · topo da página', nav_agendar: 'Agendar · menu', menu_agendar: 'Agendar · menu do celular', menu_wa: 'WhatsApp · menu do celular', dock_agendar: 'Agendar · barra fixa', dock_wa: 'WhatsApp · botão fixo', faq_wa: 'WhatsApp · Dúvidas',
      sobre_wa: 'WhatsApp · seção Sobre', proc_wa: 'WhatsApp · Procedimentos', depoimentos_wa: 'WhatsApp · Depoimentos',
      galeria_cta: 'Conversar sobre meu caso · galeria', lead_hero_wa: 'WhatsApp · Agendamento', form_success_wa: 'WhatsApp · após o formulário', reserva_wa: 'WhatsApp · após a pré-reserva', agenda_fechada_wa: 'WhatsApp · agenda fechada', reserva_passo_1: 'Agendamento · passo 1', reserva_passo_2: 'Agendamento · escolheu interesse', reserva_passo_3: 'Agendamento · escolheu horário',
      float_wa: 'WhatsApp · botão flutuante', footer_wa: 'WhatsApp · rodapé', footer_instagram: 'Instagram · rodapé',
      footer_email: 'Email · rodapé', form_inicio: 'Começou o formulário', antes_depois: 'Arrastou o antes e depois', whatsapp: 'WhatsApp'
    };
    if (fixed[l]) return fixed[l];
    var m;
    if ((m = /^proc_(\d+)_whatsapp$/.exec(l))) return 'WhatsApp · ' + ((procs[m[1]] || {}).title || 'procedimento');
    if ((m = /^proc_(\d+)$/.exec(l))) return 'Abriu ' + ((procs[m[1]] || {}).title || 'procedimento');
    if ((m = /^faq_(\d+)$/.exec(l))) return 'Dúvida: ' + ((faq[m[1]] || {}).q || 'pergunta');
    if ((m = /^filtro_(.+)$/.exec(l))) return 'Filtro de resultados: ' + m[1];
    return l;
  }
  function sourceName(s) {
    var map = { direto: 'Direto ou WhatsApp', instagram: 'Instagram', facebook: 'Facebook', google: 'Google', tiktok: 'TikTok' };
    return map[s] || s;
  }
  function delta(cur, prev) {
    if (!prev && !cur) return { t: 'sem dados no período anterior', c: '' };
    if (!prev) return { t: 'novo no período', c: 'up' };
    var p = (cur - prev) / prev;
    return { t: (p >= 0 ? '+' : '') + Math.round(p * 100) + '% vs. período anterior', c: p > 0.005 ? 'up' : p < -0.005 ? 'down' : '' };
  }

  async function renderDashboard(view) {
    var seg = h('div', { class: 'seg', role: 'tablist' });
    [[7, '7 dias'], [30, '30 dias'], [90, '90 dias']].forEach(function (o) {
      seg.appendChild(h('button', { type: 'button', class: state.days === o[0] ? 'is-on' : '', onclick: function () { state.days = o[0]; go('painel', true); } }, o[1]));
    });
    $('#top-actions').appendChild(seg);
    view.appendChild(h('div', { class: 'empty' }, 'Carregando…'));

    var s;
    try { s = await api('/api/stats?days=' + state.days); }
    catch (e) { view.innerHTML = ''; view.appendChild(h('div', { class: 'card empty' }, e.message)); return; }
    if (state.view !== 'painel') return;
    view.innerHTML = '';

    var t = s.totals, p = s.previous;
    var contacts = t.whatsapp + t.leads;
    var kpis = [
      ['Visitas', nf.format(t.sessions), delta(t.sessions, p.sessions)],
      ['Pessoas', nf.format(t.visitors), delta(t.visitors, p.visitors)],
      ['Contatos', nf.format(contacts), delta(contacts, p.whatsapp + p.leads), t.whatsapp + ' WhatsApp · ' + t.leads + ' formulário'],
      ['Conversão', (t.conversion * 100).toLocaleString('pt-BR', { maximumFractionDigits: 1 }) + '%', delta(t.conversion, p.conversion), 'visitas que viraram contato']
    ];
    view.appendChild(h('div', { class: 'kpis' }, kpis.map(function (k) {
      return h('div', { class: 'kpi' },
        h('div', { class: 'kpi__label' }, k[0]),
        h('div', { class: 'kpi__value' }, k[1]),
        h('div', { class: 'kpi__delta ' + k[2].c }, k[3] ? k[3] : k[2].t),
        k[3] ? h('div', { class: 'kpi__delta ' + k[2].c }, k[2].t) : null);
    })));

    var chartCard = h('section', { class: 'card' },
      h('div', { class: 'card__head' },
        h('div', { class: 'card__title' }, 'Visitas e contatos por dia'),
        h('div', { class: 'legend' }, h('span', null, h('i', { style: 'background:#c9b18c' }), 'Visitas'), h('span', null, h('i', { style: 'background:#1d1d1f' }), 'Contatos'))),
      chart(s.series));
    view.appendChild(chartCard);

    var maxSrc = Math.max.apply(null, s.sources.map(function (x) { return x.sessions; }).concat(1));
    var sources = h('section', { class: 'card' }, h('div', { class: 'card__head' }, h('div', { class: 'card__title' }, 'De onde vêm as visitas')),
      s.sources.length ? h('table', { class: 'table' },
        h('thead', null, h('tr', null, h('th', null, 'Origem'), h('th', { class: 'num' }, 'Visitas'), h('th', { class: 'num' }, 'Contatos'))),
        h('tbody', null, s.sources.map(function (x) {
          return h('tr', null,
            h('td', null, sourceName(x.name), h('div', { class: 'bar' }, h('i', { style: 'width:' + (x.sessions / maxSrc * 100) + '%' }))),
            h('td', { class: 'num' }, nf.format(x.sessions)),
            h('td', { class: 'num' }, nf.format(x.contacts)));
        }))) : h('div', { class: 'empty' }, 'Ainda sem visitas no período.'));

    var ctas = h('section', { class: 'card' }, h('div', { class: 'card__head' }, h('div', { class: 'card__title' }, 'Cliques mais comuns')),
      s.ctas.length ? h('table', { class: 'table' }, h('tbody', null, s.ctas.map(function (x) {
        return h('tr', null, h('td', null, labelName(x.name)), h('td', { class: 'num' }, nf.format(x.n)));
      }))) : h('div', { class: 'empty' }, 'Nenhum clique registrado ainda.'));
    view.appendChild(h('div', { class: 'grid-2' }, sources, ctas));

    var totalDev = s.devices.reduce(function (a, x) { return a + x.n; }, 0) || 1;
    var devNames = { mobile: 'Celular', desktop: 'Computador', tablet: 'Tablet' };
    var devices = h('section', { class: 'card' }, h('div', { class: 'card__head' }, h('div', { class: 'card__title' }, 'Dispositivos')),
      s.devices.length ? h('table', { class: 'table' }, h('tbody', null, s.devices.map(function (x) {
        return h('tr', null, h('td', null, devNames[x.name] || x.name, h('div', { class: 'bar' }, h('i', { style: 'width:' + (x.n / totalDev * 100) + '%' }))),
          h('td', { class: 'num' }, Math.round(x.n / totalDev * 100) + '%'));
      }))) : h('div', { class: 'empty' }, 'Sem dados.'),
      s.cities.length ? h('div', { style: 'margin-top:18px' }, h('div', { class: 'card__title', style: 'font-size:15px;margin-bottom:6px' }, 'Cidades'),
        h('table', { class: 'table' }, h('tbody', null, s.cities.map(function (x) {
          return h('tr', null, h('td', null, x.name), h('td', { class: 'num' }, nf.format(x.n)));
        })))) : null);

    var recent = h('section', { class: 'card' },
      h('div', { class: 'card__head' }, h('div', { class: 'card__title' }, 'Últimos leads'), h('button', { class: 'btn btn--ghost btn--sm', type: 'button', onclick: function () { go('leads'); } }, 'Ver todos')),
      s.recentLeads.length ? h('table', { class: 'table' }, h('tbody', null, s.recentLeads.map(function (l) {
        return h('tr', null,
          h('td', null, h('strong', null, l.nome), h('div', { class: 'card__sub' }, (l.procedimento || '') + ' · ' + fmtDate(l.ts))),
          h('td', { class: 'num' }, h('a', { class: 'btn btn--ghost btn--sm', href: waFor(l.telefone), target: '_blank', rel: 'noopener' }, 'WhatsApp')));
      }))) : h('div', { class: 'empty' }, 'Os leads do formulário aparecem aqui.'));
    view.appendChild(h('div', { class: 'grid-2' }, devices, recent));

    if (s.campaigns.length) {
      view.appendChild(h('section', { class: 'card', style: 'margin-top:18px' }, h('div', { class: 'card__head' }, h('div', { class: 'card__title' }, 'Campanhas')),
        h('table', { class: 'table' },
          h('thead', null, h('tr', null, h('th', null, 'Campanha'), h('th', { class: 'num' }, 'Visitas'), h('th', { class: 'num' }, 'Contatos'))),
          h('tbody', null, s.campaigns.map(function (x) {
            return h('tr', null, h('td', null, x.name), h('td', { class: 'num' }, nf.format(x.sessions)), h('td', { class: 'num' }, nf.format(x.contacts)));
          })))));
    }

    view.appendChild(utmBuilder());
  }

  function chart(series) {
    var W = 900, H = 240, pad = { l: 28, r: 8, t: 12, b: 26 };
    var max = Math.max.apply(null, series.map(function (d) { return d.sessions; }).concat(4));
    var nice = Math.ceil(max / 4) * 4;
    var n = series.length;
    var x = function (i) { return pad.l + (n === 1 ? (W - pad.l - pad.r) / 2 : i * (W - pad.l - pad.r) / (n - 1)); };
    var y = function (v) { return pad.t + (H - pad.t - pad.b) * (1 - v / nice); };
    var line = series.map(function (d, i) { return (i ? 'L' : 'M') + x(i).toFixed(1) + ' ' + y(d.sessions).toFixed(1); }).join(' ');
    var area = line + ' L' + x(n - 1).toFixed(1) + ' ' + y(0) + ' L' + x(0).toFixed(1) + ' ' + y(0) + ' Z';
    var bw = Math.max(2, Math.min(14, (W - pad.l - pad.r) / n * 0.45));
    var svg = '<svg viewBox="0 0 ' + W + ' ' + H + '" preserveAspectRatio="none" role="img" aria-label="Gráfico de visitas por dia">' +
      '<defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#c9b18c" stop-opacity=".45"/><stop offset="1" stop-color="#c9b18c" stop-opacity="0"/></linearGradient></defs>';
    for (var k = 0; k <= 4; k++) {
      var v = nice / 4 * k;
      svg += '<line x1="' + pad.l + '" x2="' + (W - pad.r) + '" y1="' + y(v) + '" y2="' + y(v) + '" stroke="rgba(0,0,0,.06)"/>' +
        '<text x="0" y="' + (y(v) + 4) + '" font-size="11" fill="#86868b">' + v + '</text>';
    }
    svg += '<path d="' + area + '" fill="url(#g)"/><path d="' + line + '" fill="none" stroke="#b39466" stroke-width="2" vector-effect="non-scaling-stroke" stroke-linejoin="round"/>';
    series.forEach(function (d, i) {
      if (d.contacts) svg += '<rect x="' + (x(i) - bw / 2) + '" y="' + y(d.contacts) + '" width="' + bw + '" height="' + (y(0) - y(d.contacts)) + '" rx="2" fill="#1d1d1f"/>';
    });
    var step = Math.ceil(n / 7);
    series.forEach(function (d, i) {
      if (i % step === 0 || i === n - 1) {
        var dd = d.day.slice(8, 10) + '/' + d.day.slice(5, 7);
        svg += '<text x="' + x(i) + '" y="' + (H - 6) + '" font-size="11" fill="#86868b" text-anchor="middle">' + dd + '</text>';
      }
    });
    svg += '</svg>';
    var tip = h('div', { class: 'chart__tip' });
    var box = h('div', { class: 'chart', html: svg });
    box.appendChild(tip);
    box.addEventListener('mousemove', function (ev) {
      var r = box.getBoundingClientRect();
      var rel = (ev.clientX - r.left) / r.width * W;
      var i = Math.round((rel - pad.l) / ((W - pad.l - pad.r) / Math.max(1, n - 1)));
      i = Math.max(0, Math.min(n - 1, i));
      var d = series[i];
      tip.innerHTML = '<strong>' + d.day.slice(8, 10) + '/' + d.day.slice(5, 7) + '</strong><br>' + d.sessions + ' visitas · ' + d.contacts + ' contatos';
      tip.style.left = (x(i) / W * 100) + '%';
      tip.style.top = (y(d.sessions) / H * r.height) + 'px';
      tip.classList.add('on');
    });
    box.addEventListener('mouseleave', function () { tip.classList.remove('on'); });
    return box;
  }

  function utmBuilder() {
    var src = h('select', { class: 'select', 'aria-label': 'Onde o link será usado' },
      [['instagram', 'Instagram (bio, stories)'], ['facebook', 'Anúncio Meta'], ['google', 'Google Ads'], ['whatsapp', 'WhatsApp / lista'], ['tiktok', 'TikTok'], ['indicacao', 'Indicação / parceria']].map(function (o) {
        return h('option', { value: o[0] }, o[1]);
      }));
    var camp = h('input', { class: 'input', type: 'text', placeholder: 'Nome da campanha, ex.: labios-outubro', 'aria-label': 'Nome da campanha' });
    var out = h('input', { class: 'input', type: 'text', readonly: true, 'aria-label': 'Link gerado' });
    function build() {
      var c = camp.value.trim().toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
      var m = { instagram: 'social', facebook: 'paid', google: 'cpc', whatsapp: 'message', tiktok: 'social', indicacao: 'referral' }[src.value];
      out.value = location.origin + '/?utm_source=' + src.value + '&utm_medium=' + m + (c ? '&utm_campaign=' + c : '');
    }
    src.addEventListener('change', build);
    camp.addEventListener('input', build);
    build();
    return h('section', { class: 'card', style: 'margin-top:18px' },
      h('div', { class: 'card__head' }, h('div', null, h('div', { class: 'card__title' }, 'Criar link rastreável'),
        h('div', { class: 'card__sub' }, 'Use este link na bio, em anúncios ou parcerias para saber exatamente quais campanhas trazem pacientes.'))),
      h('div', { class: 'utm' }, src, camp, h('span')),
      h('div', { class: 'utm__out' }, out, h('button', { class: 'btn btn--primary', type: 'button', onclick: function () {
        out.select();
        (navigator.clipboard ? navigator.clipboard.writeText(out.value) : Promise.reject()).then(function () { toast('Link copiado'); }, function () { document.execCommand('copy'); toast('Link copiado'); });
      } }, 'Copiar')));
  }

  /* =================================================================
     Leads
     ================================================================= */
  var STATUS = [['novo', 'Novo'], ['contatado', 'Contatado'], ['agendado', 'Agendado'], ['paciente', 'Paciente'], ['perdido', 'Perdido']];

  async function refreshLeadBadge() {
    try {
      var r = await api('/api/leads?status=novo');
      state.newLeads = r.counts.novo || 0;
      renderNav();
    } catch (e) { /* ignora */ }
  }

  async function renderLeads(view) {
    $('#top-actions').appendChild(h('a', { class: 'btn btn--ghost', href: '/api/leads?format=csv', html: ico('download') + ' Exportar planilha' }));
    var seg = h('div', { class: 'seg' });
    var search = h('input', { class: 'input', type: 'search', placeholder: 'Buscar nome, telefone…', value: state.leadsQ, 'aria-label': 'Buscar leads' });
    var list = h('div', { class: 'leads' }, h('div', { class: 'empty' }, 'Carregando…'));
    view.appendChild(h('div', { class: 'toolbar' }, seg, h('span', { class: 'spacer' }), search));
    view.appendChild(list);

    var timer;
    search.addEventListener('input', function () { clearTimeout(timer); timer = setTimeout(function () { state.leadsQ = search.value; load(); }, 250); });

    async function load() {
      var qs = new URLSearchParams();
      if (state.leadsFilter) qs.set('status', state.leadsFilter);
      if (state.leadsQ) qs.set('q', state.leadsQ);
      var r;
      try { r = await api('/api/leads?' + qs.toString()); }
      catch (e) { list.innerHTML = ''; list.appendChild(h('div', { class: 'empty' }, e.message)); return; }
      var total = Object.keys(r.counts).reduce(function (a, k) { return a + r.counts[k]; }, 0);
      seg.innerHTML = '';
      [['', 'Todos', total]].concat(STATUS.map(function (s) { return [s[0], s[1], r.counts[s[0]] || 0]; })).forEach(function (o) {
        seg.appendChild(h('button', { type: 'button', class: state.leadsFilter === o[0] ? 'is-on' : '', onclick: function () { state.leadsFilter = o[0]; load(); } }, o[1] + (o[2] ? ' ' + o[2] : '')));
      });
      state.newLeads = r.counts.novo || 0;
      renderNav();

      list.innerHTML = '';
      if (!r.leads.length) {
        list.appendChild(h('div', { class: 'empty' }, total ? 'Nenhum lead com esse filtro.' : 'Quando alguém preencher o formulário do site, aparece aqui.'));
        return;
      }
      list.appendChild(h('div', { class: 'lead lead--head' },
        h('span', { class: 'lead__date' }, 'Data'), h('span', null, 'Nome'), h('span', null, 'Interesse'), h('span', { class: 'lead__src' }, 'Origem'), h('span', null, 'Status'), h('span')));
      r.leads.forEach(function (l) { list.appendChild(leadRow(l, load)); });
    }
    load();
  }

  function leadRow(l, reload) {
    var sel = h('select', { class: 'select pill-select st-' + l.status, 'aria-label': 'Status de ' + l.nome },
      STATUS.map(function (s) { return h('option', { value: s[0], selected: s[0] === l.status }, s[1]); }));
    sel.addEventListener('change', async function () {
      try {
        await api('/api/leads', { method: 'PATCH', body: { id: l.id, status: sel.value } });
        sel.className = 'select pill-select st-' + sel.value;
        l.status = sel.value;
        toast('Status atualizado');
        refreshLeadBadge();
      } catch (e) { toast(e.message, true); }
    });
    var notes = h('div', { class: 'lead__notes', hidden: !l.notas });
    var ta = h('textarea', { class: 'textarea', placeholder: 'Anotações sobre este contato…', 'aria-label': 'Anotações' });
    ta.value = l.notas || '';
    ta.addEventListener('blur', async function () {
      if (ta.value === (l.notas || '')) return;
      try { await api('/api/leads', { method: 'PATCH', body: { id: l.id, notas: ta.value } }); l.notas = ta.value; toast('Anotação salva'); }
      catch (e) { toast(e.message, true); }
    });
    notes.appendChild(ta);
    var origin = [l.source || l.ref || 'direto', l.campaign].filter(Boolean).join(' · ');
    return h('div', { class: 'lead' },
      h('span', { class: 'lead__date' }, fmtDate(l.ts)),
      h('span', { class: 'lead__name' }, h('strong', null, l.nome), h('a', { href: waFor(l.telefone), target: '_blank', rel: 'noopener' }, fmtPhone(l.telefone))),
      h('span', { class: 'lead__proc' }, l.procedimento || '—'),
      h('span', { class: 'lead__src' }, sourceName(origin)),
      h('span', { class: 'lead__status' }, sel),
      h('span', { class: 'lead__actions' },
        h('a', { class: 'icon-btn', href: waFor(l.telefone), target: '_blank', rel: 'noopener', title: 'Abrir WhatsApp', 'aria-label': 'Abrir WhatsApp', html: ico('wa') }),
        h('button', { class: 'icon-btn', type: 'button', title: 'Anotações', 'aria-label': 'Anotações', html: ico('note'), onclick: function () { notes.hidden = !notes.hidden; if (!notes.hidden) ta.focus(); } }),
        h('button', { class: 'icon-btn icon-btn--danger', type: 'button', title: 'Excluir', 'aria-label': 'Excluir', html: ico('trash'), onclick: async function () {
          if (!confirm('Excluir o lead de ' + l.nome + '?')) return;
          try { await api('/api/leads', { method: 'DELETE', body: { id: l.id } }); toast('Lead excluído'); reload(); refreshLeadBadge(); }
          catch (e) { toast(e.message, true); }
        } })),
      notes);
  }

  /* =================================================================
     Agenda (pré-reservas)
     ================================================================= */
  var BOOK_STATUS = [['pendente', 'A confirmar'], ['confirmado', 'Confirmado'], ['cancelado', 'Cancelado']];
  var WEEK_LONG = ['domingo', 'segunda-feira', 'terça-feira', 'quarta-feira', 'quinta-feira', 'sexta-feira', 'sábado'];

  async function renderBookings(view) {
    var past = false;
    var seg = h('div', { class: 'seg' });
    var box = h('div', null, h('div', { class: 'empty' }, 'Carregando…'));
    $('#top-actions').appendChild(seg);
    view.appendChild(box);
    function drawSeg() {
      seg.innerHTML = '';
      [[false, 'Próximas'], [true, 'Anteriores']].forEach(function (o) {
        seg.appendChild(h('button', { type: 'button', class: past === o[0] ? 'is-on' : '', onclick: function () { past = o[0]; drawSeg(); load(); } }, o[1]));
      });
    }
    async function load() {
      var r;
      try { r = await api('/api/bookings' + (past ? '?past=1' : '')); }
      catch (e) { box.innerHTML = ''; box.appendChild(h('div', { class: 'card empty' }, e.message)); return; }
      box.innerHTML = '';
      if (!r.bookings.length) {
        box.appendChild(h('div', { class: 'card empty' }, past ? 'Nenhuma reserva anterior.' : 'Nenhuma pré-reserva ainda. Quando alguém escolher um horário no site, aparece aqui.'));
        return;
      }
      var byDay = {};
      r.bookings.forEach(function (b) { (byDay[b.date] = byDay[b.date] || []).push(b); });
      Object.keys(byDay).forEach(function (date) {
        var d = new Date(date + 'T12:00:00Z');
        var label = WEEK_LONG[d.getUTCDay()] + ', ' + d.toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', timeZone: 'UTC' });
        var rows = h('div', { class: 'rows' });
        byDay[date].forEach(function (b) {
          var sel = h('select', { class: 'select pill-select bk-' + b.status, 'aria-label': 'Status de ' + b.nome },
            BOOK_STATUS.map(function (s) { return h('option', { value: s[0], selected: s[0] === b.status }, s[1]); }));
          sel.addEventListener('change', async function () {
            try {
              await api('/api/bookings', { method: 'PATCH', body: { id: b.id, status: sel.value } });
              sel.className = 'select pill-select bk-' + sel.value;
              toast(sel.value === 'confirmado' ? 'Reserva confirmada' : sel.value === 'cancelado' ? 'Reserva cancelada, horário liberado' : 'Status atualizado');
            } catch (e) { toast(e.message, true); }
          });
          var msg = 'Olá, ' + b.nome.split(' ')[0] + '! Aqui é da equipe da Dra. Millena. Confirmando sua avaliação ' + label + ' às ' + b.time + '. Podemos confirmar?';
          rows.appendChild(h('div', { class: 'booking' },
            h('span', { class: 'booking__time' }, b.time),
            h('span', { class: 'booking__who' }, h('strong', null, b.nome), h('small', null, fmtPhone(b.telefone) + (b.interesse ? ' · ' + b.interesse : ''))),
            sel,
            h('a', { class: 'btn btn--ghost btn--sm', href: waFor(b.telefone) + '?text=' + encodeURIComponent(msg), target: '_blank', rel: 'noopener', html: ico('wa') + ' Confirmar' })));
        });
        box.appendChild(h('section', { class: 'group' }, h('div', { class: 'group__label' }, label), rows));
      });
    }
    drawSeg();
    load();
  }

  /* =================================================================
     Usuários
     ================================================================= */
  async function renderUsers(view) {
    var listBox = h('div', { class: 'rows' }, h('div', { class: 'empty' }, 'Carregando…'));
    var email = h('input', { class: 'input', type: 'email', placeholder: 'email@exemplo.com', autocomplete: 'off', 'aria-label': 'Email' });
    var pass = h('input', { class: 'input', type: 'password', placeholder: 'Senha (8+ caracteres)', autocomplete: 'new-password', 'aria-label': 'Senha' });
    var addForm = h('form', { class: 'inline-form' }, email, pass, h('button', { class: 'btn btn--blue', type: 'submit' }, 'Adicionar'));
    addForm.addEventListener('submit', async function (ev) {
      ev.preventDefault();
      try { var r = await api('/api/users', { method: 'POST', body: { email: email.value, password: pass.value } }); email.value = ''; pass.value = ''; draw(r.users); toast('Acesso criado'); }
      catch (e) { toast(e.message, true); }
    });
    var myPass = h('input', { class: 'input', type: 'password', placeholder: 'Nova senha (8+ caracteres)', autocomplete: 'new-password', 'aria-label': 'Nova senha' });
    var myForm = h('form', { class: 'inline-form', style: 'grid-template-columns:1fr auto' }, myPass, h('button', { class: 'btn btn--primary', type: 'submit' }, 'Trocar senha'));
    myForm.addEventListener('submit', async function (ev) {
      ev.preventDefault();
      try { await api('/api/users', { method: 'PATCH', body: { password: myPass.value } }); myPass.value = ''; toast('Senha alterada'); }
      catch (e) { toast(e.message, true); }
    });

    view.appendChild(h('section', { class: 'group' }, h('div', { class: 'group__label' }, 'Quem tem acesso'), listBox));
    view.appendChild(h('section', { class: 'group' }, h('div', { class: 'group__label' }, 'Dar acesso a outra pessoa'), h('div', { class: 'rows' }, addForm)));
    view.appendChild(h('section', { class: 'group' }, h('div', { class: 'group__label' }, 'Minha senha'), h('div', { class: 'rows' }, myForm)));

    function draw(users) {
      listBox.innerHTML = '';
      users.forEach(function (u) {
        var me = u.id === state.me.id;
        listBox.appendChild(h('div', { class: 'user-row' },
          h('span', { class: 'avatar' }, u.email.charAt(0)),
          h('div', { class: 'user-row__body' }, u.email, h('small', null, me ? 'Você' : 'Desde ' + new Date(u.created_at).toLocaleDateString('pt-BR'))),
          me ? null : h('button', { class: 'btn btn--danger btn--sm', type: 'button', onclick: async function () {
            if (!confirm('Remover o acesso de ' + u.email + '?')) return;
            try { var r = await api('/api/users', { method: 'DELETE', body: { id: u.id } }); draw(r.users); toast('Acesso removido'); }
            catch (e) { toast(e.message, true); }
          } }, 'Remover')));
      });
    }
    try { draw((await api('/api/users')).users); }
    catch (e) { listBox.innerHTML = ''; listBox.appendChild(h('div', { class: 'empty' }, e.message)); }
  }

  /* =================================================================
     Início
     ================================================================= */
  (async function init() {
    try {
      var r = await api('/api/me');
      if (r.user) { state.me = r.user; await start(); }
      else showLogin(r.setup);
    } catch (e) {
      showLogin(null);
      $('#login-err').textContent = e.message;
    }
  })();
})();
