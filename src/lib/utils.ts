import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { Difficulty, CHARACTERS, FUN_FACTS } from './constants';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// ── Utility Functions ──────────────────────────────────────

export const clampInteger = (value: unknown, min: number, max: number, fallback: number): number => {
  const number = Number(value);
  if (!Number.isInteger(number) || number < min || number > max) return fallback;
  return number;
};

export const isPlainObject = (value: unknown): value is Record<string, unknown> => {
  return !!value && Object.prototype.toString.call(value) === '[object Object]';
};

export const isValidCardKeyForTable = (cardKey: unknown, tableNumber: number): boolean => {
  if (typeof cardKey !== 'string') return false;
  const match = cardKey.match(/^(1[0-9]|20|[1-9])x([1-9]|10)$/);
  return !!match && Number(match[1]) === tableNumber;
};

// ── Sanitization Functions ─────────────────────────────────

export const sanitizeCardList = (tableNumber: number, cardValues: unknown): string[] => {
  if (!Array.isArray(cardValues)) return [];
  const seen = new Set<string>();
  return cardValues.filter((cardKey) => {
    if (isValidCardKeyForTable(cardKey, tableNumber) && !seen.has(cardKey as string)) {
      seen.add(cardKey as string);
      return true;
    }
    return false;
  }) as string[];
};

export const sanitizeActiveCard = (tableNumber: number, cardValue: unknown): string | null => {
  return isValidCardKeyForTable(cardValue, tableNumber) ? (cardValue as string) : null;
};

export const sanitizeCompletedTables = (tableValues: unknown): number[] => {
  if (!Array.isArray(tableValues)) return [];
  const seen = new Set<number>();
  const uniqueTables = tableValues
    .map((table) => clampInteger(table, 1, 20, 0))
    .filter((table) => table && !seen.has(table) && (seen.add(table), true))
    .sort((a, b) => a - b);

  const sequentialTables: number[] = [];
  let expectedTable = 1;
  for (const table of uniqueTables) {
    if (table === expectedTable) {
      sequentialTables.push(table);
      expectedTable++;
    }
  }
  return sequentialTables;
};

export const sanitizeTableStars = (starValues: unknown): Record<number, number> => {
  if (!isPlainObject(starValues)) return {};
  const sanitized: Record<number, number> = {};
  for (let tableIndex = 1; tableIndex <= 20; tableIndex++) {
    const starCount = clampInteger(starValues[tableIndex], 1, 3, 0);
    if (starCount) sanitized[tableIndex] = starCount;
  }
  return sanitized;
};

export const sanitizeQuizResults = (resultValues: unknown): Record<number, { correct: number; total: number }> => {
  if (!isPlainObject(resultValues)) return {};
  const sanitized: Record<number, { correct: number; total: number }> = {};
  for (let tableIndex = 1; tableIndex <= 20; tableIndex++) {
    const result = resultValues[tableIndex] as Record<string, unknown> | undefined;
    if (!isPlainObject(result)) continue;
    const totalQuestions = clampInteger(result.total, 1, 5, 5);
    const correctAnswers = clampInteger(result.correct, 0, totalQuestions, 0);
    sanitized[tableIndex] = { correct: correctAnswers, total: totalQuestions };
  }
  return sanitized;
};

export interface TableState {
  revealed: string[];
  activeCard: string | null;
}

export const sanitizeTableStates = (stateValues: unknown): Record<number, TableState> => {
  if (!isPlainObject(stateValues)) return {};
  const sanitized: Record<number, TableState> = {};
  for (let tableIndex = 1; tableIndex <= 20; tableIndex++) {
    const tableState = stateValues[tableIndex] as Record<string, unknown> | undefined;
    if (!isPlainObject(tableState)) continue;
    const safeRevealed = sanitizeCardList(tableIndex, tableState.revealed);
    let safeActive = sanitizeActiveCard(tableIndex, tableState.activeCard);
    if (safeActive && !safeRevealed.includes(safeActive)) safeActive = null;
    sanitized[tableIndex] = { revealed: safeRevealed, activeCard: safeActive };
  }
  return sanitized;
};

// ── Table Management ───────────────────────────────────────

export const getMaxAllowedTable = (practiceMode: boolean, difficulty: Difficulty): number => {
  if (practiceMode) return 20;
  if (difficulty === 'easy') return 10;
  if (difficulty === 'hard') return 20;
  return 15;
};

export const isTableUnlocked = (
  tableNumber: number,
  practiceMode: boolean,
  difficulty: Difficulty,
  completedTables: Set<number>
): boolean => {
  if (practiceMode) return true;
  if (tableNumber > getMaxAllowedTable(practiceMode, difficulty)) return false;
  if (tableNumber === 1) return true;
  return completedTables.has(tableNumber - 1);
};

// ── Helper Functions ───────────────────────────────────────

export const getRandomFunFact = (): string => {
  return FUN_FACTS[Math.floor(Math.random() * FUN_FACTS.length)];
};

export const calculateStarRating = (elapsedSeconds: number): number => {
  if (elapsedSeconds < 90) return 3;
  if (elapsedSeconds < 180) return 2;
  return 1;
};

export const formatElapsedTime = (totalSeconds: number): string => {
  if (totalSeconds < 60) return `${totalSeconds} seconds`;
  const minutes = Math.floor(totalSeconds / 60);
  const remainingSeconds = totalSeconds % 60;
  return `${minutes} min ${remainingSeconds} sec`;
};

// ── SVG Generation ─────────────────────────────────────────

import { SVG_CONFIG } from './constants';

export const generateMultiplicationSVG = (multiplier: number, groupCount: number): string => {
  const totalProduct = multiplier * groupCount;
  const groupsPerRow = Math.min(groupCount, SVG_CONFIG.MAX_PER_ROW);
  const totalRows = Math.ceil(groupCount / groupsPerRow);
  const usableWidth = SVG_CONFIG.WIDTH - SVG_CONFIG.PADDING * 2;
  const circleBoxWidth = Math.min(SVG_CONFIG.CIRCLE_SIZE, Math.floor(usableWidth / groupsPerRow));
  const startXPosition = SVG_CONFIG.PADDING + (usableWidth - groupsPerRow * circleBoxWidth) / 2;

  const circleElements = Array.from({ length: groupCount }, (_, groupIndex) => {
    const rowIndex = Math.floor(groupIndex / groupsPerRow);
    const columnIndex = groupIndex % groupsPerRow;
    const centerX = startXPosition + columnIndex * circleBoxWidth + circleBoxWidth / 2;
    const centerY = SVG_CONFIG.TOP_PAD + rowIndex * SVG_CONFIG.ROW_HEIGHT;
    const radius = Math.min(SVG_CONFIG.CIRCLE_MAX, circleBoxWidth / 2 - 4);
    const fontSize = Math.max(SVG_CONFIG.MIN_FONT, radius * SVG_CONFIG.FONT_SIZE);

    return `
      <circle cx="${centerX}" cy="${centerY}" r="${radius}" fill="#B45309" stroke="${SVG_CONFIG.STROKE}" stroke-width="${SVG_CONFIG.STROKE_WIDTH}"/>
      <text x="${centerX}" y="${centerY + 5}" text-anchor="middle" font-family="system-ui,sans-serif" font-size="${fontSize}" fill="#FFFFFF">${multiplier}</text>
    `;
  }).join('');

  const svgHeight = SVG_CONFIG.TOP_PAD + totalRows * SVG_CONFIG.ROW_HEIGHT + SVG_CONFIG.BOTTOM_PAD;
  const groupLabel = `${groupCount} group${groupCount > 1 ? 's' : ''} of ${multiplier} = ${totalProduct}`;

  return `<svg viewBox="0 0 ${SVG_CONFIG.WIDTH} ${svgHeight}" xmlns="http://www.w3.org/2000/svg">${circleElements}<text x="${SVG_CONFIG.WIDTH / 2}" y="${svgHeight - 4}" text-anchor="middle" font-family="system-ui,sans-serif" font-size="${SVG_CONFIG.GROUP_FONT}" fill="#64748B">${groupLabel}</text></svg>`;
};

// ── Story Generation ───────────────────────────────────────

export const generateStoryText = (tableNumber: number, groupCount: number): string => {
  const character = CHARACTERS[tableNumber] || { name: "our friend", item: "things", emoji: "\u2728" };
  const totalProduct = tableNumber * groupCount;
  const countSequence = Array.from({ length: groupCount }, (_, index) => (index + 1) * tableNumber).join(', ');

  const storyTemplates = [
    `Meet <strong>${character.name} ${character.emoji}</strong>! Every single one has exactly <strong>${tableNumber} ${character.item}</strong>. With just <strong>1</strong>, that's <strong>${tableNumber} \u00D7 1 = ${totalProduct}</strong>. Easy peasy!`,
    `Now there are <strong>2</strong> of ${character.name}! Each has <strong>${tableNumber} ${character.item}</strong>. Count together: <strong>${countSequence}</strong>. So <strong>${tableNumber} \u00D7 2 = ${totalProduct}</strong>!`,
    `Three ${character.emoji}${character.emoji}${character.emoji}! Count the ${character.item} in groups of ${tableNumber}: <strong>${countSequence}</strong>. <strong>${tableNumber} \u00D7 3 = ${totalProduct}</strong>!`,
    `Four friends join the fun! Count all their ${character.item}: <strong>${countSequence}</strong>. Remember: <strong>${tableNumber} \u00D7 4 = ${totalProduct}</strong>!`,
    `Halfway there \u2014 5 of ${character.name}! Their ${character.item} go: <strong>${countSequence}</strong>. <strong>${tableNumber} \u00D7 5 = ${totalProduct}</strong>!`,
    `Six is a super number! All the ${character.item} together: <strong>${countSequence}</strong>. <strong>${tableNumber} \u00D7 6 = ${totalProduct}</strong>!`,
    `Lucky 7! Count each group's ${character.item}: <strong>${countSequence}</strong>. <strong>${tableNumber} \u00D7 7 = ${totalProduct}</strong>. You're doing great!`,
    `Eight is great! All their ${character.item}: <strong>${countSequence}</strong>. <strong>${tableNumber} \u00D7 8 = ${totalProduct}</strong>!`,
    `Almost at 10! Nine groups, count the ${character.item}: <strong>${countSequence}</strong>. <strong>${tableNumber} \u00D7 9 = ${totalProduct}</strong>!`,
    `The big 10! Count ALL the ${character.item}: <strong>${countSequence}</strong>. <strong>${tableNumber} \u00D7 10 = ${totalProduct}</strong>! You finished the whole table!`,
  ];

  return storyTemplates[groupCount - 1] || `${groupCount} groups of ${tableNumber} \u2014 count them: <strong>${countSequence}</strong>. <strong>${tableNumber} \u00D7 ${groupCount} = ${totalProduct}</strong>!`;
};

// ── Quiz Generation ────────────────────────────────────────

export interface QuizQuestion {
  multiplier: number;
  correctAnswer: number;
  options: number[];
}

export const generateQuizQuestions = (tableNumber: number): QuizQuestion[] => {
  const usedMultipliers = new Set<number>();
  const questions: QuizQuestion[] = [];
  const maxAttempts = 100;

  for (let questionIndex = 0; questionIndex < 5; questionIndex++) {
    let multiplier: number;
    let attempts = 0;
    do {
      multiplier = Math.floor(Math.random() * 10) + 1;
      attempts++;
    } while (usedMultipliers.has(multiplier) && attempts < maxAttempts);
    if (attempts >= maxAttempts) break;
    usedMultipliers.add(multiplier);

    const correctAnswer = tableNumber * multiplier;
    const answerOptions = [correctAnswer];
    let fakeAttempts = 0;
    while (answerOptions.length < 4 && fakeAttempts < 50) {
      fakeAttempts++;
      const offset = Math.floor(Math.random() * 7) - 3;
      const fakeAnswer = correctAnswer + offset;
      if (fakeAnswer > 0 && fakeAnswer !== correctAnswer && !answerOptions.includes(fakeAnswer)) {
        answerOptions.push(fakeAnswer);
      }
    }
    answerOptions.sort(() => Math.random() - 0.5);
    questions.push({ multiplier, correctAnswer, options: answerOptions });
  }
  return questions;
};

// ── Speech Synthesis ───────────────────────────────────────

export const cancelSpeech = (): void => {
  if (typeof window !== 'undefined' && window.speechSynthesis) {
    window.speechSynthesis.cancel();
  }
};

export const speakStoryText = (plainText: string, onEnd?: () => void): void => {
  if (typeof window === 'undefined' || !window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(plainText);
  utterance.lang = 'en-US';
  utterance.rate = 0.85;
  utterance.pitch = 1.0;
  utterance.volume = 1.0;

  const availableVoices = window.speechSynthesis.getVoices();
  const preferredVoiceNames = ['Samantha', 'Karen', 'Victoria', 'Google US English', 'Microsoft Zira', 'Apple Samantha'];
  for (const preferredName of preferredVoiceNames) {
    const matchedVoice = availableVoices.find(
      (voice) => voice.name.includes(preferredName) && voice.lang.startsWith('en')
    );
    if (matchedVoice) {
      utterance.voice = matchedVoice;
      break;
    }
  }
  if (!utterance.voice) {
    const englishVoice = availableVoices.find(
      (voice) => voice.lang.startsWith('en') && !voice.localService
    );
    if (englishVoice) utterance.voice = englishVoice;
  }

  utterance.onend = () => onEnd?.();
  utterance.onerror = () => onEnd?.();

  window.speechSynthesis.speak(utterance);
};

// ── Leaderboard ────────────────────────────────────────────

export interface LeaderboardEntry {
  totalStars: number;
  totalTime: number;
  completedTables: number;
  maxTables: number;
  lastPlayed: number;
}

export type LeaderboardData = Record<string, LeaderboardEntry>;

export const calculateLeaderboardStats = (
  tableStarRatings: Record<number, number>
): { totalStars: number; estimatedTime: number; completedCount: number } => {
  let totalStars = 0;
  let estimatedTime = 0;
  let completedCount = 0;

  for (let tableIndex = 1; tableIndex <= 20; tableIndex++) {
    if (tableStarRatings[tableIndex]) {
      totalStars += tableStarRatings[tableIndex];
      completedCount++;
    }
  }
  for (let tableIndex = 1; tableIndex <= 20; tableIndex++) {
    if (tableStarRatings[tableIndex] === 3) estimatedTime += 60;
    else if (tableStarRatings[tableIndex] === 2) estimatedTime += 135;
    else if (tableStarRatings[tableIndex] === 1) estimatedTime += 200;
  }

  return { totalStars, estimatedTime, completedCount };
};
