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
    seoTitle: 'Dra. Millena Curty · Harmonização Facial em São Paulo | Avaliação Gratuita',
    seoDescription: 'Harmonização facial autoral com a Dra. Millena Curty. Resultados naturais, técnica refinada. Agende sua avaliação gratuita pelo WhatsApp.',
    ogImage: '/img/millena.webp',
    pixelId: '',
    ga4Id: ''
  },

  hero: {
    eyebrow: 'Avaliação gratuita, com vagas limitadas este mês',
    title: 'Você, mais você.|*Sem parecer "feita".*',
    sub: 'Harmonização facial autoral com a Dra. Millena Curty, em São Paulo. Resultado natural, do jeito que você é.',
    frase: 'Ninguém percebe o procedimento. Todo mundo percebe você.',
    ctaPrimary: 'Agendar avaliação gratuita',
    ctaSecondary: 'Falar no WhatsApp',
    antes: '/img/antes1.webp',
    depois: '/img/depois1.webp',
    note: 'Arraste a linha para comparar o antes e o depois.',
    trust: [
      { num: '+800', label: 'rostos harmonizados' },
      { num: '7 anos', label: 'de bisturi zero' },
      { num: '5.0', label: '★★★★★' }
    ]
  },

  millena: {
    eyebrow: 'Quem cuida de você',
    foto: '/img/millena.webp',
    badge: 'CRO Certificada',
    title: 'Conheça a Dra. Millena',
    bio1: 'Cirurgiã-dentista, especialista em Harmonização Orofacial. Há 7 anos dedico meu trabalho a um único propósito: fazer você se olhar no espelho e reconhecer a si mesma. Só que com um brilho a mais.',
    bio2: '"O melhor procedimento é aquele que ninguém percebe, mas todos sentem. Harmonização não é mudar quem você é, é devolver a você o que o tempo, o cansaço ou a genética te tiraram."',
    credentials: [
      'Especialista em Harmonização Orofacial (CRO)',
      '+800 pacientes atendidas com 100% de satisfação',
      'Atualização constante em técnicas internacionais',
      'Uma paciente por horário. Sem correria, sem fila'
    ],
    cta: 'Falar com a Millena'
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
    title: 'Pequenas mudanças, grandes revelações.',
    intro: 'Arraste o controle de cada imagem pra revelar o antes e o depois. Cada caso mostra o que muda quando o procedimento respeita a identidade do rosto.',
    disclaimer: 'Resultados podem variar de acordo com cada paciente. Imagens ilustrativas.',
    cta: 'Quero conversar sobre o meu caso',
    items: [
      { before: '/img/antes1.webp', after: '/img/depois1.webp', titulo: 'Harmonização global', categoria: 'Harmonização' }
    ]
  },

  procedimentos: {
    eyebrow: 'Procedimentos',
    title: 'Cuidado autoral, do diagnóstico ao resultado.',
    cta: 'Tirar dúvidas no WhatsApp',
    items: [
      { title: 'Full Face', desc: 'Plano integrado com múltiplas técnicas conversando entre si. Reestruturação facial completa com resultado natural e duradouro.', icon: '/img/icon-fullface.webp' },
      { title: 'Rinomodelação', desc: 'Correção sutil do contorno nasal sem cirurgia. Preenchimento estratégico que harmoniza o perfil respeitando sua identidade.', icon: '/img/icon-rinomodelacao.webp' },
      { title: 'Preenchimento Labial', desc: 'Lábios em proporção com o resto do rosto. Volume sob medida. Nada de "lábio de novela".', icon: '/img/icon-labios.webp' },
      { title: 'Bioestimulador de Colágeno', desc: 'Reativa o colágeno que a sua pele produz cada vez menos. Firmeza que aparece devagar e dura anos.', icon: '/img/icon-bioestimulador.webp' },
      { title: 'Ulthera', desc: 'Ultrassom microfocado que estimula colágeno em camadas profundas. Lifting sem cirurgia, sem downtime.', icon: '/img/icon-ulthera.webp' }
    ]
  },

  depoimentos: {
    eyebrow: 'Depoimentos',
    title: 'Histórias que moldaram as minhas.',
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
    title: 'Tudo o que você quer saber.',
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
    title: 'Vamos começar por uma conversa.',
    desc: 'Deixe seu nome e WhatsApp, ou chame direto. Respondemos em até 1 hora em horário comercial.',
    waTitle: 'Falar no WhatsApp',
    waSub: 'resposta em até 1 hora',
    formTitle: 'Reserve sua avaliação gratuita',
    formSub: 'Seus dados ficam só com a nossa equipe.',
    submit: 'Quero conversar com a Millena',
    legal: 'Ao enviar, você concorda em receber contato pelo WhatsApp. Seus dados são confidenciais.'
  },

  footer: {
    tag: 'Harmonização facial autoral. Cirurgiã-dentista especializada em estética orofacial.'
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
