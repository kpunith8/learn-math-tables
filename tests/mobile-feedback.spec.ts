import { test, expect } from './fixtures';
import { computeAnswer, parsePlayEquation, readPracticeEquation } from './helpers';

test.use({ reducedMotion: 'reduce' });

test('warm-up completion button fits its card on a narrow screen', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 720 });
  await page.goto('/multiplication/play');
  for (let round = 0; round < 5; round++) {
    await page.getByTestId('clip-play').click();
    await page.getByTestId('clip-skip').click();
    const answer = computeAnswer('multiplication', parsePlayEquation(await page.getByTestId('play-equation').innerText()));
    await page.getByTestId(`play-badge-${answer}`).click();
    const next = page.getByTestId('play-next-round');
    await expect(next).toBeVisible();
    if (round === 4) {
      const bounds = await next.evaluate((button) => {
        const b = button.getBoundingClientRect();
        const card = button.parentElement!.getBoundingClientRect();
        return { left: b.left, right: b.right, cardLeft: card.left, cardRight: card.right, scrollWidth: button.scrollWidth, clientWidth: button.clientWidth };
      });
      expect(bounds.left).toBeGreaterThanOrEqual(bounds.cardLeft);
      expect(bounds.right).toBeLessThanOrEqual(bounds.cardRight);
      expect(bounds.scrollWidth).toBeLessThanOrEqual(bounds.clientWidth);
    }
    await next.click();
  }
});

for (const { name, viewport, visible } of [
  { name: 'mobile', viewport: { width: 375, height: 812 }, visible: false },
  { name: 'desktop', viewport: { width: 1024, height: 768 }, visible: true },
]) {
  test(`practice success notification is ${visible ? 'visible' : 'hidden'} on ${name}`, async ({ page }) => {
    await page.setViewportSize(viewport);
    await page.goto('/multiplication/practice');
    const answer = computeAnswer('multiplication', await readPracticeEquation(page, 'multiplication'));
    await page.getByLabel('Answer').fill(String(answer));
    await page.getByRole('button', { name: /Check Answer/ }).click();
    const toast = page.getByText('Keep it up, Math Explorer!');
    await expect(toast).toBeAttached();
    if (visible) await expect(toast).toBeVisible();
    else await expect(toast).toBeHidden();
  });
}
