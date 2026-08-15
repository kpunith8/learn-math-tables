import { execFileSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import path from 'node:path';

export default async function globalTeardown() {
  const rawDir = path.join(process.cwd(), 'coverage', 'raw');
  if (!existsSync(rawDir)) return;
  try {
    execFileSync(process.execPath, ['scripts/generate-coverage.mjs'], {
      cwd: process.cwd(),
      stdio: 'inherit',
    });
  } catch (err) {
    console.error('[global-teardown] coverage generation failed:', err);
  }
}