import { Example, PracticeProblem, QuizQuestion, ConceptIntro, DifficultyLevel, Translate } from './types';
import { pickEmojis } from './emoji-pool';
import { pickUniquePair, Pair } from './unique-pair';
import { randInt, shuffleArray, isEmojiSafe, levelMax } from './utils';

function pickOperands(difficulty: DifficultyLevel): Pair {
  if (difficulty === 'easy') {
    const a = randInt(1, 10);
    const b = randInt(1, 10);
    return { a, b };
  }
  if (difficulty === 'medium') {
    while (true) {
      const a = randInt(11, 40);
      const b = randInt(11, 40);
      if (a + b <= levelMax('medium')) return { a, b };
    }
  }
  while (true) {
    const a = randInt(-60, 60);
    const b = randInt(-60, 60);
    if (Math.abs(a + b) <= levelMax('hard') && !(a === 0 && b === 0)) return { a, b };
  }
}

function emojiLine(a: number, b: number, result: number, emoji: string): string {
  const groupA = emoji.repeat(a);
  const groupB = emoji.repeat(b);
  return `${groupA} + ${groupB} = ${emoji.repeat(result)}`;
}

function getHint(t: Translate): string {
  return t('operations.practiceTip.addition');
}

export function generateLearnExamples(difficulty: DifficultyLevel, t: Translate): Example[] {
  const emojis = pickEmojis(5);
  const examples: Example[] = [];
  const used = new Set<string>();

  for (let i = 0; i < 5; i++) {
    const { a, b } = pickUniquePair(difficulty, used, pickOperands);
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
  const used = new Set<string>();

  for (let i = 0; i < 5; i++) {
    const { a, b } = pickUniquePair(difficulty, used, pickOperands);
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
  const used = new Set<string>();

  for (let i = 0; i < 5; i++) {
    const { a, b } = pickUniquePair(difficulty, used, pickOperands);
    qs.push({ a, b });
  }

  for (const { a, b } of qs) {
    const result = a + b;
    const label = `${String(a)} + ${String(b)} = ?`;
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
    const hint = t('operations.addition.quizHint', { result, a: String(a), b: String(b) });
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