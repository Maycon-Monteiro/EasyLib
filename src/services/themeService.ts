export type AppTheme = 'light' | 'dark';

const THEME_STORAGE_KEY = 'easylib_theme_v1';

export function getStoredTheme(): AppTheme {
  if (typeof window === 'undefined') return 'light';
  try {
    const raw = window.localStorage.getItem(THEME_STORAGE_KEY);
    return raw === 'dark' ? 'dark' : 'light';
  } catch {
    return 'light';
  }
}

export function applyTheme(theme: AppTheme): void {
  if (typeof document === 'undefined') return;
  document.documentElement.setAttribute('data-theme', theme);
  document.documentElement.style.colorScheme = theme;
}

export function saveAndApplyTheme(theme: AppTheme): AppTheme {
  try {
    window.localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    // Ignore storage quota errors
  }
  applyTheme(theme);
  return theme;
}

export function toggleStoredTheme(current?: AppTheme): AppTheme {
  const active = current ?? getStoredTheme();
  const next: AppTheme = active === 'dark' ? 'light' : 'dark';
  return saveAndApplyTheme(next);
}
