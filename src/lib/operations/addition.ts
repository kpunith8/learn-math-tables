import { PracticeProblem, QuizQuestion, DifficultyLevel, Translate } from './types';
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

