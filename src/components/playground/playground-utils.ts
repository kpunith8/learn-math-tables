export interface Token {
  id: string;
  value: number;
  kind: 'single' | 'ten' | 'neg-single' | 'neg-ten';
}

function decompose(n: number, prefix: string): Token[] {
  const sign = n < 0 ? -1 : 1;
  const abs = Math.abs(n);
  const tens = Math.floor(abs / 10);
  const ones = abs % 10;
  const tokens: Token[] = [];
  for (let i = 0; i < tens; i++) {
    tokens.push({ id: `${prefix}-t${i}`, value: 10 * sign, kind: sign < 0 ? 'neg-ten' : 'ten' });
  }
  for (let i = 0; i < ones; i++) {
    tokens.push({ id: `${prefix}-s${i}`, value: sign, kind: sign < 0 ? 'neg-single' : 'single' });
  }
  // Zero decomposes to nothing — represent it with a single zero chip.
  if (n === 0) tokens.push({ id: `${prefix}-zero`, value: 0, kind: 'single' });
  return tokens;
}

/** Split operands into draggable tokens (tens-blocks + singles, sign-aware). Caps DOM nodes. */
export function buildTokens(a: number, b: number): { tokensA: Token[]; tokensB: Token[] } {
  return { tokensA: decompose(a, 'a'), tokensB: decompose(b, 'b') };
}

/** 3 answer badges: correct + 2 nearby distractors, shuffled, unique. */
export function makeAnswerOptions(result: number): number[] {
  const options = new Set<number>([result]);
  const deltas = [1, -1, 2, -2, 10, -10];
  for (const d of deltas) {
    if (options.size >= 3) break;
    const candidate = result + d;
    if (candidate !== result && candidate >= -100 && candidate <= 200) options.add(candidate);
  }
  return [...options].sort(() => Math.random() - 0.5);
}
