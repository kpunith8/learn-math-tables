import { test, expect } from './fixtures';
import { OPERATIONS, computeAnswer, readPracticeEquation } from './helpers';

test.use({ reducedMotion: 'reduce' });

for (const op of OPERATIONS) {
  test(`${op} offers practice immediately and places Nova below the controls`, async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(`/${op}/play`);
    await expect(page.getByTestId('play-equation')).toBeVisible();
    const replay = page.getByTestId('play-again');
    const skip = page.getByRole('button', { name: 'Skip and Practice' });
    const nova = page.getByText('Nova says');
    await expect(skip).toBeVisible();
    const replayBox = await replay.boundingBox();
    const novaBox = await nova.boundingBox();
    expect(novaBox!.y).toBeGreaterThan(replayBox!.y + replayBox!.height);
    await skip.click();
    await expect(page).toHaveURL(new RegExp(`/${op}/practice$`));
  });
}

test('correct practice feedback is centered below the check button', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/multiplication/practice');
  const answer = computeAnswer('multiplication', await readPracticeEquation(page, 'multiplication'));
  await page.getByLabel('Answer').fill(String(answer));
  await page.getByRole('button', { name: /Check Answer/ }).click();
  const button = page.getByRole('button', { name: /Check Answer/ });
  const feedback = page.getByText('Yes! Great job!');
  await expect(feedback).toBeVisible();
  const b = await button.boundingBox();
  const f = await feedback.boundingBox();
  expect(f!.y).toBeGreaterThan(b!.y + b!.height);
  expect(Math.abs((f!.x + f!.width / 2) - (b!.x + b!.width / 2))).toBeLessThan(2);
});

test('tables playground does not offer the skip button', async ({ page }) => {
  await page.goto('/tables/play');
  await expect(page.getByTestId('play-equation')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Skip and Practice' })).toHaveCount(0);
});
