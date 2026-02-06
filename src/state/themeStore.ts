import { create } from 'zustand';

const STORAGE_KEYS = {
  primary: 'theme.primary',
  secondary: 'theme.secondary',
  accent: 'theme.accent',
};

const DEFAULT_THEME = {
  primary: '#0d6efd',
  secondary: '#6c757d',
  accent: '#0dcaf0',
};

interface ThemeState {
  primary: string;
  secondary: string;
  accent: string;
  loadTheme: () => void;
  applyTheme: () => void;
  setTheme: (colors: { primary?: string; secondary?: string; accent?: string }) => void;
  resetTheme: () => void;
}

export const useThemeStore = create<ThemeState>((set, get) => ({
  primary: DEFAULT_THEME.primary,
  secondary: DEFAULT_THEME.secondary,
  accent: DEFAULT_THEME.accent,

  loadTheme: () => {
    const primary = localStorage.getItem(STORAGE_KEYS.primary) || DEFAULT_THEME.primary;
    const secondary = localStorage.getItem(STORAGE_KEYS.secondary) || DEFAULT_THEME.secondary;
    const accent = localStorage.getItem(STORAGE_KEYS.accent) || DEFAULT_THEME.accent;

    set({ primary, secondary, accent });
    get().applyTheme();
  },

  applyTheme: () => {
    const { primary, secondary, accent } = get();
    const root = document.documentElement;

    root.style.setProperty('--c-primary', primary);
    root.style.setProperty('--c-secondary', secondary);
    root.style.setProperty('--c-accent', accent);
  },

  setTheme: (colors) => {
    const newState: Partial<ThemeState> = {};

    if (colors.primary) {
      localStorage.setItem(STORAGE_KEYS.primary, colors.primary);
      newState.primary = colors.primary;
    }
    if (colors.secondary) {
      localStorage.setItem(STORAGE_KEYS.secondary, colors.secondary);
      newState.secondary = colors.secondary;
    }
    if (colors.accent) {
      localStorage.setItem(STORAGE_KEYS.accent, colors.accent);
      newState.accent = colors.accent;
    }

    set(newState);
    get().applyTheme();
  },

  resetTheme: () => {
    localStorage.removeItem(STORAGE_KEYS.primary);
    localStorage.removeItem(STORAGE_KEYS.secondary);
    localStorage.removeItem(STORAGE_KEYS.accent);

    set({
      primary: DEFAULT_THEME.primary,
      secondary: DEFAULT_THEME.secondary,
      accent: DEFAULT_THEME.accent,
    });
    get().applyTheme();
  },
}));
