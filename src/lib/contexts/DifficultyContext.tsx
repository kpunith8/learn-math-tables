'use client';

import { createContext, useCallback, useContext, useEffect, useState, ReactNode } from 'react';
import { DifficultyLevel } from '@/lib/operations/types';

export const DIFFICULTY_STORAGE_KEY = 'mathAdvDifficulty';

const VALID_LEVELS = ['easy', 'medium', 'hard'] as const;

interface DifficultyContextValue {
  difficulty: DifficultyLevel;
  isLoaded: boolean;
  setDifficulty: (level: DifficultyLevel) => void;
}

const DifficultyContext = createContext<DifficultyContextValue | null>(null);

export function DifficultyProvider({ children }: { children: ReactNode }) {
  const [difficulty, setDifficultyState] = useState<DifficultyLevel>('easy');
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    let stored: DifficultyLevel = 'easy';
    try {
      const raw = localStorage.getItem(DIFFICULTY_STORAGE_KEY);
      if (raw && (VALID_LEVELS as readonly string[]).includes(raw)) {
        stored = raw as DifficultyLevel;
      }
    } catch {}
    setDifficultyState(stored); // eslint-disable-line react-hooks/set-state-in-effect
    setIsLoaded(true);
  }, []);

  const setDifficulty = useCallback((level: DifficultyLevel) => {
    setDifficultyState(level);
    try {
      localStorage.setItem(DIFFICULTY_STORAGE_KEY, level);
    } catch {}
  }, []);

  return (
    <DifficultyContext.Provider value={{ difficulty, isLoaded, setDifficulty }}>
      {children}
    </DifficultyContext.Provider>
  );
}

export function useDifficulty(): DifficultyContextValue {
  const ctx = useContext(DifficultyContext);
  if (!ctx) {
    throw new Error('useDifficulty must be used within a DifficultyProvider');
  }
  return ctx;
}