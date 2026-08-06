'use client';

import { useEffect } from 'react';
import { I18nextProvider } from 'react-i18next';
import i18n from '@/i18n/client';

function LanguageSync() {
  useEffect(() => {
    const applyLang = () => {
      document.documentElement.lang = i18n.language.split('-')[0] || 'en';
    };

    const detected = i18n.services.languageDetector?.detect();
    const supported = (i18n.options.supportedLngs ?? []) as string[];
    const normalize = (code: unknown) => {
      if (typeof code !== 'string') return null;
      const base = code.split('-')[0].toLowerCase();
      return supported.includes(base) ? base : null;
    };
    const detectedBase = normalize(detected);

    if (detectedBase && detectedBase !== i18n.language) {
      i18n.changeLanguage(detectedBase);
    }

    applyLang();
    i18n.on('languageChanged', applyLang);
    return () => {
      i18n.off('languageChanged', applyLang);
    };
  }, []);

  return null;
}

export function I18nProvider({ children }: { children: React.ReactNode }) {
  return (
    <I18nextProvider i18n={i18n}>
      {children}
      <LanguageSync />
    </I18nextProvider>
  );
}
