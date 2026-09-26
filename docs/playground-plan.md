# Interactive Playground Plan (approved reference)

> Status: approved. `/play` is the landing target for every operation + tables.
> Flow everywhere: `play` → `practice` → `quiz`. Play awards **zero stars**
> (pure learning). 5 rounds per play session. All difficulties fully draggable
> from day one.

## 1. Locked decisions

1. **Retire `/learn`.** `/:op` redirects to `/:op/play`; `/:op/learn` (and legacy
   `/:op/:difficulty/learn`) `router.replace()` to `/:op/play`. `STAGES` becomes
   `['play', 'practice', 'quiz']`. `ConceptIntroCard` + `WorkedExample` are
   removed from the flow; their best copy migrates into `ShowClip` steps.
2. **Standalone `/tables/play`.** New route `src/app/tables/play/page.tsx`
   reusing `AppHeader` + existing table-lock logic (`getMaxAllowedTable`). Not a
   tab inside the legacy `/tables` page.
3. **Press-to-play.** `ShowClip` never autoplays (classroom-noise friendly). A big
   Play button mounts the clip; after first play: Replay + step dots + explicit
   Back/Next buttons. Mobile: native horizontal swipe (touch `swipeleft/right`
   via Pointer Events) moves steps when the browser supports touch.
4. **Eat zone for subtraction.** Drag-away target is a take-away tray styled as an
   "eat zone" (monster motif), not a plain tray.
5. **5 rounds** per play session (repetition builds mastery).
6. **Dots + Back/Next** step controls (big 44px targets for small fingers).

## 2. Pedagogy (from leading-apps research)

Surveyed SplashLearn / Khan Academy Kids / Prodigy (2026):

- Addition: drag-to-combine two groups into one pot. Fully draggable — viable.
- Subtraction: drag-away / feed-a-monster (`start full → remove b`). Viable.
- Multiplication: leaders do NOT 1:1-drag 48 items. They build **arrays /
  equal groups** for small facts + **skip-count number line + animated clip**
  for larger facts, then a single answer pick.
- Division: **deal-one-by-one into equal plates** for small totals, animated
  fair-share clip for larger, then answer pick.
- Tables: pattern-first (double-the-2s, 9s digit-sum), skip-count song, rapid
  retrieval — never full-drag of 12×9 items.

### Resulting design

- **Addition / subtraction: full manipulative drag, all difficulties, day one.**
- **Multiplication / division / tables: two-phase `Show → Drag-answer`.**
  A short press-to-play animated clip constructs the answer visually
  (replayable + step Back/Next + dots + swipe), then the kid drags the number
  badge onto `= ?`.

## 3. Routes & flow

```text
Landing TRAIL click → /addition/play (was /addition)
  /addition/play       → Playground (no stars) → CTA "Practice!" → /addition/practice
  /addition/practice   → unchanged (stars stay) → /addition/quiz
  /addition/quiz       → unchanged
  /addition            → redirect → /addition/play
  /addition/learn      → redirect → /addition/play
Same for subtraction / multiplication / division.
Tables: /tables/play (new standalone page) → completion CTA back to /tables.
/tables/[n] deep links unchanged.
```

- `src/app/sitemap.ts`: `OP_STAGES` `['learn',…]` → `['play','practice','quiz']`.
- Per-op `layout.tsx` metadata unchanged except canonicals pointing at `/play`.
- `src/app/page.tsx` `TRAIL` routes: `/addition` → `/addition/play` (all 4 ops),
  `/tables` stays `/tables` (play entry lives on the tables page + deep links).

## 4. Architecture (one core, five skins)

```text
src/components/playground/
  PlaygroundShell.tsx   # gradient header, round dots (5), Replay, Practice CTA, footer nav
  drag-core.tsx         # Pointer Events drag + tap-to-fly fallback + keyboard model
  CountBadge.tsx        # draggable answer chips (reuses quiz distractor logic)
  ShowClip.tsx          # press-to-play animated explainer (dots + Back/Next + swipe)
  Manipulative.tsx      # scaled rendering: emoji singles / tens-blocks / sign tint
  playground-utils.ts   # buildTokens (tens+singles, sign-aware) + makeAnswerOptions
  addition-playground.tsx / subtraction-playground.tsx (full manipulative drag)
  show-then-answer.tsx  # ShowClip → drag-answer shell + Multiplication/Division wrappers
src/app/tables/play/page.tsx
tests/playground.spec.ts
```

`OperationFlow` keeps practice/quiz branches; the `play` branch dynamically
imports the per-op playground (`ssr:false`, like `QuizOverlay`) to avoid
hydration divergence and keep first-load JS small.

## 5. Icons (lucide-react only for UI chrome)

Manipulatives stay emoji (🍎…) — they are countable learning objects, same as
`EmojiGroup` today. Every button/header/badge uses lucide:

| Surface | Icon | Notes |
|---|---|---|
| Play / Replay / Pause | `Play`, `RotateCcw`, `Pause` | `ShowClip` primary control |
| Drag affordance | `GripVertical`, `Hand` | badge handle + hint row |
| Drop targets | `Plus`, `Minus`, `X`, `Divide` (existing `OPERATION_META`) | pot / eat-zone / grid / plates |
| Eat zone motif | `Cookie`, `Trash2` | take-away tray dressing |
| Round nav | `ArrowLeft`, `ArrowRight`, `Check`, `BicepsFlexed` | existing, reused |
| Tables play | `Music4` (skip-count), `Sparkles` (pattern), `Trophy` (streak) | clip + pattern strip |
| Header | `House`, `User`, `Star` | existing, unchanged |

No new icon dependency. No emoji in buttons/headers (lint by review).

## 6. UI/UX smoothing (playground + existing screens)

- **Motion:** `transform`/`opacity` only. 200ms `ease-out` micro-interactions;
  350ms `cubic-bezier(0.34,1.4,0.64,1)` pop on drop/success. Extend the existing
  `prefers-reduced-motion` block in `globals.css` — no new animation library.
- **Color:** existing tokens only — op accents
  (`lagoon #4FA8F5`, `valley #57C278`, `periwinkle #7E8CD9`, `castle #FF7A59`,
  `kingdom #F5AB3C`) as 12% gradient backdrop → `paper`; white `card` stage;
  drop-zone ring glow in op color; success `leaf`, miss shake `coral`.
- **Touch:** `touch-action:none` while dragging, `setPointerCapture`, 44px+
  targets, `navigator.vibrate?.(20)` on drop, `useAudio()` `click` /
  `quiz-correct` sounds, existing Base UI `Toast` for round success.
- **Practice/quiz headers** adopt the same gradient + dot treatment for visual
  continuity. `Toast` timing/position unchanged. `MascotMessage` intro reused
  verbatim on play so tone stays consistent.
- **Fonts:** `font-display` (Baloo) headings / `font-body` (Nunito) body; new
  text classes must join the +2px hi/kn + mobile remap blocks in `globals.css`.

## 7. Per-operation interaction spec

### Addition (`a + b`, bins → Merge Pot)

Bins A + B → drag all into Merge Pot → live counter ticks → drag correct total
badge onto `a + b = ?`. Wrong badge: shake + snap-back + tip. 5 rounds.
Scaling: `≤10` emoji; `11–40` tens-block + singles; `>40`/negatives mini
number-line chips. Live DOM cap ~40 nodes.

### Subtraction (`a − b`, remove `b` → eat zone)

The bar shows exactly the `b` items to remove (tens-frames + singles, always
directly draggable — no break-apart step). Kid drags all `b` to the eat zone →
the `a − b` remainder is revealed grouped → drag answer badge. Showing the
minuend `a` as draggables was tried and rejected: removing e.g. 11 from five
bare ten-frames needs an undiscoverable split interaction. Same core, inverted.

### Multiplication (`a × b`, Show → answer)

`ShowClip` builds the array row-by-row (e.g. `4×3` → 4 rows drop in,
skip-count ticks `3,6,9,12`) → kid drags answer badge onto `a × b = ?`.
Easy: emoji grid; medium/hard: dot grid + equation. Zero/one get dedicated
2s clips (copy exists in locale files). No 1:1 dragging past ~20 cells.

### Division (`a ÷ b`, Show → answer)

`ShowClip` deals `a` items round-robin into `b` plates (one-per-plate ticks) →
drag answer badge onto `a ÷ b = ?`. Reuses `emojiSplit` data shape.

### Tables (`table × group`, Show → answer)

Table strip picker (1–20, honors `getMaxAllowedTable` lock) → skip-count clip
(`4,8,12…`) + `buildPattern(table)` tip strip → drag answer for
`table × group = ?`. Completion CTA → `/tables`. Stars still only via quiz.

## 8. Performance plan

- `translate3d` + rAF-throttled pointermove; `will-change` only mid-drag.
- Move/up are tracked on `window` (deliberately no pointer capture, which can
  throw on some mouse/pen stacks and silently kill gestures); per-gesture
  closures avoid all stale-handler issues.
- Hit-testing is point-in-rect against a live zone registry (+8px forgiveness),
  never `elementFromPoint` — stacking order and overlays can't swallow drops.
- Playgrounds remount by problem signature (`key`), so a regenerated problem
  set always restarts with fresh round state instead of stranding stale drops.
- `memo` + stable keys; round state in `usePlaygroundRound` (no per-frame
  React renders — drag position lives in refs/DOM).
- Single shared `AudioContext` (existing `useAudio`); no new deps.
- `dynamic(ssr:false)` playground imports; first paint = shell + Play button.
- No `emoji.repeat(99)` in DOM; grouped blocks beyond the cap.

## 9. State, scoring, storage

- Play calls **zero** `engine.award*` / `updateMission` — no `milestoneStars`,
  no `STAR_CAPS`, no `markOperationComplete` change.
- Difficulty via existing `useDifficulty()` (global). No new storage keys
  (`STORAGE_KEYS` untouched; no migration).
- No Turnstile needed (no form posts).

## 10. i18n

~18 new `playground.*` keys in `src/i18n/locales/{en,hi,kn}.json` with full
parity (repo parity script). `TFunction` imported from `i18next`.
Keys: `title, pressPlay, replay, dragHint, tapHint, rounds, stepBack,
stepNext, wrongBadge, correctRound, sessionDone, practiceCta, eatZone,
mergePot, plates, gridRows, skipCount, patternTip`.

## 11. Accessibility

Keyboard: Tab to item → arrows move → Enter drops; badges operable as buttons.
`aria-grabbed`, live-region counters, visible focus ring (existing global
style). Reduced-motion → static clip frames + instant snap.

## 12. Testing

New `tests/playground.spec.ts` (parameterized 4 ops + tables): pointer-drag
path, tap-fly path, keyboard path, clip replay + dots + Back/Next, wrong-badge
snap-back, play→practice navigation, **assert zero `milestoneStars` delta
after play**. Reuse `seedAppState` / `mockKindeAuth`. Keep the
`tests/fixtures.ts` hydration-error guardrail green. `npm run build` must pass
(type check), `npm run lint` clean.

## 13. Build order

1. Core: `drag-core` + `Shell` + `CountBadge` + addition + `/addition/play` +
   TRAIL retarget (addition only).
2. Subtraction skin (inverted core) + retarget.
3. `ShowClip` + multiplication + division + retargets.
4. Tables `/tables/play` + pattern strip.
5. i18n hi/kn + Playwright suite + sitemap + `/learn` redirects + gradient
   touch-ups to practice/quiz headers.
