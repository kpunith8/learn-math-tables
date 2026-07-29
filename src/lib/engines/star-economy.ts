import { STAR_REWARDS, STAR_CAPS } from './types';

export function awardStarsForCorrectAnswer(
  milestoneStars: Record<string, number>,
  key: string,
): Record<string, number> {
  const milestoneKey = `${key}:practice`;
  const current = milestoneStars[milestoneKey] ?? 0;
  const earned = Math.min(current + STAR_REWARDS.correctAnswer, STAR_CAPS.practice);
  if (earned <= current) return milestoneStars;
  return { ...milestoneStars, [milestoneKey]: earned };
}

export function awardStarsForLessonComplete(
  milestoneStars: Record<string, number>,
  key: string,
): Record<string, number> {
  const milestoneKey = `${key}:lesson`;
  const current = milestoneStars[milestoneKey] ?? 0;
  const earned = Math.max(current, STAR_REWARDS.lessonComplete);
  if (earned <= current) return milestoneStars;
  return { ...milestoneStars, [milestoneKey]: earned };
}

export function awardStarsForPracticeComplete(
  milestoneStars: Record<string, number>,
  key: string,
): Record<string, number> {
  const milestoneKey = `${key}:practice`;
  const current = milestoneStars[milestoneKey] ?? 0;
  const capped = Math.min(current + STAR_REWARDS.practiceComplete, STAR_CAPS.practice);
  if (capped <= current) return milestoneStars;
  return { ...milestoneStars, [milestoneKey]: capped };
}

export function awardStarsForQuizComplete(
  milestoneStars: Record<string, number>,
  key: string,
): Record<string, number> {
  const milestoneKey = `${key}:quiz`;
  const current = milestoneStars[milestoneKey] ?? 0;
  const earned = Math.max(current, STAR_REWARDS.quizComplete);
  if (earned <= current) return milestoneStars;
  return { ...milestoneStars, [milestoneKey]: earned };
}

export function awardStarsForDailyMission(stars: number): number {
  return stars + STAR_REWARDS.dailyMission;
}

export function awardStarsForStreak(stars: number): number {
  return stars + STAR_REWARDS.streakBonus;
}

export function computeTotalStars(milestoneStars: Record<string, number>): number {
  return Object.values(milestoneStars).reduce((sum, v) => sum + v, 0);
}

export function getStarsToNextMilestone(stars: number): number {
  const milestones = [10, 25, 50, 100, 150, 200, 300, 500];
  for (const m of milestones) {
    if (stars < m) return m - stars;
  }
  return Infinity;
}
