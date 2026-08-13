# Kids Learning Next

## Next.js 16 — NOT your training data

This project uses **Next.js 16** (App Router) with breaking changes.
**Read `node_modules/next/dist/docs/` before writing any code.**
Heed deprecation notices — APIs, conventions, file structure may differ.

## Quick start

```bash
npm run dev        # dev server at localhost:3000
npm run build      # production build (catches type errors too)
npm run lint       # ESLint (eslint.config.mjs)
```

No test framework is configured — no test commands exist.

## Stack

- **Next.js 16** App Router (`'use client'` for interactive pages)
- **React 19** with server components by default
- **Tailwind CSS v4** (`@import "tailwindcss"` — no `@tailwind` directives)
- **shadcn v4** (`components.json` style: `base-nova`); use `npx shadcn@latest add <item>` to add components
- **PostCSS** with `@tailwindcss/postcss` v4 plugin
- **TypeScript** (strict mode, `@/*` maps to `src/*`)
- **i18n**: `i18next` + `react-i18next` + `i18next-browser-languagedetector` — client-side only, en/hi/kn (see **i18n / Multi-language** below)
- **Auth**: `@kinde-oss/kinde-auth-nextjs` — Kinde for social sign-in/sign-out (Google **and** Facebook, both enabled in the Kinde dashboard; the hosted login screen shows both providers — no code-level difference between them). `useKindeBrowserClient()` gives `{ isAuthenticated, isLoading, user }`; `<LoginLink>` / `<LogoutLink>` from `@kinde-oss/kinde-auth-nextjs/components`. Session name shown from `user?.given_name`; guests use the "Add Name" modal (session name is never persisted to localStorage).
- **Icons**: `lucide-react` for all icons (prefer SVG icons over emoji). Import per-icon, e.g. `import { House, Check, ArrowRight } from 'lucide-react'`. Do NOT add emoji icons; use lucide equivalents.
- `cn()` helper: `import { cn } from '@/lib/utils'` (wraps `tailwind-merge` + `clsx`)

## Architecture

### Routes

```
/                    Landing page (5-card grid + name modal)
/addition/[[...segments]]    Operation modules
/subtraction/[[...segments]] (same structure)
/multiplication/[[...segments]]
/division/[[...segments]]
/tables              Legacy tables app (separate codebase)
```

Operation catch-all pattern: `/[operation]` (learn), `/[operation]/learn`, `/[operation]/practice`, `/[operation]/quiz`.
There is **no per-operation difficulty chooser page** — difficulty is global (see **Universal difficulty** below). Legacy URLs
like `/addition/easy/practice` are client-redirected (in `OperationFlow`) to `/addition/practice`.

### Provider composition (`src/lib/contexts/Providers.tsx`)

All app-wide client context is composed in one `Providers` component (used in root `layout.tsx`):
`I18nProvider` → `AppProvider` → `DifficultyProvider` → `children`. **Add future providers here**
(session, login, etc.) instead of nesting per-page. Hooks: `useAppContext()`, `useDifficulty()`.

### Universal difficulty

- **`DifficultyProvider` + `useDifficulty()`** (`src/lib/contexts/DifficultyContext.tsx`) — single global
  `'easy' | 'medium' | 'hard'`, persisted in `localStorage['mathAdvDifficulty']`. Do NOT store difficulty
  in each page's own state.
- **`UniversalDifficultySelector`** (`src/components/universal-difficulty-selector.tsx`) — Base UI `Select`,
  mirrors `LanguageSelector` styling, shows `common.difficulty.{level}.badge`. Rendered **only in the landing
  header** — operations and `/tables` headers have no difficulty UI (the old tables difficulty buttons are gone).
- Operations read the level via `useDifficulty()` in `OperationFlow`; the tables app maps `medium → normal`
  and mirrors it into its legacy `state.difficulty` (two effects in `tables/page.tsx`: one-time hydration for
  returning players + universal→app sync gated on a ref so it never fires on first render).

### Module structure (addition, subtraction, multiplication, division)

Each operation module has 4 files and must export all 4 functions:

```
src/lib/operations/{operation}.ts
  ├── generateLearnExamples(d: DifficultyLevel, t: Translate) → Example[]
  ├── generatePracticeProblems(d: DifficultyLevel, t: Translate) → PracticeProblem[]
  ├── generateQuizQuestions(d: DifficultyLevel, t: Translate) → QuizQuestion[]
  └── getConceptIntro(d: DifficultyLevel, t: Translate) → ConceptIntro | null
```

Shared types at `src/lib/operations/types.ts` (`Operation`, `DifficultyLevel`, `Stage`, `Example`, `PracticeProblem`, `QuizQuestion`, `ConceptIntro`, `Translate`, `OPERATION_META`, `EMOJI_SAFE_LIMIT`). `Translate = (key: string, options?: Record<string, unknown>) => string`.

Each route's page.tsx is a thin Client Component wrapper importing `OperationFlow` and the 4 generation functions.

### Component tree

- `OperationFlow` (state machine driven by `useParams()` URL segments: optional first segment = stage)
- `ConceptIntroCard` (optional) → `WorkedExample` (5) → `PracticeProblemView` (6) → `ProblemSummaryList` → `QuizOverlay`
- **`QuizOverlay` is conditionally mounted** (no `isOpen` prop — render it only when quiz starts to avoid cascade warning)
- `NameModal` only shows on landing page when `isLoaded && !state.playerName`

### State management

`AppContext` via `useAppState()` hook (`src/lib/hooks/useAppState.ts`).
- `isLoaded` signals localStorage hydration complete — **must wait for it** before reading `state.playerName`.
- Exports `state`, `setPlayerName`, and other app state.

### Design tokens (Tailwind `@theme inline` in `src/app/globals.css`)

- `ink` `#1B1447` — dark header bg + headings; `coral` `#FF6B52` (+ `coral-soft` `#F47C6B`, `coral-hover`, `coral-active`) — primary buttons/accents
- `paper` `#F7F1E8` — body bg; `card` `#FFFDF8` — cards; `mist` `#E4DDCB` — borders
- `gold` `#FFB648` — leaderboard/table accent; `leaf` `#3FA664` — success/complete
- Body text: `text-text-primary` `#2B2352`, `text-text-secondary`, `text-text-muted/dim/tertiary`
- Fonts: `font-display` = **Baloo_2** (rounded bold; default `font-weight:700`), `font-body` = **Nunito**

### i18n / Multi-language (English / Hindi / Kannada)

Client-side `i18next` only. `I18nProvider` wraps `<body>` in `src/app/layout.tsx` and
sets `document.documentElement.lang` on language change. Use `useTranslation()` for copy.

**When adding a new string, ALWAYS:**
- Add the key to **all three** locale files: `src/i18n/locales/{en,hi,kn}.json` (keep key parity).
- Only `_note` documentation keys may be en-only (there are exactly 4). Verify parity:
  `node -e "const fs=require('fs');const L=l=>JSON.parse(fs.readFileSync('src/i18n/locales/'+l+'.json','utf8'));const leaf=(o,p='')=>{const r=[];for(const k in o){const np=p?p+'.'+k:k;o[k]&&typeof o[k]==='object'&&!Array.isArray(o[k])?r.push(...leaf(o[k],np)):r.push(np)}return r};const en=leaf(L('en')).sort();const hi=new Set(leaf(L('hi'))),kn=new Set(leaf(L('kn')));console.log(en.filter(k=>!hi.has(k)||!kn.has(k)))"`
- In components: `const { t } = useTranslation()`. In operation generators: receive `t: Translate` and call `t('key', { var })`.
- **`TFunction` type is imported from `i18next`, NOT `react-i18next`** (v17 doesn't export it).
- `getMascotHint(t, operation?)` — `t` is the FIRST argument.
- Difficulty key is `common.difficulty.${level}.desc` (NOT `.description`).
- `LanguageSelector` (`src/components/language-selector.tsx`) is a **Base UI `Select`** (portaled popup, `z-50`) — keep the `dark`/`className` props. Rendered **only in the landing header** — the tables `AppHeader` (desktop row + mobile drawer) and operations headers have no language UI; language is detected from the browser (`navigator`) on first load.
- **+2px font bump**: `globals.css` remaps common `text-*` size utilities (10px→12 … 28px→30, `text-xs`→14, `text-sm`→16, etc.) under `@media (max-width:767px)` (all languages) and `html[lang='hi'], html[lang='kn']` (desktop, hi/kn only) — Devanagari/Kannada glyphs render smaller at the same px. If you introduce a new small text class (below ~30px), add it to those two scoped blocks.

### Tables module (`/tables`)

Legacy feature with its own components in `src/components/` (app-header, celebration, certificate, leaderboard, fact-card, illustration-panel, table-selector, progress-bar, pattern-discovery). Has audio (Web Speech), SVG generation, hamburger drawer. No name modal. Also has a `/tables/[table]` deep-link route (1–20) that seeds the app to that table; its metadata is generated in `tables/[table]/layout.tsx`.

### SEO metadata

- Site URL lives in `src/lib/site.ts` (`SITE_URL`, `SITE_NAME`, `SITE_DESCRIPTION`) — change the domain there, never hardcode it.
- Pages are client components, so per-route metadata lives in **server `layout.tsx`** files (one per operation, `tables/layout.tsx`, `tables/[table]/layout.tsx`).
- **When adding a new route**: add a `layout.tsx` exporting `Metadata` (unique `title`, `description`, `alternates.canonical`) and add the URL to `src/app/sitemap.ts`.
- OG/Twitter images are generated with `next/og` in `src/app/opengraph-image.tsx` / `twitter-image.tsx` (shared design in `og-image.tsx`). `robots.ts` and `sitemap.ts` live in `src/app/`.
- `generateMetadata` plain-string `title`s do NOT get the root `title.template` suffix applied — append `| Math Adventure` explicitly (see `tables/[table]/layout.tsx`).

## Key conventions

- **Scroll to top** on stage change with `window.scrollTo({ top: 0, behavior: 'instant' })`
- **State reset** for practice problems via `key={currentProblemIndex}` on the component
- **Stars** are tracked per operation+difficulty via `milestoneStars` (keys like `addition:easy:practice`). Each milestone category has a cap (lesson: 2, practice: 7, quiz: 3). Revisiting the same topic uses `Math.max()` — never adds on top. Total stars = sum of all `milestoneStars`.
- **Operation completion** (`completedOperations`, trail-card ✓/DONE badge + `math-explorer` badge) requires the **quiz** milestone for **all three** difficulties — `isOperationFullyCompleted(milestoneStars, op)` in `star-economy.ts` checks every `op:{easy,medium,hard}:quiz` ≥ cap 3. `markOperationComplete` is gated on this inside its persist updater (reads the post-award `milestoneStars`); the landing card derives completion from `milestoneStars` too, never from the stored flag alone (so a single easy quiz does not complete the card).
- **Negative numbers** display as `-10` not `(-10)` — `padNumber` returns `String(n)`
- **Emoji rendering** only when all operands and result > 0 and each ≤ `EMOJI_SAFE_LIMIT` (10); multiplication/division show horizontal equation, addition/subtraction show right-aligned vertical stacked
- **Practice problems**: 5 per session, 3 attempts before revealing answer; all content (examples, practice, quiz) uses `randInt` so it's different each visit — no fixed pools and no `generatedForRef` caching
- **Input width**: `w-[clamp(70px,25vw,100px)]` for number blanks; `+/-` toggle button with `gap-1.5` from input; stacked vertical layout has `mt-3 pt-2` from the border line
- **Practice feedback**: Correct answer fires a base-ui `Toast` (stacked, `type='success'`, `timeout=2000`) at top-center with ✅ check mark — not inline banners or Nova dialog
- **Concept intro** and practice content are mutually exclusive (`!showConcept` guards the practice section)
- **Use shadcn components for generic UI** — import from `@/components/ui/` (`Button`, `Dialog` + `DialogContent/Header/Title/Description/Footer`, `Input`, `Card`, `Badge`, `Progress`) instead of hand-rolling raw JSX (`<button>`, custom modal `<div>`s). Add missing ones with `npx shadcn@latest add <item>`. Base UI is also fine for low-level primitives already in use (Toast, Select).
- **Use lucide-react icons for all glyphs** — buttons, feedback, and decorative marks use lucide SVGs (`Check`, `ArrowRight`, `RefreshCcw`, `BicepsFlexed`, `ThumbsUp`, `User`, `Plus`/`Minus`/`X`/`Divide`, etc.). Avoid emoji characters. `OPERATION_META` stores each operation's `icon: LucideIcon` (see `src/lib/operations/types.ts`).
- **shadcn `@acme` registries in docs are placeholders** — no public ACME registry exists
- **Mission tasks** carry a translated `descriptionKey` (i18n key in all 3 locales) plus a legacy English `description` fallback. New mission templates in `src/lib/engines/daily-mission.ts` must set `descriptionKey`; `ensureDescriptionKeys()` migrates old stored missions in `useEngineState.ts`.
- **Table pattern discovery** (`pattern-discovery.tsx`) is generated dynamically via `buildPattern(tableNumber)` — there is NO fixed table map (the old 2–11 hardcoded map caused tables 12+ to render blank). Tables go up to 20 (practice/hard), 15 normal, 10 easy.
