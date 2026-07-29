import { Example, PracticeProblem, QuizQuestion, ConceptIntro, DifficultyLevel, EMOJI_SAFE_LIMIT } from './types';
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

function getHint(): string {
  return 'Try counting all the items together, starting from the first number!';
}

export function generateLearnExamples(difficulty: DifficultyLevel): Example[] {
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

    let hint: string;
    let explanation: string;

    if (difficulty === 'easy') {
      hint = `Count the ${emoji === '🍎' ? 'apples' : emoji === '🍪' ? 'cookies' : 'items'}!`;
      if (safe) {
        explanation = emojiLine(a, b, result, emoji);
      } else {
        explanation = `${a} + ${b} = ${result}. Add the two numbers together to find the total!`;
      }
    } else if (difficulty === 'medium') {
      hint = 'Add the tens, then the ones!';
      explanation = `${a} + ${b}: first add the tens (${Math.floor(a / 10) * 10} + ${Math.floor(b / 10) * 10} = ${Math.floor((a + b) / 10) * 10}), then the ones (${a % 10} + ${b % 10} = ${(a % 10) + (b % 10)}). Combined: ${result}.`;
    } else {
      hint = 'Think of the number line — adding a negative means moving left!';
      explanation = `${a} + ${b}: start at ${a} on the number line. Adding ${b} means moving ${Math.abs(b)} step${Math.abs(b) > 1 ? 's' : ''} ${b < 0 ? 'left' : 'right'}. You land at ${result}.`;
    }

    examples.push({ operand1: a, operand2: b, operation: 'addition', result, emojiSafe: safe, hint, explanation, emoji });
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
      explanation: `${a} + ${b} = ${result}. ${safe ? emojiLine(a, b, result, emoji) : ''}`,
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
    const label = `${a >= 0 ? a : `(${a})`} + ${b >= 0 ? b : `(${b})`} = ?`;
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
    const hint = `The answer is ${result} — ${a >= 0 ? a : `(${a})`} + ${b >= 0 ? b : `(${b})`} = ${result}`;
    questions.push({ label, correctAnswer: result, options: shuffleArray(Array.from(options)), hint });
  }

  return questions;
}

export function getConceptIntro(difficulty: DifficultyLevel): ConceptIntro | null {
  if (difficulty === 'easy') {
    return { copy: "Addition means putting things together! Let's count everything together. 🍎🍎🍎 + 🍎🍎🍎🍎 = ?", level: 'easy' };
  }
  if (difficulty === 'medium') {
    return { copy: "Let's add bigger numbers! Remember — addition means combining two groups to find the total.", level: 'medium' };
  }
  if (difficulty === 'hard') {
    return { copy: "What happens when we add a negative number? 🤔 Adding a negative number is like taking a step backward!", level: 'hard' };
  }
  return null;
}
