import type { SupportedLanguage } from '@/state/i18nStore';

export function normalizeApiLanguage(value: string | null | undefined): SupportedLanguage {
  return value?.toLowerCase().startsWith('es') ? 'es' : 'en';
}
