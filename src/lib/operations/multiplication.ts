import { Example, PracticeProblem, QuizQuestion, ConceptIntro, DifficultyLevel, EMOJI_SAFE_LIMIT, Translate } from './types';
import { pickEmojis } from './emoji-pool';
import { pickUniquePair, levelMax, Pair } from './unique-pair';

function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pickOperands(difficulty: DifficultyLevel): Pair {
  if (difficulty === 'easy') {
    while (true) {
      const a = randInt(0, 6);
      const b = randInt(0, 6);
      if (a * b <= levelMax('easy')) return { a, b };
    }
  }
  if (difficulty === 'medium') {
    while (true) {
      const a = randInt(2, 12);
      const b = randInt(2, 12);
      if (a * b <= levelMax('medium')) return { a, b };
    }
  }
  while (true) {
    const a = randInt(2, 12);
    let b = randInt(-5, 5);
    if (b === 0) b = 2;
    if (Math.abs(a * b) <= levelMax('hard')) return { a, b };
  }
}

function shuffleArray<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5);
}

function isEmojiSafe(a: number, b: number, result: number): boolean {
  return a >= 0 && b >= 0 && result >= 0 && a <= EMOJI_SAFE_LIMIT && b <= EMOJI_SAFE_LIMIT && result <= EMOJI_SAFE_LIMIT;
}

function emojiGroups(a: number, b: number, emoji: string): string {
  if (a <= 0 || b <= 0) return '';
  return Array.from({ length: a }, () => emoji.repeat(b)).join('  ');
}

function getHint(t: Translate): string {
  return t('operations.practiceTip.multiplication');
}

export function generateLearnExamples(difficulty: DifficultyLevel, t: Translate): Example[] {
  const emojis = pickEmojis(5);
  const examples: Example[] = [];
  const used = new Set<string>();

  for (let i = 0; i < 5; i++) {
    const { a, b } = pickUniquePair(difficulty, used, pickOperands);
    const result = a * b;
    const emoji = emojis[i];
    const safe = isEmojiSafe(a, b, result);
    const h = 'operations.multiplication';
    const opts = { a, b, result, absB: Math.abs(b), emojiGroups: emojiGroups(a, b, emoji) };

    let hint: string;
    let explanation: string;

    if (difficulty === 'easy') {
      if (a === 0) {
        hint = t(`${h}.hints.easyZero`);
        explanation = t(`${h}.explanations.easyZero`, opts);
      } else if (a === 1) {
        hint = t(`${h}.hints.easyOne`);
        explanation = t(`${h}.explanations.easyOne`, opts);
      } else {
        hint = t(emoji === '🎈' ? `${h}.hints.easyCountBalloons` : `${h}.hints.easyCountItems`);
        if (safe && a > 0 && b > 0) {
          explanation = t(`${h}.explanations.easyGeneralSafe`, opts);
        } else {
          explanation = t(`${h}.explanations.easyGeneralNotSafe`, opts);
        }
      }
    } else if (difficulty === 'medium') {
      if (a === 0 || b === 0) {
        hint = t(`${h}.hints.mediumZero`);
        explanation = t(`${h}.explanations.mediumZero`, opts);
      } else if (a === 1 || b === 1) {
        hint = t(`${h}.hints.mediumOne`);
        explanation = t(`${h}.explanations.mediumOne`, opts);
      } else {
        hint = t(`${h}.hints.mediumGeneral`);
        explanation = t(`${h}.explanations.mediumGeneral`, opts);
      }
    } else {
      if (result < 0) {
        hint = t(`${h}.hints.hardNegative`);
        explanation = t(`${h}.explanations.hardNegative`, opts);
      } else {
        hint = t(`${h}.hints.hardPositive`);
        explanation = t(`${h}.explanations.hardPositive`, opts);
      }
    }

    examples.push({ operand1: a, operand2: b, operation: 'multiplication', result, emojiSafe: safe, hint, explanation, emoji });
  }

  return examples;
}

export function generatePracticeProblems(difficulty: DifficultyLevel, t: Translate): PracticeProblem[] {
  const emojis = pickEmojis(5);
  const problems: PracticeProblem[] = [];
  const used = new Set<string>();

  for (let i = 0; i < 5; i++) {
    const { a, b } = pickUniquePair(difficulty, used, pickOperands);
    const result = a * b;
    const emoji = emojis[i];
    const safe = isEmojiSafe(a, b, result);

    problems.push({
      operand1: a,
      operand2: b,
      operation: 'multiplication',
      result,
      blanks: ['result'],
      emojiSafe: safe,
      explanation: t('operations.multiplication.explanations.practiceFallback', { a, b, result, emojiGroups: safe && a > 0 && b > 0 ? emojiGroups(a, b, emoji) : '' }),
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
    const result = a * b;
    const label = `${a} × ${b} = ?`;
    const options = new Set<number>();
    options.add(result);
    const distractors = [
      result + a,
      result - a,
      a + b,
      b === 0 ? 1 : Math.round(result / b),
      -(result),
    ];
    for (const d of shuffleArray(distractors)) {
      if (options.size >= 4) break;
      if (d !== result && d >= -100 && d <= 100) options.add(d);
    }
    const hint = t('operations.multiplication.quizHint', { result, a, b });
    questions.push({ label, correctAnswer: result, options: shuffleArray(Array.from(options)), hint });
  }

  return questions;
}

export function getConceptIntro(difficulty: DifficultyLevel, t: Translate): ConceptIntro | null {
  if (difficulty === 'easy') {
    return { copy: t('operations.conceptIntro.multiplication.easy'), level: 'easy' };
  }
  if (difficulty === 'medium') {
    return { copy: t('operations.conceptIntro.multiplication.medium'), level: 'medium' };
  }
  if (difficulty === 'hard') {
    return { copy: t('operations.conceptIntro.multiplication.hard'), level: 'hard' };
  }
  return null;
}