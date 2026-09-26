import { test, expect } from './fixtures';
import { seedAppState } from './helpers';

test.describe('tables', () => {
  test('switching tables shows pattern discovery, then cards reveal answers', async ({ page }) => {
    await page.goto('/tables');
    await expect(page.getByRole('navigation', { name: 'Select a times table' })).toBeVisible();
    await expect(page.getByText('Tap a card to reveal the answer!')).toBeVisible();

    await page.getByRole('button', { name: /Practice/ }).first().click();
    await page.getByRole('button', { name: 'Table 2', exact: true }).click();
    await expect(page.getByRole('heading', { name: 'Pattern Discovery: Table 2' })).toBeVisible();
    await page.getByRole('button', { name: /Show Pattern/ }).click();
    await page.getByRole('button', { name: 'Got it! Start Table 2' }).click();

    const card = page.getByRole('button', { name: '2 times 1, tap to reveal' });
    await expect(card).toBeVisible();
    await card.click();
    await expect(page.getByRole('button', { name: '2 times 1 equals 2' })).toBeVisible();
    await expect(page.getByText('✓ 2')).toBeVisible();
  });

  test('timer pauses while navigated away', async ({ page }) => {
    await seedAppState(page, {
      currentTable: 1,
      revealedCards: [],
      activeCard: null,
      completedTables: [],
      tableStarRatings: {},
      quizResults: {},
      tableStates: {},
      tableStartTime: Date.now() - 5 * 60 * 1000,
      playerName: '',
      difficulty: 'normal',
      practiceMode: false,
    });
    const readTimerSeconds = async () => {
      const text = await page.locator('.timer-display').innerText();
      const m = text.match(/(?:(\d+)m )?(\d+)s/);
      if (!m) throw new Error(`Could not parse timer: "${text}"`);
      return (m[1] ? Number(m[1]) * 60 : 0) + Number(m[2]);
    };

    await page.goto('/tables');
    await expect(page.locator('.timer-display')).toBeVisible();
    const before = await readTimerSeconds();
    expect(before).toBeGreaterThanOrEqual(290);

    // Leave and return via in-app SPA navigation (the way users move): without
    // the pause the timer would grow ~5s, paused it froze.
    await page.locator('header div.hidden.md\\:flex button[aria-label="Home"]').click();
    await expect(page).toHaveURL(/\/$/);
    await page.waitForTimeout(5000);
    await page.getByText('Table Kingdom').click();
    await expect(page).toHaveURL(/\/tables$/);
    await expect(page.locator('.timer-display')).toBeVisible();
    const after = await readTimerSeconds();
    expect(after - before).toBeLessThan(4);
  });

  test('deep link seeds the table and shows its pattern discovery', async ({ page }) => {
    await page.goto('/tables/5');
    await expect(page.getByRole('heading', { name: 'Pattern Discovery: Table 5' })).toBeVisible();
    await page.getByRole('button', { name: /Show Pattern/ }).click();
    await page.getByRole('button', { name: 'Got it! Start Table 5' }).click();

    const card = page.getByRole('button', { name: '5 times 1, tap to reveal' });
    await expect(card).toBeVisible();
    await card.click();
    await expect(page.getByRole('button', { name: '5 times 1 equals 5' })).toBeVisible();
  });
});