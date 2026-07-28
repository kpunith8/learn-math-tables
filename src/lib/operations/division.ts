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

function emojiSplit(total: number, groups: number, emoji: string): string {
  const perGroup = total / groups;
  const groupsStr = Array.from({ length: groups }, () => emoji.repeat(perGroup)).join(' | ');
  return `${emoji.repeat(total)} → ${groupsStr}`;
}

function getHint(): string {
  return 'Try sharing the total equally into groups — how many in each group?';
}

const EASY_EXAMPLES: Array<{ a: number; b: number }> = [
  { a: 6, b: 2 }, { a: 8, b: 4 }, { a: 0, b: 5 }, { a: 10, b: 5 }, { a: 12, b: 3 },
];

const MEDIUM_EXAMPLES: Array<{ a: number; b: number }> = [
  { a: 18, b: 3 }, { a: 24, b: 6 }, { a: 30, b: 5 }, { a: 27, b: 9 }, { a: 36, b: 4 },
];

const HARD_EXAMPLES: Array<{ a: number; b: number }> = [
  { a: 36, b: 4 }, { a: 45, b: 5 }, { a: 56, b: 7 }, { a: 72, b: 9 }, { a: 63, b: 7 },
];

export function generateLearnExamples(difficulty: DifficultyLevel): Example[] {
  const emojis = pickEmojis(5);
  const examples: Example[] = [];

  let pool: Array<{ a: number; b: number }>;
  if (difficulty === 'easy') pool = EASY_EXAMPLES;
  else if (difficulty === 'medium') pool = MEDIUM_EXAMPLES;
  else pool = HARD_EXAMPLES;

  for (let i = 0; i < 5; i++) {
    const { a, b } = pool[i];
    const result = a / b;
    const emoji = emojis[i];
    const safe = isEmojiSafe(a, b, result);

    let hint: string;
    let explanation: string;

    if (difficulty === 'easy') {
      if (a === 0) {
        hint = 'Sharing nothing gives everyone nothing!';
        explanation = `${a} ÷ ${b} = ${result}. If you have 0 items to share among ${b} friends, everyone gets 0.`;
      } else if (b === 1) {
        hint = 'Dividing by 1 keeps the same number!';
        explanation = `${a} ÷ ${b} = ${result}. One friend gets everything — so the number stays the same!`;
      } else {
        hint = `Count how many ${emoji === '🍪' ? 'cookies' : 'items'} are in each group!`;
        if (safe && a > 0 && b > 0 && result > 0) {
          explanation = `Share ${a} ${emoji} among ${b} groups: ${emojiSplit(a, b, emoji)}\nEach group gets ${result}!`;
        } else {
          explanation = `${a} ÷ ${b} = ${result}. Share ${a} equally into ${b} groups — each gets ${result}.`;
        }
      }
    } else if (difficulty === 'medium') {
      hint = `Count how many ${emoji === '🍪' ? 'cookies' : 'items'} are in each group!`;
      if (safe && a > 0 && b > 0 && result > 0) {
        explanation = `Share ${a} ${emoji} among ${b} groups: ${emojiSplit(a, b, emoji)}\nEach group gets ${result}!`;
      } else {
        explanation = `${a} ÷ ${b} = ${result}. ${a} shared equally among ${b} gives ${result} each.`;
      }
    } else {
      hint = 'Share the total equally into groups!';
      explanation = `${a} ÷ ${b} = ${result}. Divide ${a} by ${b} to get ${result} in each group.`;
    }

    examples.push({ operand1: a, operand2: b, operation: 'division', result, emojiSafe: safe, hint, explanation, emoji });
  }

  return examples;
}

export function generatePracticeProblems(difficulty: DifficultyLevel): PracticeProblem[] {
  const emojis = pickEmojis(6);
  const problems: PracticeProblem[] = [];

  let problemPool: Array<{ a: number; b: number }>;
  if (difficulty === 'easy') {
    problemPool = [
      { a: 8, b: 2 }, { a: 0, b: 3 }, { a: 15, b: 5 }, { a: 9, b: 3 }, { a: 12, b: 4 }, { a: 10, b: 2 },
    ];
  } else if (difficulty === 'medium') {
    problemPool = [
      { a: 20, b: 4 }, { a: 36, b: 6 }, { a: 42, b: 7 }, { a: 30, b: 5 }, { a: 24, b: 8 }, { a: 54, b: 6 },
    ];
  } else {
    problemPool = [
      { a: 48, b: 6 }, { a: 54, b: 9 }, { a: 63, b: 7 }, { a: 72, b: 8 }, { a: 56, b: 7 }, { a: 81, b: 9 },
    ];
  }

  for (let i = 0; i < 6; i++) {
    const { a, b } = problemPool[i];
    const result = a / b;
    const emoji = emojis[i];
    const safe = isEmojiSafe(a, b, result);

    problems.push({
      operand1: a,
      operand2: b,
      operation: 'division',
      result,
      blanks: ['result'],
      emojiSafe: safe,
      explanation: `${a} ÷ ${b} = ${result}. ${safe && a > 0 && b > 0 && result > 0 ? emojiSplit(a, b, emoji) : ''}`,
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
      const b = randInt(1, 5);
      const result = randInt(1, 5);
      const a = b * result;
      qs.push({ a, b });
    }
  } else if (difficulty === 'medium') {
    for (let i = 0; i < 5; i++) {
      const b = randInt(2, 10);
      const result = randInt(2, 10);
      const a = b * result;
      qs.push({ a, b });
    }
  } else {
    for (let i = 0; i < 5; i++) {
      const b = randInt(2, 9);
      const result = randInt(2, 12);
      const a = b * result;
      qs.push({ a, b });
    }
  }

  for (const { a, b } of qs) {
    const result = a / b;
    const label = `${a} ÷ ${b} = ?`;
    const options = new Set<number>();
    options.add(result);
    const distractors = [
      result + 1,
      result - 1,
      a * b,
      b / a,
      result + 2,
    ];
    for (const d of shuffleArray(distractors)) {
      if (options.size >= 4) break;
      if (d !== result && d >= -100 && d <= 100 && Number.isInteger(d)) options.add(d);
    }
    const hint = `The answer is ${result} — ${a} ÷ ${b} = ${result}`;
    questions.push({ label, correctAnswer: result, options: shuffleArray(Array.from(options)), hint });
  }

  return questions;
}

export function getConceptIntro(difficulty: DifficultyLevel): ConceptIntro | null {
  if (difficulty === 'hard') {
    return { copy: "Can we divide by zero? 🤔 If you try to share 6 cookies among 0 friends, the question doesn't make sense — so we say dividing by zero is 'undefined.'", level: 'hard' };
  }
  return null;
}
