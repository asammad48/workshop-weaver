import enCommon from './locales/en/common.json';
import esCommon from './locales/es/common.json';
import { useI18nStore, type SupportedLanguage } from '@/state/i18nStore';

const resources = {
  en: enCommon,
  es: esCommon,
} as const;

function pickInitialLanguage(): SupportedLanguage {
  const stored = localStorage.getItem('ui.language');
  if (stored === 'en' || stored === 'es') return stored;

  const nav = navigator.language.toLowerCase();
  if (nav.startsWith('es')) return 'es';
  return 'en';
}

function getByPath(source: Record<string, unknown>, path: string): unknown {
  return path.split('.').reduce<unknown>((acc, segment) => {
    if (!acc || typeof acc !== 'object') return undefined;
    return (acc as Record<string, unknown>)[segment];
  }, source);
}

export function t(key: string, language: SupportedLanguage): string {
  const value = getByPath(resources[language] as unknown as Record<string, unknown>, key);
  if (typeof value === 'string') return value;

  const fallback = getByPath(resources.en as unknown as Record<string, unknown>, key);
  if (typeof fallback === 'string') return fallback;

  return key;
}

export function initializeI18n() {
  const stored = localStorage.getItem('ui.language');
  const language =
    stored === 'en' || stored === 'es'
      ? stored
      : pickInitialLanguage();

  useI18nStore.setState({ language });
  localStorage.setItem('ui.language', language);
  document.documentElement.lang = language;
}

export function useI18n() {
  const language = useI18nStore((s) => s.language);
  const setLanguage = useI18nStore((s) => s.setLanguage);

  return {
    language,
    setLanguage,
    t: (key: string) => t(key, language),
  };
}
