import { DifficultyLevel } from './types';

export type Pair = { a: number; b: number };

const LEVEL_MAX: Record<DifficultyLevel, number> = {
  easy: 20,
  medium: 50,
  hard: 99,
};

export function levelMax(difficulty: DifficultyLevel): number {
  return LEVEL_MAX[difficulty];
}

export function pickUniquePair(
  difficulty: DifficultyLevel,
  used: Set<string>,
  pick: (d: DifficultyLevel) => Pair
): Pair {
  for (let attempt = 0; attempt < 30; attempt++) {
    const pair = pick(difficulty);
    const key = `${pair.a},${pair.b}`;
    if (used.has(key)) continue;
    used.add(key);
    return pair;
  }
  throw new Error('Could not produce a unique problem pair');
}