import { DifficultyLevel } from './types';

export type Pair = { a: number; b: number };

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