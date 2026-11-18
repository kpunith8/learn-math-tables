import { Plus, Minus, X, Divide, type LucideIcon } from 'lucide-react';
import type { TFunction } from 'i18next';

export type Operation = 'addition' | 'subtraction' | 'multiplication' | 'division';
export type DifficultyLevel = 'easy' | 'medium' | 'hard';

// i18next's `t` is an overloaded generic function; i18next 27 tightened its
// options parameter so a hand-written `(key, options?) => string` shape no
// longer accepts it. Alias the library type instead of restating it.
export type Translate = TFunction;

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

export const OPERATION_META: Record<Operation, { icon: LucideIcon; name: string; tagline: string; description: string; color: string }> = {
  addition: { icon: Plus, name: 'Addition', tagline: 'Put numbers together!', description: 'Addition is putting two groups together to find the total!', color: '#4FA8F5' },
  subtraction: { icon: Minus, name: 'Subtraction', tagline: 'Take some away!', description: 'Subtraction is taking some away to see what\'s left!', color: '#57C278' },
  multiplication: { icon: X, name: 'Multiplication', tagline: 'Count in groups!', description: 'Multiplication is counting in equal groups — a fast way to add!', color: '#7E8CD9' },
  division: { icon: Divide, name: 'Division', tagline: 'Share things fairly!', description: 'Division is sharing a total equally into groups!', color: '#FF7A59' },
};

export const EMOJI_SAFE_LIMIT = 10;
