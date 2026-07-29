'use client';

import { useState, useEffect, useCallback } from 'react';
import { ENGINE_STORAGE_KEY } from '@/lib/constants';
import {
  FactMastery,
  FactKey,
  Achievement,
  ALL_ACHIEVEMENTS,
  DailyMission,
  BadgeId,
} from '@/lib/engines/types';
import { recordAttempt, getWeakFacts, getDueFacts } from '@/lib/engines/mastery-engine';
import { generateDailyMission, isMissionExpired, updateMissionProgress } from '@/lib/engines/daily-mission';
import { unlockAchievement } from '@/lib/engines/achievement-engine';
import {
  awardStarsForCorrectAnswer,
  awardStarsForLessonComplete,
  awardStarsForPracticeComplete,
  awardStarsForQuizComplete,
  awardStarsForDailyMission,
  computeTotalStars,
} from '@/lib/engines/star-economy';

interface EngineState {
  stars: number;
  milestoneStars: Record<string, number>;
  streak: number;
  lastActiveDate: string;
  achievements: Achievement[];
  masteryMap: Record<FactKey, FactMastery>;
  dailyMission: DailyMission | null;
  completedOperations: string[];
  discoveredPatterns: number[];
  starHistory: { date: string; amount: number; reason: string }[];
}

function getInitialEngineState(): EngineState {
  return {
    stars: 0,
    milestoneStars: {},
    streak: 0,
    lastActiveDate: '',
    achievements: ALL_ACHIEVEMENTS.map((a) => ({ ...a })),
    masteryMap: {},
    dailyMission: null,
    completedOperations: [],
    discoveredPatterns: [],
    starHistory: [],
  };
}

function loadEngineState(): EngineState {
  try {
    const raw = localStorage.getItem(ENGINE_STORAGE_KEY);
    if (!raw) return getInitialEngineState();
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return getInitialEngineState();

    const milestoneStars: Record<string, number> =
      typeof parsed.milestoneStars === 'object' && parsed.milestoneStars !== null
        ? parsed.milestoneStars
        : {};

    return {
      stars: computeTotalStars(milestoneStars),
      milestoneStars,
      streak: typeof parsed.streak === 'number' ? parsed.streak : 0,
      lastActiveDate: typeof parsed.lastActiveDate === 'string' ? parsed.lastActiveDate : '',
      achievements: Array.isArray(parsed.achievements) ? parsed.achievements : ALL_ACHIEVEMENTS.map((a) => ({ ...a })),
      masteryMap: typeof parsed.masteryMap === 'object' && parsed.masteryMap !== null ? parsed.masteryMap : {},
      dailyMission: typeof parsed.dailyMission === 'object' && parsed.dailyMission !== null ? parsed.dailyMission : null,
      completedOperations: Array.isArray(parsed.completedOperations) ? parsed.completedOperations : [],
      discoveredPatterns: Array.isArray(parsed.discoveredPatterns) ? parsed.discoveredPatterns : [],
      starHistory: Array.isArray(parsed.starHistory) ? parsed.starHistory : [],
    };
  } catch {
    return getInitialEngineState();
  }
}

function saveEngineState(state: EngineState): void {
  try {
    localStorage.setItem(ENGINE_STORAGE_KEY, JSON.stringify(state));
  } catch {
    console.warn('Failed to save engine state');
  }
}

function recomputeStars(ms: Record<string, number>): number {
  return computeTotalStars(ms);
}

export function useEngineState() {
  const [engineState, setEngineState] = useState<EngineState>(getInitialEngineState);
  const [isEngineLoaded, setIsEngineLoaded] = useState(false);

  useEffect(() => {
    const loaded = loadEngineState();
    setEngineState(loaded);
    setIsEngineLoaded(true);
  }, []);

  const persist = useCallback((updater: (prev: EngineState) => EngineState) => {
    setEngineState((prev) => {
      const next = updater(prev);
      saveEngineState(next);
      return next;
    });
  }, []);

  const checkStreak = useCallback(() => {
    persist((prev) => {
      const today = new Date().toISOString().split('T')[0];
      if (prev.lastActiveDate === today) return prev;

      const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
      const newStreak = prev.lastActiveDate === yesterday ? prev.streak + 1 : 1;

      return { ...prev, streak: newStreak, lastActiveDate: today };
    });
  }, [persist]);

  const recordFactAttempt = useCallback(
    (factKey: FactKey, correct: boolean) => {
      persist((prev) => {
        const newMasteryMap = recordAttempt(prev.masteryMap, factKey, correct);
        return { ...prev, masteryMap: newMasteryMap };
      });
    },
    [persist]
  );

  const addStars = useCallback(
    (amount: number, reason: string) => {
      persist((prev) => {
        const today = new Date().toISOString().split('T')[0];
        const newStars = prev.stars + amount;
        return {
          ...prev,
          stars: newStars,
          starHistory: [...prev.starHistory, { date: today, amount, reason }],
        };
      });
    },
    [persist]
  );

  const awardCorrectAnswer = useCallback(
    (key: string) => {
      persist((prev) => {
        const newMilestones = awardStarsForCorrectAnswer(prev.milestoneStars, key);
        if (newMilestones === prev.milestoneStars) return prev;
        return { ...prev, milestoneStars: newMilestones, stars: recomputeStars(newMilestones) };
      });
    },
    [persist]
  );

  const awardLessonComplete = useCallback(
    (key: string) => {
      persist((prev) => {
        const newMilestones = awardStarsForLessonComplete(prev.milestoneStars, key);
        if (newMilestones === prev.milestoneStars) return prev;
        return { ...prev, milestoneStars: newMilestones, stars: recomputeStars(newMilestones) };
      });
    },
    [persist]
  );

  const awardPracticeComplete = useCallback(
    (key: string) => {
      persist((prev) => {
        const newMilestones = awardStarsForPracticeComplete(prev.milestoneStars, key);
        if (newMilestones === prev.milestoneStars) return prev;
        return { ...prev, milestoneStars: newMilestones, stars: recomputeStars(newMilestones) };
      });
    },
    [persist]
  );

  const awardQuizComplete = useCallback(
    (key: string) => {
      persist((prev) => {
        const newMilestones = awardStarsForQuizComplete(prev.milestoneStars, key);
        if (newMilestones === prev.milestoneStars) return prev;
        return { ...prev, milestoneStars: newMilestones, stars: recomputeStars(newMilestones) };
      });
    },
    [persist]
  );

  const awardDailyMission = useCallback(() => {
    persist((prev) => ({
      ...prev,
      stars: awardStarsForDailyMission(prev.stars),
    }));
  }, [persist]);

  const unlockBadge = useCallback(
    (badgeId: BadgeId) => {
      persist((prev) => ({
        ...prev,
        achievements: unlockAchievement(prev.achievements, badgeId),
      }));
    },
    [persist]
  );

  const markOperationComplete = useCallback(
    (operation: string) => {
      persist((prev) => {
        if (prev.completedOperations.includes(operation)) return prev;
        return { ...prev, completedOperations: [...prev.completedOperations, operation] };
      });
    },
    [persist]
  );

  const discoverPattern = useCallback(
    (tableNumber: number) => {
      persist((prev) => {
        if (prev.discoveredPatterns.includes(tableNumber)) return prev;
        return { ...prev, discoveredPatterns: [...prev.discoveredPatterns, tableNumber] };
      });
    },
    [persist]
  );

  const ensureDailyMission = useCallback(() => {
    persist((prev) => {
      if (prev.dailyMission && !isMissionExpired(prev.dailyMission)) return prev;
      return { ...prev, dailyMission: generateDailyMission('Explorer') };
    });
  }, [persist]);

  useEffect(() => {
    if (isEngineLoaded) {
      ensureDailyMission();
    }
  }, [isEngineLoaded, ensureDailyMission]);

  const updateMission = useCallback(
    (type: 'practice' | 'review' | 'challenge', increment = 1) => {
      persist((prev) => {
        if (!prev.dailyMission || isMissionExpired(prev.dailyMission)) return prev;
        const updated = updateMissionProgress(prev.dailyMission, type, increment);
        return { ...prev, dailyMission: updated };
      });
    },
    [persist]
  );

  const getWeakFactsList = () => getWeakFacts(engineState.masteryMap);
  const getDueFactsList = () => getDueFacts(engineState.masteryMap);
  const getNewBadges = () => engineState.achievements.filter((a) => a.unlockedAt !== null);

  return {
    engineState,
    isEngineLoaded,
    checkStreak,
    recordFactAttempt,
    addStars,
    awardCorrectAnswer,
    awardLessonComplete,
    awardPracticeComplete,
    awardQuizComplete,
    awardDailyMission,
    unlockBadge,
    markOperationComplete,
    discoverPattern,
    updateMission,
    getWeakFacts: getWeakFactsList,
    getDueFacts: getDueFactsList,
    getNewBadges,
  };
}
