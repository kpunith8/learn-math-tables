'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  STORAGE_KEY,
  NAME_STORAGE_KEY,
  LEADERBOARD_STORAGE_KEY,
  Difficulty,
} from '../constants';
import {
  clampInteger,
  sanitizeCompletedTables,
  sanitizeCardList,
  sanitizeActiveCard,
  sanitizeTableStars,
  sanitizeQuizResults,
  sanitizeTableStates,
  isPlainObject,
  TableState,
  LeaderboardData,
} from '../utils';

export interface AppState {
  currentTable: number;
  revealedCards: Set<string>;
  activeCard: string | null;
  completedTables: Set<number>;
  tableStarRatings: Record<number, number>;
  quizResults: Record<number, { correct: number; total: number }>;
  tableStates: Record<number, TableState>;
  tableStartTime: number;
  playerName: string;
  difficulty: Difficulty;
  practiceMode: boolean;
}

const getInitialState = (): AppState => ({
  currentTable: 1,
  revealedCards: new Set<string>(),
  activeCard: null,
  completedTables: new Set(),
  tableStarRatings: {},
  quizResults: {},
  tableStates: {},
  tableStartTime: 0,
  playerName: '',
  difficulty: 'normal',
  practiceMode: false,
});

const saveAppStateToStorage = (state: AppState) => {
  try {
    const serialized = {
      currentTable: state.currentTable,
      revealedCards: Array.from(state.revealedCards),
      activeCard: state.activeCard,
      completedTables: Array.from(state.completedTables),
      tableStarRatings: state.tableStarRatings,
      quizResults: state.quizResults,
      tableStates: state.tableStates,
      tableStartTime: state.tableStartTime,
      playerName: state.playerName,
      difficulty: state.difficulty,
      practiceMode: state.practiceMode,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(serialized));
  } catch (error) {
    console.warn('Failed to save app state:', error);
  }
};

const loadAppStateFromStorage = (): AppState | null => {
  try {
    const rawData = localStorage.getItem(STORAGE_KEY);
    if (!rawData) return null;
    const state = JSON.parse(rawData);
    if (!isPlainObject(state)) return null;

    const completedTables = new Set(sanitizeCompletedTables(state.completedTables));
    const currentTable = clampInteger(state.currentTable, 1, 10, 1);
    const difficulty: Difficulty = (['easy', 'normal', 'hard'] as string[]).includes(state.difficulty as string)
      ? (state.difficulty as Difficulty)
      : 'normal';
    const practiceMode = state.practiceMode === true;

    let effectiveCurrentTable = currentTable;
    if (practiceMode) {
      // In practice mode all tables are unlocked
    } else {
      const maxAllowed = difficulty === 'easy' ? 5 : difficulty === 'hard' ? 10 : 7;
      if (currentTable > maxAllowed) effectiveCurrentTable = 1;
      if (currentTable > 1 && !completedTables.has(currentTable - 1)) effectiveCurrentTable = 1;
    }

    const revealedCards = new Set(sanitizeCardList(effectiveCurrentTable, state.revealedCards));
    let activeCard = sanitizeActiveCard(effectiveCurrentTable, state.activeCard);
    if (activeCard && !revealedCards.has(activeCard)) activeCard = null;

    const tableStates = sanitizeTableStates(state.tableStates);
    if (tableStates[effectiveCurrentTable]) {
      const savedState = tableStates[effectiveCurrentTable];
      revealedCards.clear();
      savedState.revealed.forEach((c) => revealedCards.add(c));
      activeCard = savedState.activeCard;
    }

    return {
      currentTable: effectiveCurrentTable,
      revealedCards,
      activeCard,
      completedTables,
      tableStarRatings: sanitizeTableStars(state.tableStarRatings),
      quizResults: sanitizeQuizResults(state.quizResults),
      tableStates,
      tableStartTime: clampInteger(state.tableStartTime, 0, Date.now(), Date.now()),
      playerName: typeof state.playerName === 'string' ? state.playerName.substring(0, 20) : '',
      difficulty,
      practiceMode,
    };
  } catch (error) {
    console.warn('Failed to load app state:', error);
    return null;
  }
};

const loadPlayerNameFromStorage = (): string => {
  try {
    const savedName = localStorage.getItem(NAME_STORAGE_KEY);
    if (savedName && typeof savedName === 'string') {
      return savedName.substring(0, 20);
    }
  } catch {}
  return '';
};

export function useAppState() {
  const [state, setState] = useState<AppState>(getInitialState);
  const [isLoaded, setIsLoaded] = useState(false);
  const [showLanding, setShowLanding] = useState(true);
  const lastWasNewRevealRef = useRef(false);

  useEffect(() => {
    const savedName = loadPlayerNameFromStorage();
    const savedState = loadAppStateFromStorage();
    if (savedState) {
      setState(savedState); // eslint-disable-line react-hooks/set-state-in-effect
      setShowLanding(false);
    }
    if (savedName) {
      setState((prev) => ({ ...prev, playerName: savedName }));
    }
    setIsLoaded(true);
  }, []);

  const save = useCallback((newState: AppState) => {
    saveAppStateToStorage(newState);
  }, []);

  const updateState = useCallback(
    (updater: (prev: AppState) => AppState) => {
      setState((prev) => {
        const next = updater(prev);
        save(next);
        return next;
      });
    },
    [save]
  );

  const switchToTable = useCallback(
    (targetTable: number) => {
      setState((prev) => {
        // Save current table state
        const newTableStates = { ...prev.tableStates };
        newTableStates[prev.currentTable] = {
          revealed: Array.from(prev.revealedCards),
          activeCard: prev.activeCard,
        };

        // Load target table state
        const savedState = newTableStates[targetTable];
        const newRevealedCards = new Set<string>();
        let newActiveCard: string | null = null;
        if (savedState) {
          savedState.revealed.forEach((c) => newRevealedCards.add(c));
          newActiveCard = savedState.activeCard;
        }

        const next = {
          ...prev,
          currentTable: targetTable,
          revealedCards: newRevealedCards,
          activeCard: newActiveCard,
          tableStates: newTableStates,
          tableStartTime: Date.now(),
        };
        save(next);
        return next;
      });
    },
    [save]
  );

  const saveCurrentTableState = useCallback(() => {
    setState((prev) => {
      const newTableStates = { ...prev.tableStates };
      newTableStates[prev.currentTable] = {
        revealed: Array.from(prev.revealedCards),
        activeCard: prev.activeCard,
      };
      const next = { ...prev, tableStates: newTableStates };
      save(next);
      return next;
    });
  }, [save]);

  const setDifficulty = useCallback(
    (level: Difficulty) => {
      setState((prev) => {
        let newCurrentTable = prev.currentTable;
        const maxAllowed = level === 'easy' ? 5 : level === 'hard' ? 10 : 7;
        if (newCurrentTable > maxAllowed) newCurrentTable = 1;
        const next = { ...prev, difficulty: level, currentTable: newCurrentTable };
        save(next);
        return next;
      });
    },
    [save]
  );

  const togglePracticeMode = useCallback(() => {
    setState((prev) => {
      const newPracticeMode = !prev.practiceMode;
      let newCurrentTable = prev.currentTable;
      const maxAllowed = newPracticeMode ? 10 : prev.difficulty === 'easy' ? 5 : prev.difficulty === 'hard' ? 10 : 7;
      if (newCurrentTable > maxAllowed) newCurrentTable = 1;
      const next = { ...prev, practiceMode: newPracticeMode, currentTable: newCurrentTable };
      save(next);
      return next;
    });
  }, [save]);

  const setPlayerName = useCallback(
    (name: string) => {
      const sanitizedName = name.trim().substring(0, 20);
      if (sanitizedName) {
        try {
          localStorage.setItem(NAME_STORAGE_KEY, sanitizedName);
        } catch {}
        setState((prev) => {
          const next = { ...prev, playerName: sanitizedName };
          save(next);
          return next;
        });
      }
    },
    [save]
  );

  const startLearning = useCallback(() => {
    setShowLanding(false);
    setState((prev) => {
      const next = {
        ...prev,
        currentTable: 1,
        revealedCards: new Set<string>(),
        activeCard: null,
        tableStartTime: Date.now(),
      };
      save(next);
      return next;
    });
  }, [save]);

  const resetProgress = useCallback(() => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {}
    const fresh = getInitialState();
    fresh.tableStartTime = Date.now();
    setState(fresh);
    setShowLanding(true);
    save(fresh);
  }, [save]);

  const playAgain = useCallback(() => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {}
    const fresh = getInitialState();
    setState(fresh);
    setShowLanding(true);
    save(fresh);
  }, [save]);

  const revealCard = useCallback(
    (cardKey: string) => {
      setState((prev) => {
        const newRevealedCards = new Set(prev.revealedCards);
        const isNewReveal = !newRevealedCards.has(cardKey);
        if (isNewReveal) {
          newRevealedCards.add(cardKey);
        }
        lastWasNewRevealRef.current = isNewReveal;
        const newActiveCard = prev.activeCard === cardKey ? null : cardKey;
        const next = {
          ...prev,
          revealedCards: newRevealedCards,
          activeCard: newActiveCard,
          tableStartTime: prev.tableStartTime || Date.now(),
        };
        save(next);
        return next;
      });
      return lastWasNewRevealRef.current;
    },
    [save]
  );

  const clearActiveCard = useCallback(() => {
    setState((prev) => {
      const next = { ...prev, activeCard: null };
      save(next);
      return next;
    });
  }, [save]);

  const completeTable = useCallback(
    (tableNumber: number, starRating: number) => {
      setState((prev) => {
        const newCompletedTables = new Set(prev.completedTables);
        newCompletedTables.add(tableNumber);
        const next = {
          ...prev,
          completedTables: newCompletedTables,
          tableStarRatings: { ...prev.tableStarRatings, [tableNumber]: starRating },
        };
        save(next);
        return next;
      });
    },
    [save]
  );

  const saveQuizResult = useCallback(
    (tableNumber: number, correct: number, total: number) => {
      setState((prev) => {
        const next = {
          ...prev,
          quizResults: { ...prev.quizResults, [tableNumber]: { correct, total } },
        };
        save(next);
        return next;
      });
    },
    [save]
  );

  const leaderboardData = useCallback((): LeaderboardData => {
    try {
      const rawData = localStorage.getItem(LEADERBOARD_STORAGE_KEY);
      if (rawData) {
        const data = JSON.parse(rawData);
        if (isPlainObject(data)) return data as LeaderboardData;
      }
    } catch {}
    return {};
  }, []);

  const saveLeaderboardEntry = useCallback(
    (name: string, totalStars: number, totalTime: number, completedCount: number, maxTables: number) => {
      try {
        const data = leaderboardData();
        const existingEntry = data[name];
        if (
          !existingEntry ||
          totalStars > existingEntry.totalStars ||
          (totalStars === existingEntry.totalStars && totalTime < existingEntry.totalTime)
        ) {
          data[name] = {
            totalStars,
            totalTime,
            completedTables: completedCount,
            maxTables,
            lastPlayed: Date.now(),
          };
          localStorage.setItem(LEADERBOARD_STORAGE_KEY, JSON.stringify(data));
        }
      } catch {}
    },
    [leaderboardData]
  );

  return {
    state,
    isLoaded,
    showLanding,
    setShowLanding,
    updateState,
    switchToTable,
    saveCurrentTableState,
    setDifficulty,
    togglePracticeMode,
    setPlayerName,
    startLearning,
    resetProgress,
    playAgain,
    revealCard,
    clearActiveCard,
    completeTable,
    saveQuizResult,
    leaderboardData,
    saveLeaderboardEntry,
  };
}
