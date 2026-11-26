const DEFAULT_APP_ICON = '/assets/aistudio/Logo_EasyLib_com_Capivara_e_Libras_9b1840f9.png';
const DEFAULT_APP_COVER = '/app-cover.jpg';
const CUSTOM_ICON_KEY = 'easylib_custom_app_icon_v1';
const CUSTOM_COVER_KEY = 'easylib_custom_app_cover_v1';

export function getCustomAppIcon(): string {
  try {
    return localStorage.getItem(CUSTOM_ICON_KEY) || DEFAULT_APP_ICON;
  } catch {
    return DEFAULT_APP_ICON;
  }
}

export function setCustomAppIcon(dataUrlOrUrl: string) {
  try {
    localStorage.setItem(CUSTOM_ICON_KEY, dataUrlOrUrl);
  } catch {}
}

export function getCustomAppCover(): string {
  try {
    return localStorage.getItem(CUSTOM_COVER_KEY) || DEFAULT_APP_COVER;
  } catch {
    return DEFAULT_APP_COVER;
  }
}

export function setCustomAppCover(dataUrlOrUrl: string) {
  try {
    localStorage.setItem(CUSTOM_COVER_KEY, dataUrlOrUrl);
  } catch {}
}

export const EASYLIB_APP_ICON = getCustomAppIcon();
export const EASYLIB_APP_COVER = getCustomAppCover();
