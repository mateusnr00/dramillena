// Conteúdo padrão do site (os mesmos textos do site original). Tudo aqui pode
// ser editado pelo painel /admin; o que for salvo lá substitui estes valores
// (merge profundo, ver mergeConfig).
//
// Marcadores de texto aceitos nos títulos:
//   *palavra*  → destaque em itálico
//   |          → quebra de linha

export const DEFAULT_CONFIG = {
  settings: {
    nome: 'Dra. Millena Curty',
    whatsapp: '5511999999999',
    whatsappMsg: 'Olá, gostaria de agendar uma avaliação com a Dra. Millena',
    instagram: 'dra.millenacurty',
    email: 'contato@millenacurty.com.br',
    cro: '',
    cidade: 'São Paulo',
    endereco: '',
    horario: 'Segunda a sábado, com hora marcada',
    mapa: '',
    seoTitle: 'Dra. Millena Curty | Harmonização Facial em São Paulo',
    seoDescription: 'A beleza da sua essência. Harmonização facial com a Dra. Millena Curty, em São Paulo: técnica, cuidado e respeito à sua individualidade.',
    ogImage: '/img/millena.webp',
    pixelId: '',
    ga4Id: ''
  },

  hero: {
    eyebrow: '',
    title: 'A beleza|da sua essência.',
    sub: 'Harmonização facial com técnica, cuidado e respeito à sua individualidade.',
    foto: '/img/millena.webp',
    video: '',
    frase: 'Ninguém percebe o procedimento. Todo mundo percebe você.',
    ctaPrimary: 'Agendar avaliação',
    ctaSecondary: 'Conheça a doutora',
    mostrarIndicadores: false,
    antes: '/img/antes1.webp',
    depois: '/img/depois1.webp',
    note: 'Arraste para comparar o antes e o depois.',
    trust: [
      { num: '+800', label: 'pacientes atendidas' },
      { num: '7 anos', label: 'dedicados à harmonização facial' },
      { num: '5,0', label: 'de nota nas avaliações' }
    ]
  },

  filosofia: {
    title: 'Cada rosto|é único.',
    lead: 'Nenhum rosto se repete. Por isso, nenhum plano se repete.',
    texto: 'Antes de qualquer procedimento, existe uma leitura: das proporções, da estrutura óssea, da pele e de como o seu rosto se move quando você fala e sorri. O objetivo nunca é aproximar você de um padrão, e sim devolver equilíbrio ao que já é seu.'
  },

  explorer: {
    title: 'Leitura facial',
    intro: 'Toque em uma região para entender como ela é avaliada. É um mapa de conversa, não uma previsão de resultado.',
    regioes: [
      { nome: 'Terço superior', texto: 'Testa, têmporas e sobrancelhas. Aqui a avaliação olha para linhas de expressão e para o quanto a região sustenta o olhar.', tratamentos: 'Toxina botulínica, bioestimulador de colágeno' },
      { nome: 'Região malar', texto: 'As maçãs do rosto refletem a luz e dão estrutura ao terço médio. Pequenas perdas de volume aqui mudam a leitura do rosto inteiro.', tratamentos: 'Preenchimento facial, bioestimulador de colágeno' },
      { nome: 'Lábios', texto: 'Contorno, volume e hidratação, sempre em proporção com o nariz, o queixo e o sorriso. Nada de lábio padrão.', tratamentos: 'Preenchimento labial' },
      { nome: 'Mento', texto: 'O queixo equilibra o perfil e o terço inferior. Uma projeção bem medida harmoniza nariz e lábios sem mexer neles.', tratamentos: 'Preenchimento facial' },
      { nome: 'Contorno mandibular', texto: 'A linha da mandíbula define o desenho do rosto de frente e de perfil. A avaliação considera estrutura óssea, pele e flacidez.', tratamentos: 'Preenchimento facial, bioestimulador de colágeno, Ulthera' }
    ]
  },

  ciencia: {
    title: 'Por dentro da pele',
    intro: 'Estética facial é anatomia antes de ser técnica. Três ideias que guiam cada avaliação.',
    camadas: 'O rosto é feito de camadas: pele, gordura, músculo e osso. Cada uma envelhece de um jeito, e cada tratamento atua em uma profundidade diferente.',
    colageno: 'O colágeno é a rede que dá firmeza à pele. Com o passar dos anos, o corpo produz menos, e a rede fica mais espaçada. Alguns tratamentos estimulam a própria pele a produzir de novo.',
    avaliacao: 'Nenhum plano começa pela agulha. Começa por escutar o que você quer, analisar o rosto inteiro e só então decidir, junto com você.'
  },

  espaco: {
    title: 'O consultório',
    texto: 'Um consultório pensado para a calma: atendimento com hora marcada, uma paciente por vez e tempo para conversar antes de qualquer decisão.',
    itens: ['Uma paciente por horário', 'Privacidade do início ao fim', 'Retorno incluso para acompanhar o resultado', 'São Paulo, SP'],
    fotos: []
  },

  millena: {
    eyebrow: 'Quem cuida de você',
    foto: '/img/millena.webp',
    badge: 'Cirurgiã-dentista',
    title: 'Dra. Millena Curty',
    resumo: 'Dedicada à harmonização facial, com um olhar que parte da anatomia e respeita a identidade de cada paciente.',
    bio1: 'Meu trabalho tem um único propósito: fazer você se olhar no espelho e reconhecer a si mesma. Só que com um brilho a mais.',
    bio2: '"O melhor procedimento é aquele que ninguém percebe, mas todos sentem. Harmonização não é mudar quem você é, é devolver a você o que o tempo, o cansaço ou a genética te tiraram."',
    credentials: [
      'Especialista em Harmonização Orofacial',
      '7 anos de atuação em harmonização facial',
      '+800 pacientes atendidas'
    ],
    cta: 'Conheça a doutora'
  },

  metodo: {
    nome: 'Método Essência',
    frase: 'Antes de pensar em agulhas, a Dra. Millena olha para quem você é.',
    texto: 'Cada plano nasce de quatro princípios que guiam todas as decisões, da primeira conversa ao retorno.',
    pilares: [
      { titulo: 'Leitura facial', texto: 'Análise das proporções, da estrutura e de como o seu rosto se move quando você fala e sorri.' },
      { titulo: 'Sutileza', texto: 'Doses e volumes na medida certa. O objetivo é que notem você, não o procedimento.' },
      { titulo: 'Identidade', texto: 'O plano respeita os traços que fazem de você quem você é. Nada de rosto padrão.' },
      { titulo: 'Cuidado contínuo', texto: 'Retorno e acompanhamento para ajustar e manter o resultado ao longo do tempo.' }
    ]
  },

  agenda: {
    ativo: true,
    dias: 'seg, ter, qua, qui, sex, sab',
    inicio: '09:00',
    fim: '18:00',
    duracao: 60,
    antecedenciaHoras: 12,
    diasFuturos: 21,
    bloqueios: ''
  },

  galeria: {
    eyebrow: 'Resultados',
    ativo: true,
    title: 'Antes e depois',
    intro: 'Arraste a linha sobre a foto para comparar. Mudanças sutis, que respeitam os traços de cada paciente.',
    disclaimer: 'Resultados variam de pessoa para pessoa e dependem de avaliação individual.',
    cta: 'Quero conversar sobre o meu caso',
    items: [
      { before: '/img/antes1.webp', after: '/img/depois1.webp', titulo: 'Harmonização global', categoria: 'Harmonização' }
    ]
  },

  procedimentos: {
    eyebrow: 'Procedimentos',
    title: 'Procedimentos',
    destaqueTitulo: 'Cuidados que respeitam|o seu desenho.',
    intro: 'Cada tratamento é uma ferramenta, não um pacote. A avaliação decide quais fazem sentido para você, e quais não fazem.',
    cta: 'Tirar dúvidas no WhatsApp',
    items: [
      { title: 'Full Face', desc: 'Plano integrado com múltiplas técnicas conversando entre si. Reestruturação facial completa com resultado natural e duradouro.', icon: '', foto: '', destaque: true },
      { title: 'Rinomodelação', desc: 'Correção sutil do contorno nasal sem cirurgia. Preenchimento estratégico que harmoniza o perfil respeitando sua identidade.', icon: '', foto: '', destaque: true },
      { title: 'Preenchimento Labial', desc: 'Lábios em proporção com o resto do rosto. Volume sob medida. Nada de "lábio de novela".', icon: '', foto: '', destaque: true },
      { title: 'Bioestimulador de Colágeno', desc: 'Reativa o colágeno que a sua pele produz cada vez menos. Firmeza que aparece devagar e dura anos.', icon: '', foto: '', destaque: false },
      { title: 'Ulthera', desc: 'Ultrassom microfocado que estimula colágeno em camadas profundas. Lifting sem cirurgia, sem downtime.', icon: '', foto: '', destaque: false }
    ]
  },

  depoimentos: {
    eyebrow: 'Depoimentos',
    ativo: false,
    title: 'Em palavras das pacientes',
    cta: 'Quero minha história',
    items: [
      { texto: 'Saí me sentindo eu mesma, só que descansada. Ninguém percebe que fiz algo, mas todos notam que estou diferente.', nome: 'Ana Beatriz', role: 'Cliente desde 2023' },
      { texto: 'Mão delicada, olhar de artista. Ela tem essa rara capacidade de enxergar o que você ainda não enxergou em si.', nome: 'Carolina M.', role: 'Cliente desde 2022' },
      { texto: 'Já tinha feito harmonização antes e não gostei. Aqui foi outra experiência: desde o atendimento até o resultado.', nome: 'Juliana R.', role: 'Cliente desde 2024' },
      { texto: "Tenho medo até de mostrar o antes. A diferença é enorme, mas ninguém consegue dizer o que mudou. Meu marido só falou que eu estava 'brilhando'.", nome: 'Fernanda P.', role: 'Cliente desde 2024' },
      { texto: 'Passei anos comparando clínicas e adiando. Se soubesse que ia ser essa experiência, tinha ido muito antes. Sem exagero: mudou meu jeito de me olhar no espelho.', nome: 'Marina C.', role: 'Cliente desde 2023' },
      { texto: 'O atendimento da Millena é uma consulta com uma amiga que entende do assunto. Ela explica tudo, escuta tudo, e só faz o que faz sentido. Zero venda forçada.', nome: 'Beatriz L.', role: 'Cliente desde 2022' }
    ]
  },

  processo: {
    eyebrow: 'Como funciona',
    title: 'Do primeiro olá ao resultado.',
    steps: [
      { title: 'Conversa', desc: 'Você chama no WhatsApp e encontramos o melhor horário para a sua avaliação.' },
      { title: 'Avaliação gratuita', desc: 'Análise completa do rosto, escuta atenta e um plano feito só para você. Sem compromisso.' },
      { title: 'Procedimento', desc: 'Técnica refinada, produtos de primeira linha e todo o tempo que o seu rosto merece.' },
      { title: 'Acompanhamento', desc: 'Retorno incluso para avaliar o resultado e ajustar o que for preciso.' }
    ]
  },

  faq: {
    eyebrow: 'Dúvidas frequentes',
    title: 'Perguntas frequentes',
    items: [
      { q: 'A avaliação é mesmo gratuita?', a: 'Sim. Na avaliação a Dra. Millena analisa o seu rosto, entende o que você deseja e monta um plano personalizado. Você decide com calma, sem compromisso.' },
      { q: 'O resultado fica natural?', a: 'Esse é o princípio de todo o trabalho. A ideia é realçar os seus traços, não transformar. As pessoas notam que você está bem, sem saber exatamente o porquê.' },
      { q: 'Dói?', a: 'Usamos anestésico tópico e, quando indicado, anestesia local. A maioria das pacientes descreve apenas um leve desconforto.' },
      { q: 'Quanto tempo dura?', a: 'Depende do procedimento. Preenchimentos costumam durar de 12 a 18 meses, toxina botulínica de 4 a 6 meses e bioestimuladores até 2 anos.' },
      { q: 'Posso voltar à rotina no mesmo dia?', a: 'Na maioria dos casos, sim. Você recebe todas as orientações de cuidados antes de sair do consultório.' }
    ]
  },

  form: {
    eyebrow: 'Agendamento',
    title: 'Sua avaliação começa|por uma conversa.',
    desc: 'Conte o que você deseja. A Dra. Millena avalia o seu rosto e indica, com honestidade, o que faz sentido para você.',
    cta: 'Agendar pelo WhatsApp',
    waTitle: 'Falar no WhatsApp',
    waSub: 'resposta em até 1 hora',
    formTitle: 'Reserve sua avaliação gratuita',
    formSub: 'Seus dados ficam só com a nossa equipe.',
    submit: 'Quero conversar com a Millena',
    legal: 'Ao enviar, você concorda em receber contato pelo WhatsApp. Seus dados são confidenciais.'
  },

  footer: {
    tag: 'Harmonização facial e estética avançada. Cirurgiã-dentista especialista em Harmonização Orofacial.'
  }
};

function isPlainObject(v) {
  return v && typeof v === 'object' && !Array.isArray(v);
}

// Merge profundo: objetos se misturam, arrays e valores simples são substituídos.
export function mergeConfig(base, override) {
  if (!isPlainObject(override)) return structuredClone(base);
  const out = structuredClone(base);
  for (const [k, v] of Object.entries(override)) {
    if (isPlainObject(v) && isPlainObject(out[k])) out[k] = mergeConfig(out[k], v);
    else if (v !== undefined && v !== null) out[k] = v;
  }
  return out;
}
