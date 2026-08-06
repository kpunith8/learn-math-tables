'use client';

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import en from './locales/en.json';
import hi from './locales/hi.json';
import kn from './locales/kn.json';

export const SUPPORTED_LANGUAGES = [
  { code: 'en', label: 'English', native: 'English' },
  { code: 'hi', label: 'हिंदी', native: 'हिंदी' },
  { code: 'kn', label: 'ಕನ್ನಡ', native: 'ಕನ್ನಡ' },
] as const;

export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number]['code'];

void i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      hi: { translation: hi },
      kn: { translation: kn },
    },
    lng: 'en',
    fallbackLng: 'en',
    supportedLngs: ['en', 'hi', 'kn'],
    nonExplicitSupportedLngs: true,
    load: 'languageOnly',
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
      lookupLocalStorage: 'math-adventure-language',
    },
    interpolation: {
      escapeValue: false,
    },
    returnObjects: true,
    returnEmptyString: false,
    react: {
      useSuspense: false,
    },
  });

export default i18n;
