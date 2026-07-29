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

function emojiGroups(a: number, b: number, emoji: string): string {
  return Array.from({ length: a }, () => emoji.repeat(b)).join('  ');
}

function getHint(): string {
  return 'Try counting in equal groups — how many groups, how many in each?';
}

export function generateLearnExamples(difficulty: DifficultyLevel): Example[] {
  const emojis = pickEmojis(5);
  const examples: Example[] = [];

  for (let i = 0; i < 5; i++) {
    let a: number;
    let b: number;
    if (difficulty === 'easy') {
      a = randInt(0, 5);
      b = randInt(0, 5);
    } else if (difficulty === 'medium') {
      a = randInt(2, 12);
      b = randInt(2, 12);
    } else {
      a = randInt(2, 15);
      b = randInt(-5, 5);
      if (b === 0) b = 2;
    }
    const result = a * b;
    const emoji = emojis[i];
    const safe = isEmojiSafe(a, b, result);

    let hint: string;
    let explanation: string;

    if (difficulty === 'easy') {
      if (a === 0) {
        hint = 'Anything times 0 is always 0!';
        explanation = `${a} × ${b}: when you have 0 groups, there's nothing at all. That's why the answer is always 0!`;
      } else if (a === 1) {
        hint = 'Times 1 stays the same!';
        explanation = `${a} × ${b}: one group of ${b} is just ${b}. That's why anything times 1 stays the same!`;
      } else {
        hint = `Count all the ${emoji === '🎈' ? 'balloons' : 'items'}!`;
        if (safe && a > 0 && b > 0) {
          explanation = `${a} groups of ${b}: ${emojiGroups(a, b, emoji)}\nThat's ${result} in total!`;
        } else {
          explanation = `${a} × ${b} = ${result}. ${a} groups of ${b} makes ${result}.`;
        }
      }
    } else if (difficulty === 'medium') {
      if (a === 0 || b === 0) {
        hint = 'Anything times 0 is 0!';
        explanation = `${a} × ${b} = ${result}. Zero groups means zero items.`;
      } else if (a === 1 || b === 1) {
        hint = 'Times 1 stays the same!';
        explanation = `${a} × ${b} = ${result}. One group keeps the number the same.`;
      } else {
        hint = 'Count all the items in every group!';
        explanation = `${a} × ${b}: ${a} groups of ${b} equals ${result}.`;
      }
    } else {
      if (result < 0) {
        hint = 'Positive times negative always gives a negative answer!';
        explanation = `${a} × ${b}: a positive (${a}) times a negative (${b}) means we have ${a} groups of ${Math.abs(b)} below zero. The answer is ${result}.`;
      } else {
        hint = 'Count all the items in every group!';
        explanation = `${a} × ${b} = ${result}. Multiply the numbers together.`;
      }
    }

    examples.push({ operand1: a, operand2: b, operation: 'multiplication', result, emojiSafe: safe, hint, explanation, emoji });
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
      a = randInt(0, 5);
      b = randInt(0, 5);
    } else if (difficulty === 'medium') {
      a = randInt(2, 12);
      b = randInt(2, 12);
    } else {
      a = randInt(2, 15);
      b = randInt(-5, 5);
      if (b === 0) b = 2;
    }
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
      explanation: `${a} × ${b} = ${result}. ${safe && a > 0 && b > 0 ? emojiGroups(a, b, emoji) : ''}`,
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
      const a = randInt(0, 5);
      const b = randInt(0, 5);
      qs.push({ a, b });
    }
  } else if (difficulty === 'medium') {
    for (let i = 0; i < 5; i++) {
      const a = randInt(6, 10);
      const b = randInt(0, 5);
      qs.push({ a, b });
    }
  } else {
    for (let i = 0; i < 5; i++) {
      const a = randInt(2, 15);
      let b = randInt(-5, 5);
      if (b === 0) b = 2;
      qs.push({ a, b });
    }
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
    const hint = `The answer is ${result} — ${a} × ${b} = ${result}`;
    questions.push({ label, correctAnswer: result, options: shuffleArray(Array.from(options)), hint });
  }

  return questions;
}

export function getConceptIntro(difficulty: DifficultyLevel): ConceptIntro | null {
  if (difficulty === 'easy') {
    return { copy: "Let's discover multiplication! 🎈🎈 + 🎈🎈 + 🎈🎈 = 3 groups of 2 = 6. Multiplication is counting groups — it's like fast adding!", level: 'easy' };
  }
  if (difficulty === 'medium') {
    return { copy: "Time to multiply with bigger numbers! Remember: multiplication means counting equal groups.", level: 'medium' };
  }
  if (difficulty === 'hard') {
    return { copy: "What happens when we multiply a positive and a negative number? A positive times a negative always gives a negative answer!", level: 'hard' };
  }
  return null;
}
