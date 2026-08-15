import { expect, type Page } from '@playwright/test';

export type Operation = 'addition' | 'subtraction' | 'multiplication' | 'division';

export const TODAY = new Date().toISOString().split('T')[0];

export const ALL_ACHIEVEMENTS = [
  { id: 'addition-hero', label: 'Addition Hero', description: 'Complete addition on any difficulty', icon: '➕', unlockedAt: null },
  { id: 'subtraction-ninja', label: 'Subtraction Ninja', description: 'Complete subtraction on any difficulty', icon: '➖', unlockedAt: null },
  { id: 'multiplication-master', label: 'Multiplication Master', description: 'Complete multiplication on any difficulty', icon: '✖️', unlockedAt: null },
  { id: 'division-champion', label: 'Division Champion', description: 'Complete division on any difficulty', icon: '➗', unlockedAt: null },
  { id: 'table-detective', label: 'Table Detective', description: 'Complete a full times table', icon: '🔍', unlockedAt: null },
  { id: 'pattern-hunter', label: 'Pattern Hunter', description: 'Discover 3 table patterns', icon: '🔮', unlockedAt: null },
  { id: 'math-explorer', label: 'Math Explorer', description: 'Try all 4 operations', icon: '🧭', unlockedAt: null },
  { id: 'first-quiz', label: 'Quiz Starter', description: 'Complete your first quiz', icon: '📝', unlockedAt: null },
  { id: 'perfect-score', label: 'Perfect Score', description: 'Get all questions right in a quiz', icon: '💯', unlockedAt: null },
  { id: 'streak-3', label: 'On Fire!', description: '3-day learning streak', icon: '🔥', unlockedAt: null },
  { id: 'streak-7', label: 'Week Warrior', description: '7-day learning streak', icon: '⚡', unlockedAt: null },
  { id: 'star-collector-50', label: 'Star Collector', description: 'Earn 50 stars', icon: '⭐', unlockedAt: null },
];

function baseEngineState() {
  return {
    stars: 0,
    milestoneStars: {},
    streak: 0,
    lastActiveDate: TODAY,
    achievements: ALL_ACHIEVEMENTS.map((a) => ({ ...a })),
    masteryMap: {},
    dailyMission: null,
    completedOperations: [],
    discoveredPatterns: [],
    starHistory: [],
  };
}

export async function seedAppState(page: Page, state: Record<string, unknown>) {
  await page.addInitScript(([key, value]) => {
    localStorage.setItem(key, JSON.stringify(value));
  }, ['mathAdventure', state] as const);
}

export async function seedEngineState(page: Page, overrides: Record<string, unknown>) {
  await page.addInitScript(([key, value]) => {
    localStorage.setItem(key, JSON.stringify(value));
  }, ['mathAdvEngine', { ...baseEngineState(), ...overrides }] as const);
}

export async function seedName(page: Page, name: string) {
  await page.addInitScript(([key, value]) => {
    localStorage.setItem(key, value);
  }, ['mathAdvName', name] as const);
}

const enc = (o: Record<string, unknown>) => Buffer.from(JSON.stringify(o)).toString('base64url');
const makeJwt = (claims: Record<string, unknown>) =>
  `${enc({ alg: 'none', typ: 'JWT' })}.${enc(claims)}.`;

const ID_TOKEN = makeJwt({ sub: 'usr_123', given_name: 'Aarav', email: 'aarav@example.com', picture: '', iat: 1750000000, exp: 1950000000 });
const ACCESS_TOKEN = makeJwt({ sub: 'usr_123', given_name: 'Aarav', permissions: [], org_code: 'org_123', feature_flags: {}, org_name: 'Test', iat: 1750000000, exp: 1950000000 });

/** Mock the Kinde `/api/auth/setup` endpoint the browser client polls. */
export async function mockKindeAuth(page: Page, mode: 'authenticated' | 'guest') {
  await page.route('**/api/auth/setup', async (route) => {
    const body: Record<string, unknown> = {
      message: 'OK',
      env: {
        clientId: 'test-client',
        issuerUrl: 'https://test.kinde.com',
        redirectUrl: 'http://localhost:3000',
      },
    };
    if (mode === 'authenticated') {
      body.accessTokenEncoded = ACCESS_TOKEN;
      body.idTokenRaw = ID_TOKEN;
      body.refreshToken = 'refresh-token';
    }
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(body) });
  });
}

/** Reveal every card of a table (all 10). */
export async function revealAllCards(page: Page, table: number) {
  for (let group = 1; group <= 10; group++) {
    await page.getByRole('button', { name: `${table} times ${group}, tap to reveal` }).click();
  }
}

/** Answer the tables quiz. Optionally answer the first question wrong first. */
export async function solveTablesQuiz(page: Page, table: number, opts: { wrongOnFirst?: boolean } = {}) {
  const dialog = page.getByRole('dialog');
  await dialog.getByRole('radiogroup').waitFor();
  const total = 5;
  for (let q = 0; q < total; q++) {
    const label = await dialog.getByText(/^\d+ × \d+ = \?$/).innerText();
    const m = label.match(/^(\d+) × (\d+) = \?$/);
    if (!m) throw new Error(`Could not parse tables quiz label: "${label}"`);
    const answer = Number(m[1]) * Number(m[2]);

    if (opts.wrongOnFirst && q === 0) {
      const radios = dialog.getByRole('radio');
      const count = await radios.count();
      let wrong = -1;
      for (let i = 0; i < count; i++) {
        const txt = (await radios.nth(i).innerText()).trim();
        if (Number(txt) !== answer) {
          wrong = i;
          break;
        }
      }
      expect(wrong).toBeGreaterThanOrEqual(0);
      await radios.nth(wrong).click();
      await dialog.getByRole('button', { name: /Try Again/ }).click();
    }

    await dialog.getByRole('radio', { name: String(answer), exact: true }).click();
    await dialog.getByRole('button', { name: q < total - 1 ? /^Next$/ : /See Results/ }).click();
  }
  await dialog.getByRole('button', { name: /Continue/ }).click();
}

export const OPERATIONS: Operation[] = ['addition', 'subtraction', 'multiplication', 'division'];

export interface Equation {
  a: number;
  b: number;
  symbol: string;
}

export function computeAnswer(op: Operation, { a, b }: Equation): number {
  switch (op) {
    case 'addition':
      return a + b;
    case 'subtraction':
      return a - b;
    case 'multiplication':
      return a * b;
    case 'division':
      return a / b;
  }
}

export async function readPracticeEquation(page: Page, op: Operation): Promise<Equation> {
  const input = page.getByLabel('Answer');
  if (op === 'multiplication' || op === 'division') {
    const text = await input.locator('..').locator('..').innerText();
    const m = text.match(/(-?\d+)\s*[×÷]\s*(-?\d+)/);
    if (!m) throw new Error(`Could not parse horizontal equation: "${text}"`);
    return { a: Number(m[1]), b: Number(m[2]), symbol: op === 'multiplication' ? '×' : '÷' };
  }

  const text = await input.locator('..').locator('..').locator('..').innerText();
  const lines = text.split('\n').map((s) => s.trim()).filter(Boolean);
  const m = lines[1]?.match(/^([+−])\s*(-?\d+)$/);
  if (!m) throw new Error(`Could not parse vertical equation: "${text}"`);
  return { a: Number(lines[0]), b: Number(m[2]), symbol: m[1] };
}

export async function solvePracticeProblem(page: Page, op: Operation, problemIndex: number, total = 5) {
  const eq = await readPracticeEquation(page, op);
  const answer = computeAnswer(op, eq);
  await page.getByLabel('Answer').fill(String(answer));
  await page.getByRole('button', { name: /Check Answer/ }).click();

  if (problemIndex < total - 1) {
    await expect(page.getByText(`Problem ${problemIndex + 2} of ${total}`)).toBeVisible();
  } else {
    await expect(page.getByText('You finished practicing! 🌈')).toBeVisible();
  }
}

export async function solveQuiz(page: Page, op: Operation, total = 5) {
  for (let q = 0; q < total; q++) {
    const label = await page
      .getByText(/-?\d+\s*[+\u2212×÷]\s*-?\d+\s*=\s*\?/)
      .first()
      .innerText();
    const m = label.match(/(-?\d+)\s*([+\u2212×÷])\s*(-?\d+)\s*=\s*\?/);
    if (!m) throw new Error(`Could not parse quiz label: "${label}"`);
    const answer = computeAnswer(op, { a: Number(m[1]), b: Number(m[3]), symbol: m[2] });
    await page.getByRole('radio', { name: String(answer), exact: true }).click();

    if (q < total - 1) {
      await page.getByRole('button', { name: /^Next$/ }).click();
    }
  }
  await page.getByRole('button', { name: /See Results/ }).click();
  await page.getByRole('button', { name: /Continue/ }).click();
}

export async function completeLearnStage(page: Page, op: Operation) {
  await page.goto(`/${op}`);
  await page.getByRole('button', { name: /Got it!/ }).click();

  for (let i = 0; i < 4; i++) {
    await page.getByRole('button', { name: /^Next$/ }).click();
  }

  await page.getByRole('button', { name: /Let's Practice!/ }).click();
  await expect(page).toHaveURL(new RegExp(`/${op}/practice$`));
  await dismissConceptIfPresent(page);
}

export async function dismissConceptIfPresent(page: Page) {
  const gotIt = page.getByRole('button', { name: /Got it!/ });
  try {
    await gotIt.waitFor({ state: 'visible', timeout: 2000 });
    await gotIt.click();
  } catch {
    // no concept intro on this screen — fine
  }
}