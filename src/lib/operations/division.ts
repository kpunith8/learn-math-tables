import { Example, PracticeProblem, QuizQuestion, ConceptIntro, DifficultyLevel, EMOJI_SAFE_LIMIT, Translate } from './types';
import { pickEmojis } from './emoji-pool';
import { pickUniquePair, levelMax, Pair } from './unique-pair';

function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function shuffleArray<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5);
}

function pickOperands(difficulty: DifficultyLevel): Pair {
  if (difficulty === 'easy') {
    while (true) {
      const b = randInt(1, 5);
      const result = randInt(1, 5);
      if (b * result <= levelMax('easy')) return { a: b * result, b };
    }
  }
  if (difficulty === 'medium') {
    while (true) {
      const b = randInt(2, 8);
      const result = randInt(2, 9);
      if (b * result <= levelMax('medium')) return { a: b * result, b };
    }
  }
  while (true) {
    const b = randInt(2, 9);
    const result = randInt(3, 12);
    if (b * result <= levelMax('hard')) return { a: b * result, b };
  }
}

function isEmojiSafe(a: number, b: number, result: number): boolean {
  return a >= 0 && b >= 0 && result >= 0 && a <= EMOJI_SAFE_LIMIT && b <= EMOJI_SAFE_LIMIT && result <= EMOJI_SAFE_LIMIT;
}

function emojiSplit(total: number, groups: number, emoji: string): string {
  const perGroup = total / groups;
  const groupsStr = Array.from({ length: groups }, () => emoji.repeat(perGroup)).join(' | ');
  return `${emoji.repeat(total)} → ${groupsStr}`;
}

function getHint(t: Translate): string {
  return t('operations.practiceTip.division');
}

export function generateLearnExamples(difficulty: DifficultyLevel, t: Translate): Example[] {
  const emojis = pickEmojis(5);
  const examples: Example[] = [];
  const used = new Set<string>();

  for (let i = 0; i < 5; i++) {
    const { a, b } = pickUniquePair(difficulty, used, pickOperands);
    const result = a / b;
    const emoji = emojis[i];
    const safe = isEmojiSafe(a, b, result);
    const h = 'operations.division';
    const opts = { a, b, result, emoji, emojiSplit: emojiSplit(a, b, emoji) };

    let hint: string;
    let explanation: string;

    if (difficulty === 'easy') {
      if (a === 0) {
        hint = t(`${h}.hints.easyZero`);
        explanation = t(`${h}.explanations.easyZero`, opts);
      } else if (b === 1) {
        hint = t(`${h}.hints.easyOne`);
        explanation = t(`${h}.explanations.easyOne`, opts);
      } else {
        hint = t(emoji === '🍪' ? `${h}.hints.easyCountCookies` : `${h}.hints.easyCountItems`);
        if (safe && a > 0 && b > 0 && result > 0) {
          explanation = t(`${h}.explanations.easyGeneralSafe`, opts);
        } else {
          explanation = t(`${h}.explanations.easyGeneralNotSafe`, opts);
        }
      }
    } else if (difficulty === 'medium') {
      hint = t(emoji === '🍪' ? `${h}.hints.mediumCountCookies` : `${h}.hints.mediumCountItems`);
      if (safe && a > 0 && b > 0 && result > 0) {
        explanation = t(`${h}.explanations.mediumSafe`, opts);
      } else {
        explanation = t(`${h}.explanations.mediumNotSafe`, opts);
      }
    } else {
      hint = t(`${h}.hints.hard`);
      explanation = t(`${h}.explanations.hard`, opts);
    }

    examples.push({ operand1: a, operand2: b, operation: 'division', result, emojiSafe: safe, hint, explanation, emoji });
  }

  return examples;
}

export function generatePracticeProblems(difficulty: DifficultyLevel, t: Translate): PracticeProblem[] {
  const emojis = pickEmojis(5);
  const problems: PracticeProblem[] = [];
  const used = new Set<string>();

  for (let i = 0; i < 5; i++) {
    const { a, b } = pickUniquePair(difficulty, used, pickOperands);
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
      explanation: t('operations.division.explanations.practiceFallback', { a, b, result }) + (safe && a > 0 && b > 0 && result > 0 ? ` ${emojiSplit(a, b, emoji)}` : ''),
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
    const hint = t('operations.division.quizHint', { result, a, b });
    questions.push({ label, correctAnswer: result, options: shuffleArray(Array.from(options)), hint });
  }

  return questions;
}

export function getConceptIntro(difficulty: DifficultyLevel, t: Translate): ConceptIntro | null {
  if (difficulty === 'easy') {
    return { copy: t('operations.conceptIntro.division.easy'), level: 'easy' };
  }
  if (difficulty === 'medium') {
    return { copy: t('operations.conceptIntro.division.medium'), level: 'medium' };
  }
  if (difficulty === 'hard') {
    return { copy: t('operations.conceptIntro.division.hard'), level: 'hard' };
  }
  return null;
}