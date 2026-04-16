import { create } from 'zustand';

export type SupportedLanguage = 'en' | 'es';

interface I18nState {
  language: SupportedLanguage;
  setLanguage: (language: SupportedLanguage) => void;
}

export const useI18nStore = create<I18nState>((set) => ({
  language: 'en',
  setLanguage: (language) => {
    localStorage.setItem('ui.language', language);
    document.documentElement.lang = language;
    set({ language });
  },
}));
