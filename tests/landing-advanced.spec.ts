import { test, expect } from './fixtures';
import { seedEngineState, mockKindeAuth, TODAY } from './helpers';

test.describe('landing page — state & auth branches', () => {
  test('completed trail stamps sit at the bottom without covering card text', async ({ page }) => {
    await seedEngineState(page, {
      milestoneStars: Object.fromEntries(
        ['addition', 'multiplication'].flatMap((op) =>
          ['easy', 'medium', 'hard'].map((level) => [`${op}:${level}:quiz`, 3])
        )
      ),
    });
    await page.goto('/');
    for (const width of [390, 1024, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      const cards = page.locator('.trail-card:has(.trail-stamp)');
      await expect(cards).toHaveCount(2);
      for (const card of await cards.all()) {
        const stamp = await card.locator('.trail-stamp').boundingBox();
        const title = await card.locator('.trail-heading').boundingBox();
        const explore = await card.locator('.trail-go').boundingBox();
        expect(stamp!.x >= title!.x + title!.width || stamp!.y >= title!.y + title!.height).toBe(true);
        expect(stamp!.x).toBeGreaterThan(explore!.x + explore!.width);
        expect(Math.abs((stamp!.y + stamp!.height / 2) - (explore!.y + explore!.height / 2))).toBeLessThan(4);
      }
    }
  });

  test('shows completed mission, badges and done trail markers when engine state is seeded', async ({ page }) => {
    await seedEngineState(page, {
      milestoneStars: {
        'addition:easy:quiz': 3,
        'addition:medium:quiz': 3,
        'addition:hard:quiz': 3,
      },
      achievements: [
        { id: 'addition-hero', label: 'Addition Hero', description: 'Complete addition on any difficulty', icon: '➕', unlockedAt: 1750000000000 },
        { id: 'first-quiz', label: 'Quiz Starter', description: 'Complete your first quiz', icon: '📝', unlockedAt: 1750000000000 },
        { id: 'table-detective', label: 'Table Detective', description: 'Complete a full times table', icon: '🔍', unlockedAt: null },
        { id: 'pattern-hunter', label: 'Pattern Hunter', description: 'Discover 3 table patterns', icon: '🔮', unlockedAt: null },
        { id: 'math-explorer', label: 'Math Explorer', description: 'Try all 4 operations', icon: '🧭', unlockedAt: null },
        { id: 'multiplication-master', label: 'Multiplication Master', description: 'Complete multiplication on any difficulty', icon: '✖️', unlockedAt: null },
        { id: 'subtraction-ninja', label: 'Subtraction Ninja', description: 'Complete subtraction on any difficulty', icon: '➖', unlockedAt: null },
        { id: 'division-champion', label: 'Division Champion', description: 'Complete division on any difficulty', icon: '➗', unlockedAt: null },
        { id: 'perfect-score', label: 'Perfect Score', description: 'Get all questions right in a quiz', icon: '💯', unlockedAt: null },
        { id: 'streak-3', label: 'On Fire!', description: '3-day learning streak', icon: '🔥', unlockedAt: null },
        { id: 'streak-7', label: 'Week Warrior', description: '7-day learning streak', icon: '⚡', unlockedAt: null },
        { id: 'star-collector-50', label: 'Star Collector', description: 'Earn 50 stars', icon: '⭐', unlockedAt: null },
      ],
      dailyMission: {
        generatedDate: TODAY,
        tasks: [
          { description: 'Solve 5 addition questions', descriptionKey: 'missions.template1.0', type: 'practice', target: 5, progress: 5, completed: true },
          { description: 'Review one times table', descriptionKey: 'missions.template1.1', type: 'review', target: 1, progress: 1, completed: true },
          { description: 'Complete one challenge', descriptionKey: 'missions.template1.2', type: 'challenge', target: 1, progress: 1, completed: true },
        ],
        completed: true,
        starsAwarded: true,
      },
    });

    await page.goto('/');

    await expect(page.getByText('Complete!')).toBeVisible();
    await expect(page.getByText('Your Badges')).toBeVisible();
    await expect(page.getByText('Addition Hero')).toBeVisible();
    await expect(page.getByText('Done ✓').first()).toBeVisible();
    await expect(page.getByText('Done ✓')).toHaveCount(1);
  });

  test('shows a signed-in header with session name', async ({ page }) => {
    await mockKindeAuth(page, 'authenticated');
    await page.goto('/');

    await expect(page.getByText('Aarav', { exact: true })).toBeVisible();
    await expect(page.getByRole('link', { name: /Log out/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /Add Name/ })).toBeHidden();
  });

  test('shows the sign-in link once the guest session is loaded', async ({ page }) => {
    await mockKindeAuth(page, 'guest');
    await page.goto('/');

    await expect(page.getByRole('link', { name: /Sign in/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /Add Name/ })).toBeVisible();
  });
});
