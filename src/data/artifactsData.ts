import { UserProfile } from '../types';

export type ArtifactRarity = 'comum' | 'raro' | 'epico' | 'lendario';

export type ArtifactCategory =
  | 'Fundamentos'
  | 'Cultura Surda'
  | 'Maestria Visual'
  | 'Ofensiva'
  | 'Coleção da Libi';

export type ArtifactIconKind =
  | 'compass'
  | 'hand_wave'
  | 'sunburst'
  | 'moon_star'
  | 'heart_ily'
  | 'crown'
  | 'flame'
  | 'shield'
  | 'gem_hex'
  | 'ribbon'
  | 'book'
  | 'eye'
  | 'spark'
  | 'trophy'
  | 'leaf'
  | 'feather'
  | 'globe'
  | 'camera'
  | 'bell'
  | 'lantern'
  | 'diamond'
  | 'scroll'
  | 'medal'
  | 'key'
  | 'rainbow_arc'
  | 'wave_crest'
  | 'owl_crest'
  | 'badge_star'
  | 'prism'
  | 'laurel';

export interface CollectibleArtifact {
  id: string;
  title: string;
  description: string;
  category: ArtifactCategory;
  rarity: ArtifactRarity;
  primaryColor: string;
  secondaryColor: string;
  bgTint: string;
  iconKind: ArtifactIconKind;
  unlockType: 'free_starter' | 'xp' | 'nodes' | 'streak' | 'section';
  threshold?: number;
  unlockHint: string;
}

export const ARTIFACTS_CATALOG: CollectibleArtifact[] = [
  // 1-6: Fundamentos
  {
    id: 'art_first_wave',
    title: 'Primeiro Aceno',
    description: 'Marca o início da sua jornada visual na Língua Brasileira de Sinais.',
    category: 'Fundamentos',
    rarity: 'comum',
    primaryColor: '#0D9488',
    secondaryColor: '#99F6E4',
    bgTint: '#F0FDFA',
    iconKind: 'hand_wave',
    unlockType: 'free_starter',
    unlockHint: 'Desbloqueado ao iniciar sua jornada'
  },
  {
    id: 'art_compass_hands',
    title: 'Bússola das Mãos',
    description: 'Domínio inicial da orientação espacial no espaço neutro.',
    category: 'Fundamentos',
    rarity: 'comum',
    primaryColor: '#0F766E',
    secondaryColor: '#5EEAD4',
    bgTint: '#F0FDFA',
    iconKind: 'compass',
    unlockType: 'nodes',
    threshold: 1,
    unlockHint: 'Conclua 1 atividade na trilha'
  },
  {
    id: 'art_dawn_sun',
    title: 'Amanhecer de Bom Dia',
    description: 'Celebra a fluência composta entre BOM e DIA no movimento completo.',
    category: 'Fundamentos',
    rarity: 'raro',
    primaryColor: '#EA580C',
    secondaryColor: '#FDE68A',
    bgTint: '#FFF7ED',
    iconKind: 'sunburst',
    unlockType: 'nodes',
    threshold: 3,
    unlockHint: 'Conclua 3 atividades na trilha'
  },
  {
    id: 'art_twilight_moon',
    title: 'Lua de Boa Noite',
    description: 'Símbolo da cortesia ao encerrar o dia em Libras.',
    category: 'Fundamentos',
    rarity: 'comum',
    primaryColor: '#4338CA',
    secondaryColor: '#C7D2FE',
    bgTint: '#EEF2FF',
    iconKind: 'moon_star',
    unlockType: 'xp',
    threshold: 180,
    unlockHint: 'Alcance 180 XP totais'
  },
  {
    id: 'art_alphabet_scroll',
    title: 'Pergaminho do Alfabeto',
    description: 'Registro clássico das 27 configurações da datilologia brasileira.',
    category: 'Fundamentos',
    rarity: 'raro',
    primaryColor: '#B45309',
    secondaryColor: '#FDE68A',
    bgTint: '#FFFBEB',
    iconKind: 'scroll',
    unlockType: 'nodes',
    threshold: 6,
    unlockHint: 'Conclua 6 atividades na trilha'
  },
  {
    id: 'art_section1_key',
    title: 'Chave das Saudações',
    description: 'Abre todas as portas do primeiro contato com a comunidade surda.',
    category: 'Fundamentos',
    rarity: 'epico',
    primaryColor: '#0D9488',
    secondaryColor: '#F59E0B',
    bgTint: '#F0FDFA',
    iconKind: 'key',
    unlockType: 'section',
    threshold: 1,
    unlockHint: 'Conclua a Seção 1 ou seu resumo'
  },

  // 7-12: Cultura Surda
  {
    id: 'art_blue_ribbon',
    title: 'Laço Azul da Comunidade',
    description: 'Símbolo internacional do orgulho, memória e identidade da cultura surda.',
    category: 'Cultura Surda',
    rarity: 'raro',
    primaryColor: '#1D4ED8',
    secondaryColor: '#93C5FD',
    bgTint: '#EFF6FF',
    iconKind: 'ribbon',
    unlockType: 'nodes',
    threshold: 8,
    unlockHint: 'Conclua 8 atividades na trilha'
  },
  {
    id: 'art_ily_heart',
    title: 'Coração Eu Te Amo',
    description: 'Emblema inspirado no sinal universal I-L-Y das mãos.',
    category: 'Cultura Surda',
    rarity: 'epico',
    primaryColor: '#BE123C',
    secondaryColor: '#FDA4AF',
    bgTint: '#FFF1F2',
    iconKind: 'heart_ily',
    unlockType: 'section',
    threshold: 2,
    unlockHint: 'Conclua a Seção 2 ou seu resumo'
  },
  {
    id: 'art_visual_gaze',
    title: 'Olhar Atento',
    description: 'Na Libras, o contato visual sustenta cada turno da conversa.',
    category: 'Cultura Surda',
    rarity: 'comum',
    primaryColor: '#0F766E',
    secondaryColor: '#99F6E4',
    bgTint: '#F0FDFA',
    iconKind: 'eye',
    unlockType: 'xp',
    threshold: 250,
    unlockHint: 'Alcance 250 XP totais'
  },
  {
    id: 'art_lantern_dialogue',
    title: 'Lanterna do Diálogo',
    description: 'Ambientes bem iluminados tornam a sinalização clara e acolhedora.',
    category: 'Cultura Surda',
    rarity: 'raro',
    primaryColor: '#D97706',
    secondaryColor: '#FDE68A',
    bgTint: '#FFFBEB',
    iconKind: 'lantern',
    unlockType: 'nodes',
    threshold: 12,
    unlockHint: 'Conclua 12 atividades'
  },
  {
    id: 'art_visual_bell',
    title: 'Sinal Luminoso',
    description: 'Referência às campainhas e alertas visuais acessíveis.',
    category: 'Cultura Surda',
    rarity: 'comum',
    primaryColor: '#EA580C',
    secondaryColor: '#FED7AA',
    bgTint: '#FFF7ED',
    iconKind: 'bell',
    unlockType: 'xp',
    threshold: 300,
    unlockHint: 'Alcance 300 XP totais'
  },
  {
    id: 'art_global_hands',
    title: 'Pontes Brasileiras',
    description: 'Celebra a riqueza regional da Libras em todo o Brasil.',
    category: 'Cultura Surda',
    rarity: 'lendario',
    primaryColor: '#047857',
    secondaryColor: '#FBBF24',
    bgTint: '#ECFDF5',
    iconKind: 'globe',
    unlockType: 'section',
    threshold: 3,
    unlockHint: 'Conclua a Seção 3 ou seu resumo'
  },

  // 13-18: Maestria Visual
  {
    id: 'art_camera_lens',
    title: 'Lente de Precisão',
    description: 'Homenagem à prática guiada de trajetória e configuração de mãos.',
    category: 'Maestria Visual',
    rarity: 'raro',
    primaryColor: '#0D9488',
    secondaryColor: '#67E8F9',
    bgTint: '#ECFEFF',
    iconKind: 'camera',
    unlockType: 'xp',
    threshold: 350,
    unlockHint: 'Alcance 350 XP totais'
  },
  {
    id: 'art_five_param_prism',
    title: 'Prisma dos 5 Parâmetros',
    description: 'CM, PA, Movimento, Orientação e ENM em perfeita harmonia.',
    category: 'Maestria Visual',
    rarity: 'epico',
    primaryColor: '#7C3AED',
    secondaryColor: '#DDD6FE',
    bgTint: '#F5F3FF',
    iconKind: 'prism',
    unlockType: 'xp',
    threshold: 600,
    unlockHint: 'Alcance 600 XP totais'
  },
  {
    id: 'art_dictionary_tome',
    title: 'Códice dos 255 Sinais',
    description: 'Selo de quem consulta e explora a biblioteca completa.',
    category: 'Maestria Visual',
    rarity: 'raro',
    primaryColor: '#0F766E',
    secondaryColor: '#A7F3D0',
    bgTint: '#ECFDF5',
    iconKind: 'book',
    unlockType: 'nodes',
    threshold: 18,
    unlockHint: 'Conclua 18 atividades'
  },
  {
    id: 'art_crystal_nmf',
    title: 'Cristal da Expressão (ENM)',
    description: 'Destaca o valor gramatical das sobrancelhas e do sorriso.',
    category: 'Maestria Visual',
    rarity: 'epico',
    primaryColor: '#0284C7',
    secondaryColor: '#BAE6FD',
    bgTint: '#F0F9FF',
    iconKind: 'gem_hex',
    unlockType: 'xp',
    threshold: 800,
    unlockHint: 'Alcance 800 XP totais'
  },
  {
    id: 'art_gloss_medallion',
    title: 'Medalhão das Glosas',
    description: 'Estrutura visual de frases naturais em Libras.',
    category: 'Maestria Visual',
    rarity: 'raro',
    primaryColor: '#C2410C',
    secondaryColor: '#FDBA74',
    bgTint: '#FFF7ED',
    iconKind: 'medal',
    unlockType: 'nodes',
    threshold: 24,
    unlockHint: 'Conclua 24 atividades'
  },
  {
    id: 'art_laurel_interpreter',
    title: 'Louros da Fluência',
    description: 'Símbolo reservado para quem domina seções avançadas.',
    category: 'Maestria Visual',
    rarity: 'lendario',
    primaryColor: '#B45309',
    secondaryColor: '#FCD34D',
    bgTint: '#FFFBEB',
    iconKind: 'laurel',
    unlockType: 'xp',
    threshold: 1200,
    unlockHint: 'Alcance 1.200 XP totais'
  },

  // 19-24: Ofensiva
  {
    id: 'art_spark_day1',
    title: 'Faísca Diária',
    description: 'A constância começa com os primeiros dias seguidos de treino.',
    category: 'Ofensiva',
    rarity: 'comum',
    primaryColor: '#EA580C',
    secondaryColor: '#FDE047',
    bgTint: '#FFF7ED',
    iconKind: 'spark',
    unlockType: 'streak',
    threshold: 2,
    unlockHint: 'Mantenha 2 dias de ofensiva'
  },
  {
    id: 'art_flame_week',
    title: 'Chama da Semana',
    description: 'Cinco dias seguidos construindo hábito real de Libras.',
    category: 'Ofensiva',
    rarity: 'raro',
    primaryColor: '#DC2626',
    secondaryColor: '#FDBA74',
    bgTint: '#FEF2F2',
    iconKind: 'flame',
    unlockType: 'streak',
    threshold: 5,
    unlockHint: 'Mantenha 5 dias de ofensiva'
  },
  {
    id: 'art_streak_shield',
    title: 'Escudo da Constância',
    description: 'Protege o ritmo de estudos nos dias corridos.',
    category: 'Ofensiva',
    rarity: 'raro',
    primaryColor: '#0D9488',
    secondaryColor: '#99F6E4',
    bgTint: '#F0FDFA',
    iconKind: 'shield',
    unlockType: 'streak',
    threshold: 7,
    unlockHint: 'Mantenha 7 dias de ofensiva'
  },
  {
    id: 'art_wave_rhythm',
    title: 'Onda do Movimento',
    description: 'Cadência suave e natural em sinais dinâmicos.',
    category: 'Ofensiva',
    rarity: 'epico',
    primaryColor: '#0369A1',
    secondaryColor: '#7DD3FC',
    bgTint: '#F0F9FF',
    iconKind: 'wave_crest',
    unlockType: 'streak',
    threshold: 14,
    unlockHint: 'Mantenha 14 dias de ofensiva'
  },
  {
    id: 'art_solar_trophy',
    title: 'Troféu Solar 21 Dias',
    description: 'Três semanas transformando sinalização em hábito diário.',
    category: 'Ofensiva',
    rarity: 'lendario',
    primaryColor: '#D97706',
    secondaryColor: '#FEF08A',
    bgTint: '#FFFBEB',
    iconKind: 'trophy',
    unlockType: 'streak',
    threshold: 21,
    unlockHint: 'Mantenha 21 dias de ofensiva'
  },
  {
    id: 'art_eternal_diamond',
    title: 'Prisma de 30 Dias',
    description: 'Um mês inteiro conectado ao aprendizado visual.',
    category: 'Ofensiva',
    rarity: 'lendario',
    primaryColor: '#0F766E',
    secondaryColor: '#F59E0B',
    bgTint: '#F0FDFA',
    iconKind: 'diamond',
    unlockType: 'streak',
    threshold: 30,
    unlockHint: 'Mantenha 30 dias de ofensiva'
  },

  // 25-30: Coleção da Libi
  {
    id: 'art_libi_crest',
    title: 'Brasão da Libi',
    description: 'Emblema oficial da nossa companheira de sinalização.',
    category: 'Coleção da Libi',
    rarity: 'comum',
    primaryColor: '#0D9488',
    secondaryColor: '#EA580C',
    bgTint: '#F0FDFA',
    iconKind: 'owl_crest',
    unlockType: 'free_starter',
    unlockHint: 'Desbloqueado para todos os aprendizes'
  },
  {
    id: 'art_feather_grace',
    title: 'Pluma da Gentileza',
    description: 'Inspira paciência, acolhimento e clareza em cada aula.',
    category: 'Coleção da Libi',
    rarity: 'raro',
    primaryColor: '#059669',
    secondaryColor: '#A7F3D0',
    bgTint: '#ECFDF5',
    iconKind: 'feather',
    unlockType: 'nodes',
    threshold: 15,
    unlockHint: 'Conclua 15 atividades na trilha'
  },
  {
    id: 'art_nature_leaf',
    title: 'Folha da Serra',
    description: 'Artefato botânico inspirado nos passeios da Libi.',
    category: 'Coleção da Libi',
    rarity: 'comum',
    primaryColor: '#15803D',
    secondaryColor: '#BBF7D0',
    bgTint: '#F0FDF4',
    iconKind: 'leaf',
    unlockType: 'xp',
    threshold: 450,
    unlockHint: 'Alcance 450 XP totais'
  },
  {
    id: 'art_rainbow_bridge',
    title: 'Arco Inclusivo',
    description: 'Conecta pessoas surdas e ouvintes pela mesma língua.',
    category: 'Coleção da Libi',
    rarity: 'epico',
    primaryColor: '#EA580C',
    secondaryColor: '#38BDF8',
    bgTint: '#FFF7ED',
    iconKind: 'rainbow_arc',
    unlockType: 'section',
    threshold: 4,
    unlockHint: 'Conclua a Seção 4 ou seu resumo'
  },
  {
    id: 'art_atelier_star',
    title: 'Estrela da Trilha',
    description: 'Concedida a quem avança firme pelas unidades de Libras.',
    category: 'Coleção da Libi',
    rarity: 'epico',
    primaryColor: '#9333EA',
    secondaryColor: '#F3E8FF',
    bgTint: '#FAF5FF',
    iconKind: 'badge_star',
    unlockType: 'nodes',
    threshold: 30,
    unlockHint: 'Conclua 30 atividades na trilha'
  },
  {
    id: 'art_golden_crown',
    title: 'Coroa Real de Libras',
    description: 'Artefato máximo da coleção, forjado para grandes mestres.',
    category: 'Coleção da Libi',
    rarity: 'lendario',
    primaryColor: '#B45309',
    secondaryColor: '#FDE047',
    bgTint: '#FFFBEB',
    iconKind: 'crown',
    unlockType: 'xp',
    threshold: 1500,
    unlockHint: 'Alcance 1.500 XP totais'
  }
];

export function isArtifactUnlocked(
  artifact: CollectibleArtifact,
  profile: Pick<UserProfile, 'xp' | 'streakDays' | 'completedNodeIds'>
): boolean {
  const threshold = artifact.threshold ?? 1;
  switch (artifact.unlockType) {
    case 'free_starter':
      return true;
    case 'xp':
      return profile.xp >= threshold;
    case 'nodes':
      return profile.completedNodeIds.length >= threshold;
    case 'streak':
      return profile.streakDays >= threshold;
    case 'section': {
      const summaryDone = profile.completedNodeIds.includes(`sec-summary-${threshold}`);
      const stagePrefix = `s${threshold}_`;
      const sectionNodesCount = profile.completedNodeIds.filter((id) =>
        id.startsWith(stagePrefix)
      ).length;
      return summaryDone || sectionNodesCount >= 12;
    }
    default:
      return false;
  }
}
