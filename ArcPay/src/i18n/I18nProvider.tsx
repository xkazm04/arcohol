import React, { createContext, useContext, useState, useCallback, useEffect, useMemo } from 'react';
import { en, type TranslationKeys, type LocaleCode } from './locales';

interface I18nContextValue {
  locale: LocaleCode;
  setLocale: (locale: LocaleCode) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
  translations: TranslationKeys;
  isLoading: boolean;
}

const I18nContext = createContext<I18nContextValue | null>(null);

export interface I18nProviderProps {
  children: React.ReactNode;
  defaultLocale?: LocaleCode;
  fallbackLocale?: LocaleCode;
  onLocaleChange?: (locale: LocaleCode) => void;
}

function getNestedValue(obj: Record<string, unknown>, path: string): string | undefined {
  const keys = path.split('.');
  let current: unknown = obj;

  for (const key of keys) {
    if (current && typeof current === 'object' && key in current) {
      current = (current as Record<string, unknown>)[key];
    } else {
      return undefined;
    }
  }

  return typeof current === 'string' ? current : undefined;
}

function interpolate(template: string, params: Record<string, string | number>): string {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key) => {
    return params[key]?.toString() ?? `{{${key}}}`;
  });
}

export function I18nProvider({
  children,
  defaultLocale = 'en',
  fallbackLocale = 'en',
  onLocaleChange,
}: I18nProviderProps) {
  const [locale, setLocaleState] = useState<LocaleCode>(defaultLocale);
  const [translations, setTranslations] = useState<TranslationKeys>(en);
  const [isLoading, setIsLoading] = useState(false);

  const loadTranslations = useCallback(async (localeCode: LocaleCode) => {
    setIsLoading(true);
    try {
      const { locales } = await import('./locales');
      const loadLocale = locales[localeCode];
      if (loadLocale) {
        const loaded = await loadLocale();
        setTranslations(loaded);
      }
    } catch (error) {
      console.error(`Failed to load locale ${localeCode}:`, error);
      if (localeCode !== fallbackLocale) {
        const { locales } = await import('./locales');
        const fallbackLoader = locales[fallbackLocale];
        if (fallbackLoader) {
          const fallback = await fallbackLoader();
          setTranslations(fallback);
        }
      }
    } finally {
      setIsLoading(false);
    }
  }, [fallbackLocale]);

  const setLocale = useCallback(
    (newLocale: LocaleCode) => {
      setLocaleState(newLocale);
      loadTranslations(newLocale);
      onLocaleChange?.(newLocale);

      if (typeof window !== 'undefined') {
        localStorage.setItem('arcpay-locale', newLocale);
      }
    },
    [loadTranslations, onLocaleChange]
  );

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedLocale = localStorage.getItem('arcpay-locale') as LocaleCode | null;
      const browserLocale = navigator.language.split('-')[0] as LocaleCode;

      const initialLocale = savedLocale ||
        (browserLocale === 'es' ? 'es' : defaultLocale);

      if (initialLocale !== locale) {
        setLocale(initialLocale);
      } else {
        loadTranslations(initialLocale);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const t = useCallback(
    (key: string, params?: Record<string, string | number>): string => {
      const value = getNestedValue(translations as unknown as Record<string, unknown>, key);

      if (!value) {
        const fallbackValue = getNestedValue(en as unknown as Record<string, unknown>, key);
        if (!fallbackValue) {
          console.warn(`Translation key not found: ${key}`);
          return key;
        }
        return params ? interpolate(fallbackValue, params) : fallbackValue;
      }

      return params ? interpolate(value, params) : value;
    },
    [translations]
  );

  const value = useMemo(
    () => ({
      locale,
      setLocale,
      t,
      translations,
      isLoading,
    }),
    [locale, setLocale, t, translations, isLoading]
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nContextValue {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return context;
}

export function useTranslation() {
  const { t, locale, setLocale, isLoading } = useI18n();
  return { t, locale, setLocale, isLoading };
}
