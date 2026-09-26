import { devices } from '@playwright/test';
import { test, expect } from './fixtures';

// Touch-context suite (mobile viewport + touch input) guarding tap-to-fly and
// real touchscreen drags. Chromium-only like the rest of the suite.
test.use({ ...devices['iPhone 13'], browserName: 'chromium' });

test.describe('playground on touch', () => {
  test('tap flies a token into the merge pot', async ({ page }) => {
    await page.goto('/addition/play');
    await expect(page.getByTestId('play-equation')).toBeVisible();
    const startCount = await page.getByTestId(/^play-token-/).count();
    await page.getByTestId(/^play-token-/).first().tap();
    await expect
      .poll(() => page.getByTestId(/^play-token-/).count(), { timeout: 8000 })
      .toBeLessThan(startCount);
  });

  test('touch drag drops a token into the merge pot', async ({ page }) => {
    await page.goto('/addition/play');
    await expect(page.getByTestId('play-equation')).toBeVisible();
    const startCount = await page.getByTestId(/^play-token-/).count();
    const sb = await page.getByTestId(/^play-token-/).first().boundingBox();
    const zb = await page.getByTestId('play-dropzone').boundingBox();
    if (!sb || !zb) throw new Error('no boxes');
    const sx = sb.x + sb.width / 2;
    const sy = sb.y + sb.height / 2;
    const ex = zb.x + zb.width / 2;
    const ey = zb.y + zb.height / 2;
    const session = await page.context().newCDPSession(page);
    await session.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: sx, y: sy, id: 1 }] });
    for (let i = 1; i <= 12; i++) {
      await session.send('Input.dispatchTouchEvent', {
        type: 'touchMove',
        touchPoints: [{ x: sx + ((ex - sx) * i) / 12, y: sy + ((ey - sy) * i) / 12, id: 1 }],
      });
    }
    await session.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
    await expect
      .poll(() => page.getByTestId(/^play-token-/).count(), { timeout: 8000 })
      .toBeLessThan(startCount);
  });
});
