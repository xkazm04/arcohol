export { en, type TranslationKeys } from './en';
export { es } from './es';

export const locales = {
  en: () => import('./en').then((m) => m.en),
  es: () => import('./es').then((m) => m.es),
} as const;

export type LocaleCode = keyof typeof locales;
