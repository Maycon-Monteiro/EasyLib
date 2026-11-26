import {
  LibrasTrackInfo,
  Section,
  Unit,
  PathNode,
  Exercise,
  SignData,
  Quest,
  Achievement,
  DuoOutfit,
  LeaderboardUser,
  MatchPair
} from '../types';
import {
  areConflictingOrEquivalentSigns,
  CatalogSign,
  findCatalogSign,
  LIBRAS_CATALOG_255
} from './librasCatalog255';

export const TRACK_STRUCTURE = {
  sections: 10,
  stagesPerSection: 20,
  activitiesPerStage: 12,
  exercisesPerActivity: 5
} as const;

export function getActivityNodeId(
  sectionNumber: number,
  stageNumber: number,
  activityNumber: number
): string {
  return `s${sectionNumber}_e${stageNumber}_a${activityNumber}`;
}

export const LIBRAS_TRACKS: LibrasTrackInfo[] = [
  {
    id: 'iniciante',
    title: 'Libras: Trilha Completa',
    subtitle: '10 seções progressivas · 255 sinais essenciais',
    badge: 'libras',
    totalUnits: 200
  }
];

export const LIBRAS_DICTIONARY: SignData[] = LIBRAS_CATALOG_255.slice(0, 24).map((cat) => ({
  id: cat.id,
  name: cat.palavra,
  category: cat.categoria,
  meaning: cat.significado,
  handshapeName: cat.palavra,
  handshapeIcon: 'hand',
  bodyLocation: cat.categoria,
  movementType: cat.significado,
  facialExpression: 'Natural',
  description: cat.significado,
  visualGlyph: 'hand',
  realVideoUrl: cat.videoUrl,
  validationStatus: 'validated'
}));

export interface SectionMeta {
  sectionNumber: number;
  title: string;
  description: string;
  themeColor: Unit['themeColor'];
  categories: string[];
  grammarTitle: string;
  grammarExplanation: string;
  exampleGloss: string;
  examplePt: string;
  culturalTip: string;
}

export const LIBRAS_SECTIONS_META: SectionMeta[] = [
  {
    sectionNumber: 1,
    title: 'Saudações & Primeiros Contatos',
    description: 'Cumprimentos, cortesia e diálogos iniciais em Libras.',
    themeColor: 'green',
    categories: ['Saudações', 'Cortesia e Comunicação'],
    grammarTitle: 'Cumprimentos e Expressão Facial',
    grammarExplanation: 'A expressão facial amigável acompanha as saudações e diferencia perguntas de afirmações.',
    exampleGloss: 'OI! TUDO-BEM?',
    examplePt: 'Oi! Tudo bem?',
    culturalTip: 'Manter o contato visual durante toda a conversa é sinal de atenção e respeito na cultura surda.'
  },
  {
    sectionNumber: 2,
    title: 'Pronomes & Perguntas',
    description: 'Pessoas do discurso, posse e pronomes interrogativos.',
    themeColor: 'teal',
    categories: ['Pronomes e Perguntas', 'Cortesia e Comunicação'],
    grammarTitle: 'Apontamento e Perguntas',
    grammarExplanation: 'O apontamento indica pronomes no espaço. Perguntas com QUEM, ONDE ou QUANDO levam sobrancelhas franzidas.',
    exampleGloss: 'VOCÊ MORAR ONDE?',
    examplePt: 'Onde você mora?',
    culturalTip: 'Em Libras, apontar para indicar pessoas ou lugares faz parte natural da gramática visual.'
  },
  {
    sectionNumber: 3,
    title: 'Família & Pessoas',
    description: 'Parentesco, relações próximas e pessoas.',
    themeColor: 'blue',
    categories: ['Família e Pessoas'],
    grammarTitle: 'Relações Familiares',
    grammarExplanation: 'Muitos sinais de parentesco combinam o marcador de gênero com a relação familiar.',
    exampleGloss: 'MINHA MÃE AMAR FAMÍLIA',
    examplePt: 'Minha mãe ama a família.',
    culturalTip: 'Quando ouvintes da família aprendem Libras, a convivência em casa fica mais próxima e acessível.'
  },
  {
    sectionNumber: 4,
    title: 'Animais',
    description: 'Animais domésticos, silvestres e marinhos.',
    themeColor: 'orange',
    categories: ['Animais'],
    grammarTitle: 'Características Visuais',
    grammarExplanation: 'Os sinais de animais destacam traços visíveis como orelhas, bico, focinho ou modo de andar.',
    exampleGloss: 'MEU CACHORRO BONITO',
    examplePt: 'Meu cachorro é bonito.',
    culturalTip: 'Animais de apoio para pessoas surdas são treinados para avisar campainhas e alertas sonoros.'
  },
  {
    sectionNumber: 5,
    title: 'Natureza & Ambiente',
    description: 'Elementos naturais, céu, clima e plantas.',
    themeColor: 'green',
    categories: ['Natureza'],
    grammarTitle: 'Intensidade Visual do Clima',
    grammarExplanation: 'A amplitude e o ritmo do movimento mostram se a chuva ou o vento são suaves ou intensos.',
    exampleGloss: 'HOJE SOL QUENTE',
    examplePt: 'Hoje está sol e quente.',
    culturalTip: 'Boletins do tempo com janela de Libras garantem acesso claro a alertas meteorológicos.'
  },
  {
    sectionNumber: 6,
    title: 'Alimentos & Bebidas',
    description: 'Frutas, refeições do dia a dia e bebidas.',
    themeColor: 'yellow',
    categories: ['Alimentos e Bebidas'],
    grammarTitle: 'Sinais Próximos à Boca',
    grammarExplanation: 'Grande parte dos sinais de alimentos e refeições é feita próxima à boca ou ao queixo.',
    exampleGloss: 'EU GOSTAR CAFÉ PÃO',
    examplePt: 'Eu gosto de café e pão.',
    culturalTip: 'Em encontros à mesa, lugares onde todos possam se enxergar facilitam o diálogo em Libras.'
  },
  {
    sectionNumber: 7,
    title: 'Casa & Escola',
    description: 'Cômodos, móveis, estudos e sala de aula.',
    themeColor: 'purple',
    categories: ['Casa e Escola'],
    grammarTitle: 'Organização Espacial',
    grammarExplanation: 'Ao descrever ambientes, você posiciona objetos e cômodos no espaço à sua frente.',
    exampleGloss: 'MINHA ESCOLA GRANDE',
    examplePt: 'Minha escola é grande.',
    culturalTip: 'Escolas bilíngues adotam a Libras como primeira língua e o Português escrito como segunda língua.'
  },
  {
    sectionNumber: 8,
    title: 'Trabalho & Lugares',
    description: 'Rotina profissional, finanças e pontos da cidade.',
    themeColor: 'blue',
    categories: ['Trabalho e Lugares'],
    grammarTitle: 'Referências da Cidade',
    grammarExplanation: 'Primeiro indica-se o local de referência e depois a ação realizada naquele espaço.',
    exampleGloss: 'AMANHÃ EU TRABALHAR MERCADO',
    examplePt: 'Amanhã eu vou trabalhar no mercado.',
    culturalTip: 'Intérpretes de Libras asseguram comunicação justa no trabalho e no atendimento ao público.'
  },
  {
    sectionNumber: 9,
    title: 'Transporte & Ações',
    description: 'Meios de locomoção e verbos do cotidiano.',
    themeColor: 'teal',
    categories: ['Transporte e Ações'],
    grammarTitle: 'Verbos e Direção',
    grammarExplanation: 'Verbos de deslocamento mostram no espaço o ponto de partida e o destino da ação.',
    exampleGloss: 'HOJE EU IR PRAIA ÔNIBUS',
    examplePt: 'Hoje eu vou à praia de ônibus.',
    culturalTip: 'Sinalizadores adaptam a trajetória das mãos para mostrar quem faz a ação e para onde vai.'
  },
  {
    sectionNumber: 10,
    title: 'Sentimentos, Tempo, Cores & Adjetivos',
    description: 'Emoções, noções de tempo, cores e qualidades.',
    themeColor: 'red',
    categories: ['Sentimentos', 'Tempo', 'Cores', 'Adjetivos'],
    grammarTitle: 'Linha do Tempo e Expressão',
    grammarExplanation: 'Passado fica atrás do corpo, presente no centro e futuro à frente, junto com a expressão emocional.',
    exampleGloss: 'HOJE EU FELIZ MUITO',
    examplePt: 'Hoje eu estou muito feliz.',
    culturalTip: 'Dominar expressões emocionais e temporais torna sua sinalização natural e fluente.'
  }
];

const CURATED_DACTYLOLOGY_WORDS = [
  'OI',
  'CASA',
  'MESA',
  'PAI',
  'AMOR',
  'VENTO',
  'BOLO',
  'SOL',
  'LUA',
  'GATO',
  'FLOR',
  'PAZ',
  'DIA',
  'AZUL',
  'SUCO',
  'UVA',
  'LIVRO',
  'ESCOLA',
  'AMIGO',
  'LIBRAS',
  'VIDA',
  'FELIZ',
  'SORRISO',
  'CAMPO',
  'TRABALHO',
  'PRAIA',
  'CHUVA',
  'VERDE',
  'BRASIL',
  'AJUDA',
  'TEMPO',
  'NOITE',
  'TARDE',
  'PEDRA',
  'RISO',
  'SONHO',
  'DOCE',
  'FRUTA',
  'CARRO',
  'PORTA',
  'JANELA',
  'LIVRE',
  'BRANCO',
  'ROSA',
  'PEIXE',
  'URSO',
  'NOME',
  'SINAL'
];

export interface PhraseChallenge {
  id: number;
  slug: string;
  portuguese: string;
  glossTokens: string[];
  distractors: string[];
}

// ============================================================================
// ONDE COLOCAR AS URLs REAIS DOS VÍDEOS DAS FRASES:
// Adicione abaixo no objeto `URLS_FRASES_REAIS` usando o slug da frase
// (ex: 'bom-dia-tudo-bem': 'https://.../bom-dia-tudo-bem.mp4').
// ============================================================================
export const URLS_FRASES_REAIS: Record<string, string> = {
  'oi-tudo-bem': '/assets/aistudio/oi_td_bem_b1c0d698.mp4',
  'onde-voce-mora': '/assets/aistudio/onde_sua_casa_5a37a97c.mp4',
  'minha-mae-ama-a-familia': '/assets/aistudio/minha_mae_ama_b2da57d0.mp4',
  'meu-cachorro-e-bonito': '/assets/aistudio/meu_cachorro___bnt_caf3b045.mp4',
  'eu-gosto-de-cafe-e-pao': '/assets/aistudio/eu-gosto-cafe.mp4',
  'minha-escola-e-grande': '/assets/aistudio/minha_escola_egrande_3836a8da.mp4',
  'hoje-eu-vou-para-a-praia-de-onibus': '/assets/aistudio/hj_vouapraia_de_onibus_021327d3.mp4',
  'hoje-eu-estou-feliz': '/assets/aistudio/hj_eu_estou_feliz_ae9563ab.mp4',
  'hoje-o-sol-esta-quente': '/assets/aistudio/hj_o_sol_est__quente_1bf7e6c7.mp4',
  'amanha-eu-vou-trabalhar-no-mercado': '/assets/aistudio/amanha_trabalha_no_mercado_c0014e6d.mp4'
};

// ============================================================================
// ONDE COLOCAR AS URLs DOS VÍDEOS EXPLICATIVOS NO MEIO DAS ATIVIDADES (Atividade 6):
// Ex.: Seção 1 Atividade 6 = 'Saudações em Libras 0.1.1' (bom dia, boa tarde, boa noite, oi)
// ============================================================================
export const URLS_VIDEOS_EXPLICATIVOS: Record<string, string> = {
  s1_a6_saudacoes: '',
  s2_a6_explicativo: '',
  s3_a6_explicativo: '',
  s4_a6_explicativo: '',
  s5_a6_explicativo: '',
  s6_a6_explicativo: '',
  s7_a6_explicativo: '',
  s8_a6_explicativo: '',
  s9_a6_explicativo: '',
  s10_a6_explicativo: ''
};

// ============================================================================
// ONDE COLOCAR AS URLs DOS VÍDEOS DE RESUMO POR SEÇÃO (Seções 1 a 10):
// ============================================================================
export const URLS_VIDEOS_SECAO: Record<string, string> = {
  secao_1: '',
  secao_2: '',
  secao_3: '',
  secao_4: '',
  secao_5: '',
  secao_6: '',
  secao_7: '',
  secao_8: '',
  secao_9: '',
  secao_10: ''
};

export interface SectionVideoSummarySpec {
  sectionNumber: number;
  title: string;
  subtitle: string;
  videoKey: string;
  videoUrl: string;
  credit: string;
  learnedSignSlugs: string[];
  practiceCameraSlug: string;
  promptSummaryHint: string;
  requiredKeywords: string[];
  minWords: number;
  xpReward: number;
  gemsReward: number;
}

const SECTION_SUMMARY_SIGN_MAP: Record<
  number,
  { slugs: string[]; keywords: string[]; subtitle: string; hint: string }
> = {
  1: {
    slugs: ['oi', 'bom-dia', 'boa-tarde', 'boa-noite', 'tudo-bem', 'obrigado'],
    keywords: ['oi', 'bom', 'dia', 'tarde', 'noite', 'saudacao', 'saudacoes', 'obrigado', 'tudo'],
    subtitle: 'Vídeo de síntese: cumprimentos e primeiros contatos em diálogo real.',
    hint: 'Descreva com suas palavras os cumprimentos vistos no vídeo (ex: oi, bom dia, boa tarde, boa noite) e tente copiar os sinais na câmera.'
  },
  2: {
    slugs: ['eu', 'voce', 'meu', 'onde', 'quem', 'qual'],
    keywords: ['eu', 'voce', 'meu', 'onde', 'quem', 'qual', 'pergunta', 'pronome', 'sobrancelha'],
    subtitle: 'Vídeo de síntese: pronomes no espaço e expressões interrogativas.',
    hint: 'Resuma como o sinalizador aponta pronomes e faz perguntas com as sobrancelhas no vídeo.'
  },
  3: {
    slugs: ['mae', 'pai', 'familia', 'irmao', 'irma', 'amigo'],
    keywords: ['mae', 'pai', 'familia', 'irmao', 'irma', 'amigo', 'parentesco'],
    subtitle: 'Vídeo de síntese: apresentando sua família e pessoas próximas.',
    hint: 'Escreva um pequeno resumo dos sinais de família apresentados no vídeo.'
  },
  4: {
    slugs: ['cachorro', 'gato', 'passaro', 'peixe', 'borboleta', 'cavalo'],
    keywords: ['cachorro', 'gato', 'passaro', 'peixe', 'animal', 'animais', 'orelha', 'asas'],
    subtitle: 'Vídeo de síntese: sinais icônicos de animais e classificadores visuais.',
    hint: 'Conte quais animais aparecem no vídeo e quais traços visuais cada sinal destaca.'
  },
  5: {
    slugs: ['sol', 'lua', 'chuva', 'flor', 'arvore', 'praia'],
    keywords: ['sol', 'lua', 'chuva', 'flor', 'arvore', 'praia', 'clima', 'natureza'],
    subtitle: 'Vídeo de síntese: clima, céu e elementos da natureza.',
    hint: 'Resuma o que o vídeo mostra sobre o clima e a natureza em Libras.'
  },
  6: {
    slugs: ['agua', 'cafe', 'pao', 'suco', 'fruta', 'queijo'],
    keywords: ['agua', 'cafe', 'pao', 'suco', 'fruta', 'queijo', 'comer', 'beber', 'boca'],
    subtitle: 'Vídeo de síntese: pedidos à mesa, alimentos e bebidas.',
    hint: 'Descreva os alimentos e bebidas mostrados no vídeo e onde a mão articula perto da boca.'
  },
  7: {
    slugs: ['casa', 'escola', 'livro', 'mesa', 'cadeira', 'caderno'],
    keywords: ['casa', 'escola', 'livro', 'mesa', 'cadeira', 'caderno', 'estudo', 'sala'],
    subtitle: 'Vídeo de síntese: rotina em casa e ambiente escolar bilíngue.',
    hint: 'Escreva um resumo sobre os espaços de casa e escola apresentados no vídeo.'
  },
  8: {
    slugs: ['trabalhar', 'mercado', 'hospital', 'professor', 'dinheiro', 'cidade'],
    keywords: ['trabalhar', 'mercado', 'hospital', 'professor', 'cidade', 'trabalho', 'lugar'],
    subtitle: 'Vídeo de síntese: profissões e locais da cidade.',
    hint: 'Resuma os lugares da cidade e ações de trabalho mostrados no vídeo.'
  },
  9: {
    slugs: ['ir', 'carro', 'onibus', 'viajar', 'ajuda', 'aprender'],
    keywords: ['ir', 'carro', 'onibus', 'viajar', 'transporte', 'direcao', 'acao', 'verbo'],
    subtitle: 'Vídeo de síntese: meios de transporte e verbos direcionais.',
    hint: 'Conte quais transportes e deslocamentos aparecem no vídeo desta seção.'
  },
  10: {
    slugs: ['feliz', 'amor', 'hoje', 'amanha', 'azul', 'bonito'],
    keywords: ['feliz', 'amor', 'hoje', 'amanha', 'sentimento', 'tempo', 'cor', 'azul', 'bonito'],
    subtitle: 'Vídeo de síntese: sentimentos, linha do tempo e qualidades.',
    hint: 'Escreva seu resumo final conectando sentimentos, cores e noções de tempo do vídeo.'
  }
};

export const SECTION_VIDEO_SUMMARIES: SectionVideoSummarySpec[] = LIBRAS_SECTIONS_META.map(
  (meta) => {
    const details = SECTION_SUMMARY_SIGN_MAP[meta.sectionNumber] || SECTION_SUMMARY_SIGN_MAP[1];
    const videoKey = `secao_${meta.sectionNumber}`;
    return {
      sectionNumber: meta.sectionNumber,
      title: `Resumo da Seção ${meta.sectionNumber}: ${meta.title}`,
      subtitle: details.subtitle,
      videoKey,
      videoUrl: URLS_VIDEOS_SECAO[videoKey] || '',
      credit: '',
      learnedSignSlugs: details.slugs,
      practiceCameraSlug: details.slugs[0] || 'oi',
      promptSummaryHint: details.hint,
      requiredKeywords: details.keywords,
      minWords: 5,
      xpReward: 50,
      gemsReward: 35
    };
  }
);

function normalizeSummaryToken(input: string): string {
  return input
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, ' ')
    .trim();
}

export function evaluateSectionSummaryText(
  rawText: string,
  spec: SectionVideoSummarySpec
): {
  valid: boolean;
  wordCount: number;
  matchedKeywords: string[];
  feedback: string;
} {
  const normalized = normalizeSummaryToken(rawText);
  const words = normalized.split(/\s+/).filter((w) => w.length >= 2);
  const matchedKeywords = spec.requiredKeywords.filter((kw) =>
    normalized.includes(normalizeSummaryToken(kw))
  );

  if (words.length < spec.minWords) {
    return {
      valid: false,
      wordCount: words.length,
      matchedKeywords,
      feedback: `Escreva pelo menos ${spec.minWords} palavras resumindo o que você observou no vídeo (${words.length}/${spec.minWords}).`
    };
  }

  if (matchedKeywords.length === 0) {
    return {
      valid: false,
      wordCount: words.length,
      matchedKeywords,
      feedback: `Mencione ao menos um tema ou sinal desta seção (ex.: ${spec.requiredKeywords
        .slice(0, 3)
        .join(', ')}).`
    };
  }

  return {
    valid: true,
    wordCount: words.length,
    matchedKeywords,
    feedback: `Ótimo resumo! Você registrou ${words.length} palavras sobre os sinais da seção.`
  };
}

export const CURATED_GLOSS_CHALLENGES: PhraseChallenge[] = [
  {
    id: 1,
    slug: 'onde-voce-mora',
    portuguese: 'Onde você mora?',
    glossTokens: ['LUGAR', 'SEU', 'CASA'],
    distractors: ['MORAR', 'DE', 'ONTEM']
  },
  {
    id: 2,
    slug: 'minha-mae-ama-a-familia',
    portuguese: 'Minha mãe ama a família.',
    glossTokens: ['MINHA', 'MÃE', 'FAMÍLIA', 'AMAR'],
    distractors: ['A', 'DE', 'NÃO']
  },
  {
    id: 3,
    slug: 'meu-cachorro-e-bonito',
    portuguese: 'Meu cachorro é bonito.',
    glossTokens: ['MEU', 'CACHORRO', 'BONITO'],
    distractors: ['É', 'O', 'DE']
  },
  {
    id: 4,
    slug: 'eu-gosto-de-cafe-e-pao',
    portuguese: 'Eu gosto de café e pão.',
    glossTokens: ['EU', 'GOSTAR', 'CAFÉ', 'PÃO'],
    distractors: ['DE', 'E', 'NÃO']
  },
  {
    id: 5,
    slug: 'minha-escola-e-grande',
    portuguese: 'Minha escola é grande.',
    glossTokens: ['MINHA', 'ESCOLA', 'GRANDE'],
    distractors: ['É', 'A', 'PARA']
  },
  {
    id: 6,
    slug: 'hoje-eu-vou-para-a-praia-de-onibus',
    portuguese: 'Hoje eu vou para a praia de ônibus.',
    glossTokens: ['HOJE', 'EU', 'PRAIA', 'ÔNIBUS', 'IR'],
    distractors: ['PARA', 'DE', 'ONTEM']
  },
  {
    id: 7,
    slug: 'hoje-eu-estou-feliz',
    portuguese: 'Hoje eu estou feliz.',
    glossTokens: ['HOJE', 'EU', 'FELIZ'],
    distractors: ['ESTOU', 'TRISTE', 'ONTEM']
  },
  {
    id: 8,
    slug: 'hoje-o-sol-esta-quente',
    portuguese: 'Hoje o sol está quente.',
    glossTokens: ['HOJE', 'SOL', 'QUENTE'],
    distractors: ['ESTÁ', 'O', 'FRIO']
  }
];

const CURATED_DIALOGUES = [
  {
    speaker: 'Diálogo em Libras',
    gloss: 'OI! TUDO-BEM?',
    portuguese: 'Oi, tudo bem?',
    nmfType: 'interrogative_brows_up' as const,
    nmfLabel: 'Cumprimento cordial',
    catalogSignId: 'tudo-bem',
    videoUrl: '/assets/aistudio/oi_td_bem_b1c0d698.mp4',
    options: [
      { id: 'dlg_1', text: 'Tudo bem', gloss: 'TUDO-BEM', catalogSignId: 'tudo-bem' },
      { id: 'dlg_2', text: 'Triste', gloss: 'TRISTE', catalogSignId: 'triste' },
      { id: 'dlg_3', text: 'Quente', gloss: 'QUENTE', catalogSignId: 'quente' }
    ],
    correctAnswer: 'Tudo bem'
  },
  {
    speaker: 'Diálogo em Libras',
    gloss: 'LUGAR SEU CASA?',
    portuguese: 'Onde você mora?',
    nmfType: 'wh_brows_furrowed' as const,
    nmfLabel: 'Pergunta de lugar (LUGAR SEU CASA?)',
    catalogSignId: 'onde',
    videoUrl: '/assets/aistudio/onde_sua_casa_5a37a97c.mp4',
    options: [
      { id: 'dlg_1', text: 'Casa', gloss: 'CASA', catalogSignId: 'casa' },
      { id: 'dlg_2', text: 'Não', gloss: 'NÃO', catalogSignId: 'nao' },
      { id: 'dlg_3', text: 'Quente', gloss: 'QUENTE', catalogSignId: 'quente' }
    ],
    correctAnswer: 'Casa'
  },
  {
    speaker: 'Diálogo em Libras',
    gloss: 'MINHA MÃE FAMÍLIA AMAR',
    portuguese: 'Minha mãe ama a família.',
    nmfType: 'positive_smile' as const,
    nmfLabel: 'Expressão afetuosa',
    catalogSignId: 'mae',
    videoUrl: '/assets/aistudio/minha_mae_ama_b2da57d0.mp4',
    options: [
      { id: 'dlg_1', text: 'Feliz', gloss: 'FELIZ', catalogSignId: 'feliz' },
      { id: 'dlg_2', text: 'Triste', gloss: 'TRISTE', catalogSignId: 'triste' },
      { id: 'dlg_3', text: 'Bravo', gloss: 'BRAVO', catalogSignId: 'bravo' }
    ],
    correctAnswer: 'Feliz'
  },
  {
    speaker: 'Diálogo em Libras',
    gloss: 'MEU CACHORRO BONITO',
    portuguese: 'Meu cachorro é bonito.',
    nmfType: 'positive_smile' as const,
    nmfLabel: 'Elogio em Libras',
    catalogSignId: 'cachorro',
    videoUrl: '/assets/aistudio/meu_cachorro___bnt_caf3b045.mp4',
    options: [
      { id: 'dlg_1', text: 'Bonito', gloss: 'BONITO', catalogSignId: 'bonito' },
      { id: 'dlg_2', text: 'Feio', gloss: 'FEIO', catalogSignId: 'feio' },
      { id: 'dlg_3', text: 'Cansado', gloss: 'CANSADO', catalogSignId: 'cansado' }
    ],
    correctAnswer: 'Bonito'
  },
  {
    speaker: 'Diálogo em Libras',
    gloss: 'EU GOSTAR CAFÉ PÃO',
    portuguese: 'Eu gosto de café e pão.',
    nmfType: 'positive_smile' as const,
    nmfLabel: 'Preferência do dia a dia',
    catalogSignId: 'cafe',
    videoUrl: '/assets/aistudio/eu-gosto-cafe.mp4',
    options: [
      { id: 'dlg_1', text: 'Sim', gloss: 'SIM', catalogSignId: 'sim' },
      { id: 'dlg_2', text: 'Não', gloss: 'NÃO', catalogSignId: 'nao' },
      { id: 'dlg_3', text: 'Triste', gloss: 'TRISTE', catalogSignId: 'triste' }
    ],
    correctAnswer: 'Sim'
  },
  {
    speaker: 'Diálogo em Libras',
    gloss: 'MINHA ESCOLA GRANDE',
    portuguese: 'Minha escola é grande.',
    nmfType: 'neutral' as const,
    nmfLabel: 'Descrição visual de tamanho',
    catalogSignId: 'escola',
    videoUrl: '/assets/aistudio/minha_escola_egrande_3836a8da.mp4',
    options: [
      { id: 'dlg_1', text: 'Grande', gloss: 'GRANDE', catalogSignId: 'grande' },
      { id: 'dlg_2', text: 'Pequeno', gloss: 'PEQUENO', catalogSignId: 'pequeno' },
      { id: 'dlg_3', text: 'Triste', gloss: 'TRISTE', catalogSignId: 'triste' }
    ],
    correctAnswer: 'Grande'
  },
  {
    speaker: 'Diálogo em Libras',
    gloss: 'HOJE EU PRAIA ÔNIBUS IR',
    portuguese: 'Hoje eu vou para a praia de ônibus.',
    nmfType: 'positive_smile' as const,
    nmfLabel: 'Passeio de hoje',
    catalogSignId: 'praia',
    videoUrl: '/assets/aistudio/hj_vouapraia_de_onibus_021327d3.mp4',
    options: [
      { id: 'dlg_1', text: 'Obrigado', gloss: 'OBRIGADO', catalogSignId: 'obrigado' },
      { id: 'dlg_2', text: 'Frio', gloss: 'FRIO', catalogSignId: 'frio' },
      { id: 'dlg_3', text: 'Não', gloss: 'NÃO', catalogSignId: 'nao' }
    ],
    correctAnswer: 'Obrigado'
  },
  {
    speaker: 'Diálogo em Libras',
    gloss: 'HOJE EU FELIZ',
    portuguese: 'Hoje eu estou feliz.',
    nmfType: 'positive_smile' as const,
    nmfLabel: 'Expressão de alegria',
    catalogSignId: 'feliz',
    videoUrl: '/assets/aistudio/hj_eu_estou_feliz_ae9563ab.mp4',
    options: [
      { id: 'dlg_1', text: 'Feliz', gloss: 'FELIZ', catalogSignId: 'feliz' },
      { id: 'dlg_2', text: 'Triste', gloss: 'TRISTE', catalogSignId: 'triste' },
      { id: 'dlg_3', text: 'Frio', gloss: 'FRIO', catalogSignId: 'frio' }
    ],
    correctAnswer: 'Feliz'
  },
  {
    speaker: 'Diálogo em Libras',
    gloss: 'HOJE SOL QUENTE',
    portuguese: 'Hoje o sol está quente.',
    nmfType: 'neutral' as const,
    nmfLabel: 'Clima de hoje',
    catalogSignId: 'sol',
    videoUrl: '/assets/aistudio/hj_o_sol_est__quente_1bf7e6c7.mp4',
    options: [
      { id: 'dlg_1', text: 'Quente', gloss: 'QUENTE', catalogSignId: 'quente' },
      { id: 'dlg_2', text: 'Frio', gloss: 'FRIO', catalogSignId: 'frio' },
      { id: 'dlg_3', text: 'Não', gloss: 'NÃO', catalogSignId: 'nao' }
    ],
    correctAnswer: 'Quente'
  },
  {
    speaker: 'Diálogo em Libras',
    gloss: 'AMANHÃ EU TRABALHAR MERCADO',
    portuguese: 'Amanhã eu vou trabalhar no mercado.',
    nmfType: 'neutral' as const,
    nmfLabel: 'Rotina de trabalho',
    catalogSignId: 'mercado',
    videoUrl: '/assets/aistudio/amanha_trabalha_no_mercado_c0014e6d.mp4',
    options: [
      { id: 'dlg_1', text: 'Por favor', gloss: 'POR-FAVOR', catalogSignId: 'por-favor' },
      { id: 'dlg_2', text: 'Triste', gloss: 'TRISTE', catalogSignId: 'triste' },
      { id: 'dlg_3', text: 'Feio', gloss: 'FEIO', catalogSignId: 'feio' }
    ],
    correctAnswer: 'Por favor'
  }
];

function createSeededRng(seed: number): () => number {
  let state = (seed >>> 0) || 1;
  return () => {
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function deterministicShuffle<T>(items: T[], seed: number): T[] {
  const arr = [...items];
  const rand = createSeededRng(seed);
  for (let idx = arr.length - 1; idx > 0; idx--) {
    const swapIdx = Math.floor(rand() * (idx + 1));
    const tmp = arr[idx];
    arr[idx] = arr[swapIdx];
    arr[swapIdx] = tmp;
  }
  return arr;
}

const sectionCatalogCache = new Map<number, CatalogSign[]>();

function deduplicateNonConflictingSigns(signs: CatalogSign[]): CatalogSign[] {
  const unique: CatalogSign[] = [];
  for (const sign of signs) {
    if (!unique.some((existing) => areConflictingOrEquivalentSigns(existing, sign))) {
      unique.push(sign);
    }
  }
  return unique;
}

const DEDUPLICATED_CATALOG_255: CatalogSign[] = deduplicateNonConflictingSigns(LIBRAS_CATALOG_255);

function getSignsForSection(sectionNumber: number): CatalogSign[] {
  const cached = sectionCatalogCache.get(sectionNumber);
  if (cached) return cached;

  const meta = LIBRAS_SECTIONS_META[sectionNumber - 1] || LIBRAS_SECTIONS_META[0];
  const matched = deduplicateNonConflictingSigns(
    LIBRAS_CATALOG_255.filter((s) => meta.categories.includes(s.categoria))
  );
  const pool = matched.length >= 8 ? matched : DEDUPLICATED_CATALOG_255;
  sectionCatalogCache.set(sectionNumber, pool);
  return pool;
}

function getSignsForStage(sectionNumber: number, stageNumber: number): CatalogSign[] {
  const pool = getSignsForSection(sectionNumber);
  const start = ((stageNumber - 1) * 3) % pool.length;
  const result: CatalogSign[] = [];
  for (let offset = 0; result.length < 4 && offset < pool.length; offset++) {
    const candidate = pool[(start + offset) % pool.length];
    if (!result.some((s) => areConflictingOrEquivalentSigns(s, candidate))) {
      result.push(candidate);
    }
  }
  return result;
}

const stageCombinedPoolCache = new Map<string, CatalogSign[]>();

function getCombinedPoolForStage(sectionNumber: number, stageNumber: number): CatalogSign[] {
  const key = `${sectionNumber}_${stageNumber}`;
  const cached = stageCombinedPoolCache.get(key);
  if (cached) return cached;

  const sectionPool = getSignsForSection(sectionNumber);
  const orderedCombined = [...sectionPool];
  const complementShift = (sectionNumber * 17 + stageNumber * 7) % DEDUPLICATED_CATALOG_255.length;
  for (let i = 0; i < DEDUPLICATED_CATALOG_255.length && orderedCombined.length < 36; i++) {
    const cand = DEDUPLICATED_CATALOG_255[(complementShift + i) % DEDUPLICATED_CATALOG_255.length];
    if (!orderedCombined.some((s) => areConflictingOrEquivalentSigns(s, cand))) {
      orderedCombined.push(cand);
    }
  }

  stageCombinedPoolCache.set(key, orderedCombined);
  return orderedCombined;
}

function getSignsForActivity(
  sectionNumber: number,
  stageNumber: number,
  activityNumber: number
): CatalogSign[] {
  const orderedCombined = getCombinedPoolForStage(sectionNumber, stageNumber);
  const start = ((stageNumber - 1) * 4 + (activityNumber - 1)) % orderedCombined.length;
  const picked: CatalogSign[] = [];
  for (let step = 0; picked.length < 4 && step < orderedCombined.length; step++) {
    const cand = orderedCombined[(start + step) % orderedCombined.length];
    if (!picked.some((s) => areConflictingOrEquivalentSigns(s, cand))) {
      picked.push(cand);
    }
  }
  return picked;
}

const activityExercisesCache = new Map<string, Exercise[]>();

export function getExercisesForActivity(
  sectionNumber: number,
  stageNumber: number,
  activityNumber: number
): Exercise[] {
  const cacheKey = `${sectionNumber}_${stageNumber}_${activityNumber}`;
  const cached = activityExercisesCache.get(cacheKey);
  if (cached) return cached;

  const activitySigns = getSignsForActivity(sectionNumber, stageNumber, activityNumber);
  const primaryCat = activitySigns[0];
  const secondaryCat = activitySigns[1] || activitySigns[0];
  const thirdCat = activitySigns[2] || activitySigns[0];
  const fourthCat = activitySigns[3] || activitySigns[1] || activitySigns[0];

  const seed = sectionNumber * 1009 + stageNumber * 97 + activityNumber * 37;

  const getDistractors = (targetSign: CatalogSign, count = 3): CatalogSign[] => {
    const res: CatalogSign[] = [];
    const shuffledCatalog = deterministicShuffle(LIBRAS_CATALOG_255, seed + targetSign.numericId * 19);
    for (const candidate of shuffledCatalog) {
      if (
        !areConflictingOrEquivalentSigns(candidate, targetSign) &&
        !res.some((r) => areConflictingOrEquivalentSigns(r, candidate))
      ) {
        res.push(candidate);
        if (res.length >= count) break;
      }
    }
    return res;
  };

  const primaryDistractors = getDistractors(primaryCat, 3);
  const secondaryDistractors = getDistractors(secondaryCat, 3);
  const thirdDistractors = getDistractors(thirdCat, 3);

  const pairSigns: CatalogSign[] = [];
  for (const s of [primaryCat, secondaryCat, thirdCat, fourthCat]) {
    if (!pairSigns.some((existing) => areConflictingOrEquivalentSigns(existing, s))) {
      pairSigns.push(s);
    }
  }
  const pairPool = deterministicShuffle(LIBRAS_CATALOG_255, seed + 71);
  for (const extra of pairPool) {
    if (pairSigns.length >= 4) break;
    if (!pairSigns.some((existing) => areConflictingOrEquivalentSigns(existing, extra))) {
      pairSigns.push(extra);
    }
  }

  const matchPairs: MatchPair[] = pairSigns.slice(0, 4).map((cat, idx) => ({
    id: `pair_${cacheKey}_${idx}`,
    signId: cat.id,
    catalogSignId: cat.id,
    signName: cat.palavra,
    signGlyph: 'hand',
    handshape: cat.palavra,
    portugueseText: cat.palavra
  }));

  const dactWordIdx = (seed + activityNumber * 7 + stageNumber * 3) % CURATED_DACTYLOLOGY_WORDS.length;
  const dactWord = CURATED_DACTYLOLOGY_WORDS[dactWordIdx];
  const useWordChoiceDact = (stageNumber + activityNumber) % 2 === 0;
  const extraLetters = ['B', 'R', 'S', 'T', 'L', 'O', 'E', 'A', 'M', 'C'];
  const dactLetters = dactWord.split('');
  const dactDistractors = extraLetters.filter((l) => !dactLetters.includes(l)).slice(0, 3);
  const letterBank = deterministicShuffle([...dactLetters, ...dactDistractors], seed + 3);

  const dactWordDistractors = deterministicShuffle(
    CURATED_DACTYLOLOGY_WORDS.filter((w) => w !== dactWord),
    seed + 9
  ).slice(0, 3);

  const phraseSlot =
    (sectionNumber - 1) * 120 +
    (stageNumber - 1) * 6 +
    Math.floor((activityNumber - 1) / 2);
  const glossChallenge =
    CURATED_GLOSS_CHALLENGES[phraseSlot % CURATED_GLOSS_CHALLENGES.length];
  const dialogueSpec =
    CURATED_DIALOGUES[(seed + activityNumber * 5) % CURATED_DIALOGUES.length];

  const slowReadingPrompts = [
    'Qual é o significado deste sinal?',
    'Assista ao sinal e escolha a palavra correta:',
    'Observe o movimento em Libras e identifique o sinal:',
    'Que palavra em português corresponde a este vídeo?'
  ];
  const slowPrompt = slowReadingPrompts[(seed + activityNumber) % slowReadingPrompts.length];

  const makeNewSignCards = (slotIdx: number, focusSign: CatalogSign, distractors: CatalogSign[]): Exercise => ({
    id: `ex_${cacheKey}_${slotIdx}`,
    type: 'new_sign_cards',
    isNewSign: true,
    prompt: focusSign.palavra,
    signMeaning: focusSign.significado,
    targetSignId: focusSign.id,
    correctAnswers: [focusSign.palavra],
    options: deterministicShuffle(
      [
        { id: `opt_${slotIdx}_1`, text: focusSign.palavra, catalogSignId: focusSign.id },
        ...distractors.map((dc, idx) => ({
          id: `opt_${slotIdx}_${idx + 2}`,
          text: dc.palavra,
          catalogSignId: dc.id
        }))
      ],
      seed + slotIdx * 13
    )
  });

  const makeSlowReading = (slotIdx: number, focusSign: CatalogSign, distractors: CatalogSign[]): Exercise => ({
    id: `ex_${cacheKey}_${slotIdx}`,
    type: 'slow_reading',
    prompt: slowPrompt,
    targetSignId: focusSign.id,
    correctAnswers: [focusSign.palavra],
    options: deterministicShuffle(
      [
        { id: `sr_${slotIdx}_1`, text: focusSign.palavra, catalogSignId: focusSign.id },
        ...distractors.map((dc, idx) => ({
          id: `sr_${slotIdx}_${idx + 2}`,
          text: dc.palavra,
          catalogSignId: dc.id
        }))
      ],
      seed + slotIdx * 17
    )
  });

  const makeMatchPairs = (slotIdx: number): Exercise => ({
    id: `ex_${cacheKey}_${slotIdx}`,
    type: 'match_sign_pairs',
    prompt: 'Combine cada palavra com o vídeo do sinal correspondente:',
    matchPairs,
    correctAnswers: pairSigns.slice(0, 4).map((p) => p.palavra)
  });

  const makeDactylology = (slotIdx: number): Exercise =>
    useWordChoiceDact
      ? {
          id: `ex_${cacheKey}_${slotIdx}`,
          type: 'dactylology_spelling',
          prompt: 'Observe a soletração no alfabeto em Libras e acerte a palavra:',
          dactylologyWord: dactWord,
          correctAnswers: [dactWord],
          options: deterministicShuffle(
            [dactWord, ...dactWordDistractors].map((word, idx) => ({
              id: `dw_${slotIdx}_${idx}`,
              text: word
            })),
            seed + slotIdx * 29
          )
        }
      : {
          id: `ex_${cacheKey}_${slotIdx}`,
          type: 'dactylology_spelling',
          prompt: 'Observe a soletração manual e monte a palavra com as letras:',
          dactylologyWord: dactWord,
          wordBank: letterBank,
          correctAnswers: [dactWord]
        };

  const makeCameraPractice = (slotIdx: number, focusSign: CatalogSign): Exercise => ({
    id: `ex_${cacheKey}_${slotIdx}`,
    type: 'camera_practice',
    targetSignId: focusSign.id,
    prompt: `Faça o sinal de "${focusSign.palavra}"`,
    signMeaning: focusSign.significado,
    correctAnswers: ['validado']
  });

  const makeTranslate = (slotIdx: number): Exercise => ({
    id: `ex_${cacheKey}_${slotIdx}`,
    type: 'translate_to_libras',
    prompt: 'Monte a frase em Libras:',
    portugueseSentence: glossChallenge.portuguese,
    targetGloss: glossChallenge.glossTokens.join(' '),
    glossSequence: glossChallenge.glossTokens,
    realVideoUrl: URLS_FRASES_REAIS[glossChallenge.slug] || undefined,
    wordBank: deterministicShuffle(
      [...glossChallenge.glossTokens, ...glossChallenge.distractors],
      seed + slotIdx * 31
    ),
    correctAnswers: [glossChallenge.glossTokens.join(' ')]
  });

  const makeDialogue = (slotIdx: number): Exercise => ({
    id: `ex_${cacheKey}_${slotIdx}`,
    type: 'dialogue_completion',
    prompt: 'Escolha a resposta adequada em Libras:',
    dialoguePrompt: {
      speaker: dialogueSpec.speaker,
      gloss: dialogueSpec.gloss,
      portuguese: dialogueSpec.portuguese,
      nmfType: dialogueSpec.nmfType,
      nmfLabel: dialogueSpec.nmfLabel,
      catalogSignId: dialogueSpec.catalogSignId,
      videoUrl: dialogueSpec.videoUrl
    },
    correctAnswers: [dialogueSpec.correctAnswer],
    options: deterministicShuffle(dialogueSpec.options, seed + slotIdx * 43)
  });

  const makeExplanatoryVideo = (): Exercise => {
    if (sectionNumber === 1) {
      return {
        id: `ex_${cacheKey}_3_video`,
        type: 'explanatory_video',
        prompt: 'Assista ao vídeo explicativo e observe os cumprimentos em Libras:',
        videoTitle: 'Saudações em Libras 0.1.1',
        videoUrl: URLS_VIDEOS_EXPLICATIVOS.s1_a6_saudacoes || undefined,
        coveredSigns: ['bom-dia', 'boa-tarde', 'boa-noite', 'oi'],
        correctAnswers: ['assistido']
      };
    }

    const secMeta = LIBRAS_SECTIONS_META[sectionNumber - 1] || LIBRAS_SECTIONS_META[0];
    const expKey = `s${sectionNumber}_a6_explicativo`;
    return {
      id: `ex_${cacheKey}_3_video`,
      type: 'explanatory_video',
      prompt: 'Vídeo explicativo no meio da atividade: observe os sinais e expressões:',
      videoTitle: `${secMeta.title} · Prática Guiada`,
      videoUrl: URLS_VIDEOS_EXPLICATIVOS[expKey] || undefined,
      coveredSigns: activitySigns.map((s) => s.slug),
      correctAnswers: ['assistido']
    };
  };

  const isOddActivity = activityNumber % 2 === 1;
  const variant = (stageNumber * 3 + activityNumber + sectionNumber) % 5;

  let exercises: Exercise[];
  if (activityNumber === 6) {
    // Regra obrigatória: vídeo explicativo inserido NO MEIO da Atividade 6 (posição 3 de 5)
    const leadFocus =
      sectionNumber === 1 ? findCatalogSign('bom-dia') || primaryCat : primaryCat;
    const followFocus =
      sectionNumber === 1 ? findCatalogSign('oi') || secondaryCat : secondaryCat;
    const leadDistractors = getDistractors(leadFocus, 3);
    exercises = [
      makeNewSignCards(1, leadFocus, leadDistractors),
      makeDactylology(2),
      makeExplanatoryVideo(),
      makeCameraPractice(4, followFocus),
      makeDialogue(5)
    ];
  } else if (isOddActivity) {
    // Atividades ímpares: preservam translate_to_libras mas variam os outros formatos, sinais e ordem!
    if (variant === 0) {
      exercises = [
        makeNewSignCards(1, primaryCat, primaryDistractors),
        makeSlowReading(2, secondaryCat, secondaryDistractors),
        makeMatchPairs(3),
        makeCameraPractice(4, primaryCat),
        makeTranslate(5)
      ];
    } else if (variant === 1) {
      exercises = [
        makeSlowReading(1, primaryCat, primaryDistractors),
        makeNewSignCards(2, secondaryCat, secondaryDistractors),
        makeDactylology(3),
        makeTranslate(4),
        makeCameraPractice(5, thirdCat)
      ];
    } else if (variant === 2) {
      exercises = [
        makeNewSignCards(1, secondaryCat, secondaryDistractors),
        makeDactylology(2),
        makeMatchPairs(3),
        makeCameraPractice(4, primaryCat),
        makeTranslate(5)
      ];
    } else if (variant === 3) {
      exercises = [
        makeMatchPairs(1),
        makeDactylology(2),
        makeSlowReading(3, thirdCat, thirdDistractors),
        makeTranslate(4),
        makeCameraPractice(5, secondaryCat)
      ];
    } else {
      exercises = [
        makeDactylology(1),
        makeNewSignCards(2, primaryCat, primaryDistractors),
        makeSlowReading(3, thirdCat, thirdDistractors),
        makeCameraPractice(4, primaryCat),
        makeTranslate(5)
      ];
    }
  } else {
    // Atividades pares: alternam entre datilologia, leitura de sinais, pares, diálogo e câmera
    if (variant === 0) {
      exercises = [
        makeNewSignCards(1, primaryCat, primaryDistractors),
        makeSlowReading(2, secondaryCat, secondaryDistractors),
        makeDactylology(3),
        makeCameraPractice(4, primaryCat),
        makeDialogue(5)
      ];
    } else if (variant === 1) {
      exercises = [
        makeDactylology(1),
        makeSlowReading(2, primaryCat, primaryDistractors),
        makeNewSignCards(3, secondaryCat, secondaryDistractors),
        makeDialogue(4),
        makeCameraPractice(5, primaryCat)
      ];
    } else if (variant === 2) {
      exercises = [
        makeSlowReading(1, secondaryCat, secondaryDistractors),
        makeNewSignCards(2, thirdCat, thirdDistractors),
        makeMatchPairs(3),
        makeDialogue(4),
        makeCameraPractice(5, secondaryCat)
      ];
    } else if (variant === 3) {
      exercises = [
        makeMatchPairs(1),
        makeDactylology(2),
        makeNewSignCards(3, secondaryCat, secondaryDistractors),
        makeCameraPractice(4, primaryCat),
        makeDialogue(5)
      ];
    } else {
      exercises = [
        makeNewSignCards(1, thirdCat, thirdDistractors),
        makeMatchPairs(2),
        makeSlowReading(3, primaryCat, primaryDistractors),
        makeCameraPractice(4, thirdCat),
        makeDialogue(5)
      ];
    }
  }

  activityExercisesCache.set(cacheKey, exercises);
  return exercises;
}

const sectionUnitsCache = new Map<number, Unit[]>();

export function getUnitsForSection(sectionNumber: number): Unit[] {
  const safeSec = Math.max(1, Math.min(TRACK_STRUCTURE.sections, sectionNumber));
  const cached = sectionUnitsCache.get(safeSec);
  if (cached) return cached;

  const meta = LIBRAS_SECTIONS_META[safeSec - 1] || LIBRAS_SECTIONS_META[0];
  const units: Unit[] = [];

  for (let stage = 1; stage <= TRACK_STRUCTURE.stagesPerSection; stage++) {
    const stageSigns = getSignsForStage(safeSec, stage);
    const focusPreview = stageSigns
      .slice(0, 3)
      .map((s) => s.palavra)
      .join(', ');

    const nodes: PathNode[] = [];
    for (let act = 1; act <= TRACK_STRUCTURE.activitiesPerStage; act++) {
      const nodeId = getActivityNodeId(safeSec, stage, act);
      const isChest = act === 6;
      const isTrophy = act === 12;
      const isStory = act === 4 || act === 8;
      const isRapid = act === 10;
      const nodeType = isChest
        ? 'chest'
        : isTrophy
        ? 'trophy'
        : isStory
        ? 'story'
        : isRapid
        ? 'rapid'
        : 'lesson';

      const targetSign = getSignsForActivity(safeSec, stage, act)[0] || stageSigns[0];
      const title = isTrophy
        ? `Atividade ${act}: Revisão da Etapa`
        : isChest
        ? `Atividade ${act}: Prática Especial`
        : `Atividade ${act}: ${targetSign.palavra}`;

      const node: PathNode = {
        id: nodeId,
        type: nodeType,
        title,
        description: targetSign.significado,
        xpReward: isTrophy ? 40 : isChest ? 30 : 20,
        gemsReward: isTrophy ? 20 : isChest ? 30 : 10,
        status: safeSec === 1 && stage === 1 && act === 1 ? 'available' : 'locked',
        get exercises() {
          return getExercisesForActivity(safeSec, stage, act);
        }
      };
      nodes.push(node);
    }

    units.push({
      id: `s${safeSec}_e${stage}`,
      unitNumber: stage,
      sectionNumber: safeSec,
      title: `Etapa ${stage}: ${focusPreview}`,
      description: `${meta.title} · ${focusPreview}`,
      themeColor: meta.themeColor,
      guidebook: {
        signsOverview: stageSigns.map((s) => ({
          sign: s.palavra,
          meaning: s.significado,
          slug: s.slug
        })),
        grammarRule: {
          title: meta.grammarTitle,
          explanation: meta.grammarExplanation,
          exampleGloss: meta.exampleGloss,
          examplePortuguese: meta.examplePt
        },
        culturalTip: meta.culturalTip
      },
      nodes
    });
  }

  sectionUnitsCache.set(safeSec, units);
  return units;
}

export function getSectionByNumber(sectionNumber: number): Section {
  const safeSec = Math.max(1, Math.min(TRACK_STRUCTURE.sections, sectionNumber));
  const meta = LIBRAS_SECTIONS_META[safeSec - 1] || LIBRAS_SECTIONS_META[0];
  return {
    sectionNumber: safeSec,
    title: meta.title,
    description: meta.description,
    get units() {
      return getUnitsForSection(safeSec);
    }
  };
}

export const LIBRAS_SECTIONS: Section[] = LIBRAS_SECTIONS_META.map((meta) => ({
  sectionNumber: meta.sectionNumber,
  title: meta.title,
  description: meta.description,
  get units() {
    return getUnitsForSection(meta.sectionNumber);
  }
}));

export interface TrackUnlockState {
  isActivityCompleted: (section: number, stage: number, activity: number) => boolean;
  isStageCompleted: (section: number, stage: number) => boolean;
  isSectionCompleted: (section: number) => boolean;
  isSectionUnlocked: (section: number) => boolean;
  isStageUnlocked: (section: number, stage: number) => boolean;
  isActivityUnlocked: (section: number, stage: number, activity: number) => boolean;
  currentSectionNumber: number;
  currentStageNumber: number;
  currentActivityNumber: number;
}

export function getTrackUnlockState(completedNodeIds: string[]): TrackUnlockState {
  const completedSet = new Set(completedNodeIds);

  const isActivityCompleted = (section: number, stage: number, activity: number): boolean =>
    completedSet.has(getActivityNodeId(section, stage, activity));

  const isStageCompleted = (section: number, stage: number): boolean => {
    for (let act = 1; act <= TRACK_STRUCTURE.activitiesPerStage; act++) {
      if (!isActivityCompleted(section, stage, act)) return false;
    }
    return true;
  };

  const isSectionCompleted = (section: number): boolean => {
    for (let stage = 1; stage <= TRACK_STRUCTURE.stagesPerSection; stage++) {
      if (!isStageCompleted(section, stage)) return false;
    }
    return true;
  };

  const isSectionUnlocked = (section: number): boolean => {
    if (section <= 1) return true;
    return isSectionCompleted(section - 1);
  };

  const isStageUnlocked = (section: number, stage: number): boolean => {
    if (!isSectionUnlocked(section)) return false;
    if (stage <= 1) return true;
    return isStageCompleted(section, stage - 1);
  };

  const isActivityUnlocked = (section: number, stage: number, activity: number): boolean => {
    if (!isStageUnlocked(section, stage)) return false;
    if (activity <= 1) return true;
    return isActivityCompleted(section, stage, activity - 1);
  };

  let currentSectionNumber = 1;
  let currentStageNumber = 1;
  let currentActivityNumber = 1;

  outer: for (let s = 1; s <= TRACK_STRUCTURE.sections; s++) {
    if (!isSectionUnlocked(s)) break;
    for (let st = 1; st <= TRACK_STRUCTURE.stagesPerSection; st++) {
      if (!isStageUnlocked(s, st)) break outer;
      for (let a = 1; a <= TRACK_STRUCTURE.activitiesPerStage; a++) {
        if (!isActivityCompleted(s, st, a)) {
          currentSectionNumber = s;
          currentStageNumber = st;
          currentActivityNumber = a;
          break outer;
        }
      }
    }
  }

  return {
    isActivityCompleted,
    isStageCompleted,
    isSectionCompleted,
    isSectionUnlocked,
    isStageUnlocked,
    isActivityUnlocked,
    currentSectionNumber,
    currentStageNumber,
    currentActivityNumber
  };
}

export const LIBRAS_DAILY_QUESTS: Quest[] = [
  {
    id: 'q_daily_1',
    title: 'Praticante Dedicado',
    description: 'Complete 3 atividades de Libras hoje.',
    icon: 'zap',
    target: 3,
    current: 0,
    rewardGems: 25,
    rewardXp: 40,
    completed: false,
    claimed: false
  },
  {
    id: 'q_daily_2',
    title: 'Prática com Câmera',
    description: 'Conclua 5 exercícios de sinalização na câmera.',
    icon: 'camera',
    target: 5,
    current: 0,
    rewardGems: 30,
    rewardXp: 50,
    completed: false,
    claimed: false
  },
  {
    id: 'q_daily_3',
    title: 'Leitura Visual',
    description: 'Acerte 10 exercícios seguidos nas atividades.',
    icon: 'target',
    target: 10,
    current: 0,
    rewardGems: 40,
    rewardXp: 60,
    completed: false,
    claimed: false
  }
];

export const LIBRAS_QUESTS = LIBRAS_DAILY_QUESTS;

export const LIBRAS_ACHIEVEMENTS: Achievement[] = [
  {
    id: 'flame_streak',
    title: 'Mãos em Chamas',
    description: 'Mantenha sua ofensiva de estudos em Libras ativa por 7 dias seguidos.',
    icon: 'flame',
    tier: 1,
    maxTier: 5,
    currentProgress: 0,
    targetProgress: 7,
    completed: false
  },
  {
    id: 'units_10_sections',
    title: 'Mestre da Trilha Completa',
    description: 'Conclua as 10 seções da trilha de Libras do EasyLib.',
    icon: 'crown',
    tier: 1,
    maxTier: 5,
    currentProgress: 0,
    targetProgress: 10,
    completed: false
  },
  {
    id: 'camera_pose_master',
    title: 'Precisão na Câmera',
    description: 'Valide 50 sinais nas atividades com câmera.',
    icon: 'camera',
    tier: 1,
    maxTier: 5,
    currentProgress: 0,
    targetProgress: 50,
    completed: false
  },
  {
    id: 'interpreter_tier',
    title: 'Fluência Visual',
    description: 'Conclua 100 exercícios de leitura e tradução em Libras.',
    icon: 'hand',
    tier: 1,
    maxTier: 5,
    currentProgress: 0,
    targetProgress: 100,
    completed: false
  }
];

export const LIBRAS_LEADERBOARD_USERS: LeaderboardUser[] = [
  { id: 'u_1', name: 'Mariana Silva', username: 'mari_libras', avatar: 'MS', xp: 1450, streak: 28, flag: 'BR' },
  { id: 'u_2', name: 'Gabriel Santos', username: 'biel_sinal', avatar: 'GS', xp: 1320, streak: 35, flag: 'BR' },
  { id: 'u_3', name: 'Camila Rocha', username: 'camilinha_sinais', avatar: 'CR', xp: 1180, streak: 19, flag: 'BR' },
  { id: 'u_4', name: 'Rafael Costa', username: 'rafa_aprendiz', avatar: 'RC', xp: 950, streak: 12, flag: 'BR' },
  { id: 'u_5', name: 'Beatriz Lima', username: 'bia_inclusao', avatar: 'BL', xp: 840, streak: 14, flag: 'BR' },
  { id: 'u_6', name: 'Thiago Oliveira', username: 'thiago_maos', avatar: 'TO', xp: 780, streak: 9, flag: 'BR' },
  { id: 'u_7', name: 'Juliana Mendes', username: 'ju_libras', avatar: 'JM', xp: 650, streak: 8, flag: 'BR' },
  { id: 'u_8', name: 'Lucas Ferreira', username: 'lucas_f', avatar: 'LF', xp: 520, streak: 5, flag: 'BR' },
  { id: 'u_9', name: 'Fernanda Nogueira', username: 'nanda_libras', avatar: 'FN', xp: 410, streak: 4, flag: 'BR' },
  { id: 'u_10', name: 'Carlos Eduardo', username: 'kadu_estudos', avatar: 'CE', xp: 340, streak: 2, flag: 'BR' }
];

export const LEADERBOARD_NAMES = LIBRAS_LEADERBOARD_USERS;

export const DUO_OUTFITS: DuoOutfit[] = [
  {
    id: 'classic',
    name: 'Libi',
    description: 'Mascote oficial de Libras.',
    price: 0,
    icon: 'libi',
    unlocked: true
  }
];

export { findCatalogSign };
