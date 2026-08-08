import { Example, PracticeProblem, QuizQuestion, ConceptIntro, DifficultyLevel, EMOJI_SAFE_LIMIT, Translate } from './types';
import { pickEmojis } from './emoji-pool';
import { pickUniquePair, levelMax, Pair } from './unique-pair';

function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pickOperands(difficulty: DifficultyLevel): Pair {
  if (difficulty === 'easy') {
    const a = randInt(2, 10);
    const b = randInt(1, a - 1);
    return { a, b };
  }
  if (difficulty === 'medium') {
    const a = randInt(10, 50);
    const b = randInt(1, a - 1);
    return { a, b };
  }
  while (true) {
    const a = randInt(20, 99);
    const b = randInt(1, a - 1);
    if (a - b <= levelMax('hard')) return { a, b };
  }
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

function getHint(t: Translate): string {
  return t('operations.practiceTip.subtraction');
}

export function generateLearnExamples(difficulty: DifficultyLevel, t: Translate): Example[] {
  const emojis = pickEmojis(5);
  const examples: Example[] = [];
  const used = new Set<string>();

  for (let i = 0; i < 5; i++) {
    const { a, b } = pickUniquePair(difficulty, used, pickOperands);
    const result = a - b;
    const emoji = emojis[i];
    const safe = isEmojiSafe(a, b, result);
    const h = 'operations.subtraction';
    const opts = { a, b, result, steps: Math.abs(b) };

    let hint: string;
    let explanation: string;

    if (difficulty === 'easy') {
      hint = t(emoji === '🐝' ? `${h}.hints.easyCountBees` : `${h}.hints.easyCountItems`);
      if (safe) {
        explanation = emojiLine(a, b, result, emoji);
      } else {
        explanation = t(`${h}.explanations.easyNotSafe`, opts);
      }
    } else if (difficulty === 'medium') {
      hint = t(`${h}.hints.mediumPositive`);
      explanation = t(`${h}.explanations.mediumPositive`, opts);
    } else {
      hint = t(`${h}.hints.hardPositiveStart`);
      explanation = t(`${h}.explanations.hardPositiveStart`, opts);
    }

    examples.push({ operand1: a, operand2: b, operation: 'subtraction', result, emojiSafe: safe, hint, explanation, emoji });
  }

  return examples;
}

export function generatePracticeProblems(difficulty: DifficultyLevel, t: Translate): PracticeProblem[] {
  const emojis = pickEmojis(5);
  const problems: PracticeProblem[] = [];
  const used = new Set<string>();

  for (let i = 0; i < 5; i++) {
    const { a, b } = pickUniquePair(difficulty, used, pickOperands);
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
      explanation: t('operations.subtraction.explanations.practiceFallback', { a, b, result }) + (safe ? ` ${emojiLine(a, b, result, emoji)}` : ''),
      emoji,
      tip: getHint(t),
    });
  }

  return problems;
}

export function generateQuizQuestions(difficulty: DifficultyLevel, t: Translate): QuizQuestion[] {
  const questions: QuizQuestion[] = [];
  const qs: Array<{ a: number; b: number }> = [];
  const used = new Set<string>();

  for (let i = 0; i < 5; i++) {
    const { a, b } = pickUniquePair(difficulty, used, pickOperands);
    qs.push({ a, b });
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
    const hint = t('operations.subtraction.quizHint', { result, a, b });
    questions.push({ label, correctAnswer: result, options: shuffleArray(Array.from(options)), hint });
  }

  return questions;
}

export function getConceptIntro(difficulty: DifficultyLevel, t: Translate): ConceptIntro | null {
  if (difficulty === 'easy') {
    return { copy: t('operations.conceptIntro.subtraction.easy'), level: 'easy' };
  }
  if (difficulty === 'medium') {
    return { copy: t('operations.conceptIntro.subtraction.medium'), level: 'medium' };
  }
  if (difficulty === 'hard') {
    return { copy: t('operations.conceptIntro.subtraction.hard'), level: 'hard' };
  }
  return null;
}