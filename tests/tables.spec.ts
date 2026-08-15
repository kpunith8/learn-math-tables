import { test, expect } from './fixtures';

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