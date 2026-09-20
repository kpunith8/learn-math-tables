// Single source of truth for every localStorage key (see AGENTS.md → Testing).
//
// Schema convention: current values are the v1 schema. If a stored shape ever
// changes incompatibly, bump STORAGE_SCHEMA_VERSION and read the new
// versionedKey() first, falling back to the legacy key and migrating it —
// never silently orphan a kid's saved progress.
export const STORAGE_SCHEMA_VERSION = 1;

export const STORAGE_KEYS = {
  appState: 'mathAdventure',
  playerName: 'mathAdvName',
  leaderboard: 'mathAdvLeaderboard',
  engine: 'mathAdvEngine',
  difficulty: 'mathAdvDifficulty',
  language: 'math-adventure-language',
  muted: 'mathAdvMuted',
} as const;

export type StorageKeyName = keyof typeof STORAGE_KEYS;

/** Key for the next schema generation of `base` (e.g. `mathAdventure:v2`). */
export function versionedKey(base: string): string {
  return `${base}:v${STORAGE_SCHEMA_VERSION + 1}`;
}
