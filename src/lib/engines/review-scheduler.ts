import { FactMastery, FactKey, SPACED_REPETITION_INTERVALS } from './types';

export interface ReviewSession {
  dueFacts: FactMastery[];
  weakFacts: FactMastery[];
  totalReviewed: number;
}

export function getNextReviewDate(currentMastery: number): number {
  const intervals = SPACED_REPETITION_INTERVALS;
  if (currentMastery >= 90) return intervals[4];
  if (currentMastery >= 75) return intervals[3];
  if (currentMastery >= 50) return intervals[2];
  if (currentMastery >= 25) return intervals[1];
  return intervals[0];
}

export function scheduleFactsForReview(
  masteryMap: Record<FactKey, FactMastery>,
  maxFacts = 5
): FactMastery[] {
  const now = Date.now();
  const due = Object.values(masteryMap)
    .filter((m) => m.nextReview <= now)
    .sort((a, b) => {
      const aScore = a.masteryScore;
      const bScore = b.masteryScore;
      if (aScore !== bScore) return aScore - bScore;
      return a.nextReview - b.nextReview;
    });

  return due.slice(0, maxFacts);
}

export function hasDueReviews(masteryMap: Record<FactKey, FactMastery>): boolean {
  const now = Date.now();
  return Object.values(masteryMap).some((m) => m.nextReview <= now);
}

export function getReviewSummary(masteryMap: Record<FactKey, FactMastery>): {
  totalFacts: number;
  masteredFacts: number;
  weakFacts: number;
  dueToday: number;
} {
  const now = Date.now();
  const facts = Object.values(masteryMap);
  return {
    totalFacts: facts.length,
    masteredFacts: facts.filter((f) => f.masteryScore >= 80).length,
    weakFacts: facts.filter((f) => f.masteryScore < 70).length,
    dueToday: facts.filter((f) => f.nextReview <= now).length,
  };
}
