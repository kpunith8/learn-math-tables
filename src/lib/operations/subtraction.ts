import { Example, PracticeProblem, QuizQuestion, ConceptIntro, DifficultyLevel, EMOJI_SAFE_LIMIT } from './types';
import { pickEmojis } from './emoji-pool';

function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function shuffleArray<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5);
}

function isEmojiSafe(a: number, b: number, result: number): boolean {
  return a >= 0 && b >= 0 && result >= 0 && a <= EMOJI_SAFE_LIMIT && b <= EMOJI_SAFE_LIMIT && result <= EMOJI_SAFE_LIMIT;
}

function emojiLine(a: number, b: number, result: number, emoji: string): string {
  const all = emoji.repeat(a);
  const removed = emoji.repeat(b);
  const remaining = emoji.repeat(result);
  return `${all} − ${removed} = ${remaining}`;
}

function getHint(): string {
  return 'Think: what do I have left after taking some away?';
}

export function generateLearnExamples(difficulty: DifficultyLevel): Example[] {
  const emojis = pickEmojis(5);
  const examples: Example[] = [];

  for (let i = 0; i < 5; i++) {
    let a: number;
    let b: number;
    if (difficulty === 'easy') {
      a = randInt(2, 10);
      b = randInt(1, a);
    } else if (difficulty === 'medium') {
      a = randInt(10, 60);
      b = randInt(0, 50);
    } else {
      a = randInt(-10, 90);
      b = randInt(-5, 40);
    }
    const result = a - b;
    const emoji = emojis[i];
    const safe = isEmojiSafe(a, b, result);

    let hint: string;
    let explanation: string;

    if (difficulty === 'easy') {
      hint = `Count the ${emoji === '🐝' ? 'bees' : 'items'} left after some fly away!`;
      if (safe) {
        explanation = emojiLine(a, b, result, emoji);
      } else {
        explanation = `${a} − ${b} = ${result}. Take ${b} away from ${a} to get ${result}.`;
      }
    } else if (difficulty === 'medium') {
      if (result < 0) {
        hint = `It's okay if the answer goes below zero — that's a negative number!`;
        explanation = `${a} − ${b}: we don't have enough ${a}s to take away ${b}, so we go past zero. The answer is ${result}.`;
      } else {
        hint = 'Subtract the tens, then the ones!';
        explanation = `${a} − ${b} = ${result}. Subtract step by step.`;
      }
    } else {
      if (a < 0) {
        hint = 'Starting from a negative number? Move further left on the number line!';
        explanation = `${a} − ${b}: start at ${a} on the number line. Subtract ${b} means moving ${Math.abs(b)} step${Math.abs(b) > 1 ? 's' : ''} left. You land at ${result}.`;
      } else {
        hint = 'Let\'s practice moving along the number line with bigger numbers!';
        explanation = `${a} − ${b} = ${result}. Start at ${a}, subtract ${b}.`;
      }
    }

    examples.push({ operand1: a, operand2: b, operation: 'subtraction', result, emojiSafe: safe, hint, explanation, emoji });
  }

  return examples;
}

export function generatePracticeProblems(difficulty: DifficultyLevel): PracticeProblem[] {
  const emojis = pickEmojis(5);
  const problems: PracticeProblem[] = [];

  for (let i = 0; i < 5; i++) {
    let a: number;
    let b: number;
    if (difficulty === 'easy') {
      a = randInt(2, 10);
      b = randInt(1, a);
    } else if (difficulty === 'medium') {
      a = randInt(10, 60);
      b = randInt(0, 50);
    } else {
      a = randInt(-10, 90);
      b = randInt(-5, 40);
    }
    const result = a - b;
    const emoji = emojis[i];
    const safe = isEmojiSafe(a, b, result);

    problems.push({
      operand1: a,
      operand2: b,
      operation: 'subtraction',
      result,
      blanks: ['result'],
      emojiSafe: safe,
      explanation: `${a} − ${b} = ${result}. ${safe ? emojiLine(a, b, result, emoji) : ''}`,
      emoji,
      tip: getHint(),
    });
  }

  return problems;
}

export function generateQuizQuestions(difficulty: DifficultyLevel): QuizQuestion[] {
  const questions: QuizQuestion[] = [];
  const qs: Array<{ a: number; b: number }> = [];

  if (difficulty === 'easy') {
    for (let i = 0; i < 5; i++) {
      const a = randInt(2, 10);
      const b = randInt(1, a);
      qs.push({ a, b });
    }
  } else if (difficulty === 'medium') {
    for (let i = 0; i < 5; i++) {
      const a = randInt(10, 50);
      const b = randInt(10, 50);
      qs.push({ a, b });
    }
  } else {
    for (let i = 0; i < 5; i++) {
      const a = randInt(-8, 100);
      const b = randInt(1, 50);
      qs.push({ a, b });
    }
  }

  for (const { a, b } of qs) {
    const result = a - b;
    const label = `${a} − ${b} = ?`;
    const options = new Set<number>();
    options.add(result);
    const distractors = [
      result + 1,
      result - 1,
      a + b,
      -(result),
      result + 2,
    ];
    for (const d of shuffleArray(distractors)) {
      if (options.size >= 4) break;
      if (d !== result && d >= -100 && d <= 100) options.add(d);
    }
    const hint = `The answer is ${result} — ${a} − ${b} = ${result}`;
    questions.push({ label, correctAnswer: result, options: shuffleArray(Array.from(options)), hint });
  }

  return questions;
}

export function getConceptIntro(difficulty: DifficultyLevel): ConceptIntro | null {
  if (difficulty === 'easy') {
    return { copy: "🍪🍪🍪🍪🍪🍪🍪 You have 7 cookies! A dinosaur eats 2. How many are left? Subtraction means taking away — let's see what's left!", level: 'easy' };
  }
  if (difficulty === 'medium') {
    return { copy: "What if we don't have enough to take away? Sometimes the answer goes below zero — that's called a negative number!", level: 'medium' };
  }
  if (difficulty === 'hard') {
    return { copy: "Let's practice moving further along the number line, even starting from a negative number!", level: 'hard' };
  }
  return null;
}
