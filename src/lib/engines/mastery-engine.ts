import { FactMastery, FactKey } from './types';

export function calculateMasteryScore(correctCount: number, wrongCount: number): number {
  const total = correctCount + wrongCount;
  if (total === 0) return 0;
  const raw = (correctCount / total) * 100;
  const penalty = Math.max(0, (wrongCount - 3)) * 5;
  return Math.max(0, Math.min(100, Math.round(raw - penalty)));
}

export function getReviewPriority(mastery: FactMastery): number {
  const now = Date.now();
  if (mastery.nextReview <= now) return 100;
  const overdue = (now - mastery.nextReview) / (1000 * 60 * 60);
  if (overdue > 0) return Math.min(100, 50 + Math.round(overdue * 2));
  return Math.max(0, Math.round((mastery.nextReview - now) / (1000 * 60 * 60 * 24) * -10));
}

export function getWeakFacts(masteryMap: Record<FactKey, FactMastery>): FactMastery[] {
  return Object.values(masteryMap)
    .filter((m) => m.masteryScore < 70)
    .sort((a, b) => getReviewPriority(b) - getReviewPriority(a));
}

export function getDueFacts(masteryMap: Record<FactKey, FactMastery>): FactMastery[] {
  const now = Date.now();
  return Object.values(masteryMap)
    .filter((m) => m.nextReview <= now)
    .sort((a, b) => getReviewPriority(b) - getReviewPriority(a));
}

export function getNextReviewInterval(currentScore: number): number {
  if (currentScore >= 90) return 30;
  if (currentScore >= 75) return 14;
  if (currentScore >= 50) return 7;
  if (currentScore >= 25) return 3;
  return 1;
}

export function recordAttempt(
  masteryMap: Record<FactKey, FactMastery>,
  fact: FactKey,
  correct: boolean
): Record<FactKey, FactMastery> {
  const now = Date.now();
  const existing = masteryMap[fact];
  const correctCount = (existing?.correctCount ?? 0) + (correct ? 1 : 0);
  const wrongCount = (existing?.wrongCount ?? 0) + (correct ? 0 : 1);
  const newScore = calculateMasteryScore(correctCount, wrongCount);
  const intervalDays = getNextReviewInterval(newScore);

  return {
    ...masteryMap,
    [fact]: {
      fact,
      correctCount,
      wrongCount,
      lastReviewed: now,
      nextReview: now + intervalDays * 24 * 60 * 60 * 1000,
      masteryScore: newScore,
    },
  };
}
