import { test, expect } from './fixtures';
import {
  completeLearnStage,
  solvePracticeProblem,
  solveQuiz,
  readPracticeEquation,
  computeAnswer,
  OPERATIONS,
} from './helpers';

for (const op of OPERATIONS) {
  test.describe(`${op} flow`, () => {
    test('learn → practice → quiz completes and returns to the operation page', async ({ page }) => {
      await completeLearnStage(page, op);

      for (let i = 0; i < 5; i++) {
        await solvePracticeProblem(page, op, i);
      }

      await page.getByRole('button', { name: /Let's do the quiz!/ }).click();
      await expect(page).toHaveURL(new RegExp(`/${op}/quiz$`));

      await solveQuiz(page, op);
      await expect(page).toHaveURL(new RegExp(`/${op}$`));
    });

    test('legacy difficulty URL redirects to the modern path', async ({ page }) => {
      await page.goto(`/${op}/easy/practice`);
      await expect(page).toHaveURL(new RegExp(`/${op}/practice$`));
    });

    test('three wrong attempts reveal the explanation', async ({ page }) => {
      await page.goto(`/${op}/practice`);
      await page.getByRole('button', { name: /Got it!/ }).click();

      const eq = await readPracticeEquation(page, op);
      const wrong = String(computeAnswer(op, eq) + 1);
      const checkButton = page.getByRole('button', { name: /Check Answer/ });

      for (let attempt = 0; attempt < 3; attempt++) {
        await page.getByLabel('Answer').fill(wrong);
        await checkButton.click();
        if (attempt < 2) {
          await expect(page.getByText('Not quite — try again! 💡')).toBeVisible();
          await expect(checkButton).toBeVisible();
        }
      }

      await expect(page.getByText("Here's how we solve it! Let's look together 👀")).toBeVisible();
    });
  });
}