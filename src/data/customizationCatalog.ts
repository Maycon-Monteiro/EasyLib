export type NameTagIconId = 'tag' | 'waves' | 'flame' | 'zap' | 'crown' | 'sparkles';
export type PlayerClassIconId = 'sprout' | 'hand' | 'drama' | 'shield' | 'mic' | 'trophy';

export interface NameTagStyleDef {
  id: string;
  name: string;
  description: string;
  price: number;
  badgeIcon: NameTagIconId;
  containerClass: string;
  accentHex: string;
  textColorClass: string;
  subTextColorClass: string;
  borderColorHex: string;
}

export const NAMETAG_CATALOG: NameTagStyleDef[] = [
  {
    id: 'tag_classic',
    name: 'NameTAG Clássica',
    description: 'Visual limpo padrão com borda turquesa da Libi.',
    price: 0,
    badgeIcon: 'tag',
    containerClass: 'bg-white border-[#E8E2D9]',
    accentHex: '#0D9488',
    textColorClass: 'text-[#1C1917]',
    subTextColorClass: 'text-[#57534E]',
    borderColorHex: '#0D9488'
  },
  {
    id: 'tag_teal_wave',
    name: 'Onda Turquesa',
    description: 'Gradiente profundo em tons da Cultura Surda com brilho suave.',
    price: 75,
    badgeIcon: 'waves',
    containerClass: 'bg-gradient-to-r from-[#0F766E] via-[#0D9488] to-[#14B8A6] border-[#5EEAD4]',
    accentHex: '#5EEAD4',
    textColorClass: 'text-white',
    subTextColorClass: 'text-[#CCFBF1]',
    borderColorHex: '#5EEAD4'
  },
  {
    id: 'tag_sunset_fire',
    name: 'Chama da Ofensiva',
    description: 'Moldura quente laranja-dourada para quem nunca perde um dia.',
    price: 120,
    badgeIcon: 'flame',
    containerClass: 'bg-gradient-to-r from-[#C2410C] via-[#EA580C] to-[#F59E0B] border-[#FDE68A]',
    accentHex: '#FDE68A',
    textColorClass: 'text-white',
    subTextColorClass: 'text-[#FFEDD5]',
    borderColorHex: '#FDE68A'
  },
  {
    id: 'tag_neon_cyber',
    name: 'Mãos Neon',
    description: 'Cartão escuro elegante com contraste ciano de alto destaque.',
    price: 170,
    badgeIcon: 'zap',
    containerClass: 'bg-gradient-to-r from-[#0F172A] via-[#1E293B] to-[#0F766E] border-[#2DD4BF]',
    accentHex: '#2DD4BF',
    textColorClass: 'text-[#F8FAFC]',
    subTextColorClass: 'text-[#99F6E4]',
    borderColorHex: '#2DD4BF'
  },
  {
    id: 'tag_royal_gold',
    name: 'Ouro Real',
    description: 'Acabamento dourado metálico exclusivo para destaques do ranking.',
    price: 260,
    badgeIcon: 'crown',
    containerClass: 'bg-gradient-to-r from-[#78350F] via-[#B45309] to-[#D97706] border-[#FCD34D]',
    accentHex: '#FCD34D',
    textColorClass: 'text-white',
    subTextColorClass: 'text-[#FEF3C7]',
    borderColorHex: '#FCD34D'
  },
  {
    id: 'tag_constellation',
    name: 'Constelação Visual',
    description: 'Gradiente violeta estelar com moldura luminosa de colecionador.',
    price: 340,
    badgeIcon: 'sparkles',
    containerClass: 'bg-gradient-to-r from-[#312E81] via-[#6D28D9] to-[#0D9488] border-[#C4B5FD]',
    accentHex: '#DDD6FE',
    textColorClass: 'text-white',
    subTextColorClass: 'text-[#EDE9FE]',
    borderColorHex: '#C4B5FD'
  }
];

export interface NameTagImagePreset {
  id: string;
  label: string;
  bgHex: string;
}

export const NAMETAG_IMAGE_PRESETS: NameTagImagePreset[] = [
  { id: 'preset:libi', label: 'Libi', bgHex: '#0D9488' },
  { id: 'preset:ily', label: 'Eu Te Amo', bgHex: '#EA580C' },
  { id: 'preset:maos', label: 'Sinais', bgHex: '#0F766E' },
  { id: 'preset:coroa', label: 'Coroa', bgHex: '#B45309' },
  { id: 'preset:fogo', label: 'Ofensiva', bgHex: '#C2410C' },
  { id: 'preset:camera', label: 'Câmera', bgHex: '#0369A1' }
];

export interface PlayerClassDef {
  id: string;
  name: string;
  description: string;
  price: number;
  icon: PlayerClassIconId;
  badgeColorHex: string;
}

export const PLAYER_CLASSES_CATALOG: PlayerClassDef[] = [
  {
    id: 'class_aprendiz',
    name: 'Aprendiz Visual',
    description: 'Classe inicial de quem começou a se comunicar em Libras.',
    price: 0,
    icon: 'sprout',
    badgeColorHex: '#0D9488'
  },
  {
    id: 'class_sinalizador',
    name: 'Sinalizador Ágil',
    description: 'Para quem já domina saudações e diálogos rápidos do dia a dia.',
    price: 80,
    icon: 'hand',
    badgeColorHex: '#EA580C'
  },
  {
    id: 'class_expressivo',
    name: 'Mestre das Expressões',
    description: 'Especialista em Expressões Não-Manuais (ENM) e entonação visual.',
    price: 140,
    icon: 'drama',
    badgeColorHex: '#7C3AED'
  },
  {
    id: 'class_guardiao',
    name: 'Guardião da Cultura Surda',
    description: 'Título de respeito dedicado à acessibilidade e inclusão.',
    price: 220,
    icon: 'shield',
    badgeColorHex: '#0284C7'
  },
  {
    id: 'class_interprete',
    name: 'Intérprete em Ascensão',
    description: 'Domina tradução simultânea de glosas e leitura fluente.',
    price: 320,
    icon: 'mic',
    badgeColorHex: '#B45309'
  },
  {
    id: 'class_embaixador',
    name: 'Embaixador da Libras',
    description: 'Classe máxima de prestígio visível na sua NameTAG e no Ranking.',
    price: 450,
    icon: 'trophy',
    badgeColorHex: '#DC2626'
  }
];

export const EASYLIB_PLUS_COIN_PRICE = 240;
export const STREAK_FREEZE_COIN_PRICE = 150;

export function getNameTagById(id?: string): NameTagStyleDef {
  return NAMETAG_CATALOG.find((item) => item.id === id) || NAMETAG_CATALOG[0];
}

export function getPlayerClassById(id?: string): PlayerClassDef {
  return PLAYER_CLASSES_CATALOG.find((item) => item.id === id) || PLAYER_CLASSES_CATALOG[0];
}
