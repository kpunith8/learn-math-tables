import type { Page } from '@playwright/test';
import { test, expect } from './fixtures';
import { parsePlayEquation, computeAnswer, seedEngineState, drainPlayTokens, type Operation } from './helpers';

async function readMilestoneStars(page: Page) {
  return page.evaluate(() => JSON.parse(localStorage.getItem('mathAdvEngine') ?? '{}').milestoneStars ?? {});
}

test.describe('playground', () => {
  test('bare operation URL redirects to the playground', async ({ page }) => {
    await page.goto('/subtraction');
    await expect(page).toHaveURL(/\/subtraction\/play$/);
    await expect(page.getByTestId('play-equation')).toBeVisible();
  });

  test('addition supports real pointer drag into the merge pot', async ({ page }) => {
    await page.goto('/addition/play');
    await expect(page.getByTestId('play-equation')).toBeVisible();

    const token = page.getByTestId(/^play-token-/).first();
    const zone = page.getByTestId('play-dropzone');
    const startCount = await page.getByTestId(/^play-token-/).count();
    await token.dragTo(zone);
    // The dragged token leaves the tray (retry once — the pointer may land outside on a busy frame).
    try {
      await expect.poll(() => page.getByTestId(/^play-token-/).count(), { timeout: 4000 }).toBeLessThan(startCount);
    } catch {
      await page.getByTestId(/^play-token-/).first().dragTo(zone);
      await expect.poll(() => page.getByTestId(/^play-token-/).count()).toBeLessThan(startCount);
    }

    // Finish the round via taps to prove tap + drag interoperate.
    await drainPlayTokens(page);
  });

  test('keyboard players can tap-fly tokens and answer with buttons', async ({ page }) => {
    await page.goto('/addition/play');
    await expect(page.getByTestId('play-equation')).toBeVisible();

    const first = page.getByTestId(/^play-token-/).first();
    const firstId = (await first.getAttribute('data-draggable')) ?? 'missing';
    await first.focus();
    await page.keyboard.press('Enter');
    await expect(page.getByTestId(/^play-token-/).first()).not.toHaveAttribute('data-draggable', firstId);

    for (let attempt = 0; attempt < 4; attempt++) {
      let guard = 0;
      while ((await page.getByTestId(/^play-token-/).count()) > 0 && guard++ < 60) {
        const t = page.getByTestId(/^play-token-/).first();
        await t.focus();
        await page.keyboard.press('Enter');
      }
      if (await page.getByTestId('play-answer-slot').isVisible()) break;
    }
    await expect(page.getByTestId('play-answer-slot')).toBeVisible();
    const eqText = await page.getByTestId('play-equation').innerText();
    const answer = computeAnswer('addition', parsePlayEquation(eqText));
    const badge = page.getByTestId(`play-badge-${answer}`);
    await badge.focus();
    await page.keyboard.press('Enter');
    await expect(page.getByTestId('play-next-round')).toBeVisible();
  });

  test('wrong answer badge shakes and keeps the round going', async ({ page }) => {
    await page.goto('/addition/play');
    // A problem-set remount can swap the round under us in dev; retry on a
    // fresh round when the click lands after a swap (bounded).
    for (let attempt = 0; attempt < 3; attempt++) {
      await drainPlayTokens(page);
      const eqText = await page.getByTestId('play-equation').innerText();
      const answer = computeAnswer('addition', parsePlayEquation(eqText));
      const badges = page.getByTestId(/^play-badge-/);
      const count = await badges.count();
      let wrongId: string | null = null;
      for (let i = 0; i < count; i++) {
        const id = await badges.nth(i).getAttribute('data-testid');
        if (id !== `play-badge-${answer}`) {
          wrongId = id;
          break;
        }
      }
      if (!wrongId) continue;
      await page.getByTestId(wrongId).click({ timeout: 5000 }).catch(() => null);
      if (await page.getByText('Not quite — try another number!').isVisible().catch(() => false)) {
        await expect(page.getByTestId('play-next-round')).toBeHidden();
        return;
      }
      await page.reload();
    }
    throw new Error('no wrong badge appeared after 3 attempts');
  });

  test('multiplication show requires press-to-play and steps through', async ({ page }) => {
    await page.goto('/multiplication/play');
    await expect(page.getByTestId('play-equation')).toBeVisible();
    // Press-to-play gate: answer slot hidden until the show is watched.
    await expect(page.getByTestId('play-answer-slot')).toBeHidden();
    await page.getByTestId('clip-play').click();
    await page.getByTestId('clip-dot-2').click();
    await expect(page.getByTestId('clip-dot-2')).toHaveAttribute('aria-selected', 'true');
    await page.getByTestId('clip-back').click();
    await expect(page.getByTestId('clip-dot-1')).toHaveAttribute('aria-selected', 'true');
    await page.getByTestId('clip-next').click();
    // Last step advances to the answer phase.
    await page.getByTestId('clip-next').click();
    await expect(page.getByTestId('play-answer-slot')).toBeVisible();
  });

  test('division show can be skipped after starting', async ({ page }) => {
    await page.goto('/division/play');
    await page.getByTestId('clip-play').click();
    await page.getByTestId('clip-skip').click();
    await expect(page.getByTestId('play-answer-slot')).toBeVisible();
  });

  for (const op of ['addition', 'subtraction', 'multiplication', 'division'] as Operation[]) {
    test(`${op} play awards zero stars`, async ({ page }) => {
      await seedEngineState(page, {});
      await page.goto(`/${op}/play`);
      // Complete one round. Bounded retries: a problem-set remount in dev can
      // swap the round between reading the equation and clicking its badge.
      let answered = false;
      for (let attempt = 0; attempt < 3 && !answered; attempt++) {
        if (op === 'addition' || op === 'subtraction') {
          await drainPlayTokens(page);
        } else {
          await page.getByTestId('clip-play').click();
          await page.getByTestId('clip-skip').click();
        }
        const eqText = await page.getByTestId('play-equation').innerText();
        const answer = computeAnswer(op, parsePlayEquation(eqText));
        try {
          await page.getByTestId(`play-badge-${answer}`).click({ timeout: 5000 });
          answered = true;
        } catch {
          // Round swapped under us — set up the fresh round and retry.
        }
      }
      expect(answered).toBe(true);
      await expect(page.getByTestId('play-next-round')).toBeVisible();
      expect(await readMilestoneStars(page)).toEqual({});
    });
  }

  test('tables play renders picker, pattern tip and answer flow', async ({ page }) => {
    await page.goto('/tables/play');
    await expect(page.getByTestId('play-equation')).toBeVisible();
    await expect(page.getByRole('note')).toBeVisible();
    await page.getByTestId('clip-play').click();
    await page.getByTestId('clip-skip').click();
    const eqText = await page.getByTestId('play-equation').innerText();
    const m = eqText.match(/(-?\d+)\s*[×]\s*(-?\d+)/);
    const answer = Number(m![1]) * Number(m![2]);
    await page.getByTestId(`play-badge-${answer}`).click();
    await expect(page.getByTestId('play-next-round')).toBeVisible();
  });
});

