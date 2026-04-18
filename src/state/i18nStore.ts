import { create } from 'zustand';

export type SupportedLanguage = 'en' | 'es';

interface I18nState {
  language: SupportedLanguage;
  setLanguage: (language: SupportedLanguage) => void;
}

function normalizeLanguage(value: string | null | undefined): SupportedLanguage {
  return value?.toLowerCase().startsWith('es') ? 'es' : 'en';
}

export const useI18nStore = create<I18nState>((set) => ({
  language: normalizeLanguage(localStorage.getItem('ui.language')),
  setLanguage: (language) => {
    localStorage.setItem('ui.language', language);
    document.documentElement.lang = language;
    set({ language });
  },
}));
