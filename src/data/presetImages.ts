import presetLibiImg from '../assets/images/preset_libi_mascot_1795618224675.jpg';
import presetIlyImg from '../assets/images/preset_libras_hands_1795618224546.jpg';
import presetMaosImg from '../assets/images/preset_deaf_culture_1795618226073.jpg';
import presetCoroaImg from '../assets/images/preset_crown_plus_1795618225968.jpg';
import presetFogoImg from '../assets/images/preset_streak_flame_1795618226535.jpg';
import presetCameraImg from '../assets/images/preset_studio_camera_1795618226447.jpg';

export const PRESET_IMAGE_MAP: Record<string, string> = {
  'preset:libi': presetLibiImg,
  'preset:ily': presetIlyImg,
  'preset:maos': presetMaosImg,
  'preset:coroa': presetCoroaImg,
  'preset:fogo': presetFogoImg,
  'preset:camera': presetCameraImg,
  // Backward-compatible aliases for any stored profile preset IDs
  'preset:estrela': presetCoroaImg,
  'preset:coracao': presetIlyImg
};

export function resolvePresetImageSrc(presetId?: string): string | null {
  if (!presetId) return null;
  return PRESET_IMAGE_MAP[presetId] || null;
}
