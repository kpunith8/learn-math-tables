export type FactKey = string;

export interface FactMastery {
  fact: FactKey;
  correctCount: number;
  wrongCount: number;
  lastReviewed: number;
  nextReview: number;
  masteryScore: number;
}

export type BadgeId =
  | 'addition-hero'
  | 'subtraction-ninja'
  | 'multiplication-master'
  | 'division-champion'
  | 'table-detective'
  | 'pattern-hunter'
  | 'math-explorer'
  | 'first-quiz'
  | 'perfect-score'
  | 'streak-3'
  | 'streak-7'
  | 'star-collector-50';

export interface Achievement {
  id: BadgeId;
  label: string;
  description: string;
  icon: string;
  unlockedAt: number | null;
}

export const ALL_ACHIEVEMENTS: Achievement[] = [
  { id: 'addition-hero', label: 'Addition Hero', description: 'Complete addition on any difficulty', icon: '➕', unlockedAt: null },
  { id: 'subtraction-ninja', label: 'Subtraction Ninja', description: 'Complete subtraction on any difficulty', icon: '➖', unlockedAt: null },
  { id: 'multiplication-master', label: 'Multiplication Master', description: 'Complete multiplication on any difficulty', icon: '✖️', unlockedAt: null },
  { id: 'division-champion', label: 'Division Champion', description: 'Complete division on any difficulty', icon: '➗', unlockedAt: null },
  { id: 'table-detective', label: 'Table Detective', description: 'Complete a full times table', icon: '🔍', unlockedAt: null },
  { id: 'pattern-hunter', label: 'Pattern Hunter', description: 'Discover 3 table patterns', icon: '🔮', unlockedAt: null },
  { id: 'math-explorer', label: 'Math Explorer', description: 'Try all 4 operations', icon: '🧭', unlockedAt: null },
  { id: 'first-quiz', label: 'Quiz Starter', description: 'Complete your first quiz', icon: '📝', unlockedAt: null },
  { id: 'perfect-score', label: 'Perfect Score', description: 'Get all questions right in a quiz', icon: '💯', unlockedAt: null },
  { id: 'streak-3', label: 'On Fire!', description: '3-day learning streak', icon: '🔥', unlockedAt: null },
  { id: 'streak-7', label: 'Week Warrior', description: '7-day learning streak', icon: '⚡', unlockedAt: null },
  { id: 'star-collector-50', label: 'Star Collector', description: 'Earn 50 stars', icon: '⭐', unlockedAt: null },
];

export interface DailyMission {
  generatedDate: string;
  tasks: MissionTask[];
  completed: boolean;
  starsAwarded: boolean;
}

export interface MissionTask {
  description: string;
  type: 'practice' | 'review' | 'challenge';
  target: number;
  progress: number;
  completed: boolean;
}

export const STAR_REWARDS = {
  correctAnswer: 1,
  lessonComplete: 5,
  practiceComplete: 3,
  quizComplete: 10,
  dailyMission: 15,
  streakBonus: 5,
} as const;

export const SPACED_REPETITION_INTERVALS = [1, 3, 7, 14, 30] as const;
