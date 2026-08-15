import { mkdirSync, readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import istanbulLibCoverage from 'istanbul-lib-coverage';
import istanbulLibReport from 'istanbul-lib-report';
import reports from 'istanbul-reports';
import v8toIstanbul from 'v8-to-istanbul';
import { FlattenMap } from '@jridgewell/trace-mapping';

const { createCoverageMap, createFileCoverage } = istanbulLibCoverage;
const { createContext, getDefaultWatermarks } = istanbulLibReport;

const root = process.cwd();
const rawDir = path.join(root, 'coverage', 'raw');
const outDir = path.join(root, 'coverage');
const srcPrefix = path.join(root, 'src');

if (!process.env.PW_DISABLE_COVERAGE && !exists(rawDir)) {
  console.log('[coverage] no raw coverage found — run `npm run test:e2e` first.');
  process.exit(0);
}

const files = exists(rawDir) ? readdirSync(rawDir).filter((f) => f.endsWith('.json')) : [];

if (files.length === 0) {
  console.log('[coverage] no raw coverage entries found.');
  process.exit(0);
}

const entries = [];
for (const file of files) {
  const parsed = JSON.parse(readFileSync(path.join(rawDir, file), 'utf8'));
  for (const entry of parsed) {
    entries.push({ ...entry, map: entry.map || null });
  }
}

const coverageMap = createCoverageMap();
const failedUrls = new Set();

for (const entry of entries) {
  if (!entry.map) continue;
  // v8-to-istanbul needs the transpiled source to back-flip offsets; without it
  // it falls back to readFile(entry.url), which is an http URL on disk. Rare
  // (chunk evicted between load and collection) — skip rather than warn.
  if (!entry.source) continue;

  // Turbopack emits empty source maps for some chunks (HMR client, node_modules,
  // shared CSS bundles). They map to nothing under src/ — flattening yields an
  // empty `sources` array, and feeding that to v8-to-istanbul makes it try to
  // readFile the chunk URL. Skip them outright.
  const flattened = entry.map.sections ? FlattenMap(entry.map) : entry.map;
  if (!flattened || !Array.isArray(flattened.sources) || flattened.sources.length === 0) continue;

  let converted;
  try {
    const sources = { source: entry.source };
    sources.sourceMap = { sourcemap: flattened };
    const script = new v8toIstanbul(entry.url, 0, sources);
    await script.load();
    script.applyCoverage(entry.functions);
    converted = script.toIstanbul();
  } catch (err) {
    if (!failedUrls.has(entry.url)) {
      failedUrls.add(entry.url);
      console.error(`[coverage] failed to convert ${entry.url}: ${err.message}`);
    }
    continue;
  }

  for (const [filePath, data] of Object.entries(converted)) {
    if (!filePath.startsWith(srcPrefix)) continue;
    try {
      coverageMap.addFileCoverage(createFileCoverage(data));
    } catch (err) {
      console.error(`[coverage] failed to add ${filePath}: ${err.message}`);
    }
  }
}

const summary = coverageMap.getCoverageSummary();
console.log('\n===== Coverage Summary =====');
console.log(
  `Statements : ${summary.statements.pct}% (${summary.statements.covered}/${summary.statements.total})`
);
console.log(
  `Branches   : ${summary.branches.pct}% (${summary.branches.covered}/${summary.branches.total})`
);
console.log(
  `Functions  : ${summary.functions.pct}% (${summary.functions.covered}/${summary.functions.total})`
);
console.log(
  `Lines      : ${summary.lines.pct}% (${summary.lines.covered}/${summary.lines.total})`
);
console.log('=============================\n');

const watermarks = getDefaultWatermarks();

const textCtx = createContext({ coverageMap, watermarks });
reports.create('text', {}).execute(textCtx);

const textSummaryCtx = createContext({ coverageMap, watermarks });
reports.create('text-summary', {}).execute(textSummaryCtx);

mkdirSync(outDir, { recursive: true });

const htmlCtx = createContext({ dir: path.join(outDir, 'html'), coverageMap, watermarks });
reports.create('html', {}).execute(htmlCtx);

const lcovCtx = createContext({ dir: outDir, coverageMap, watermarks });
reports.create('lcovonly', { file: 'lcov.info' }).execute(lcovCtx);

const jsonCtx = createContext({ dir: outDir, coverageMap, watermarks });
reports.create('json', { file: 'coverage-final.json' }).execute(jsonCtx);

console.log(`[coverage] reports written to ${outDir}`);

function exists(p) {
  try {
    readdirSync(p);
    return true;
  } catch {
    return false;
  }
}