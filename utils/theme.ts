import { Theme } from '../types';

const THEME_KEY = 'regret-calc-theme';

export const getStoredTheme = (): Theme => {
  if (typeof window === 'undefined') return 'purple';

  try {
    const stored = localStorage.getItem(THEME_KEY);
    if (stored === 'purple' || stored === 'green' || stored === 'blue') {
      return stored;
    }
  } catch {
    // Storage may be blocked in sandboxed previews
  }
  return 'purple';
};

export const saveTheme = (theme: Theme): void => {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(THEME_KEY, theme);
  } catch {
    // Storage may be blocked in sandboxed previews
  }
};
