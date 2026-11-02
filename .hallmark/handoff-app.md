# App-screen pass — handoff

Prompt: carry the landing system across routes and pages, and deliver the material ask.
Scope: `/addition/*`, `/subtraction/*`, `/multiplication/*`, `/division/*`, `/tables`, `/tables/play` (plus the shared chrome they use).

## Before → after

| Check | Before | After |
| --- | --- | --- |
| App scope (4 URLs, 21 files) | 15 FAIL · 4 REFLEX · 3 WARN | **0 FAIL · 0 REFLEX · 0 WARN** |
| Landing (1 URL) | 32 FAIL · 7 Reflex · 1 WARN | **0 FAIL · 0 WARN · 2 waived · 1 note** |
| `tsc --noEmit` / `lint` / `build` | clean | clean |
| Playwright | 59 passed | **59 passed** |

Kept record: links 1/1 · fields 1/1 · handlers 21/21 · headings 3/3 · figures 1/1.
Before/after side by side: `.hallmark/compare.html` (screenshots in `.hallmark/shots`).

## Kept

- Every route and URL, including the legacy `/op/difficulty/stage` redirects and `/learn` → `/play`.
- Every handler, form field, test id and DOM hook the suite uses (`play-equation`, `play-badge-*`, `play-dropzone`, `clip-*`, `.timer-display`, `.drawer-panel`, `.table-strip`, `Done ✓`, world names, etc.).
- All page copy; no section removed.

## Changed

- **Shared chrome**: ink app bar with the landing's grain, paper ground washed in each route's `--world` colour, capped `app-width` container, pressed controls, token shadows.
- **Equations** now sit on a paper `equation-plate` with an ink reading colour, so no world hue has to carry text.
- **Fills** (coral / leaf / castle / gold) carry `text-ink`; fields use `--color-field-edge`; incorrect feedback uses `text-error`; success uses `text-growth-ink`.
- **Controls**: opaque focus rings, `disabled:` states, named transitions (`background-color`, `border-color`, `transform`, `box-shadow`, `color`) with `motion-reduce` fallbacks; progress fill animates `transform: scaleX`, not `width`.
- **Icons**: hamburger, close, reset, volume, search and sparkles are lucide SVGs (no emoji glyphs).
- **Tables chrome**: `Menu`, `X`, `RotateCcw`, `Volume2/VolumeX`; drawer is off-canvas, clipped and hidden to assistive tech when closed.
- **Material ask — badge album**: the landing now renders the full 12-achievement set from `engineState.achievements`; earned badges get a gold ring medallion, unearned stay as dashed ghosts, with a real “N of M badges earned” count. Empty state remains as a fallback if the set is ever zero-length.
- **Material ask — die-cut tiles**: every trail tile carries a deckled fringe (`--tear-mask-sm`) along its bottom edge, so the cut-paper stock reads as cut rather than printed.

## Copy changes

- New keys (all three locales, parity verified — only the 4 documented `_note` keys are en-only):
  - `home.badges.earned` — “Earned”
  - `home.badges.locked` — “Not yet earned”
  - `home.badges.count` — “{{earned}} of {{total}} badges earned”
- The first two are screen-reader labels inside each stamp; the count is visible.

## Dropped

- Nothing. No file was deleted; no route, field, form or handler was removed.

## Yours

- The seeded test in `tests/landing.spec.ts` asserts the old emoji-led labels (`🌟 Math Adventure!`, `⭐ Medium`). Those two assertions were updated to the icon-led labels when the wordmark and difficulty option moved to lucide marks. This is the only test change; no test was edited to hide a failure.
- The five trail tiles remain 132–158px destination cards and are waived on 39b; the drawer/body form-control waiver for 26b stays as recorded.
- Hero still carries three text blocks before its actions (NOTE 58) — deliberate: the star meter is a live figure, not a third paragraph.

## Performance pass (Vercel React rules)

Applied:

- **`rerender-memo` / `rerender-derived-state`** — `getNewBadges`, `getWeakFacts`, `getDueFacts` in `useEngineState` are now `useCallback`-stable against their underlying slice, so consumers and effects don't see a new function on every render.
- **`rerender-derived-state`** — the landing derives the earned-badge list once per achievements change instead of filtering on every render.
- **`js-set-map-lookups`** — the trail completion list is a memoized `Set` and each tile checks `.has(id)` rather than scanning an array.
- **`rerender-dependencies`** — `practiceProblems`, `quizQuestions` and the playground `playKey` are memoized against `generatedContent`, so unrelated practice/clip/answer updates no longer rebuild them or re-key the playground subtree.

Already following the guide (verified, no change needed):

- `bundle-dynamic-imports` — every playground and overlay is `next/dynamic` + `ssr: false`; the tables page defers quiz, celebration, certificate, leaderboard, confirm, pattern and retrieval panels.
- `rendering-hoist-jsx` / module constants — `TRAIL` and `BADGE_ICONS` are module-level; `Chip` and `PracticeToastList` are module-level components.
- `rerender-memo` — `FactCard`, `IllustrationPanel` and `LeaderboardOverlay` are `memo()`-wrapped; the leaderboard sort is `useMemo`.
- `bundle-barrel-imports` — direct component imports and per-icon lucide imports; no project barrel files.
- `client-passive-event-listeners` / `rendering-animate-svg-wrapper` — pointer gestures drive wrappers, not SVG nodes; no scroll listeners added.

## Verification commands

```bash
npx tsc --noEmit && npm run lint && npm run build
npm test
# app scope
HALLMARK_PUPPETEER=… node .agents/skills/hallmark/scripts/sloplint.mjs <app files> \
  --genre playful --render --kept --scope app \
  --url http://localhost:3000/addition/play \
  --url http://localhost:3000/addition/practice \
  --url http://localhost:3000/tables \
  --url http://localhost:3000/tables/play
```
