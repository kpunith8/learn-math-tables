'use client';

import { ReactNode } from 'react';
import { I18nProvider } from '@/i18n/I18nProvider';
import { AppProvider } from './AppContext';
import { DifficultyProvider } from './DifficultyContext';

/**
 * Composes all app-wide providers (client state). Add future providers here —
 * e.g. SessionProvider, LoginProvider — rather than nesting them per-page.
 */
export function Providers({ children }: { children: ReactNode }) {
  return (
    <I18nProvider>
      <AppProvider>
        <DifficultyProvider>{children}</DifficultyProvider>
      </AppProvider>
    </I18nProvider>
  );
}