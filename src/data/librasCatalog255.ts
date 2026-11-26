export const LIBRAS_CATALOG_CATEGORIES = [
  'Verbos',
  'Saudações',
  'Cortesia e Comunicação',
  'Pronomes e Perguntas',
  'Família e Pessoas',
  'Animais',
  'Natureza',
  'Alimentos e Bebidas',
  'Casa e Escola',
  'Trabalho e Lugares',
  'Transporte e Ações',
  'Sentimentos',
  'Tempo',
  'Cores',
  'Adjetivos',
  'Corpo e Saúde',
  'Números e Quantidades',
  'Tecnologia e Mídia',
  'Vestuário e Objetos'
] as const;

import { RAW_EXTENDED_SIGNS } from './librasCatalogExtended';

export type LibrasCatalogCategory = (typeof LIBRAS_CATALOG_CATEGORIES)[number];

export type TargetArticulationZone =
  | 'chin'
  | 'forehead'
  | 'nose_mouth'
  | 'ear'
  | 'eye_cheek'
  | 'chest'
  | 'shoulder'
  | 'neutral_space';

export type TargetHandshapeId =
  | 'open_5'
  | 'flat_b'
  | 'fist_s'
  | 'thumb_a'
  | 'point_1'
  | 'v_2'
  | 'u_2'
  | 'l_shape'
  | 'c_shape'
  | 'o_pinch'
  | 'f_shape'
  | 'y_shape'
  | 'ily_love'
  | 'pinky_i'
  | 'three_3'
  | 'four_4'
  | 'k_shape'
  | 'r_shape';

export interface CompoundMotionPhase {
  label: string;
  handshapeId: TargetHandshapeId;
  fingers: {
    thumb: [number, number];
    index: [number, number];
    middle: [number, number];
    ring: [number, number];
    pinky: [number, number];
  };
  maxThumbIndexTipDist?: number;
  minThumbIndexTipDist?: number;
  minIndexMiddleSpread?: number;
  maxIndexMiddleSpread?: number;
  articulationZone: TargetArticulationZone;
  motionType: 'static' | 'wave' | 'forward' | 'circular' | 'vertical' | 'tap' | 'downward';
}

export interface TargetLandmarks {
  handshapeId: TargetHandshapeId;
  fingers: {
    thumb: [number, number];
    index: [number, number];
    middle: [number, number];
    ring: [number, number];
    pinky: [number, number];
  };
  maxThumbIndexTipDist?: number;
  minThumbIndexTipDist?: number;
  minIndexMiddleSpread?: number;
  maxIndexMiddleSpread?: number;
  articulationZone: TargetArticulationZone;
  motionType: 'static' | 'wave' | 'forward' | 'circular' | 'vertical' | 'tap' | 'downward';
  twoHanded: 1 | 2;
  expectedNmf?: 'neutral' | 'interrogative_brows_up' | 'wh_brows_furrowed' | 'positive_smile';
  motionPhases?: CompoundMotionPhase[];
}

export type SchematicArrowDirection =
  | 'none'
  | 'forward'
  | 'left_right'
  | 'up_down'
  | 'circle'
  | 'tap_chin'
  | 'tap_forehead'
  | 'tap_chest';

export interface CatalogSign {
  numericId: number;
  id: string;
  slug: string;
  palavra: string;
  significado: string;
  categoria: LibrasCatalogCategory;
  videoUrl: string;
  referenceUrl: string;
  targetLandmarks: TargetLandmarks;
  schematicHint: {
    handshapeId: TargetHandshapeId;
    zone: TargetArticulationZone;
    motionType: TargetLandmarks['motionType'];
    arrowDirection: SchematicArrowDirection;
  };
}

interface HandshapePreset {
  fingers: TargetLandmarks['fingers'];
  maxThumbIndexTipDist?: number;
  minThumbIndexTipDist?: number;
  minIndexMiddleSpread?: number;
  maxIndexMiddleSpread?: number;
}

const HANDSHAPE_PRESETS: Record<TargetHandshapeId, HandshapePreset> = {
  open_5: {
    fingers: { thumb: [0.55, 1], index: [0.65, 1], middle: [0.65, 1], ring: [0.65, 1], pinky: [0.65, 1] },
    minIndexMiddleSpread: 10
  },
  flat_b: {
    fingers: { thumb: [0, 0.72], index: [0.68, 1], middle: [0.68, 1], ring: [0.68, 1], pinky: [0.68, 1] },
    maxIndexMiddleSpread: 22
  },
  fist_s: {
    fingers: { thumb: [0, 0.6], index: [0, 0.35], middle: [0, 0.35], ring: [0, 0.35], pinky: [0, 0.35] }
  },
  thumb_a: {
    fingers: { thumb: [0.62, 1], index: [0, 0.35], middle: [0, 0.35], ring: [0, 0.35], pinky: [0, 0.35] }
  },
  point_1: {
    fingers: { thumb: [0, 0.65], index: [0.68, 1], middle: [0, 0.35], ring: [0, 0.35], pinky: [0, 0.35] }
  },
  v_2: {
    fingers: { thumb: [0, 0.62], index: [0.65, 1], middle: [0.65, 1], ring: [0, 0.35], pinky: [0, 0.35] },
    minIndexMiddleSpread: 12
  },
  u_2: {
    fingers: { thumb: [0, 0.62], index: [0.65, 1], middle: [0.65, 1], ring: [0, 0.35], pinky: [0, 0.35] },
    maxIndexMiddleSpread: 16
  },
  l_shape: {
    fingers: { thumb: [0.62, 1], index: [0.68, 1], middle: [0, 0.35], ring: [0, 0.35], pinky: [0, 0.35] },
    minThumbIndexTipDist: 0.62
  },
  c_shape: {
    fingers: { thumb: [0.35, 0.92], index: [0.25, 0.78], middle: [0.25, 0.78], ring: [0.25, 0.78], pinky: [0.25, 0.78] },
    minThumbIndexTipDist: 0.36
  },
  o_pinch: {
    fingers: { thumb: [0.25, 0.8], index: [0.2, 0.72], middle: [0, 0.68], ring: [0, 0.68], pinky: [0, 0.68] },
    maxThumbIndexTipDist: 0.48
  },
  f_shape: {
    fingers: { thumb: [0.25, 0.85], index: [0.18, 0.68], middle: [0.65, 1], ring: [0.65, 1], pinky: [0.65, 1] },
    maxThumbIndexTipDist: 0.45
  },
  y_shape: {
    fingers: { thumb: [0.62, 1], index: [0, 0.38], middle: [0, 0.35], ring: [0, 0.35], pinky: [0.62, 1] }
  },
  ily_love: {
    fingers: { thumb: [0.62, 1], index: [0.68, 1], middle: [0, 0.35], ring: [0, 0.35], pinky: [0.62, 1] }
  },
  pinky_i: {
    fingers: { thumb: [0, 0.62], index: [0, 0.35], middle: [0, 0.35], ring: [0, 0.35], pinky: [0.65, 1] }
  },
  three_3: {
    fingers: { thumb: [0.5, 1], index: [0.65, 1], middle: [0.65, 1], ring: [0, 0.42], pinky: [0, 0.38] }
  },
  four_4: {
    fingers: { thumb: [0, 0.55], index: [0.65, 1], middle: [0.65, 1], ring: [0.65, 1], pinky: [0.65, 1] }
  },
  k_shape: {
    fingers: { thumb: [0.45, 0.9], index: [0.65, 1], middle: [0.45, 0.9], ring: [0, 0.35], pinky: [0, 0.35] }
  },
  r_shape: {
    fingers: { thumb: [0, 0.6], index: [0.65, 1], middle: [0.65, 1], ring: [0, 0.35], pinky: [0, 0.35] },
    maxIndexMiddleSpread: 11
  }
};

type RawSignTuple = [
  numericId: number,
  slug: string,
  palavra: string,
  significado: string,
  categoria: LibrasCatalogCategory,
  handshapeId: TargetHandshapeId,
  zone: TargetArticulationZone,
  motionType: TargetLandmarks['motionType'],
  twoHanded?: 1 | 2,
  expectedNmf?: TargetLandmarks['expectedNmf']
];

const RAW_SIGNS_255: RawSignTuple[] = [
  [1, 'oi', 'Oi', 'Cumprimento informal', 'Saudações', 'open_5', 'shoulder', 'wave', 1, 'positive_smile'],
  [2, 'ola', 'Olá', 'Cumprimento cordial', 'Saudações', 'open_5', 'shoulder', 'wave', 1, 'positive_smile'],
  [3, 'tudo-bem', 'Tudo bem', 'Pergunta ou confirmação de bem-estar', 'Saudações', 'thumb_a', 'neutral_space', 'static', 1, 'interrogative_brows_up'],
  [4, 'bom-dia', 'Bom dia', 'Saudação matinal', 'Saudações', 'point_1', 'forehead', 'forward', 1, 'positive_smile'],
  [5, 'boa-tarde', 'Boa tarde', 'Saudação da tarde', 'Saudações', 'flat_b', 'neutral_space', 'downward', 2, 'positive_smile'],
  [6, 'boa-noite', 'Boa noite', 'Saudação da noite', 'Saudações', 'flat_b', 'neutral_space', 'downward', 2, 'neutral'],
  [7, 'tchau', 'Tchau', 'Despedida', 'Saudações', 'open_5', 'shoulder', 'wave', 1, 'positive_smile'],
  [8, 'por-favor', 'Por favor', 'Pedido educado', 'Cortesia e Comunicação', 'flat_b', 'chest', 'forward', 2, 'neutral'],
  [9, 'obrigado', 'Obrigado', 'Expressão de agradecimento', 'Cortesia e Comunicação', 'flat_b', 'forehead', 'forward', 1, 'positive_smile'],
  [10, 'obrigada', 'Obrigada', 'Expressão de agradecimento', 'Cortesia e Comunicação', 'flat_b', 'forehead', 'forward', 1, 'positive_smile'],
  [11, 'desculpa', 'Desculpa', 'Pedido de perdão', 'Cortesia e Comunicação', 'y_shape', 'chin', 'tap', 1, 'neutral'],
  [12, 'com-licenca', 'Com licença', 'Pedido de passagem ou permissão', 'Cortesia e Comunicação', 'flat_b', 'chest', 'forward', 2, 'neutral'],
  [13, 'sim', 'Sim', 'Confirmação positiva', 'Cortesia e Comunicação', 'fist_s', 'neutral_space', 'vertical', 1, 'neutral'],
  [14, 'nao', 'Não', 'Negação', 'Cortesia e Comunicação', 'point_1', 'neutral_space', 'wave', 1, 'wh_brows_furrowed'],
  [15, 'ajuda', 'Ajuda', 'Auxílio ou apoio', 'Cortesia e Comunicação', 'flat_b', 'neutral_space', 'forward', 2, 'neutral'],
  [16, 'entender', 'Entender', 'Compreender uma ideia', 'Cortesia e Comunicação', 'point_1', 'forehead', 'tap', 1, 'neutral'],
  [17, 'nao-entender', 'Não entender', 'Falta de compreensão', 'Cortesia e Comunicação', 'open_5', 'forehead', 'wave', 1, 'wh_brows_furrowed'],
  [18, 'sinal', 'Sinal', 'Unidade visual da língua de sinais', 'Cortesia e Comunicação', 'open_5', 'neutral_space', 'circular', 2, 'neutral'],
  [19, 'libras', 'Libras', 'Língua Brasileira de Sinais', 'Cortesia e Comunicação', 'open_5', 'neutral_space', 'circular', 2, 'positive_smile'],
  [20, 'nome', 'Nome', 'Identificação pessoal', 'Cortesia e Comunicação', 'u_2', 'chest', 'wave', 1, 'neutral'],
  [21, 'eu', 'Eu', 'Primeira pessoa do singular', 'Pronomes e Perguntas', 'point_1', 'chest', 'tap', 1, 'neutral'],
  [22, 'voce', 'Você', 'Segunda pessoa do singular', 'Pronomes e Perguntas', 'point_1', 'neutral_space', 'forward', 1, 'neutral'],
  [23, 'nos', 'Nós', 'Primeira pessoa do plural', 'Pronomes e Perguntas', 'point_1', 'chest', 'circular', 1, 'neutral'],
  [24, 'eles', 'Eles', 'Terceira pessoa do plural', 'Pronomes e Perguntas', 'point_1', 'neutral_space', 'wave', 1, 'neutral'],
  [25, 'meu', 'Meu', 'Posse da primeira pessoa', 'Pronomes e Perguntas', 'flat_b', 'chest', 'tap', 1, 'neutral'],
  [26, 'seu', 'Seu', 'Posse da segunda pessoa', 'Pronomes e Perguntas', 'flat_b', 'neutral_space', 'forward', 1, 'neutral'],
  [27, 'onde', 'Onde', 'Pergunta sobre lugar', 'Pronomes e Perguntas', 'open_5', 'neutral_space', 'wave', 1, 'wh_brows_furrowed'],
  [28, 'quem', 'Quem', 'Pergunta sobre pessoa', 'Pronomes e Perguntas', 'point_1', 'chin', 'circular', 1, 'wh_brows_furrowed'],
  [29, 'o-que', 'O quê', 'Pergunta sobre coisa ou ação', 'Pronomes e Perguntas', 'open_5', 'neutral_space', 'wave', 1, 'wh_brows_furrowed'],
  [30, 'quando', 'Quando', 'Pergunta sobre tempo', 'Pronomes e Perguntas', 'point_1', 'neutral_space', 'circular', 2, 'wh_brows_furrowed'],
  [31, 'por-que', 'Por que', 'Pergunta sobre motivo', 'Pronomes e Perguntas', 'point_1', 'forehead', 'forward', 1, 'wh_brows_furrowed'],
  [32, 'como', 'Como', 'Pergunta sobre modo', 'Pronomes e Perguntas', 'open_5', 'neutral_space', 'circular', 2, 'wh_brows_furrowed'],
  [33, 'qual', 'Qual', 'Pergunta de escolha', 'Pronomes e Perguntas', 'open_5', 'neutral_space', 'vertical', 2, 'wh_brows_furrowed'],
  [34, 'quanto', 'Quanto', 'Pergunta sobre quantidade ou valor', 'Pronomes e Perguntas', 'o_pinch', 'neutral_space', 'vertical', 1, 'wh_brows_furrowed'],
  [35, 'mae', 'Mãe', 'Genitora feminina', 'Família e Pessoas', 'flat_b', 'chin', 'tap', 1, 'positive_smile'],
  [36, 'pai', 'Pai', 'Genitor masculino', 'Família e Pessoas', 'c_shape', 'chin', 'tap', 1, 'neutral'],
  [37, 'irmao', 'Irmão', 'Irmão do sexo masculino', 'Família e Pessoas', 'point_1', 'neutral_space', 'downward', 2, 'neutral'],
  [38, 'irma', 'Irmã', 'Irmã do sexo feminino', 'Família e Pessoas', 'point_1', 'chin', 'downward', 2, 'neutral'],
  [39, 'filho', 'Filho', 'Descendente masculino', 'Família e Pessoas', 'open_5', 'chest', 'forward', 1, 'positive_smile'],
  [40, 'filha', 'Filha', 'Descendente feminino', 'Família e Pessoas', 'open_5', 'chin', 'forward', 1, 'positive_smile'],
  [41, 'avo', 'Avô', 'Pai do pai ou da mãe', 'Família e Pessoas', 'fist_s', 'chin', 'downward', 1, 'neutral'],
  [42, 'avo-feminino', 'Avó', 'Mãe do pai ou da mãe', 'Família e Pessoas', 'fist_s', 'chin', 'tap', 1, 'positive_smile'],
  [43, 'tio', 'Tio', 'Irmão do pai ou da mãe', 'Família e Pessoas', 'c_shape', 'forehead', 'tap', 1, 'neutral'],
  [44, 'tia', 'Tia', 'Irmã do pai ou da mãe', 'Família e Pessoas', 'c_shape', 'chin', 'tap', 1, 'neutral'],
  [45, 'primo', 'Primo', 'Filho do tio ou da tia', 'Família e Pessoas', 'point_1', 'neutral_space', 'tap', 1, 'neutral'],
  [46, 'prima', 'Prima', 'Filha do tio ou da tia', 'Família e Pessoas', 'point_1', 'chin', 'tap', 1, 'neutral'],
  [47, 'familia', 'Família', 'Grupo de parentes e pessoas próximas', 'Família e Pessoas', 'f_shape', 'neutral_space', 'circular', 2, 'positive_smile'],
  [48, 'amigo', 'Amigo', 'Companheiro e pessoa próxima', 'Família e Pessoas', 'flat_b', 'chest', 'tap', 1, 'positive_smile'],
  [49, 'amiga', 'Amiga', 'Companheira e pessoa próxima', 'Família e Pessoas', 'flat_b', 'chest', 'tap', 1, 'positive_smile'],
  [50, 'casamento', 'Casamento', 'União matrimonial', 'Família e Pessoas', 'open_5', 'neutral_space', 'forward', 2, 'positive_smile'],
  [51, 'bebe', 'Bebê', 'Criança de colo', 'Família e Pessoas', 'flat_b', 'chest', 'wave', 2, 'positive_smile'],
  [52, 'crianca', 'Criança', 'Pessoa na infância', 'Família e Pessoas', 'flat_b', 'neutral_space', 'tap', 1, 'positive_smile'],
  [53, 'homem', 'Homem', 'Pessoa adulta do sexo masculino', 'Família e Pessoas', 'c_shape', 'chin', 'downward', 1, 'neutral'],
  [54, 'mulher', 'Mulher', 'Pessoa adulta do sexo feminino', 'Família e Pessoas', 'thumb_a', 'eye_cheek', 'downward', 1, 'neutral'],
  [55, 'pessoa', 'Pessoa', 'Ser humano', 'Família e Pessoas', 'point_1', 'forehead', 'downward', 1, 'neutral'],
  [56, 'abelha', 'Abelha', 'Inseto produtor de mel', 'Animais', 'f_shape', 'eye_cheek', 'circular', 1, 'neutral'],
  [57, 'borboleta', 'Borboleta', 'Inseto de asas coloridas', 'Animais', 'open_5', 'neutral_space', 'wave', 2, 'positive_smile'],
  [58, 'cachorro', 'Cachorro', 'Animal doméstico canino', 'Animais', 'c_shape', 'nose_mouth', 'tap', 1, 'positive_smile'],
  [59, 'gato', 'Gato', 'Animal doméstico felino', 'Animais', 'open_5', 'eye_cheek', 'wave', 1, 'neutral'],
  [60, 'passaro', 'Pássaro', 'Ave que voa', 'Animais', 'o_pinch', 'nose_mouth', 'tap', 1, 'neutral'],
  [61, 'peixe', 'Peixe', 'Animal aquático', 'Animais', 'flat_b', 'neutral_space', 'wave', 2, 'neutral'],
  [62, 'cavalo', 'Cavalo', 'Animal equino', 'Animais', 'u_2', 'forehead', 'vertical', 1, 'neutral'],
  [63, 'vaca', 'Vaca', 'Bovino fêmea', 'Animais', 'y_shape', 'forehead', 'tap', 1, 'neutral'],
  [64, 'boi', 'Boi', 'Bovino macho', 'Animais', 'y_shape', 'forehead', 'forward', 1, 'neutral'],
  [65, 'porco', 'Porco', 'Animal suíno', 'Animais', 'flat_b', 'chin', 'tap', 1, 'neutral'],
  [66, 'ovelha', 'Ovelha', 'Animal lanígero', 'Animais', 'v_2', 'ear', 'circular', 1, 'neutral'],
  [67, 'galinha', 'Galinha', 'Ave doméstica fêmea', 'Animais', 'o_pinch', 'nose_mouth', 'tap', 1, 'neutral'],
  [68, 'pato', 'Pato', 'Ave aquática', 'Animais', 'flat_b', 'nose_mouth', 'tap', 1, 'neutral'],
  [69, 'leao', 'Leão', 'Grande felino selvagem', 'Animais', 'open_5', 'forehead', 'circular', 1, 'neutral'],
  [70, 'tigre', 'Tigre', 'Felino listrado', 'Animais', 'open_5', 'eye_cheek', 'downward', 2, 'neutral'],
  [71, 'elefante', 'Elefante', 'Grande mamífero com tromba', 'Animais', 'flat_b', 'nose_mouth', 'forward', 1, 'neutral'],
  [72, 'macaco', 'Macaco', 'Primata ágil', 'Animais', 'c_shape', 'chest', 'vertical', 2, 'positive_smile'],
  [73, 'urso', 'Urso', 'Grande mamífero silvestre', 'Animais', 'open_5', 'chest', 'tap', 2, 'neutral'],
  [74, 'cobra', 'Cobra', 'Réptil alongado sem patas', 'Animais', 'u_2', 'neutral_space', 'wave', 1, 'neutral'],
  [75, 'jacare', 'Jacaré', 'Réptil aquático', 'Animais', 'open_5', 'neutral_space', 'tap', 2, 'neutral'],
  [76, 'tartaruga', 'Tartaruga', 'Réptil com casco', 'Animais', 'thumb_a', 'neutral_space', 'circular', 2, 'neutral'],
  [77, 'sapo', 'Sapo', 'Anfíbio saltador', 'Animais', 'v_2', 'chin', 'tap', 1, 'neutral'],
  [78, 'formiga', 'Formiga', 'Pequeno inseto social', 'Animais', 'o_pinch', 'neutral_space', 'forward', 1, 'neutral'],
  [79, 'aranha', 'Aranha', 'Aracnídeo de oito patas', 'Animais', 'open_5', 'neutral_space', 'forward', 2, 'neutral'],
  [80, 'rato', 'Rato', 'Pequeno roedor', 'Animais', 'point_1', 'nose_mouth', 'tap', 1, 'neutral'],
  [81, 'coelho', 'Coelho', 'Mamífero de orelhas longas', 'Animais', 'u_2', 'ear', 'vertical', 2, 'positive_smile'],
  [82, 'galo', 'Galo', 'Ave doméstica macho', 'Animais', 'three_3', 'forehead', 'tap', 1, 'neutral'],
  [83, 'aguia', 'Águia', 'Ave de rapina', 'Animais', 'point_1', 'nose_mouth', 'downward', 1, 'neutral'],
  [84, 'coruja', 'Coruja', 'Ave noturna', 'Animais', 'o_pinch', 'eye_cheek', 'static', 2, 'neutral'],
  [85, 'tubarao', 'Tubarão', 'Grande peixe marinho', 'Animais', 'flat_b', 'forehead', 'forward', 1, 'neutral'],
  [86, 'golfinho', 'Golfinho', 'Mamífero marinho', 'Animais', 'flat_b', 'neutral_space', 'wave', 1, 'positive_smile'],
  [87, 'baleia', 'Baleia', 'Grande mamífero oceânico', 'Animais', 'y_shape', 'neutral_space', 'wave', 1, 'neutral'],
  [88, 'polvo', 'Polvo', 'Molusco marinho com tentáculos', 'Animais', 'open_5', 'neutral_space', 'downward', 2, 'neutral'],
  [89, 'agua', 'Água', 'Líquido essencial à vida', 'Natureza', 'l_shape', 'chin', 'wave', 1, 'neutral'],
  [90, 'fogo', 'Fogo', 'Chama e calor intenso', 'Natureza', 'open_5', 'neutral_space', 'vertical', 2, 'neutral'],
  [91, 'terra', 'Terra', 'Solo ou planeta Terra', 'Natureza', 'open_5', 'neutral_space', 'circular', 2, 'neutral'],
  [92, 'ar', 'Ar', 'Atmosfera que respiramos', 'Natureza', 'open_5', 'chest', 'wave', 2, 'neutral'],
  [93, 'sol', 'Sol', 'Estrela que ilumina o dia', 'Natureza', 'c_shape', 'forehead', 'circular', 1, 'positive_smile'],
  [94, 'lua', 'Lua', 'Satélite natural visível à noite', 'Natureza', 'c_shape', 'forehead', 'static', 1, 'neutral'],
  [95, 'estrela', 'Estrela', 'Astro luminoso no céu', 'Natureza', 'o_pinch', 'forehead', 'vertical', 2, 'positive_smile'],
  [96, 'ceu', 'Céu', 'Espaço azul acima da terra', 'Natureza', 'flat_b', 'forehead', 'wave', 1, 'neutral'],
  [97, 'nuvem', 'Nuvem', 'Massa de vapor no céu', 'Natureza', 'open_5', 'forehead', 'circular', 2, 'neutral'],
  [98, 'chuva', 'Chuva', 'Água que cai das nuvens', 'Natureza', 'open_5', 'forehead', 'downward', 2, 'neutral'],
  [99, 'vento', 'Vento', 'Movimento natural do ar', 'Natureza', 'open_5', 'eye_cheek', 'wave', 2, 'neutral'],
  [100, 'rio', 'Rio', 'Curso natural de água doce', 'Natureza', 'flat_b', 'neutral_space', 'wave', 2, 'neutral'],
  [101, 'mar', 'Mar', 'Grande extensão de água salgada', 'Natureza', 'open_5', 'neutral_space', 'wave', 2, 'neutral'],
  [102, 'montanha', 'Montanha', 'Grande elevação natural do terreno', 'Natureza', 'flat_b', 'neutral_space', 'vertical', 2, 'neutral'],
  [103, 'arvore', 'Árvore', 'Planta alta com tronco e copa', 'Natureza', 'open_5', 'neutral_space', 'circular', 2, 'neutral'],
  [104, 'flor', 'Flor', 'Parte colorida e aromática da planta', 'Natureza', 'o_pinch', 'nose_mouth', 'tap', 1, 'positive_smile'],
  [105, 'folha', 'Folha', 'Parte verde dos galhos', 'Natureza', 'flat_b', 'neutral_space', 'wave', 2, 'neutral'],
  [106, 'fruta', 'Fruta', 'Alimento vindo das plantas', 'Alimentos e Bebidas', 'f_shape', 'chin', 'circular', 1, 'neutral'],
  [107, 'maca', 'Maçã', 'Fruta vermelha ou verde', 'Alimentos e Bebidas', 'c_shape', 'nose_mouth', 'tap', 1, 'neutral'],
  [108, 'banana', 'Banana', 'Fruta amarela alongada', 'Alimentos e Bebidas', 'point_1', 'neutral_space', 'downward', 2, 'neutral'],
  [109, 'laranja', 'Laranja', 'Fruta cítrica', 'Alimentos e Bebidas', 'fist_s', 'nose_mouth', 'tap', 1, 'neutral'],
  [110, 'uva', 'Uva', 'Fruta pequena em cachos', 'Alimentos e Bebidas', 'o_pinch', 'nose_mouth', 'downward', 1, 'neutral'],
  [111, 'morango', 'Morango', 'Fruta vermelha pequena', 'Alimentos e Bebidas', 'o_pinch', 'chin', 'tap', 1, 'positive_smile'],
  [112, 'abacaxi', 'Abacaxi', 'Fruta tropical com coroa', 'Alimentos e Bebidas', 'open_5', 'neutral_space', 'vertical', 2, 'neutral'],
  [113, 'melancia', 'Melancia', 'Fruta grande e suculenta', 'Alimentos e Bebidas', 'c_shape', 'nose_mouth', 'wave', 2, 'neutral'],
  [114, 'pao', 'Pão', 'Alimento assado de farinha', 'Alimentos e Bebidas', 'c_shape', 'neutral_space', 'wave', 2, 'neutral'],
  [115, 'leite', 'Leite', 'Bebida branca nutritiva', 'Alimentos e Bebidas', 'fist_s', 'neutral_space', 'vertical', 2, 'neutral'],
  [116, 'cafe', 'Café', 'Bebida quente escura', 'Alimentos e Bebidas', 'c_shape', 'nose_mouth', 'circular', 1, 'neutral'],
  [117, 'cha', 'Chá', 'Bebida preparada em infusão', 'Alimentos e Bebidas', 'o_pinch', 'neutral_space', 'vertical', 2, 'neutral'],
  [118, 'suco', 'Suco', 'Bebida extraída de frutas', 'Alimentos e Bebidas', 'c_shape', 'nose_mouth', 'tap', 1, 'neutral'],
  [119, 'arroz', 'Arroz', 'Grão básico das refeições', 'Alimentos e Bebidas', 'o_pinch', 'neutral_space', 'vertical', 2, 'neutral'],
  [120, 'feijao', 'Feijão', 'Grão cozido típico das refeições', 'Alimentos e Bebidas', 'o_pinch', 'neutral_space', 'circular', 2, 'neutral'],
  [121, 'carne', 'Carne', 'Alimento de origem animal', 'Alimentos e Bebidas', 'o_pinch', 'neutral_space', 'tap', 2, 'neutral'],
  [122, 'frango', 'Frango', 'Carne de ave', 'Alimentos e Bebidas', 'o_pinch', 'nose_mouth', 'tap', 1, 'neutral'],
  [123, 'ovo', 'Ovo', 'Alimento oval nutritivo', 'Alimentos e Bebidas', 'o_pinch', 'neutral_space', 'downward', 2, 'neutral'],
  [124, 'queijo', 'Queijo', 'Derivado sólido do leite', 'Alimentos e Bebidas', 'l_shape', 'eye_cheek', 'downward', 1, 'neutral'],
  [125, 'manteiga', 'Manteiga', 'Pasta cremosa derivada do leite', 'Alimentos e Bebidas', 'u_2', 'neutral_space', 'wave', 2, 'neutral'],
  [126, 'acucar', 'Açúcar', 'Ingrediente doce', 'Alimentos e Bebidas', 'u_2', 'nose_mouth', 'wave', 1, 'neutral'],
  [127, 'sal', 'Sal', 'Tempero salgado', 'Alimentos e Bebidas', 'v_2', 'nose_mouth', 'tap', 1, 'neutral'],
  [128, 'comida', 'Comida', 'Alimento em geral', 'Alimentos e Bebidas', 'o_pinch', 'nose_mouth', 'tap', 1, 'neutral'],
  [129, 'comer', 'Comer', 'Ato de se alimentar', 'Alimentos e Bebidas', 'o_pinch', 'nose_mouth', 'tap', 1, 'neutral'],
  [130, 'beber', 'Beber', 'Ato de ingerir líquidos', 'Alimentos e Bebidas', 'c_shape', 'nose_mouth', 'vertical', 1, 'neutral'],
  [131, 'casa', 'Casa', 'Moradia ou lar', 'Casa e Escola', 'flat_b', 'neutral_space', 'static', 2, 'neutral'],
  [132, 'quarto', 'Quarto', 'Cômodo de descanso', 'Casa e Escola', 'flat_b', 'eye_cheek', 'static', 2, 'neutral'],
  [133, 'cozinha', 'Cozinha', 'Cômodo de preparo de alimentos', 'Casa e Escola', 'c_shape', 'neutral_space', 'wave', 2, 'neutral'],
  [134, 'banheiro', 'Banheiro', 'Cômodo de higiene pessoal', 'Casa e Escola', 'point_1', 'neutral_space', 'wave', 1, 'neutral'],
  [135, 'sala', 'Sala', 'Cômodo de convivência', 'Casa e Escola', 'l_shape', 'neutral_space', 'circular', 2, 'neutral'],
  [136, 'porta', 'Porta', 'Abertura de entrada e saída', 'Casa e Escola', 'flat_b', 'neutral_space', 'forward', 2, 'neutral'],
  [137, 'janela', 'Janela', 'Abertura para luz e ventilação', 'Casa e Escola', 'flat_b', 'neutral_space', 'vertical', 2, 'neutral'],
  [138, 'mesa', 'Mesa', 'Móvel com tampo plano', 'Casa e Escola', 'flat_b', 'neutral_space', 'wave', 2, 'neutral'],
  [139, 'cadeira', 'Cadeira', 'Assento individual com encosto', 'Casa e Escola', 'u_2', 'neutral_space', 'tap', 2, 'neutral'],
  [140, 'cama', 'Cama', 'Móvel usado para dormir', 'Casa e Escola', 'flat_b', 'eye_cheek', 'static', 2, 'neutral'],
  [141, 'escola', 'Escola', 'Lugar de ensino e aprendizagem', 'Casa e Escola', 'flat_b', 'neutral_space', 'tap', 2, 'neutral'],
  [142, 'professor', 'Professor', 'Profissional que ensina', 'Casa e Escola', 'k_shape', 'neutral_space', 'forward', 2, 'neutral'],
  [143, 'professora', 'Professora', 'Profissional que ensina', 'Casa e Escola', 'k_shape', 'chin', 'forward', 2, 'neutral'],
  [144, 'aluno', 'Aluno', 'Estudante do sexo masculino', 'Casa e Escola', 'thumb_a', 'neutral_space', 'tap', 1, 'neutral'],
  [145, 'aluna', 'Aluna', 'Estudante do sexo feminino', 'Casa e Escola', 'thumb_a', 'chin', 'tap', 1, 'neutral'],
  [146, 'livro', 'Livro', 'Obra para leitura', 'Casa e Escola', 'flat_b', 'neutral_space', 'forward', 2, 'neutral'],
  [147, 'caderno', 'Caderno', 'Material de anotações', 'Casa e Escola', 'flat_b', 'neutral_space', 'downward', 2, 'neutral'],
  [148, 'caneta', 'Caneta', 'Objeto de escrita com tinta', 'Casa e Escola', 'o_pinch', 'neutral_space', 'wave', 2, 'neutral'],
  [149, 'lapis', 'Lápis', 'Objeto de escrita com grafite', 'Casa e Escola', 'o_pinch', 'neutral_space', 'wave', 2, 'neutral'],
  [150, 'prova', 'Prova', 'Avaliação escolar ou exame', 'Casa e Escola', 'flat_b', 'neutral_space', 'downward', 2, 'neutral'],
  [151, 'estudar', 'Estudar', 'Dedicar-se a aprender', 'Casa e Escola', 'flat_b', 'neutral_space', 'tap', 2, 'neutral'],
  [152, 'aprender', 'Aprender', 'Adquirir conhecimento', 'Casa e Escola', 'open_5', 'forehead', 'tap', 1, 'neutral'],
  [153, 'ensinar', 'Ensinar', 'Transmitir conhecimento', 'Casa e Escola', 'o_pinch', 'forehead', 'forward', 2, 'neutral'],
  [154, 'ler', 'Ler', 'Interpretar textos escritos', 'Casa e Escola', 'v_2', 'neutral_space', 'vertical', 2, 'neutral'],
  [155, 'escrever', 'Escrever', 'Registrar palavras por escrito', 'Casa e Escola', 'o_pinch', 'neutral_space', 'wave', 2, 'neutral'],
  [156, 'trabalhar', 'Trabalhar', 'Exercer atividade profissional', 'Trabalho e Lugares', 'l_shape', 'neutral_space', 'forward', 2, 'neutral'],
  [157, 'trabalho', 'Trabalho', 'Ocupação ou ofício', 'Trabalho e Lugares', 'l_shape', 'neutral_space', 'forward', 2, 'neutral'],
  [158, 'dinheiro', 'Dinheiro', 'Valor monetário', 'Trabalho e Lugares', 'o_pinch', 'neutral_space', 'tap', 1, 'neutral'],
  [159, 'comprar', 'Comprar', 'Adquirir algo mediante pagamento', 'Trabalho e Lugares', 'o_pinch', 'neutral_space', 'forward', 2, 'neutral'],
  [160, 'vender', 'Vender', 'Oferecer algo em troca de valor', 'Trabalho e Lugares', 'o_pinch', 'neutral_space', 'forward', 2, 'neutral'],
  [161, 'pagar', 'Pagar', 'Quitar um valor devido', 'Trabalho e Lugares', 'point_1', 'neutral_space', 'forward', 2, 'neutral'],
  [162, 'cidade', 'Cidade', 'Área urbana povoada', 'Trabalho e Lugares', 'flat_b', 'neutral_space', 'tap', 2, 'neutral'],
  [163, 'rua', 'Rua', 'Via pública urbana', 'Trabalho e Lugares', 'flat_b', 'neutral_space', 'forward', 2, 'neutral'],
  [164, 'mercado', 'Mercado', 'Local de compras e mantimentos', 'Trabalho e Lugares', 'three_3', 'neutral_space', 'forward', 2, 'neutral'],
  [165, 'hospital', 'Hospital', 'Centro de atendimento médico', 'Trabalho e Lugares', 'point_1', 'forehead', 'tap', 1, 'neutral'],
  [166, 'banco', 'Banco', 'Instituição financeira', 'Trabalho e Lugares', 'flat_b', 'neutral_space', 'tap', 2, 'neutral'],
  [167, 'igreja', 'Igreja', 'Templo religioso', 'Trabalho e Lugares', 'flat_b', 'neutral_space', 'static', 2, 'neutral'],
  [168, 'parque', 'Parque', 'Área verde para lazer', 'Trabalho e Lugares', 'open_5', 'neutral_space', 'circular', 2, 'positive_smile'],
  [169, 'praia', 'Praia', 'Faixa de areia à beira-mar', 'Trabalho e Lugares', 'open_5', 'neutral_space', 'wave', 2, 'positive_smile'],
  [170, 'carro', 'Carro', 'Veículo automóvel', 'Transporte e Ações', 'fist_s', 'neutral_space', 'wave', 2, 'neutral'],
  [171, 'onibus', 'Ônibus', 'Transporte coletivo rodoviário', 'Transporte e Ações', 'fist_s', 'neutral_space', 'forward', 2, 'neutral'],
  [172, 'moto', 'Moto', 'Veículo motorizado de duas rodas', 'Transporte e Ações', 'fist_s', 'neutral_space', 'vertical', 2, 'neutral'],
  [173, 'bicicleta', 'Bicicleta', 'Veículo de duas rodas a pedal', 'Transporte e Ações', 'fist_s', 'neutral_space', 'circular', 2, 'neutral'],
  [174, 'trem', 'Trem', 'Transporte ferroviário sobre trilhos', 'Transporte e Ações', 'u_2', 'neutral_space', 'forward', 2, 'neutral'],
  [175, 'aviao', 'Avião', 'Aeronave de transporte aéreo', 'Transporte e Ações', 'y_shape', 'neutral_space', 'forward', 1, 'neutral'],
  [176, 'barco', 'Barco', 'Embarcação aquática', 'Transporte e Ações', 'flat_b', 'neutral_space', 'wave', 2, 'neutral'],
  [177, 'andar', 'Andar', 'Caminhar a pé', 'Transporte e Ações', 'v_2', 'neutral_space', 'forward', 1, 'neutral'],
  [178, 'correr', 'Correr', 'Deslocar-se com rapidez', 'Transporte e Ações', 'l_shape', 'neutral_space', 'forward', 2, 'neutral'],
  [179, 'pular', 'Pular', 'Dar saltos', 'Transporte e Ações', 'v_2', 'neutral_space', 'vertical', 2, 'neutral'],
  [180, 'sentar', 'Sentar', 'Acomodar-se em assento', 'Transporte e Ações', 'u_2', 'neutral_space', 'downward', 2, 'neutral'],
  [181, 'levantar', 'Levantar', 'Ficar de pé ou erguer-se', 'Transporte e Ações', 'v_2', 'neutral_space', 'vertical', 2, 'neutral'],
  [182, 'dormir', 'Dormir', 'Repousar em sono', 'Transporte e Ações', 'open_5', 'eye_cheek', 'downward', 1, 'neutral'],
  [183, 'acordar', 'Acordar', 'Despertar do sono', 'Transporte e Ações', 'o_pinch', 'eye_cheek', 'vertical', 2, 'neutral'],
  [184, 'falar', 'Falar', 'Expressar-se verbalmente', 'Transporte e Ações', 'four_4', 'nose_mouth', 'forward', 1, 'neutral'],
  [185, 'ouvir', 'Ouvir', 'Perceber sons', 'Transporte e Ações', 'point_1', 'ear', 'tap', 1, 'neutral'],
  [186, 'ver', 'Ver', 'Perceber pela visão', 'Transporte e Ações', 'v_2', 'eye_cheek', 'forward', 1, 'neutral'],
  [187, 'olhar', 'Olhar', 'Direcionar a visão para algo', 'Transporte e Ações', 'v_2', 'eye_cheek', 'forward', 1, 'neutral'],
  [188, 'gostar', 'Gostar', 'Ter apreço ou preferência', 'Sentimentos', 'open_5', 'chest', 'circular', 1, 'positive_smile'],
  [189, 'amar', 'Amar', 'Sentir amor profundo', 'Sentimentos', 'ily_love', 'chest', 'static', 1, 'positive_smile'],
  [190, 'querer', 'Querer', 'Ter desejo ou vontade', 'Transporte e Ações', 'open_5', 'neutral_space', 'forward', 2, 'neutral'],
  [191, 'poder', 'Poder', 'Ter capacidade ou permissão', 'Transporte e Ações', 'fist_s', 'neutral_space', 'downward', 2, 'neutral'],
  [192, 'precisar', 'Precisar', 'Ter necessidade de algo', 'Transporte e Ações', 'u_2', 'neutral_space', 'downward', 1, 'neutral'],
  [193, 'fazer', 'Fazer', 'Realizar ou executar uma ação', 'Transporte e Ações', 'fist_s', 'neutral_space', 'circular', 2, 'neutral'],
  [194, 'ir', 'Ir', 'Deslocar-se para outro lugar', 'Transporte e Ações', 'point_1', 'neutral_space', 'forward', 1, 'neutral'],
  [195, 'vir', 'Vir', 'Aproximar-se de quem fala', 'Transporte e Ações', 'point_1', 'neutral_space', 'forward', 1, 'neutral'],
  [196, 'ficar', 'Ficar', 'Permanecer em um lugar ou estado', 'Transporte e Ações', 'y_shape', 'neutral_space', 'downward', 1, 'neutral'],
  [197, 'sair', 'Sair', 'Deixar um ambiente', 'Transporte e Ações', 'flat_b', 'neutral_space', 'forward', 2, 'neutral'],
  [198, 'entrar', 'Entrar', 'Ingressar em um ambiente', 'Transporte e Ações', 'flat_b', 'neutral_space', 'forward', 2, 'neutral'],
  [199, 'abrir', 'Abrir', 'Destrancar ou afastar o que fecha', 'Transporte e Ações', 'flat_b', 'neutral_space', 'wave', 2, 'neutral'],
  [200, 'fechar', 'Fechar', 'Encerrar ou tapar uma abertura', 'Transporte e Ações', 'flat_b', 'neutral_space', 'wave', 2, 'neutral'],
  [201, 'feliz', 'Feliz', 'Estado de alegria', 'Sentimentos', 'f_shape', 'chest', 'vertical', 2, 'positive_smile'],
  [202, 'triste', 'Triste', 'Estado de abatimento ou melancolia', 'Sentimentos', 'y_shape', 'chin', 'downward', 1, 'neutral'],
  [203, 'bravo', 'Bravo', 'Estado de irritação ou raiva', 'Sentimentos', 'open_5', 'chest', 'vertical', 1, 'wh_brows_furrowed'],
  [204, 'cansado', 'Cansado', 'Sem energia física ou mental', 'Sentimentos', 'open_5', 'chest', 'downward', 2, 'neutral'],
  [205, 'cansada', 'Cansada', 'Sem energia física ou mental', 'Sentimentos', 'open_5', 'chest', 'downward', 2, 'neutral'],
  [206, 'com-medo', 'Com medo', 'Sentimento de receio ou temor', 'Sentimentos', 'open_5', 'chest', 'tap', 2, 'wh_brows_furrowed'],
  [207, 'calmo', 'Calmo', 'Estado de tranquilidade', 'Sentimentos', 'flat_b', 'chest', 'downward', 2, 'neutral'],
  [208, 'animado', 'Animado', 'Estado de entusiasmo', 'Sentimentos', 'open_5', 'chest', 'vertical', 2, 'positive_smile'],
  [209, 'vergonha', 'Vergonha', 'Sentimento de timidez ou acanhamento', 'Sentimentos', 'flat_b', 'eye_cheek', 'tap', 1, 'neutral'],
  [210, 'saudade', 'Saudade', 'Lembrança afetuosa de algo distante', 'Sentimentos', 'fist_s', 'chest', 'circular', 1, 'neutral'],
  [211, 'amor', 'Amor', 'Sentimento profundo de afeto', 'Sentimentos', 'ily_love', 'chest', 'static', 1, 'positive_smile'],
  [212, 'paz', 'Paz', 'Harmonia e ausência de conflito', 'Sentimentos', 'v_2', 'chest', 'downward', 2, 'positive_smile'],
  [213, 'alegria', 'Alegria', 'Sentimento vivo de contentamento', 'Sentimentos', 'open_5', 'chest', 'circular', 2, 'positive_smile'],
  [214, 'hoje', 'Hoje', 'O dia presente', 'Tempo', 'flat_b', 'neutral_space', 'downward', 2, 'neutral'],
  [215, 'ontem', 'Ontem', 'O dia anterior a hoje', 'Tempo', 'l_shape', 'shoulder', 'wave', 1, 'neutral'],
  [216, 'amanha', 'Amanhã', 'O dia seguinte a hoje', 'Tempo', 'point_1', 'forehead', 'forward', 1, 'neutral'],
  [217, 'agora', 'Agora', 'Neste exato momento', 'Tempo', 'flat_b', 'neutral_space', 'downward', 2, 'neutral'],
  [218, 'sempre', 'Sempre', 'Em todos os momentos', 'Tempo', 'point_1', 'neutral_space', 'circular', 1, 'neutral'],
  [219, 'nunca', 'Nunca', 'Em nenhum momento', 'Tempo', 'flat_b', 'neutral_space', 'wave', 1, 'wh_brows_furrowed'],
  [220, 'cedo', 'Cedo', 'Antes do horário habitual', 'Tempo', 'o_pinch', 'neutral_space', 'tap', 1, 'neutral'],
  [221, 'tarde', 'Tarde', 'Período após o meio-dia ou atrasado', 'Tempo', 'flat_b', 'neutral_space', 'downward', 2, 'neutral'],
  [222, 'dia', 'Dia', 'Período de claridade ou vinte e quatro horas', 'Tempo', 'point_1', 'forehead', 'circular', 1, 'neutral'],
  [223, 'noite', 'Noite', 'Período escuro após o pôr do sol', 'Tempo', 'flat_b', 'neutral_space', 'downward', 2, 'neutral'],
  [224, 'semana', 'Semana', 'Período de sete dias', 'Tempo', 'flat_b', 'neutral_space', 'forward', 2, 'neutral'],
  [225, 'mes', 'Mês', 'Divisão do ano em cerca de trinta dias', 'Tempo', 'point_1', 'neutral_space', 'downward', 2, 'neutral'],
  [226, 'ano', 'Ano', 'Período de doze meses', 'Tempo', 'fist_s', 'neutral_space', 'circular', 2, 'neutral'],
  [227, 'hora', 'Hora', 'Unidade de tempo de sessenta minutos', 'Tempo', 'point_1', 'neutral_space', 'tap', 2, 'neutral'],
  [228, 'tempo', 'Tempo', 'Duração dos acontecimentos ou clima', 'Tempo', 'point_1', 'neutral_space', 'circular', 2, 'neutral'],
  [229, 'vermelho', 'Vermelho', 'Cor viva associada ao rubor', 'Cores', 'point_1', 'nose_mouth', 'downward', 1, 'neutral'],
  [230, 'azul', 'Azul', 'Cor do céu limpo', 'Cores', 'l_shape', 'neutral_space', 'forward', 1, 'neutral'],
  [231, 'amarelo', 'Amarelo', 'Cor luminosa como o sol', 'Cores', 'point_1', 'nose_mouth', 'downward', 1, 'neutral'],
  [232, 'verde', 'Verde', 'Cor das folhas e matas', 'Cores', 'v_2', 'neutral_space', 'wave', 2, 'neutral'],
  [233, 'laranja-cor', 'Laranja (cor)', 'Cor entre o vermelho e o amarelo', 'Cores', 'fist_s', 'nose_mouth', 'tap', 1, 'neutral'],
  [234, 'roxo', 'Roxo', 'Cor violeta intensa', 'Cores', 'r_shape', 'neutral_space', 'wave', 2, 'neutral'],
  [235, 'rosa', 'Rosa', 'Cor suave entre vermelho e branco', 'Cores', 'r_shape', 'eye_cheek', 'circular', 1, 'neutral'],
  [236, 'preto', 'Preto', 'Cor mais escura', 'Cores', 'fist_s', 'forehead', 'circular', 1, 'neutral'],
  [237, 'branco', 'Branco', 'Cor mais clara', 'Cores', 'flat_b', 'neutral_space', 'downward', 2, 'neutral'],
  [238, 'cinza', 'Cinza', 'Cor intermediária entre preto e branco', 'Cores', 'c_shape', 'neutral_space', 'wave', 2, 'neutral'],
  [239, 'marrom', 'Marrom', 'Cor da terra e madeira', 'Cores', 'three_3', 'neutral_space', 'wave', 2, 'neutral'],
  [240, 'grande', 'Grande', 'De tamanho elevado', 'Adjetivos', 'open_5', 'neutral_space', 'wave', 2, 'neutral'],
  [241, 'pequeno', 'Pequeno', 'De tamanho reduzido', 'Adjetivos', 'o_pinch', 'neutral_space', 'static', 1, 'neutral'],
  [242, 'bonito', 'Bonito', 'Que tem beleza', 'Adjetivos', 'open_5', 'eye_cheek', 'circular', 1, 'positive_smile'],
  [243, 'bonita', 'Bonita', 'Que tem beleza', 'Adjetivos', 'open_5', 'eye_cheek', 'circular', 1, 'positive_smile'],
  [244, 'feio', 'Feio', 'Sem atrativo estético', 'Adjetivos', 'f_shape', 'chin', 'forward', 1, 'wh_brows_furrowed'],
  [245, 'novo', 'Novo', 'Recente ou pouco usado', 'Adjetivos', 'flat_b', 'neutral_space', 'forward', 2, 'neutral'],
  [246, 'velho', 'Velho', 'Antigo ou de idade avançada', 'Adjetivos', 'fist_s', 'chin', 'downward', 1, 'neutral'],
  [247, 'quente', 'Quente', 'Com temperatura elevada', 'Adjetivos', 'open_5', 'nose_mouth', 'forward', 1, 'neutral'],
  [248, 'frio', 'Frio', 'Com temperatura baixa', 'Adjetivos', 'fist_s', 'chest', 'wave', 2, 'neutral'],
  [249, 'bom', 'Bom', 'De boa qualidade ou positivo', 'Adjetivos', 'thumb_a', 'nose_mouth', 'forward', 1, 'positive_smile'],
  [250, 'ruim', 'Ruim', 'De má qualidade ou negativo', 'Adjetivos', 'open_5', 'nose_mouth', 'downward', 1, 'wh_brows_furrowed'],
  [251, 'rapido', 'Rápido', 'Com grande velocidade', 'Adjetivos', 'point_1', 'neutral_space', 'forward', 1, 'neutral'],
  [252, 'devagar', 'Devagar', 'Com movimento lento', 'Adjetivos', 'flat_b', 'neutral_space', 'downward', 2, 'neutral'],
  [253, 'facil', 'Fácil', 'Que não exige grande esforço', 'Adjetivos', 'flat_b', 'chin', 'forward', 1, 'positive_smile'],
  [254, 'dificil', 'Difícil', 'Que exige esforço ou atenção', 'Adjetivos', 'point_1', 'forehead', 'circular', 1, 'wh_brows_furrowed'],
  [255, 'certo', 'Certo', 'Correto ou exato', 'Adjetivos', 'point_1', 'neutral_space', 'downward', 2, 'neutral']
];

// ============================================================================
// ONDE COLOCAR SUAS URLs REAIS DE VÍDEO:
// Adicione abaixo no objeto `URLS_REAIS` usando o slug (ex: 'oi', 'bom-dia', 'abelha')
// ou o nome do sinal (ex: 'Bom dia', 'Olá', 'Abelha').
// ============================================================================
export const URLS_REAIS: Record<string, string> = {
'Oi': 'https://libras.se/assets/videos/sinais/ola.mp4',
'oi': 'https://libras.se/assets/videos/sinais/ola.mp4',
'Olá': 'https://libras.se/assets/videos/sinais/ola.mp4',
'ola': 'https://libras.se/assets/videos/sinais/ola.mp4',
'Tudo bem': 'https://libras.se/assets/videos/sinais-canal/tudo-bem.mp4',
'tudo-bem': 'https://libras.se/assets/videos/sinais-canal/tudo-bem.mp4',
'Bom dia': 'https://libras.se/assets/videos/sinais-canal/bom-dia.mp4',
'bom-dia': 'https://libras.se/assets/videos/sinais-canal/bom-dia.mp4',
'Boa tarde': 'https://libras.se/assets/videos/sinais/boa-tarde.mp4',
'boa-tarde': 'https://libras.se/assets/videos/sinais/boa-tarde.mp4',
'Boa noite': 'https://youtu.be/4SsEeU5lAZc',
'boa-noite': 'https://youtu.be/4SsEeU5lAZc',
'Tchau': 'https://libras.se/assets/videos/sinais/tchau.mp4',
'tchau': 'https://libras.se/assets/videos/sinais/tchau.mp4',
'Por favor': 'https://libras.se/assets/videos/sinais-canal/por-favor.mp4',
'por-favor': 'https://libras.se/assets/videos/sinais-canal/por-favor.mp4',
'Obrigado': 'https://libras.se/assets/videos/sinais/obrigado.mp4',
'obrigado': 'https://libras.se/assets/videos/sinais/obrigado.mp4',
'Obrigada': 'https://libras.se/assets/videos/sinais/obrigado.mp4',
'obrigada': 'https://libras.se/assets/videos/sinais/obrigado.mp4',
'Desculpa': 'https://libras.se/assets/videos/sinais/desculpa.mp4',
'desculpa': 'https://libras.se/assets/videos/sinais/desculpa.mp4',
'Com licença': 'https://libras.se/assets/videos/sinais-canal/com-licenca.mp4',
'com-licenca': 'https://libras.se/assets/videos/sinais-canal/com-licenca.mp4',
'Sim': 'https://youtu.be/4_gsOiAvvoI',
'sim': 'https://youtu.be/4_gsOiAvvoI',
'Não': 'https://youtu.be/g5uLm2N0mY0',
'nao': 'https://youtu.be/g5uLm2N0mY0',
'Ajuda': 'https://youtu.be/fFKvNicVieA',
'ajuda': 'https://youtu.be/fFKvNicVieA',
'Entender': 'https://youtu.be/Dx7a8eWuLtY',
'entender': 'https://youtu.be/Dx7a8eWuLtY',
'Não entender': 'https://youtu.be/Hqjg-i_QYXY',
'nao-entender': 'https://youtu.be/Hqjg-i_QYXY',
'Sinal': 'https://youtu.be/afyHQ9CdLS0',
'sinal': 'https://youtu.be/afyHQ9CdLS0',
'Libras': 'https://libras.se/assets/videos/sinais-canal/libras.mp4',
'libras': 'https://libras.se/assets/videos/sinais-canal/libras.mp4',
'Nome': 'https://youtu.be/TotOUnrWBdI',
'nome': 'https://youtu.be/TotOUnrWBdI',
'Eu': 'https://libras.se/assets/videos/sinais/eu.mp4',
'eu': 'https://libras.se/assets/videos/sinais/eu.mp4',
'Você': 'https://libras.se/assets/videos/sinais/voce.mp4',
'voce': 'https://libras.se/assets/videos/sinais/voce.mp4',
'Nós': 'https://youtu.be/SdoCx3B4Xhw',
'nos': 'https://youtu.be/SdoCx3B4Xhw',
'Eles': 'https://youtu.be/5EpuNNwUrtA',
'eles': 'https://youtu.be/5EpuNNwUrtA',
'Meu': 'https://youtu.be/BEOe6bFd2H0',
'meu': 'https://youtu.be/BEOe6bFd2H0',
'Seu': 'https://youtu.be/mGvMnU4Aqig',
'seu': 'https://youtu.be/mGvMnU4Aqig',
'Onde': 'https://youtu.be/z0MjD6ArT7M',
'onde': 'https://youtu.be/z0MjD6ArT7M',
'Quem': 'https://youtu.be/wbUrt0v6quc',
'quem': 'https://youtu.be/wbUrt0v6quc',
'O quê': 'https://youtu.be/NmMfebF97L8',
'o-que': 'https://youtu.be/NmMfebF97L8',
'Quando': 'https://youtu.be/OcuB515J_VU',
'quando': 'https://youtu.be/OcuB515J_VU',
'Por que': 'https://youtu.be/37AwCyd4QoE',
'por-que': 'https://youtu.be/37AwCyd4QoE',
'Como': 'https://www.youtube.com/shorts/AqZpws2Ddoc?feature=share',
'como': 'https://www.youtube.com/shorts/AqZpws2Ddoc?feature=share',
'Qual': 'https://youtu.be/VBx6O6rtF9k',
'qual': 'https://youtu.be/VBx6O6rtF9k',
'Quantos': 'https://youtu.be/aJRu8zmS5hU',
'quantos': 'https://youtu.be/aJRu8zmS5hU',
'Mãe': 'https://youtu.be/IljftNTMgqU',
'mae': 'https://youtu.be/IljftNTMgqU',
'Pai': 'https://libras.se/assets/videos/sinais/pai.mp4',
'pai': 'https://libras.se/assets/videos/sinais/pai.mp4',
'Irmão': 'https://libras.se/assets/videos/sinais/irmao.mp4',
'irmao': 'https://libras.se/assets/videos/sinais/irmao.mp4',
'Irmã': 'https://libras.se/assets/videos/sinais/irma.mp4',
'irma': 'https://libras.se/assets/videos/sinais/irma.mp4',
'Filho': 'https://libras.se/assets/videos/sinais/filho.mp4',
'filho': 'https://libras.se/assets/videos/sinais/filho.mp4',
'Filha': 'https://libras.se/assets/videos/sinais/filha.mp4',
'filha': 'https://libras.se/assets/videos/sinais/filha.mp4',
'Avô': 'https://youtu.be/Les9uc10LdY',
'avo': 'https://youtu.be/Les9uc10LdY',
'Avó': 'https://youtu.be/m0j6_6SG3F8',
'avo-feminino': 'https://youtu.be/m0j6_6SG3F8',
'Tio': 'https://youtu.be/86WmjIr6zaM',
'tio': 'https://youtu.be/86WmjIr6zaM',
'Tia': 'https://youtu.be/1Zxj4NDW2QE',
'tia': 'https://youtu.be/1Zxj4NDW2QE',
'Primo': 'https://youtu.be/8d7t5_IWhH0',
'primo': 'https://youtu.be/8d7t5_IWhH0',
'Prima': 'https://youtu.be/BQ0Sd5LjEiU',
'prima': 'https://youtu.be/BQ0Sd5LjEiU',
'Família': 'https://libras.se/assets/videos/sinais/familia.mp4',
'familia': 'https://libras.se/assets/videos/sinais/familia.mp4',
'Amigo': 'https://libras.se/assets/videos/sinais/amigo.mp4',
'amigo': 'https://libras.se/assets/videos/sinais/amigo.mp4',
'Amiga': 'https://youtu.be/nnenOb5Wf8Y',
'amiga': 'https://youtu.be/nnenOb5Wf8Y',
'Casamento': 'https://youtu.be/acpOxlgigE0',
'casamento': 'https://youtu.be/acpOxlgigE0',
'Bebê': 'https://libras.se/sinal/bebe/',
'bebe': 'https://libras.se/sinal/bebe/',
'Criança': 'https://youtu.be/WfvGJvIGLkY',
'crianca': 'https://youtu.be/WfvGJvIGLkY',
'Homem': 'https://youtu.be/LTS1oinrxvw',
'homem': 'https://youtu.be/LTS1oinrxvw',
'Mulher': 'https://youtu.be/CiqR8IDVElA',
'mulher': 'https://youtu.be/CiqR8IDVElA',
'Pessoa': 'https://www.youtube.com/shorts/G_QvMq1nZFE?feature=share',
'pessoa': 'https://www.youtube.com/shorts/G_QvMq1nZFE?feature=share',
'Abelha': 'https://libras.se/assets/videos/sinais/abelha.mp4',
'abelha': 'https://libras.se/assets/videos/sinais/abelha.mp4',
'Borboleta': 'https://libras.se/assets/videos/sinais/borboleta.mp4',
'borboleta': 'https://libras.se/assets/videos/sinais/borboleta.mp4',
'Cachorro': 'https://libras.se/assets/videos/sinais/cachorro.mp4',
'cachorro': 'https://libras.se/assets/videos/sinais/cachorro.mp4',
'Gato': 'https://libras.se/assets/videos/sinais/gato.mp4',
'gato': 'https://libras.se/assets/videos/sinais/gato.mp4',
'Pássaro': 'https://libras.se/assets/videos/sinais/passaro.mp4',
'passaro': 'https://libras.se/assets/videos/sinais/passaro.mp4',
'Peixe': 'https://libras.se/assets/videos/sinais/peixe.mp4',
'peixe': 'https://libras.se/assets/videos/sinais/peixe.mp4',
'Cavalo': 'https://youtu.be/jnz4aezPOhE',
'cavalo': 'https://youtu.be/jnz4aezPOhE',
'Vaca': 'https://youtu.be/utEUnjxefGA',
'vaca': 'https://youtu.be/utEUnjxefGA',
'Boi': 'https://youtu.be/TeV052P1_vo',
'boi': 'https://youtu.be/TeV052P1_vo',
'Porco': 'https://youtu.be/5w39X0qfHyQ',
'porco': 'https://youtu.be/5w39X0qfHyQ',
'Leão': 'https://libras.se/assets/videos/sinais/leao.mp4',
'leao': 'https://libras.se/assets/videos/sinais/leao.mp4',
'Elefante': 'https://libras.se/assets/videos/sinais/elefante.mp4',
'elefante': 'https://libras.se/assets/videos/sinais/elefante.mp4',
'Macaco': 'https://libras.se/assets/videos/sinais/macaco.mp4',
'macaco': 'https://libras.se/assets/videos/sinais/macaco.mp4',
'Cobra': 'https://libras.se/assets/videos/sinais/cobra.mp4',
'cobra': 'https://libras.se/assets/videos/sinais/cobra.mp4',
'Tartaruga': 'https://libras.se/assets/videos/sinais/tartaruga.mp4',
'tartaruga': 'https://libras.se/assets/videos/sinais/tartaruga.mp4',
'Água': 'https://libras.se/assets/videos/sinais/agua.mp4',
'agua': 'https://libras.se/assets/videos/sinais/agua.mp4',
'Rio': 'https://libras.se/assets/videos/sinais-canal/rio.mp4',
'rio': 'https://libras.se/assets/videos/sinais-canal/rio.mp4',
'Montanha': 'https://libras.se/assets/videos/sinais/montanha.mp4',
'montanha': 'https://libras.se/assets/videos/sinais/montanha.mp4',
'Fruta': 'https://libras.se/assets/videos/sinais/fruta.mp4',
'fruta': 'https://libras.se/assets/videos/sinais/fruta.mp4',
'Banana': 'https://libras.se/assets/videos/sinais/banana.mp4',
'banana': 'https://libras.se/assets/videos/sinais/banana.mp4',
'Leite': 'https://libras.se/assets/videos/sinais/leite.mp4',
'leite': 'https://libras.se/assets/videos/sinais/leite.mp4',
'Café': 'https://libras.se/assets/videos/sinais/cafe.mp4',
'cafe': 'https://libras.se/assets/videos/sinais/cafe.mp4',
'Suco': 'https://libras.se/assets/videos/sinais/suco.mp4',
'suco': 'https://libras.se/assets/videos/sinais/suco.mp4',
'Arroz': 'https://libras.se/assets/videos/sinais/arroz.mp4',
'arroz': 'https://libras.se/assets/videos/sinais/arroz.mp4',
'Feijão': 'https://libras.se/assets/videos/sinais/feijao.mp4',
'feijao': 'https://libras.se/assets/videos/sinais/feijao.mp4',
'Frango': 'https://libras.se/assets/videos/sinais/frango.mp4',
'frango': 'https://libras.se/assets/videos/sinais/frango.mp4',
'Queijo': 'https://libras.se/assets/videos/sinais/queijo.mp4',
'queijo': 'https://libras.se/assets/videos/sinais/queijo.mp4',
'Comer': 'https://libras.se/assets/videos/sinais/comer.mp4',
'comer': 'https://libras.se/assets/videos/sinais/comer.mp4',
'Casa': 'https://libras.se/assets/videos/sinais/casa.mp4',
'casa': 'https://libras.se/assets/videos/sinais/casa.mp4',
'Banheiro': 'https://libras.se/assets/videos/sinais/banheiro.mp4',
'banheiro': 'https://libras.se/assets/videos/sinais/banheiro.mp4',
'Porta': 'https://libras.se/assets/videos/sinais/porta.mp4',
'porta': 'https://libras.se/assets/videos/sinais/porta.mp4',
'Janela': 'https://libras.se/assets/videos/sinais/janela.mp4',
'janela': 'https://libras.se/assets/videos/sinais/janela.mp4',
'Mesa': 'https://libras.se/assets/videos/sinais/mesa.mp4',
'mesa': 'https://libras.se/assets/videos/sinais/mesa.mp4',
'Cadeira': 'https://libras.se/assets/videos/sinais-canal/cadeira.mp4',
'cadeira': 'https://libras.se/assets/videos/sinais-canal/cadeira.mp4',
'Cama': 'https://libras.se/assets/videos/sinais/cama.mp4',
'cama': 'https://libras.se/assets/videos/sinais/cama.mp4',
'Escola': 'https://libras.se/assets/videos/sinais/escola.mp4',
'escola': 'https://libras.se/assets/videos/sinais/escola.mp4',
'Professor': 'https://libras.se/assets/videos/sinais/professor.mp4',
'professor': 'https://libras.se/assets/videos/sinais/professor.mp4',
'Professora': 'https://libras.se/assets/videos/sinais/professor.mp4',
'professora': 'https://libras.se/assets/videos/sinais/professor.mp4',
'Livro': 'https://libras.se/assets/videos/sinais/livro.mp4',
'livro': 'https://libras.se/assets/videos/sinais/livro.mp4',
'Estudar': 'https://libras.se/assets/videos/sinais/estudar.mp4',
'estudar': 'https://libras.se/assets/videos/sinais/estudar.mp4',
'Aprender': 'https://libras.se/assets/videos/sinais/aprender.mp4',
'aprender': 'https://libras.se/assets/videos/sinais/aprender.mp4',
'Ensinar': 'https://libras.se/assets/videos/sinais/ensinar.mp4',
'ensinar': 'https://libras.se/assets/videos/sinais/ensinar.mp4',
'Trabalho': 'https://libras.se/assets/videos/sinais/trabalho.mp4',
'trabalho': 'https://libras.se/assets/videos/sinais/trabalho.mp4',
'Dinheiro': 'https://libras.se/assets/videos/sinais/dinheiro.mp4',
'dinheiro': 'https://libras.se/assets/videos/sinais/dinheiro.mp4',
'Cidade': 'https://libras.se/assets/videos/sinais/cidade.mp4',
'cidade': 'https://libras.se/assets/videos/sinais/cidade.mp4',
'Mercado': 'https://libras.se/assets/videos/sinais-canal/supermercado.mp4',
'mercado': 'https://libras.se/assets/videos/sinais-canal/supermercado.mp4',
'Hospital': 'https://libras.se/assets/videos/sinais/hospital.mp4',
'hospital': 'https://libras.se/assets/videos/sinais/hospital.mp4',
'Praia': 'https://libras.se/assets/videos/sinais/praia.mp4',
'praia': 'https://libras.se/assets/videos/sinais/praia.mp4',
'Carro': 'https://libras.se/assets/videos/sinais/carro.mp4',
'carro': 'https://libras.se/assets/videos/sinais/carro.mp4',
'Ônibus': 'https://libras.se/assets/videos/sinais/onibus.mp4',
'onibus': 'https://libras.se/assets/videos/sinais/onibus.mp4',
'Barco': 'https://libras.se/assets/videos/sinais-canal/barco.mp4',
'barco': 'https://libras.se/assets/videos/sinais-canal/barco.mp4',
'Correr': 'https://libras.se/assets/videos/sinais/correr.mp4',
'correr': 'https://libras.se/assets/videos/sinais/correr.mp4',
'Falar': 'https://libras.se/assets/videos/sinais/falar.mp4',
'falar': 'https://libras.se/assets/videos/sinais/falar.mp4',
'Olhar': 'https://libras.se/assets/videos/sinais/olhar.mp4',
'olhar': 'https://libras.se/assets/videos/sinais/olhar.mp4',
'Gostar': 'https://libras.se/assets/videos/sinais/gostar.mp4',
'gostar': 'https://libras.se/assets/videos/sinais/gostar.mp4',
'Feliz': 'https://libras.se/assets/videos/sinais/feliz.mp4',
'feliz': 'https://libras.se/assets/videos/sinais/feliz.mp4',
'Triste': 'https://libras.se/assets/videos/sinais/triste.mp4',
'triste': 'https://libras.se/assets/videos/sinais/triste.mp4',
'Bravo': 'https://libras.se/sinal/bravo/',
'bravo': 'https://libras.se/sinal/bravo/',
'Cansado': 'https://libras.se/sinal/cansado/',
'cansado': 'https://libras.se/sinal/cansado/',
'Cansada': 'https://libras.se/sinal/cansado/',
'cansada': 'https://libras.se/sinal/cansado/',
'Com medo': 'https://libras.se/sinal/medo/',
'com-medo': 'https://libras.se/sinal/medo/',
'Calmo': 'https://libras.se/sinal/calmo/',
'calmo': 'https://libras.se/sinal/calmo/',
'Vergonha': 'https://libras.se/sinal/vergonha/',
'vergonha': 'https://libras.se/sinal/vergonha/',
'Saudade': 'https://libras.se/sinal/saudade/',
'saudade': 'https://libras.se/sinal/saudade/',
'Amor': 'https://libras.se/sinal/amor/',
'amor': 'https://libras.se/sinal/amor/',
'Vermelho': 'https://libras.se/sinal/vermelho/',
'vermelho': 'https://libras.se/sinal/vermelho/',
'Azul': 'https://libras.se/sinal/azul/',
'azul': 'https://libras.se/sinal/azul/',
'Amarelo': 'https://libras.se/sinal/amarelo/',
'amarelo': 'https://libras.se/sinal/amarelo/',
'Verde': 'https://libras.se/sinal/verde/',
'verde': 'https://libras.se/sinal/verde/',
'Roxo': 'https://libras.se/sinal/roxo/',
'roxo': 'https://libras.se/sinal/roxo/',
'Marrom': 'https://libras.se/sinal/marrom/',
'marrom': 'https://libras.se/sinal/marrom/',
'jacaré': 'https://youtu.be/B3lkO3vVTog',
'Jacaré': 'https://youtu.be/B3lkO3vVTog',
'grande': 'https://youtu.be/EY-voXIMhQE',
'Grande': 'https://youtu.be/EY-voXIMhQE',
'velho': 'https://youtu.be/hJEzIWhSX5s',
'Velho': 'https://youtu.be/hJEzIWhSX5s',
'poder': 'https://youtu.be/WNFF7IU54rw',
'Poder': 'https://youtu.be/WNFF7IU54rw',
'pato': 'https://youtu.be/Jby63egCQOY',
'Pato': 'https://youtu.be/Jby63egCQOY',
'preto': 'https://youtu.be/cujtTtJyV4Y',
'Preto': 'https://youtu.be/cujtTtJyV4Y',
  'amanha-eu-vou-trabalhar-no-mercado': '/assets/aistudio/amanha_trabalha_no_mercado_c0014e6d.mp4',
  'Amanhã eu vou trabalhar no mercado': '/assets/aistudio/amanha_trabalha_no_mercado_c0014e6d.mp4',
  'Oi tudo bem': '/assets/aistudio/oi_td_bem_b1c0d698.mp4',
  'Oi, tudo bem?': '/assets/aistudio/oi_td_bem_b1c0d698.mp4',
  'oi-tudo-bem': '/assets/aistudio/oi_td_bem_b1c0d698.mp4',
  'Onde você mora?': '/assets/aistudio/onde_sua_casa_5a37a97c.mp4',
  'onde-voce-mora': '/assets/aistudio/onde_sua_casa_5a37a97c.mp4',
  'Minha mãe ama a familia': '/assets/aistudio/minha_mae_ama_b2da57d0.mp4',
  'Minha mãe ama a família': '/assets/aistudio/minha_mae_ama_b2da57d0.mp4',
  'minha-mae-ama-a-familia': '/assets/aistudio/minha_mae_ama_b2da57d0.mp4',
  'Meu cachorro é bonito': '/assets/aistudio/meu_cachorro___bnt_caf3b045.mp4',
  'meu-cachorro-e-bonito': '/assets/aistudio/meu_cachorro___bnt_caf3b045.mp4',
  'Eu goto de café e pão': '/assets/aistudio/eu-gosto-cafe.mp4',
  'Eu gosto de café e pão': '/assets/aistudio/eu-gosto-cafe.mp4',
  'eu-gosto-de-cafe-e-pao': '/assets/aistudio/eu-gosto-cafe.mp4',
  'Minha escola é grande': '/assets/aistudio/minha_escola_egrande_3836a8da.mp4',
  'minha-escola-e-grande': '/assets/aistudio/minha_escola_egrande_3836a8da.mp4',
  'Hoje eu vou para a praia de ônibus': '/assets/aistudio/hj_vouapraia_de_onibus_021327d3.mp4',
  'hoje-eu-vou-para-a-praia-de-onibus': '/assets/aistudio/hj_vouapraia_de_onibus_021327d3.mp4',
  'Hoje eu estou feliz': '/assets/aistudio/hj_eu_estou_feliz_ae9563ab.mp4',
  'hoje-eu-estou-feliz': '/assets/aistudio/hj_eu_estou_feliz_ae9563ab.mp4',
  'Hoje o sol está quente': '/assets/aistudio/hj_o_sol_est__quente_1bf7e6c7.mp4',
  'hoje-o-sol-esta-quente': '/assets/aistudio/hj_o_sol_est__quente_1bf7e6c7.mp4',
};

// ============================================================================
// URLs REAIS DO ALFABETO EM LIBRAS (A-Z):
// Mapeia cada letra maiúscula para as imagens enviadas em `/assets/aistudio/`.
// ============================================================================
export const URLS_ALFABETO_REAIS: Record<string, string> = {
  A: '/assets/aistudio/a_3978a683.jpg',
  B: '/assets/aistudio/B_2b2dada8.jpeg',
  C: '/assets/aistudio/C_86988674.jpeg',
  D: '/assets/aistudio/D_033befb1.jpeg',
  E: '/assets/aistudio/E_614c55a8.jpeg',
  F: '/assets/aistudio/F_6417922e.jpeg',
  G: '/assets/aistudio/G_b46c9b5a.jpeg',
  H: '/assets/aistudio/H_aafaf3a3.jpeg',
  I: '/assets/aistudio/I_a7b27bfb.jpeg',
  J: '/assets/aistudio/J_c42f0932.jpeg',
  K: '/assets/aistudio/K_eaae6ead.jpeg',
  L: '/assets/aistudio/L_a2ddd982.jpeg',
  M: '/assets/aistudio/M_b55a0863.jpeg',
  N: '/assets/aistudio/N_a037b74b.jpeg',
  O: '/assets/aistudio/O_f47f0272.jpeg',
  P: '/assets/aistudio/P_4f17139b.jpeg',
  Q: '/assets/aistudio/Q_53e52735.jpeg',
  R: '/assets/aistudio/R_338e91b0.jpeg',
  S: '/assets/aistudio/S_5dd8227c.jpeg',
  T: '/assets/aistudio/T_9f742551.jpeg',
  U: '/assets/aistudio/U_7bb195a3.jpeg',
  V: '/assets/aistudio/V_e5f3d535.jpeg',
  W: '/assets/aistudio/W_73e1ec8e.jpeg',
  X: '/assets/aistudio/X_3e04f49a.jpeg',
  Y: '/assets/aistudio/Y_f585351d.jpeg',
  Z: '/assets/aistudio/Z_e49ef189.jpeg'
};

export function resolveAlphabetMediaUrl(letter: string): string | undefined {
  const upper = (letter || '').trim().toUpperCase();
  const lower = upper.toLowerCase();
  if (!upper) return undefined;
  return (
    URLS_ALFABETO_REAIS[upper] ||
    URLS_ALFABETO_REAIS[lower] ||
    URLS_REAIS[`letra-${lower}`] ||
    URLS_REAIS[`alfabeto-${lower}`] ||
    undefined
  );
}

function resolveCustomVideoUrl(slug: string, palavra: string): string | undefined {
  if (URLS_REAIS[slug]) return URLS_REAIS[slug];
  if (URLS_REAIS[palavra]) return URLS_REAIS[palavra];
  const normalizedTarget = normalizeLookup(palavra);
  for (const [key, url] of Object.entries(URLS_REAIS)) {
    if (normalizeLookup(key) === normalizedTarget || normalizeLookup(key) === slug) {
      return url;
    }
  }
  return undefined;
}

export const LIBRAS_SE_VIDEO_BASE_URL = 'https://libras.se/assets/videos/sinais';

export function buildSignVideoUrl(slug: string, palavra = ''): string {
  return resolveCustomVideoUrl(slug, palavra) || `${LIBRAS_SE_VIDEO_BASE_URL}/${slug}.mp4`;
}

function inferArrowDirection(
  motionType: TargetLandmarks['motionType'],
  zone: TargetArticulationZone
): SchematicArrowDirection {
  if (motionType === 'wave') return 'left_right';
  if (motionType === 'vertical' || motionType === 'downward') return 'up_down';
  if (motionType === 'circular') return 'circle';
  if (motionType === 'forward') return 'forward';
  if (motionType === 'tap') {
    if (zone === 'chin') return 'tap_chin';
    if (zone === 'forehead') return 'tap_forehead';
    if (zone === 'chest') return 'tap_chest';
  }
  return 'none';
}

interface CompoundPhaseBlueprint {
  label: string;
  handshapeId: TargetHandshapeId;
  articulationZone: TargetArticulationZone;
  motionType: TargetLandmarks['motionType'];
}

function buildPhaseFromBlueprint(bp: CompoundPhaseBlueprint): CompoundMotionPhase {
  const preset = HANDSHAPE_PRESETS[bp.handshapeId];
  return {
    label: bp.label,
    handshapeId: bp.handshapeId,
    fingers: preset.fingers,
    maxThumbIndexTipDist: preset.maxThumbIndexTipDist,
    minThumbIndexTipDist: preset.minThumbIndexTipDist,
    minIndexMiddleSpread: preset.minIndexMiddleSpread,
    maxIndexMiddleSpread: preset.maxIndexMiddleSpread,
    articulationZone: bp.articulationZone,
    motionType: bp.motionType
  };
}

const COMPOUND_SIGN_PHASES: Record<string, CompoundPhaseBlueprint[]> = {
  'bom-dia': [
    { label: 'BOM (mão próxima à boca indo à frente)', handshapeId: 'thumb_a', articulationZone: 'nose_mouth', motionType: 'forward' },
    { label: 'DIA (indicador na testa indo à frente)', handshapeId: 'point_1', articulationZone: 'forehead', motionType: 'forward' }
  ],
  'boa-tarde': [
    { label: 'BOA (mão próxima à boca indo à frente)', handshapeId: 'thumb_a', articulationZone: 'nose_mouth', motionType: 'forward' },
    { label: 'TARDE (mão plana descendo à frente)', handshapeId: 'flat_b', articulationZone: 'neutral_space', motionType: 'downward' }
  ],
  'boa-noite': [
    { label: 'BOA (mão próxima à boca indo à frente)', handshapeId: 'thumb_a', articulationZone: 'nose_mouth', motionType: 'forward' },
    { label: 'NOITE (mão fechando/descendo lateral)', handshapeId: 'flat_b', articulationZone: 'eye_cheek', motionType: 'downward' }
  ],
  'tudo-bem': [
    { label: 'TUDO (mão do queixo para fora)', handshapeId: 'flat_b', articulationZone: 'chin', motionType: 'forward' },
    { label: 'BEM (sinal positivo com polegar)', handshapeId: 'thumb_a', articulationZone: 'neutral_space', motionType: 'forward' }
  ],
  'por-favor': [
    { label: 'Passo 1 (palma junto ao rosto)', handshapeId: 'flat_b', articulationZone: 'eye_cheek', motionType: 'downward' },
    { label: 'Passo 2 (movimento suave à frente)', handshapeId: 'flat_b', articulationZone: 'chin', motionType: 'forward' }
  ],
  'com-licenca': [
    { label: 'Passo 1 (mãos em B avançando)', handshapeId: 'flat_b', articulationZone: 'neutral_space', motionType: 'forward' },
    { label: 'Passo 2 (passagem lateral suave)', handshapeId: 'flat_b', articulationZone: 'neutral_space', motionType: 'wave' }
  ]
};

function buildCatalogSign(
  numericId: number,
  slug: string,
  palavra: string,
  significado: string,
  categoria: LibrasCatalogCategory,
  handshapeId: TargetHandshapeId,
  zone: TargetArticulationZone,
  motionType: TargetLandmarks['motionType'],
  twoHanded: 1 | 2 = 1,
  expectedNmf: TargetLandmarks['expectedNmf'] = 'neutral'
): CatalogSign {
  const preset = HANDSHAPE_PRESETS[handshapeId];
  const compoundBlueprints = COMPOUND_SIGN_PHASES[slug];
  const targetLandmarks: TargetLandmarks = {
    handshapeId,
    fingers: preset.fingers,
    maxThumbIndexTipDist: preset.maxThumbIndexTipDist,
    minThumbIndexTipDist: preset.minThumbIndexTipDist,
    minIndexMiddleSpread: preset.minIndexMiddleSpread,
    maxIndexMiddleSpread: preset.maxIndexMiddleSpread,
    articulationZone: zone,
    motionType,
    twoHanded,
    expectedNmf,
    ...(compoundBlueprints ? { motionPhases: compoundBlueprints.map(buildPhaseFromBlueprint) } : {})
  };

  return {
    numericId,
    id: slug,
    slug,
    palavra,
    significado,
    categoria,
    videoUrl: buildSignVideoUrl(slug, palavra),
    referenceUrl: `https://libras.se/sinal/${slug}/`,
    targetLandmarks,
    schematicHint: {
      handshapeId,
      zone,
      motionType,
      arrowDirection: inferArrowDirection(motionType, zone)
    }
  };
}

export const LIBRAS_CATALOG_255: CatalogSign[] = RAW_SIGNS_255.map(
  ([numericId, slug, palavra, significado, categoria, handshapeId, zone, motionType, twoHanded = 1, expectedNmf = 'neutral']) =>
    buildCatalogSign(numericId, slug, palavra, significado, categoria, handshapeId, zone, motionType, twoHanded, expectedNmf)
);

const seenCatalogSlugs = new Set(LIBRAS_CATALOG_255.map((sign) => sign.slug));
let nextExtendedId = LIBRAS_CATALOG_255.length + 1;

const EXTENDED_CATALOG_SIGNS: CatalogSign[] = [];
for (const [slug, palavra, significado, categoria, handshapeId, zone, motionType, twoHanded = 1, expectedNmf = 'neutral'] of RAW_EXTENDED_SIGNS) {
  if (seenCatalogSlugs.has(slug)) continue;
  seenCatalogSlugs.add(slug);
  EXTENDED_CATALOG_SIGNS.push(
    buildCatalogSign(
      nextExtendedId++,
      slug,
      palavra,
      significado,
      categoria,
      handshapeId,
      zone,
      motionType,
      twoHanded,
      expectedNmf
    )
  );
}

export const LIBRAS_CATALOG_FULL: CatalogSign[] = [
  ...LIBRAS_CATALOG_255,
  ...EXTENDED_CATALOG_SIGNS
];

const LEGACY_SLUG_MAP: Record<string, string> = {
  sign_oi: 'oi',
  cat_oi: 'oi',
  sign_tudo_bem: 'tudo-bem',
  cat_tudo_bem: 'tudo-bem',
  sign_bom_dia: 'bom-dia',
  cat_bom_dia: 'bom-dia',
  sign_boa_tarde: 'boa-tarde',
  cat_boa_tarde: 'boa-tarde',
  sign_boa_noite: 'boa-noite',
  cat_boa_noite: 'boa-noite',
  sign_obrigado: 'obrigado',
  cat_obrigado: 'obrigado',
  sign_por_favor: 'por-favor',
  cat_por_favor: 'por-favor',
  sign_meu_nome: 'nome',
  cat_nome: 'nome',
  sign_aprender: 'aprender',
  cat_aprender: 'aprender',
  sign_saber: 'entender',
  cat_saber: 'entender',
  sign_libras: 'libras',
  cat_libras: 'libras',
  sign_casa: 'casa',
  cat_casa: 'casa',
  sign_trabalhar: 'trabalhar',
  cat_trabalhar: 'trabalhar',
  sign_ajudar: 'ajuda',
  cat_ajudar: 'ajuda',
  sign_mae: 'mae',
  cat_mae: 'mae',
  sign_pai: 'pai',
  cat_pai: 'pai',
  sign_filho: 'filho',
  cat_filho: 'filho',
  sign_amigo: 'amigo',
  cat_amigo: 'amigo',
  sign_gostar: 'gostar',
  cat_gostar: 'gostar',
  sign_desculpas: 'desculpa',
  cat_desculpa: 'desculpa',
  sign_eu_te_amo: 'amor',
  cat_eu_te_amo: 'amor',
  cat_agua: 'agua',
  cat_comer: 'comer'
};

function normalizeLookup(val: string): string {
  return val
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

export function findCatalogSign(idOrSlugOrWord: string): CatalogSign {
  const raw = (idOrSlugOrWord || '').trim();
  if (!raw) return LIBRAS_CATALOG_FULL[0];

  const mappedSlug = LEGACY_SLUG_MAP[raw] || raw.replace(/^(cat_|sign_)/, '').replace(/_/g, '-');

  const exactSlug = LIBRAS_CATALOG_FULL.find(
    (s) => s.id === raw || s.slug === raw || s.slug === mappedSlug || String(s.numericId) === raw
  );
  if (exactSlug) return exactSlug;

  const q = normalizeLookup(raw);
  const exactWord = LIBRAS_CATALOG_FULL.find(
    (s) => normalizeLookup(s.palavra) === q || normalizeLookup(s.slug) === q
  );
  if (exactWord) return exactWord;

  const partial = LIBRAS_CATALOG_FULL.find(
    (s) => normalizeLookup(s.palavra).includes(q) || normalizeLookup(s.slug).includes(q)
  );
  return partial || LIBRAS_CATALOG_FULL[0];
}

const EQUIVALENT_SIGN_GROUPS: string[][] = [
  ['oi', 'ola'],
  ['obrigado', 'obrigada'],
  ['bonito', 'bonita'],
  ['cansado', 'cansada'],
  ['amigo', 'amiga'],
  ['professor', 'professora'],
  ['aluno', 'aluna']
];

const SIGN_SYNONYM_GROUP_MAP = new Map<string, number>();
EQUIVALENT_SIGN_GROUPS.forEach((group, groupIndex) => {
  for (const slug of group) {
    SIGN_SYNONYM_GROUP_MAP.set(slug, groupIndex);
  }
});

/**
 * Retorna true se dois sinais forem iguais, compartilharem o mesmo videoUrl
 * (ex: 'oi' e 'ola'), tiverem a mesma palavra normalizada ou pertencerem ao
 * mesmo grupo de sinônimos / flexão de gênero.
 */
export function areConflictingOrEquivalentSigns(a: CatalogSign, b: CatalogSign): boolean {
  if (a.id === b.id || a.slug === b.slug) return true;
  if (a.videoUrl && b.videoUrl && a.videoUrl === b.videoUrl) return true;
  if (normalizeLookup(a.palavra) === normalizeLookup(b.palavra)) return true;

  const groupA = SIGN_SYNONYM_GROUP_MAP.get(a.slug);
  const groupB = SIGN_SYNONYM_GROUP_MAP.get(b.slug);
  if (groupA !== undefined && groupA === groupB) return true;

  return false;
}
