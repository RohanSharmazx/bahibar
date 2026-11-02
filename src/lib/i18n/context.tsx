'use client';

import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import type { Locale, TranslationDictionary } from './types';
import { enDictionary } from './dictionaries/en';
import { hiDictionary } from './dictionaries/hi';
import { Globe, Check } from 'lucide-react';

const COOKIE_NAME = 'bahibar_lang';
const STORAGE_KEY = 'bahibar_lang';

export type TFunction = ((path: string) => string) & TranslationDictionary;

interface I18nContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: TFunction;
  dictionary: TranslationDictionary;
  formatNumber: (value: number) => string;
}

const dictionaries: Record<Locale, TranslationDictionary> = {
  en: enDictionary,
  hi: hiDictionary,
};

const I18nContext = createContext<I18nContextType | null>(null);

function getInitialLocale(): Locale {
  if (typeof window === 'undefined') return 'en';

  // Check localStorage
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === 'hi' || saved === 'en') return saved;
  } catch {}

  // Check cookie
  try {
    const match = document.cookie.match(new RegExp(`(?:^|; )${COOKIE_NAME}=([^;]*)`));
    if (match && (match[1] === 'hi' || match[1] === 'en')) {
      return match[1] as Locale;
    }
  } catch {}

  return 'en';
}

export function I18nProvider({
  children,
  initialLocale = 'en',
}: {
  children: React.ReactNode;
  initialLocale?: Locale;
}) {
  const [locale, setLocaleState] = useState<Locale>(initialLocale);

  // Sync on mount with client storage
  useEffect(() => {
    const clientLocale = getInitialLocale();
    if (clientLocale !== locale) {
      setLocaleState(clientLocale);
    }
  }, []);

  // Update HTML document attributes when locale changes
  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.lang = locale;
      if (locale === 'hi') {
        document.documentElement.classList.add('lang-hi');
      } else {
        document.documentElement.classList.remove('lang-hi');
      }
    }
  }, [locale]);

  const setLocale = useCallback((newLocale: Locale) => {
    setLocaleState(newLocale);
    try {
      localStorage.setItem(STORAGE_KEY, newLocale);
      // Set cookie for 1 year
      document.cookie = `${COOKIE_NAME}=${newLocale}; path=/; max-age=31536000; SameSite=Lax`;
    } catch {}
  }, []);

  const dictionary = useMemo(() => dictionaries[locale] || enDictionary, [locale]);

  // Dual-style lookup: supports both t("common.save") and t.common.save
  const t = useMemo(() => {
    const fn = (path: string): string => {
      const parts = path.split('.');
      let current: any = dictionary;

      for (const part of parts) {
        if (current && typeof current === 'object' && part in current) {
          current = current[part];
        } else {
          // Fallback to English dictionary
          let fallback: any = enDictionary;
          for (const fPart of parts) {
            if (fallback && typeof fallback === 'object' && fPart in fallback) {
              fallback = fallback[fPart];
            } else {
              return path;
            }
          }
          return typeof fallback === 'string' ? fallback : path;
        }
      }

      return typeof current === 'string' ? current : path;
    };

    return Object.assign(fn, dictionary) as TFunction;
  }, [dictionary]);

  const formatNumber = useCallback(
    (value: number): string => {
      try {
        return new Intl.NumberFormat(locale === 'hi' ? 'hi-IN' : 'en-IN').format(value);
      } catch {
        return String(value);
      }
    },
    [locale]
  );

  const contextValue = useMemo(
    () => ({
      locale,
      setLocale,
      t,
      dictionary,
      formatNumber,
    }),
    [locale, setLocale, t, dictionary, formatNumber]
  );

  return <I18nContext.Provider value={contextValue}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nContextType {
  const context = useContext(I18nContext);
  if (!context) {
    // Return safe fallback if used outside provider
    const fallbackFn = (path: string) => {
      const parts = path.split('.');
      let cur: any = enDictionary;
      for (const p of parts) {
        if (cur && typeof cur === 'object' && p in cur) cur = cur[p];
        else return path;
      }
      return typeof cur === 'string' ? cur : path;
    };
    return {
      locale: 'en',
      setLocale: () => {},
      t: Object.assign(fallbackFn, enDictionary) as TFunction,
      dictionary: enDictionary,
      formatNumber: (v: number) => String(v),
    };
  }
  return context;
}

export const useTranslation = useI18n;

export { LanguageDropdown, LanguageToggle } from '@/components/layout/LanguageDropdown';
