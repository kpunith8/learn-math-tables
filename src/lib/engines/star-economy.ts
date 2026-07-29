import { STAR_REWARDS } from './types';

export function awardStarsForCorrectAnswer(stars: number): number {
  return stars + STAR_REWARDS.correctAnswer;
}

export function awardStarsForLessonComplete(stars: number): number {
  return stars + STAR_REWARDS.lessonComplete;
}

export function awardStarsForPracticeComplete(stars: number): number {
  return stars + STAR_REWARDS.practiceComplete;
}

export function awardStarsForQuizComplete(stars: number): number {
  return stars + STAR_REWARDS.quizComplete;
}

export function awardStarsForDailyMission(stars: number): number {
  return stars + STAR_REWARDS.dailyMission;
}

export function awardStarsForStreak(stars: number): number {
  return stars + STAR_REWARDS.streakBonus;
}

export function getStarsToNextMilestone(stars: number): number {
  const milestones = [10, 25, 50, 100, 150, 200, 300, 500];
  for (const m of milestones) {
    if (stars < m) return m - stars;
  }
  return Infinity;
}
