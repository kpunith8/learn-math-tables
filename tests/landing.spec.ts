import { test, expect } from './fixtures';

test.describe('landing page', () => {
  test('renders header, hero, stats, mission and trail', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { name: 'Welcome Number Explorer!' })).toBeVisible();
    await expect(page.getByText('🌟 Math Adventure!')).toBeVisible();
    await expect(page.getByText('The Number Trail')).toBeVisible();
    await expect(page.getByText("Today's Mission")).toBeVisible();
    await expect(page.getByText('Postcard from Nova')).toBeVisible();
    await expect(page.getByText('Stars', { exact: true })).toBeVisible();
    await expect(page.getByText('Badges', { exact: true })).toBeVisible();
    await expect(page.getByText('Day Streak', { exact: true })).toBeVisible();
    await expect(page.getByText('Addition Island')).toBeVisible();
    await expect(page.getByText('Number Valley')).toBeVisible();
    await expect(page.getByText('Multiplication Mountain')).toBeVisible();
    await expect(page.getByText('Division Castle')).toBeVisible();
    await expect(page.getByText('Table Kingdom')).toBeVisible();
  });

  test('trail cards navigate to operation routes', async ({ page }) => {
    await page.goto('/');
    await page.getByText('Addition Island').click();
    await expect(page).toHaveURL(/\/addition$/);
    await expect(page.getByRole('button', { name: /Got it!/ })).toBeVisible();
  });

  test('difficulty selector switches level and persists to localStorage', async ({ page }) => {
    await page.goto('/');
    const trigger = page.getByRole('combobox', { name: 'Difficulty:' });
    await expect(trigger).toContainText('Easy');
    await trigger.click();
    await page.getByRole('option', { name: '⭐ Medium' }).click();
    await expect(trigger).toContainText('Medium');
    const stored = await page.evaluate(() => localStorage.getItem('mathAdvDifficulty'));
    expect(stored).toBe('medium');
  });

  test('language selector switches to Hindi and sets document lang', async ({ page }) => {
    await page.goto('/');
    const trigger = page.getByRole('combobox', { name: 'Language' });
    await trigger.click();
    await page.getByRole('option', { name: 'हिंदी' }).click();
    const lang = await page.evaluate(() => document.documentElement.lang);
    expect(lang).toBe('hi');
    const stored = await page.evaluate(() => localStorage.getItem('math-adventure-language'));
    expect(stored).toBe('hi');
  });

  test('name modal opens and skips without saving', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: /Add Name/ }).click();
    await expect(page.getByRole('heading', { name: "What's your name?" })).toBeVisible();
    await page.getByRole('button', { name: /^Skip$/ }).click();
    await expect(page.getByRole('heading', { name: "What's your name?" })).toBeHidden();
  });

  test('guest saves their name with a verified token', async ({ page }) => {
    await page.addInitScript(() => {
      (window as unknown as Record<string, unknown>).turnstile = {
        render: () => 'mock-widget-id',
        getResponse: () => 'mock-token',
        reset: () => {},
        remove: () => {},
      };
    });
    await page.route('**/challenges.cloudflare.com/**', (route) => route.abort());
    await page.route('**/api/name', async (route) => {
      const body = JSON.parse(route.request().postData() || '{}');
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ ok: true, name: body.name }),
      });
    });

    await page.goto('/');
    await page.getByRole('button', { name: /Add Name/ }).click();
    await page.getByRole('textbox', { name: "What's your name?" }).fill('Aarav');
    await page.getByRole('button', { name: /Let's Go!/ }).click();
    await expect(page.getByRole('button', { name: /Aarav/ })).toBeVisible();
    const stored = await page.evaluate(() => localStorage.getItem('mathAdvName'));
    expect(stored).toBe('Aarav');
  });
});