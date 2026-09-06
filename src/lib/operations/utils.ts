import { DifficultyLevel, EMOJI_SAFE_LIMIT } from './types';

export function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function shuffleArray<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5);
}

export function isEmojiSafe(a: number, b: number, result: number): boolean {
  return (
    a >= 0 &&
    b >= 0 &&
    result >= 0 &&
    a <= EMOJI_SAFE_LIMIT &&
    b <= EMOJI_SAFE_LIMIT &&
    result <= EMOJI_SAFE_LIMIT
  );
}

const LEVEL_MAX: Record<DifficultyLevel, number> = {
  easy: 20,
  medium: 50,
  hard: 99,
};

export function levelMax(difficulty: DifficultyLevel): number {
  return LEVEL_MAX[difficulty];
}