const EMOJI_GROUPS: string[][] = [
  ['🍎', '🍌', '🍊', '🍇', '🍓', '🍉'],
  ['🐝', '🐞', '🐢', '🐸', '🐤', '🐰'],
  ['🎈', '🎁', '🧸', '⚽', '🚗', '🌟'],
  ['🍪', '🍩', '🧁', '🍭'],
];

const ALL_EMOJIS = EMOJI_GROUPS.flat();

const usedEmojis = new Set<string>();

export function pickEmojis(count: number): string[] {
  const available = ALL_EMOJIS.filter((e) => !usedEmojis.has(e));
  const pool = available.length >= count ? available : ALL_EMOJIS;
  if (pool === ALL_EMOJIS) usedEmojis.clear();
  const shuffled = [...pool].sort(() => Math.random() - 0.5);
  const picked = shuffled.slice(0, count);
  picked.forEach((e) => usedEmojis.add(e));
  return picked;
}

export function resetEmojiPool(): void {
  usedEmojis.clear();
}
