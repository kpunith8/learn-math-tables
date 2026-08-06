import { Example, PracticeProblem, QuizQuestion, ConceptIntro, DifficultyLevel, EMOJI_SAFE_LIMIT, Translate } from './types';
import { pickEmojis } from './emoji-pool';

function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function shuffleArray<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5);
}

function isEmojiSafe(a: number, b: number, result: number): boolean {
  return Math.abs(a) <= EMOJI_SAFE_LIMIT && Math.abs(b) <= EMOJI_SAFE_LIMIT && Math.abs(result) <= EMOJI_SAFE_LIMIT && a >= 0 && b >= 0 && result >= 0;
}

function emojiLine(a: number, b: number, result: number, emoji: string): string {
  const groupA = emoji.repeat(a);
  const groupB = emoji.repeat(b);
  return `${groupA} + ${groupB} = ${emoji.repeat(result)}`;
}

const pad = (n: number): string | number => (n < 0 ? `(${n})` : n);

function getHint(t: Translate): string {
  return t('operations.practiceTip.addition');
}

export function generateLearnExamples(difficulty: DifficultyLevel, t: Translate): Example[] {
  const emojis = pickEmojis(5);
  const examples: Example[] = [];

  for (let i = 0; i < 5; i++) {
    let a: number;
    let b: number;
    if (difficulty === 'easy') {
      a = randInt(1, 9);
      b = randInt(1, 9);
    } else if (difficulty === 'medium') {
      a = randInt(10, 50);
      b = randInt(10, 50);
    } else {
      a = randInt(-8, 8);
      b = randInt(-8, 8);
    }
    const result = a + b;
    const emoji = emojis[i];
    const safe = isEmojiSafe(a, b, result);
    const h = 'operations.addition';

    let hint: string;
    let explanation: string;

    if (difficulty === 'easy') {
      hint = t(emoji === '🍎' ? `${h}.hints.easyCountApples` : emoji === '🍪' ? `${h}.hints.easyCountCookies` : `${h}.hints.easyCountItems`);
      if (safe) {
        explanation = emojiLine(a, b, result, emoji);
      } else {
        explanation = t(`${h}.explanations.easyNotSafe`, { a, b, result });
      }
    } else if (difficulty === 'medium') {
      hint = t(`${h}.hints.medium`);
      explanation = t(`${h}.explanations.medium`, {
        a, b, result,
        tensA: Math.floor(a / 10) * 10,
        tensB: Math.floor(b / 10) * 10,
        tensSum: Math.floor((a + b) / 10) * 10,
        onesA: a % 10,
        onesB: b % 10,
        onesSum: (a % 10) + (b % 10),
      });
    } else {
      hint = t(`${h}.hints.hard`);
      explanation = t(`${h}.explanations.hard`, {
        a, b, result,
        steps: Math.abs(b),
        direction: b < 0 ? 'left' : 'right',
      });
    }

    examples.push({ operand1: a, operand2: b, operation: 'addition', result, emojiSafe: safe, hint, explanation, emoji });
  }

  return examples;
}

export function generatePracticeProblems(difficulty: DifficultyLevel, t: Translate): PracticeProblem[] {
  const emojis = pickEmojis(5);
  const problems: PracticeProblem[] = [];

  for (let i = 0; i < 5; i++) {
    let a: number;
    let b: number;
    if (difficulty === 'easy') {
      a = randInt(1, 9);
      b = randInt(1, 9);
    } else if (difficulty === 'medium') {
      a = randInt(10, 50);
      b = randInt(10, 50);
    } else {
      a = randInt(-8, 8);
      b = randInt(-8, 8);
    }
    const result = a + b;
    const emoji = emojis[i];
    const safe = isEmojiSafe(a, b, result);

    problems.push({
      operand1: a,
      operand2: b,
      operation: 'addition',
      result,
      blanks: ['result'],
      emojiSafe: safe,
      explanation: t('operations.addition.explanations.practiceFallback', { a, b, result }) + (safe ? ` ${emojiLine(a, b, result, emoji)}` : ''),
      emoji,
      tip: getHint(t),
    });
  }

  return problems;
}

export function generateQuizQuestions(difficulty: DifficultyLevel, t: Translate): QuizQuestion[] {
  const questions: QuizQuestion[] = [];
  const qs: Array<{ a: number; b: number }> = [];

  if (difficulty === 'easy') {
    for (let i = 0; i < 5; i++) {
      const a = randInt(1, 9);
      const b = randInt(1, 9);
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
      const a = randInt(-8, 8);
      const b = randInt(-8, 8);
      qs.push({ a, b });
    }
  }

  for (const { a, b } of qs) {
    const result = a + b;
    const label = `${pad(a)} + ${pad(b)} = ?`;
    const options = new Set<number>();
    options.add(result);
    const distractors = [
      result + 1,
      result - 1,
      a - b,
      -(result),
      result + (a > 0 ? 1 : -1),
    ];
    for (const d of shuffleArray(distractors)) {
      if (options.size >= 4) break;
      if (d !== result && d >= -100 && d <= 100) options.add(d);
    }
    const hint = t('operations.addition.quizHint', { result, a: pad(a), b: pad(b) });
    questions.push({ label, correctAnswer: result, options: shuffleArray(Array.from(options)), hint });
  }

  return questions;
}

export function getConceptIntro(difficulty: DifficultyLevel, t: Translate): ConceptIntro | null {
  if (difficulty === 'easy') {
    return { copy: t('operations.conceptIntro.addition.easy'), level: 'easy' };
  }
  if (difficulty === 'medium') {
    return { copy: t('operations.conceptIntro.addition.medium'), level: 'medium' };
  }
  if (difficulty === 'hard') {
    return { copy: t('operations.conceptIntro.addition.hard'), level: 'hard' };
  }
  return null;
}