import {
  CatalogSign,
  LIBRAS_CATALOG_FULL,
  LibrasCatalogCategory,
  TargetArticulationZone,
  TargetHandshapeId,
  TargetLandmarks
} from './librasCatalog255';

export interface SignEditorialDetail {
  grammaticalClass: string;
  usageContext: string;
  regionalVariation: string;
  heroSummary: string;
  howToMake: {
    intro: string;
    handshapeText: string;
    locationText: string;
    movementText: string;
    expressionText: string;
  };
  definitions: [string, string];
  examples: [string, string, string];
  contextNote: {
    inPhrase: string;
    regionalNote: string;
  };
  relatedSigns: CatalogSign[];
}

const CONTEXT_BY_CATEGORY: Record<LibrasCatalogCategory, string> = {
  Verbos: 'Ações, processos e expressão verbal',
  Saudações: 'Cumprimentos e convívio diário',
  'Cortesia e Comunicação': 'Comunicação respeitosa e diálogos',
  'Pronomes e Perguntas': 'Perguntas e estrutura de frases',
  'Família e Pessoas': 'Relações familiares e pessoas',
  Animais: 'Natureza e animais',
  Natureza: 'Meio ambiente e fenômenos naturais',
  'Alimentos e Bebidas': 'Alimentação e refeições',
  'Casa e Escola': 'Rotina doméstica e ambiente escolar',
  'Trabalho e Lugares': 'Profissões, espaços e cidade',
  'Transporte e Ações': 'Deslocamento e verbos do cotidiano',
  Sentimentos: 'Emoções e estados de espírito',
  Tempo: 'Calendário, horários e frequência',
  Cores: 'Características visuais e descrição',
  Adjetivos: 'Qualidades, tamanhos e comparações',
  'Corpo e Saúde': 'Anatomia, bem-estar e cuidados médicos',
  'Números e Quantidades': 'Contagem, medidas e proporções',
  'Tecnologia e Mídia': 'Ferramentas digitais, redes e comunicação',
  'Vestuário e Objetos': 'Roupas, acessórios e itens de uso pessoal'
};

const LIBRAS_CONTEXT_BY_CATEGORY: Record<LibrasCatalogCategory, string> = {
  Verbos:
    'Em Libras: os verbos podem se flexionar no espaço indicando quem realiza e quem recebe a ação, além da intensidade do movimento.',
  Saudações:
    'Em Libras: faz parte do vocabulário inicial de acolhimento e abertura de conversa em encontros cotidianos.',
  'Cortesia e Comunicação':
    'Em Libras: é essencial para manter clareza, gentileza e fluidez durante conversas em comunidade.',
  'Pronomes e Perguntas':
    'Em Libras: orienta quem participa da conversa ou define perguntas, acompanhado sempre de expressão facial adequada.',
  'Família e Pessoas':
    'Em Libras: aparece com frequência em apresentações pessoais, histórias de família e diálogos do dia a dia.',
  Animais:
    'Em Libras: integra o repertório de natureza, muito presente em narrativas, materiais escolares e conversas infantis.',
  Natureza:
    'Em Libras: ajuda a descrever paisagens, clima e elementos ambientais com forte apoio visual.',
  'Alimentos e Bebidas':
    'Em Libras: é amplamente usado em pedidos, receitas, compras e rotinas de refeições.',
  'Casa e Escola':
    'Em Libras: descreve objetos e espaços comuns do lar, da sala de aula e das atividades de estudo.',
  'Trabalho e Lugares':
    'Em Libras: facilita localizar serviços, profissões e pontos de referência na cidade.',
  'Transporte e Ações':
    'Em Libras: expressa deslocamentos e ações práticas cujo ritmo e direção ajudam a transmitir o sentido da frase.',
  Sentimentos:
    'Em Libras: depende diretamente da expressão facial e corporal para transmitir a intensidade da emoção.',
  Tempo:
    'Em Libras: marca o tempo logo no início da frase, situando a conversa no presente, passado ou futuro.',
  Cores:
    'Em Libras: costuma acompanhar substantivos para detalhar roupas, objetos e características visuais.',
  Adjetivos:
    'Em Libras: complementa nomes e ações indicando qualidades, contrastes e estados percebidos visualmente.',
  'Corpo e Saúde':
    'Em Libras: facilita relatar sintomas, localizar partes do corpo e manter diálogos claros em atendimentos de saúde.',
  'Números e Quantidades':
    'Em Libras: combina configurações numéricas específicas com orientação da palma para diferenciar idade, valores e quantidades.',
  'Tecnologia e Mídia':
    'Em Libras: representa dispositivos e ações digitais com foco visual na forma de uso e interação.',
  'Vestuário e Objetos':
    'Em Libras: costuma reproduzir o contorno, o encaixe no corpo ou o manuseio prático do objeto no cotidiano.'
};

const HANDSHAPE_PT: Record<TargetHandshapeId, string> = {
  open_5: 'mão aberta com os cinco dedos estendidos',
  flat_b: 'mão plana com os dedos unidos e estendidos',
  fist_s: 'mão fechada com os dedos recolhidos na palma',
  thumb_a: 'mão fechada com o polegar estendido para cima',
  point_1: 'dedo indicador estendido apontando a direção do sinal',
  v_2: 'dedos indicador e médio estendidos e separados em V',
  u_2: 'dedos indicador e médio estendidos e unidos',
  l_shape: 'polegar e indicador estendidos formando um ângulo aberto',
  c_shape: 'mão curvada em formato semicircular',
  o_pinch: 'pontas dos dedos unidas formando um círculo fechado',
  f_shape: 'polegar e indicador unidos na ponta com os demais dedos estendidos',
  y_shape: 'polegar e dedo mínimo estendidos com os outros recolhidos',
  ily_love: 'polegar, indicador e dedo mínimo estendidos',
  pinky_i: 'apenas o dedo mínimo estendido para cima',
  three_3: 'polegar, indicador e médio estendidos',
  four_4: 'quatro dedos estendidos para cima com o polegar dobrado',
  k_shape: 'indicador para cima, médio projetado e polegar apoiado',
  r_shape: 'dedos indicador e médio cruzados entre si'
};

const ZONE_PT: Record<TargetArticulationZone, string> = {
  forehead: 'próximo à testa',
  eye_cheek: 'na altura do olho ou da bochecha',
  ear: 'próximo à orelha',
  nose_mouth: 'próximo ao nariz ou à boca',
  chin: 'próximo ao queixo',
  shoulder: 'na região do ombro',
  chest: 'à frente do peito',
  neutral_space: 'no espaço neutro à frente do corpo'
};

const MOTION_PT: Record<TargetLandmarks['motionType'], string> = {
  static: 'mantenha a posição firme e visível por um instante',
  wave: 'faça um movimento suave de vai e vem lateral com a mão',
  forward: 'projete a mão suavemente para a frente em direção ao interlocutor',
  circular: 'realize um pequeno movimento circular contínuo',
  vertical: 'mova a mão suavemente para cima e para baixo',
  tap: 'faça um toque leve e rítmico no ponto de articulação',
  downward: 'desça a mão suavemente em movimento contínuo'
};

const EXPRESSION_PT: Record<NonNullable<TargetLandmarks['expectedNmf']>, string> = {
  neutral: 'mantenha a expressão facial tranquila, compatível com o contexto da frase',
  positive_smile: 'acompanhe com expressão receptiva e leve sorriso natural',
  interrogative_brows_up: 'eleve suavemente as sobrancelhas para marcar tom de pergunta ou confirmação',
  wh_brows_furrowed: 'aproxime levemente as sobrancelhas para indicar pergunta aberta ou ênfase'
};

export function inferGrammaticalClass(sign: CatalogSign): string {
  const lower = sign.palavra.toLowerCase();
  const sigLower = sign.significado.toLowerCase();

  if (sign.categoria === 'Saudações' || sign.categoria === 'Cortesia e Comunicação') {
    if (
      lower.includes('obrigado') ||
      lower.includes('desculp') ||
      lower.includes('parabéns') ||
      lower.includes('tchau') ||
      lower === 'oi' ||
      lower === 'olá' ||
      lower === 'sim' ||
      lower === 'não'
    ) {
      return 'Expressão comunicativa';
    }
    if (lower.startsWith('bom ') || lower.startsWith('boa ')) {
      return 'Saudação composta';
    }
    return 'Expressão de cortesia';
  }

  if (sign.categoria === 'Pronomes e Perguntas') {
    if (
      ['quem', 'o quê', 'onde', 'quando', 'por quê', 'como', 'qual', 'quantos'].some((w) =>
        lower.includes(w)
      )
    ) {
      return 'Pronome interrogativo';
    }
    return 'Pronome';
  }

  if (sign.categoria === 'Verbos') {
    return 'Verbo';
  }

  if (sign.categoria === 'Números e Quantidades') {
    return 'Numeral / Quantificador';
  }

  if (sign.categoria === 'Adjetivos' || sign.categoria === 'Cores') {
    return 'Adjetivo';
  }

  if (
    sign.categoria === 'Transporte e Ações' &&
    ['ir', 'vir', 'andar', 'correr', 'viajar', 'dirigir', 'esperar', 'voltar', 'chegar', 'sair', 'entrar', 'subir', 'descer'].some(
      (v) => lower === v || lower.startsWith(`${v} `)
    )
  ) {
    return 'Verbo';
  }

  if (sigLower.startsWith('ação de ') || sigLower.startsWith('ato de ')) {
    return 'Verbo';
  }

  if (
    ['amanhã', 'ontem', 'hoje', 'agora', 'depois', 'antes', 'sempre', 'nunca', 'cedo', 'tarde'].includes(
      lower
    )
  ) {
    return 'Advérbio de tempo';
  }

  return 'Substantivo / Sinal lexical';
}

function buildContextualExamples(sign: CatalogSign): [string, string, string] {
  const term = sign.palavra;
  const termLower = term.toLowerCase();
  const cat = sign.categoria;

  switch (cat) {
    case 'Saudações':
      return [
        `"${term}!" é uma das primeiras formas de iniciar uma conversa em Libras.`,
        `Ao encontrar um amigo ou colega na aula, cumprimente usando o sinal de ${termLower}.`,
        `Em diálogos cotidianos, combine "${termLower}" com expressão facial aberta e acolhedora.`
      ];
    case 'Cortesia e Comunicação':
      return [
        `Usar o sinal de ${termLower} torna a conversa mais clara e respeitosa.`,
        `Em ambientes de estudo ou trabalho, vale reforçar a comunicação com "${termLower}".`,
        `Pratique o sinal de ${termLower} junto com uma expressão facial coerente com a situação.`
      ];
    case 'Pronomes e Perguntas':
      return [
        `Em perguntas com "${termLower}", observe a elevação ou contração das sobrancelhas.`,
        `Na frase em Libras, termos como "${termLower}" ajudam a situar o assunto principal.`,
        `Treine perguntar e responder usando "${termLower}" diante da câmera com calma.`
      ];
    case 'Família e Pessoas':
      return [
        `Ao apresentar seus familiares em Libras, você pode usar o sinal de ${termLower}.`,
        `Na conversa sobre rotina em casa, mencionamos ${termLower} logo no começo da frase.`,
        `Observe o ponto de articulação próximo ao rosto ou corpo ao sinalizar ${termLower}.`
      ];
    case 'Animais':
      return [
        `Em atividades escolares e histórias em Libras, o sinal de ${termLower} é muito usado.`,
        `Ao visitar parques ou falar da natureza, podemos sinalizar ${termLower}.`,
        `Compare o movimento característico de ${termLower} em velocidade normal e lenta.`
      ];
    case 'Natureza':
      return [
        `Para descrever a paisagem ou o tempo lá fora, utilize o sinal de ${termLower}.`,
        `Em temas sobre meio ambiente, ${termLower} aparece com frequência nos relatos.`,
        `Observe o movimento amplo ou direcional que representa ${termLower} em Libras.`
      ];
    case 'Alimentos e Bebidas':
      return [
        `Na hora das refeições ou em um restaurante, você pode pedir ${termLower} em Libras.`,
        `Ao conversar sobre preferências alimentares, sinalize ${termLower} claramente.`,
        `Combine o sinal de ${termLower} com verbos como gostar, querer ou preparar.`
      ];
    case 'Casa e Escola':
      return [
        `No ambiente escolar ou em casa, o sinal de ${termLower} facilita o diálogo do dia a dia.`,
        `Ao organizar tarefas e objetos do cotidiano, usamos o sinal de ${termLower}.`,
        `Observe se o sinal de ${termLower} usa uma ou duas mãos para representar a forma ou função.`
      ];
    case 'Trabalho e Lugares':
      return [
        `Para indicar destinos, serviços ou profissões na cidade, utilize ${termLower}.`,
        `Em entrevistas ou conversas sobre profissão, o sinal de ${termLower} ajuda a dar contexto.`,
        `Você pode combinar ${termLower} com sinais de direção como ir, trabalhar ou visitar.`
      ];
    case 'Transporte e Ações':
      return [
        `Em frases sobre rotina e deslocamento, o sinal de ${termLower} descreve a ação principal.`,
        `A direção e o ritmo das mãos ajudam a deixar claro o sentido de ${termLower}.`,
        `Experimente unir ${termLower} a marcadores de tempo como hoje, amanhã ou ontem.`
      ];
    case 'Sentimentos':
      return [
        `Ao expressar ${termLower} em Libras, a expressão facial acompanha o movimento das mãos.`,
        `Em conversas sobre bem-estar, sinalize ${termLower} de forma natural e clara.`,
        `Na câmera lenta, note como postura e rosto reforçam o significado de ${termLower}.`
      ];
    case 'Tempo':
      return [
        `Na estrutura da Libras, referências como "${termLower}" costumam abrir a frase.`,
        `Para combinar compromissos e horários, o sinal de ${termLower} dá precisão à conversa.`,
        `Pratique combinar ${termLower} com ações da semana, escola ou trabalho.`
      ];
    case 'Cores':
      return [
        `Ao descrever roupas, objetos ou ambientes, acrescente a cor ${termLower} após o substantivo.`,
        `Em Libras, "${termLower}" ajuda a diferenciar itens parecidos visualmente.`,
        `Treine combinar objetos da casa ou escola com o sinal de ${termLower}.`
      ];
    case 'Verbos':
      return [
        `Na frase em Libras, o verbo "${termLower}" costuma vir após o sujeito ou marcador de tempo.`,
        `Observe a direção e a velocidade do movimento de ${termLower}, pois elas indicam intensidade ou frequência.`,
        `Pratique combinar ${termLower} com pronomes como eu, você ou nós para ganhar fluência.`
      ];
    case 'Corpo e Saúde':
      return [
        `Em consultas ou conversas sobre bem-estar, o sinal de ${termLower} traz precisão imediata ao relato.`,
        `Note que sinais de ${termLower} muitas vezes apontam diretamente a região correspondente do corpo.`,
        `Combine ${termLower} com expressões faciais claras para indicar dor, alívio ou intensidade.`
      ];
    case 'Números e Quantidades':
      return [
        `Ao usar "${termLower}" em Libras, mantenha a mão bem visível na altura do peito para evitar confusão entre algarismos.`,
        `Em valores, horários ou quantidades, "${termLower}" costuma anteceder ou acompanhar o item contado.`,
        `Treine combinar ${termLower} com sinais de tempo, compras e datas.`
      ];
    case 'Tecnologia e Mídia':
      return [
        `No cotidiano digital, o sinal de ${termLower} aparece em conversas sobre estudo, trabalho e redes sociais.`,
        `Observe o movimento característico de ${termLower}, que frequentemente remete ao gesto de uso do aparelho.`,
        `Combine ${termLower} com verbos como usar, abrir, enviar ou compartilhar.`
      ];
    case 'Vestuário e Objetos':
      return [
        `Para descrever o que está vestindo ou procurando, utilize o sinal de ${termLower} seguido da cor ou tamanho.`,
        `Repare no ponto de articulação de ${termLower}, geralmente próximo à parte do corpo onde o item é usado.`,
        `Pratique montar frases combinando ${termLower} com verbos como vestir, comprar ou guardar.`
      ];
    case 'Adjetivos':
    default:
      return [
        `Em Libras, "${termLower}" aparece junto ao objeto ou pessoa para descrever sua característica.`,
        `A intensidade do movimento e da expressão facial ajuda a graduar o sentido de ${termLower}.`,
        `Use "${termLower}" em comparações simples para enriquecer suas frases em Libras.`
      ];
  }
}

export function getRelatedCatalogSigns(sign: CatalogSign, count = 4): CatalogSign[] {
  const sameCategory = LIBRAS_CATALOG_FULL.filter(
    (item) => item.id !== sign.id && item.categoria === sign.categoria
  );

  if (sameCategory.length >= count) {
    return sameCategory.slice(0, count);
  }

  const others = LIBRAS_CATALOG_FULL.filter(
    (item) => item.id !== sign.id && item.categoria !== sign.categoria
  );
  return [...sameCategory, ...others].slice(0, count);
}

export function getSignEditorialDetail(sign: CatalogSign): SignEditorialDetail {
  const grammaticalClass = inferGrammaticalClass(sign);
  const usageContext = CONTEXT_BY_CATEGORY[sign.categoria] || sign.categoria;
  const regionalVariation = 'Pode variar por região';
  const handshapeText = HANDSHAPE_PT[sign.targetLandmarks.handshapeId] || 'mão configurada conforme o modelo';
  const locationText = ZONE_PT[sign.targetLandmarks.articulationZone] || 'à frente do corpo';
  const movementText = MOTION_PT[sign.targetLandmarks.motionType] || 'realize o movimento de forma contínua';
  const expressionKey = sign.targetLandmarks.expectedNmf || 'neutral';
  const expressionText = EXPRESSION_PT[expressionKey];
  const twoHandLabel =
    sign.targetLandmarks.twoHanded === 2
      ? 'Este sinal utiliza as duas mãos em coordenação.'
      : 'Este sinal é executado principalmente com uma mão dominante.';

  return {
    grammaticalClass,
    usageContext,
    regionalVariation,
    heroSummary: sign.significado,
    howToMake: {
      intro:
        'A área de vídeo no topo desta página reproduz o sinal em loop quando o vídeo estiver disponível. Use a câmera lenta (0,5x) para observar a configuração das mãos, o movimento e a expressão facial.',
      handshapeText: `Configuração: use a ${handshapeText}. ${twoHandLabel}`,
      locationText: `Ponto de articulação: posicione a mão ${locationText}.`,
      movementText: `Movimento: ${movementText}.`,
      expressionText: `Expressão não-manual: ${expressionText}.`
    },
    definitions: [
      sign.significado,
      LIBRAS_CONTEXT_BY_CATEGORY[sign.categoria]
    ],
    examples: buildContextualExamples(sign),
    contextNote: {
      inPhrase:
        'A Libras possui estrutura gramatical própria, e a ordem dos sinais na frase nem sempre segue a sequência linear do português. Observe o contexto e os exemplos de uso ao praticar.',
      regionalNote:
        'Os sinais podem apresentar variações entre regiões e comunidades surdas no Brasil. A referência visual apresentada mostra uma das formas reconhecidas no vocabulário.'
    },
    relatedSigns: getRelatedCatalogSigns(sign, 4)
  };
}
