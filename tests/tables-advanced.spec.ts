import { test, expect } from './fixtures';
import { seedAppState, seedEngineState, seedName, mockKindeAuth, solveTablesQuiz } from './helpers';

const COMPLETED_TABLE_1 = {
  currentTable: 1,
  revealedCards: Array.from({ length: 10 }, (_, i) => `1x${i + 1}`),
  activeCard: null,
  completedTables: [],
  tableStarRatings: {},
  quizResults: {},
  tableStates: {},
  tableStartTime: Date.now() - 99999999,
  playerName: 'Aarav',
  difficulty: 'normal',
  practiceMode: false,
};

test.describe('tables — state hydration', () => {
  test('hydrates and sanitizes saved app state', async ({ page }) => {
    await seedEngineState(page, { discoveredPatterns: [3] });
    await seedAppState(page, {
      currentTable: 3,
      revealedCards: ['3x1', '3x5', 'bad-key', '9x9'],
      activeCard: '3x2',
      completedTables: [1, 5, 3, 2],
      tableStarRatings: { 1: 3, 2: 9, 3: 2 },
      quizResults: { 1: { correct: 4, total: 5 }, 2: { correct: 9, total: 1 } },
      tableStates: { 1: { revealed: ['1x1', 'junk'], activeCard: '1x2' }, 3: { revealed: ['3x2'], activeCard: null } },
      tableStartTime: 0,
      playerName: 'a name that is far too long to keep',
      difficulty: 'bogus',
      practiceMode: true,
    });

    await page.goto('/tables');

    // tableStates[3] wins for the current table: only 3x2 is revealed
    await expect(page.getByRole('button', { name: '3 times 2 equals 6' })).toBeVisible();
    await expect(page.getByRole('button', { name: '3 times 1, tap to reveal' })).toBeVisible();
  });

  test('corrupt app storage falls back to a fresh table', async ({ page }) => {
    await seedEngineState(page, { discoveredPatterns: [1] });
    await page.addInitScript(() => {
      localStorage.setItem('mathAdventure', 'this is not valid json');
    });

    await page.goto('/tables');
    await expect(page.getByText('Tap a card to reveal the answer!')).toBeVisible();
    await expect(page.getByRole('button', { name: '1 times 1, tap to reveal' })).toBeVisible();

    // non-object JSON (an array) also fails isPlainObject
    await page.addInitScript(() => {
      localStorage.setItem('mathAdventure', '[1,2]');
    });
    await page.goto('/tables');
    await expect(page.getByRole('button', { name: '1 times 1, tap to reveal' })).toBeVisible();
  });
});

test.describe('tables — completion flow', () => {
  test('completing a table triggers celebration, quiz, and leaderboard entry', async ({ page }) => {
    await seedEngineState(page, { discoveredPatterns: [1, 2] });
    await seedName(page, 'Aarav');
    await seedAppState(page, COMPLETED_TABLE_1);

    await page.goto('/tables');
    await expect(page.locator('.celebration-overlay')).toBeVisible();
    await page.locator('.celebration-overlay').click();

    await solveTablesQuiz(page, 1, { wrongOnFirst: true });

    await expect(page.getByText('2 × 1 = ?')).toBeVisible();
    const leaderboard = await page.evaluate(() => localStorage.getItem('mathAdvLeaderboard') || '');
    expect(leaderboard).toContain('Aarav');
  });

  test('retrieval practice runs after completing a table with weak facts', async ({ page }) => {
    await seedEngineState(page, {
      discoveredPatterns: [1],
      masteryMap: {
        '1x3': { fact: '1x3', correctCount: 0, wrongCount: 1, lastReviewed: 0, nextReview: 0, masteryScore: 0 },
      },
    });
    await seedName(page, 'Aarav');
    await seedAppState(page, { ...COMPLETED_TABLE_1, tableStartTime: Date.now() - 120000 });

    await page.goto('/tables');
    await expect(page.locator('.celebration-overlay')).toBeVisible();
    await page.locator('.celebration-overlay').click();

    await expect(page.getByText('1 × 3')).toBeVisible();
    await page.getByRole('textbox').fill('3');
    await page.getByRole('button', { name: /Check Answer/ }).click();
    await expect(page.getByText('Correct!')).toBeVisible();
    await expect(page.locator('.main-content')).toBeVisible();

    const leaderboard = await page.evaluate(() => localStorage.getItem('mathAdvLeaderboard') || '');
    expect(leaderboard).toContain('Aarav');
  });
});

test.describe('tables — header interactions', () => {
  test('reset progress clears saved progress after confirmation', async ({ page }) => {
    await seedEngineState(page, { discoveredPatterns: [1] });
    await seedAppState(page, {
      currentTable: 1,
      revealedCards: ['1x1', '1x2', '1x3'],
      activeCard: '1x1',
      completedTables: [],
      tableStarRatings: {},
      quizResults: {},
      tableStates: {},
      tableStartTime: Date.now(),
      playerName: '',
      difficulty: 'normal',
      practiceMode: false,
    });

    await page.goto('/tables');
    await expect(page.getByRole('button', { name: '1 times 3 equals 3' })).toBeVisible();

    await page.getByRole('button', { name: /Reset/ }).first().click();
    await page.getByRole('button', { name: /Yes, sure!/ }).click();

    await expect(page.getByRole('button', { name: '1 times 3, tap to reveal' })).toBeVisible();
    await expect(page.getByRole('button', { name: '1 times 3 equals 3' })).toBeHidden();
  });

  test('leaderboard shows seeded entries with formatted times', async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem(
        'mathAdvLeaderboard',
        JSON.stringify({
          Aarav: { totalStars: 9, totalTime: 45, completedTables: 3, maxTables: 10, lastPlayed: 123 },
          Zoya: { totalStars: 6, totalTime: 200, completedTables: 2, maxTables: 10, lastPlayed: 124 },
        })
      );
    });

    await page.goto('/tables');
    await page.getByRole('button', { name: /Scores/ }).first().click();

    await expect(page.getByText('🏆 Scoreboard')).toBeVisible();
    await expect(page.getByText('45 seconds')).toBeVisible();
    await expect(page.getByText('3 min 20 sec')).toBeVisible();
    await expect(page.getByText('Aarav', { exact: true })).toBeVisible();
    await expect(page.getByText('Zoya', { exact: true })).toBeVisible();
  });

  test('mute toggle switches the speaker state', async ({ page }) => {
    await seedEngineState(page, { discoveredPatterns: [1] });
    await page.goto('/tables');

    const mute = page.getByRole('button', { name: /Mute sounds/ }).first();
    await expect(mute).toBeVisible();
    await mute.click();
    await expect(page.getByRole('button', { name: /Unmute sounds/ }).first()).toBeVisible();
  });

  test('escape clears the active card story', async ({ page }) => {
    await seedEngineState(page, { discoveredPatterns: [1, 2] });
    await page.goto('/tables');

    await page.getByRole('button', { name: /Practice/ }).first().click();
    await page.getByRole('button', { name: 'Table 2', exact: true }).click();
    await page.getByRole('button', { name: '2 times 1, tap to reveal' }).click();

    await expect(page.locator('.fact-explainer')).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page.locator('.fact-explainer')).toBeHidden();

    // switching back to a table with saved state restores it
    await page.getByRole('button', { name: 'Table 1', exact: true }).click();
    await expect(page.getByRole('button', { name: '1 times 1, tap to reveal' })).toBeVisible();
    await expect(page.locator('.fact-explainer')).toBeHidden();
  });

  test('mobile drawer opens, toggles practice, and closes via Escape', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await seedEngineState(page, { discoveredPatterns: [1] });
    await page.goto('/tables');

    await page.getByRole('button', { name: 'Open menu' }).click();
    await expect(page.getByRole('button', { name: 'Close menu' })).toBeVisible();

    const panelLeft = () =>
      page.locator('aside.drawer-panel').evaluate((el) => el.getBoundingClientRect().left);
    await expect.poll(panelLeft).toBeLessThan(390);

    await page.locator('.drawer-practice').click();
    const stored = await page.evaluate(() =>
      JSON.parse(localStorage.getItem('mathAdventure') || '{}').practiceMode
    );
    expect(stored).toBe(true);

    await page.getByRole('button', { name: 'Open menu' }).click();
    await expect.poll(panelLeft).toBeLessThan(390);
    await page.keyboard.press('Escape');
    await expect.poll(panelLeft).toBeGreaterThanOrEqual(390);
  });

  test('drawer reset, mute, and home buttons work', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await seedEngineState(page, { discoveredPatterns: [1] });
    await seedAppState(page, {
      currentTable: 1,
      revealedCards: ['1x1', '1x2'],
      activeCard: null,
      completedTables: [],
      tableStarRatings: {},
      quizResults: {},
      tableStates: {},
      tableStartTime: Date.now(),
      playerName: '',
      difficulty: 'normal',
      practiceMode: false,
    });
    await page.goto('/tables');

    // drawer reset
    await page.getByRole('button', { name: 'Open menu' }).click();
    await page.locator('.drawer-reset').click();
    await page.getByRole('button', { name: /Yes, sure!/ }).click();
    await expect(page.getByRole('button', { name: '1 times 1, tap to reveal' })).toBeVisible();

    // drawer mute
    await page.getByRole('button', { name: 'Open menu' }).click();
    await page.locator('.drawer-mute').click();
    await expect(page.getByRole('button', { name: /Unmute sounds/ }).first()).toBeVisible();

    // drawer home navigates to the landing page
    await page.getByRole('button', { name: 'Open menu' }).click();
    await page.locator('.drawer-header').getByRole('button', { name: 'Home' }).click();
    await page.waitForURL('**/');
  });

  test('survives localStorage write failures', async ({ page }) => {
    await page.addInitScript(() => {
      const orig = Storage.prototype.setItem;
      Storage.prototype.setItem = function (key, value) {
        if (key === 'mathAdventure') throw new Error('QuotaExceededError');
        orig.call(this, key, value);
      };
    });
    await page.goto('/tables');

    await page.getByRole('button', { name: '1 times 1, tap to reveal' }).click();
    await expect(page.locator('.fact-explainer')).toBeVisible();
  });
});

test.describe('tables — auth header branches', () => {
  test('shows session controls when authenticated', async ({ page }) => {
    await mockKindeAuth(page, 'authenticated');
    await page.goto('/tables');

    await expect(page.getByRole('link', { name: /Log out/i }).first()).toBeVisible();
    await expect(page.getByText('Aarav', { exact: true }).first()).toBeVisible();
  });

  test('shows guest sign-in link once loaded', async ({ page }) => {
    await mockKindeAuth(page, 'guest');
    await page.goto('/tables');

    await expect(page.getByRole('link', { name: /Sign in/i }).first()).toBeVisible();
  });

  test('mobile drawer shows auth controls when authenticated', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await mockKindeAuth(page, 'authenticated');
    await page.goto('/tables');

    await page.getByRole('button', { name: 'Open menu' }).click();
    const drawer = page.locator('aside.drawer-panel');
    await expect(drawer.getByText('Aarav', { exact: true })).toBeVisible();
    await expect(drawer.getByRole('link', { name: /Log out/i })).toBeVisible();
  });

  test('mobile drawer shows sign-in for guests', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await mockKindeAuth(page, 'guest');
    await page.goto('/tables');

    await page.getByRole('button', { name: 'Open menu' }).click();
    const drawer = page.locator('aside.drawer-panel');
    await expect(drawer.getByRole('link', { name: /Sign in/i })).toBeVisible();
  });
});