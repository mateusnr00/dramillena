// Conteúdo padrão do site. Tudo aqui pode ser editado pelo painel /admin;
// o que for salvo lá substitui estes valores (merge profundo, ver mergeConfig).
//
// Marcadores de texto aceitos nos títulos:
//   *palavra*  → destaque em itálico serifado
//   |          → quebra de linha

export const DEFAULT_CONFIG = {
  settings: {
    nome: 'Dra. Millena Curty',
    whatsapp: '5511999999999',
    whatsappMsg: 'Olá, Dra. Millena! Gostaria de agendar uma avaliação.',
    instagram: 'dra.millenacurty',
    email: 'contato@millenacurty.com.br',
    endereco: '',
    cidade: 'São Paulo, SP',
    cro: '',
    horario: 'Segunda a sábado, com hora marcada',
    seoTitle: 'Dra. Millena Curty · Harmonização Facial em São Paulo',
    seoDescription: 'Harmonização facial autoral com a Dra. Millena Curty. Resultados naturais, técnica refinada e avaliação gratuita pelo WhatsApp.',
    ogImage: '/img/millena.webp',
    pixelId: '',
    ga4Id: ''
  },

  hero: {
    eyebrow: 'Harmonização Facial · São Paulo',
    title: 'Você, mais *você*.',
    titleMuted: 'Sem parecer feita.',
    sub: 'Harmonização facial autoral, com resultado natural. Ninguém percebe o procedimento. Todo mundo percebe você.',
    ctaPrimary: 'Agendar avaliação gratuita',
    ctaSecondary: 'Falar no WhatsApp',
    antes: '/img/antes1.webp',
    depois: '/img/depois1.webp',
    note: 'Arraste para comparar'
  },

  stats: [
    { num: '+800', label: 'rostos harmonizados' },
    { num: '7 anos', label: 'dedicados à harmonização' },
    { num: '5,0', label: 'nota das pacientes' },
    { num: '1', label: 'paciente por horário' }
  ],

  manifesto: {
    text: 'O melhor procedimento é aquele que ninguém percebe, mas todo mundo sente.'
  },

  sobre: {
    foto: '/img/millena.webp',
    eyebrow: 'Quem cuida de você',
    title: 'Conheça a *Dra. Millena*.',
    bio1: 'Cirurgiã-dentista, especialista em Harmonização Orofacial. Há 7 anos dedico meu trabalho a um único propósito: fazer você se olhar no espelho e reconhecer a si mesma. Só que com um brilho a mais.',
    bio2: 'Harmonização não é mudar quem você é. É devolver o que o tempo, o cansaço ou a genética tiraram, respeitando a identidade do seu rosto.',
    credentials: [
      'Especialista em Harmonização Orofacial',
      '+800 pacientes atendidas',
      'Atualização constante em técnicas internacionais',
      'Uma paciente por horário. Sem correria, sem fila.'
    ]
  },

  procedimentos: {
    eyebrow: 'Procedimentos',
    title: 'Cuidado *autoral*, do diagnóstico ao resultado.',
    items: [
      {
        title: 'Full Face',
        short: 'O rosto inteiro, em equilíbrio.',
        desc: 'Plano integrado em que várias técnicas conversam entre si. Uma reestruturação facial completa, com resultado natural e duradouro.',
        icon: '/img/icon-fullface.webp',
        duracao: '60 a 90 min',
        resultado: 'Imediato, com refinamento em 15 dias',
        recuperacao: 'Rotina normal no mesmo dia'
      },
      {
        title: 'Rinomodelação',
        short: 'Perfil harmônico, sem cirurgia.',
        desc: 'Correção sutil do contorno nasal com preenchimento estratégico. Harmoniza o perfil respeitando a sua identidade.',
        icon: '/img/icon-rinomodelacao.webp',
        duracao: '30 a 45 min',
        resultado: 'Imediato',
        recuperacao: 'Rotina normal no mesmo dia'
      },
      {
        title: 'Preenchimento Labial',
        short: 'Volume sob medida.',
        desc: 'Lábios em proporção com o resto do rosto. Contorno e hidratação na medida certa. Nada de "lábio de novela".',
        icon: '/img/icon-labios.webp',
        duracao: '30 a 45 min',
        resultado: 'Imediato, assenta em 7 a 15 dias',
        recuperacao: 'Leve inchaço por 2 a 3 dias'
      },
      {
        title: 'Bioestimulador de Colágeno',
        short: 'Firmeza que aparece devagar e dura.',
        desc: 'Reativa o colágeno que a sua pele produz cada vez menos. Melhora firmeza, textura e contorno de forma progressiva.',
        icon: '/img/icon-bioestimulador.webp',
        duracao: '40 min',
        resultado: 'Progressivo, de 30 a 90 dias',
        recuperacao: 'Rotina normal no mesmo dia'
      },
      {
        title: 'Ulthera',
        short: 'Lifting sem cirurgia.',
        desc: 'Ultrassom microfocado que estimula colágeno nas camadas profundas da pele. Efeito lifting, sem cortes e sem downtime.',
        icon: '/img/icon-ulthera.webp',
        duracao: '60 a 90 min',
        resultado: 'Progressivo, de 60 a 180 dias',
        recuperacao: 'Sem afastamento'
      }
    ]
  },

  processo: {
    eyebrow: 'Como funciona',
    title: 'Simples, do primeiro *olá* ao resultado.',
    steps: [
      { title: 'Conversa', desc: 'Você chama no WhatsApp e a gente encontra o melhor horário para a sua avaliação.' },
      { title: 'Avaliação gratuita', desc: 'Análise completa do rosto, escuta atenta e um plano feito só para você. Sem compromisso.' },
      { title: 'Procedimento', desc: 'Técnica refinada, produtos de primeira linha e todo o tempo que o seu rosto merece.' },
      { title: 'Acompanhamento', desc: 'Retorno incluso para avaliar o resultado e ajustar o que for preciso.' }
    ]
  },

  resultados: {
    eyebrow: 'Resultados',
    title: 'Pequenas mudanças. *Grandes* revelações.',
    intro: 'Arraste o controle de cada imagem para comparar o antes e o depois.',
    disclaimer: 'Resultados variam de acordo com cada paciente. Imagens publicadas com autorização.',
    items: [
      { before: '/img/antes1.webp', after: '/img/depois1.webp', titulo: 'Harmonização global', categoria: 'Harmonização' }
    ]
  },

  depoimentos: {
    eyebrow: 'Depoimentos',
    title: 'Histórias que *moldaram* as minhas.',
    items: [
      { texto: 'Saí me sentindo eu mesma, só que descansada. Ninguém percebe que fiz algo, mas todos notam que estou diferente.', nome: 'Ana Beatriz', role: 'Paciente desde 2023' },
      { texto: 'Mão delicada, olhar de artista. Ela tem essa rara capacidade de enxergar o que você ainda não enxergou em si.', nome: 'Carolina M.', role: 'Paciente desde 2022' },
      { texto: 'Já tinha feito harmonização antes e não gostei. Aqui foi outra experiência, do atendimento ao resultado.', nome: 'Juliana R.', role: 'Paciente desde 2024' },
      { texto: 'A diferença é enorme, mas ninguém consegue dizer o que mudou. Meu marido só falou que eu estava brilhando.', nome: 'Fernanda P.', role: 'Paciente desde 2024' },
      { texto: 'Passei anos comparando clínicas e adiando. Se soubesse que seria essa experiência, teria ido muito antes.', nome: 'Marina C.', role: 'Paciente desde 2023' },
      { texto: 'É como uma consulta com uma amiga que entende do assunto. Explica tudo, escuta tudo e só faz o que faz sentido.', nome: 'Beatriz L.', role: 'Paciente desde 2022' }
    ]
  },

  faq: {
    eyebrow: 'Dúvidas frequentes',
    title: 'Tudo o que você quer *saber*.',
    items: [
      { q: 'A avaliação é mesmo gratuita?', a: 'Sim. Na avaliação a Dra. Millena analisa o seu rosto, entende o que você deseja e monta um plano personalizado. Você decide com calma, sem compromisso.' },
      { q: 'O resultado fica natural?', a: 'Esse é o princípio de todo o trabalho. A ideia é realçar os seus traços, não transformar. As pessoas notam que você está bem, sem saber exatamente o porquê.' },
      { q: 'Dói?', a: 'Usamos anestésico tópico e, quando indicado, anestesia local. A maioria das pacientes descreve apenas um leve desconforto.' },
      { q: 'Quanto tempo dura?', a: 'Depende do procedimento. Preenchimentos costumam durar de 12 a 18 meses, toxina botulínica de 4 a 6 meses e bioestimuladores até 2 anos.' },
      { q: 'Posso voltar à rotina no mesmo dia?', a: 'Na maioria dos casos, sim. Você recebe todas as orientações de cuidados antes de sair do consultório.' }
    ]
  },

  agendar: {
    eyebrow: 'Agendamento',
    title: 'Vamos começar por uma *conversa*.',
    desc: 'Deixe seu nome e WhatsApp. Respondemos em até 1 hora, em horário comercial.',
    submit: 'Continuar no WhatsApp',
    legal: 'Seus dados são usados apenas para entrarmos em contato com você.'
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
