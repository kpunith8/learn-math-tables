import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { test as base } from '@playwright/test';

/* eslint-disable react-hooks/rules-of-hooks */

export { expect } from '@playwright/test';

const mapCache = new Map<string, unknown>();
const sourceCache = new Map<string, string>();

async function fetchMap(url: string): Promise<unknown | null> {
  try {
    const res = await fetch(`${url}.map`, { signal: AbortSignal.timeout(5000) });
    return res.ok ? await res.json() : null;
  } catch {
    return null;
  }
}

async function fetchSource(url: string): Promise<string | null> {
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(5000) });
    return res.ok ? await res.text() : null;
  } catch {
    return null;
  }
}

async function persistCoverage(entries: Array<{ url: string; source?: string; functions: unknown }>, title: string) {
  const rawDir = path.join(process.cwd(), 'coverage', 'raw');
  mkdirSync(rawDir, { recursive: true });

  const out = [];
  for (const entry of entries) {
    const url = entry.url;
    if (!url || !url.startsWith('http://localhost:3000') || !url.endsWith('.js')) continue;

    let map = mapCache.get(url);
    if (map === undefined) {
      map = await fetchMap(url);
      mapCache.set(url, map);
    }

    let source = entry.source ?? '';
    if (!source) {
      source = sourceCache.get(url) ?? (await fetchSource(url)) ?? '';
      sourceCache.set(url, source);
    }

    out.push({ url, source, functions: entry.functions, map });
  }

  if (out.length === 0) return;
  const safe = title.replace(/[^a-zA-Z0-9]+/g, '_').slice(0, 120);
  writeFileSync(path.join(rawDir, `${safe}.json`), JSON.stringify(out));
}

export const test = base.extend({
  page: async ({ page }, use, testInfo) => {
    const disabled = process.env.PW_DISABLE_COVERAGE === '1';
    let entries: Array<{ url: string; source?: string; functions: unknown }> | null = null;

    if (!disabled) {
      await page.coverage.startJSCoverage({ resetOnNavigation: false });
    }

    await use(page);

    if (!disabled) {
      entries = await page.coverage.stopJSCoverage();
      await persistCoverage(entries, testInfo.titlePath.join(' / '));
    }
  },
});