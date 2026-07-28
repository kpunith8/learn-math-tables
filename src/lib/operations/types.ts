export type Operation = 'addition' | 'subtraction' | 'multiplication' | 'division';
export type DifficultyLevel = 'easy' | 'medium' | 'hard';
export type Stage = 'difficulty' | 'learn' | 'practice' | 'quiz';

export interface Example {
  operand1: number;
  operand2: number;
  operation: Operation;
  result: number;
  emojiSafe: boolean;
  hint: string;
  explanation: string;
  emoji: string;
}

export interface PracticeProblem {
  operand1: number;
  operand2: number;
  operation: Operation;
  result: number;
  blanks: ('operand1' | 'operand2' | 'result')[];
  emojiSafe: boolean;
  explanation: string;
  emoji: string;
  tip: string;
}

export interface QuizQuestion {
  label: string;
  correctAnswer: number;
  options: number[];
  hint: string;
}

export interface ConceptIntro {
  copy: string;
  level: DifficultyLevel;
}

export const OPERATION_META: Record<Operation, { emoji: string; name: string; tagline: string; description: string; color: string }> = {
  addition: { emoji: '➕', name: 'Addition', tagline: 'Put numbers together!', description: 'Addition is putting two groups together to find the total!', color: '#C2410C' },
  subtraction: { emoji: '➖', name: 'Subtraction', tagline: 'Take some away!', description: 'Subtraction is taking some away to see what\'s left!', color: '#1565C0' },
  multiplication: { emoji: '✖️', name: 'Multiplication', tagline: 'Count in groups!', description: 'Multiplication is counting in equal groups — a fast way to add!', color: '#7B1FA2' },
  division: { emoji: '➗', name: 'Division', tagline: 'Share things fairly!', description: 'Division is sharing a total equally into groups!', color: '#1D9E75' },
};

export const EMOJI_SAFE_LIMIT = 8;
