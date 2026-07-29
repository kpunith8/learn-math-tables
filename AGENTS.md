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

Operation catch-all pattern: `/[operation]`, `/[operation]/[difficulty]`, `/[operation]/[difficulty]/practice`, `/[operation]/[difficulty]/quiz`.

### Module structure (addition, subtraction, multiplication, division)

Each operation module has 4 files and must export all 4 functions:

```
src/lib/operations/{operation}.ts
  ├── generateLearnExamples(d: DifficultyLevel) → Example[]
  ├── generatePracticeProblems(d: DifficultyLevel) → PracticeProblem[]
  ├── generateQuizQuestions(d: DifficultyLevel) → QuizQuestion[]
  └── getConceptIntro(d: DifficultyLevel) → ConceptIntro | null
```

Shared types at `src/lib/operations/types.ts` (`Operation`, `DifficultyLevel`, `Stage`, `Example`, `PracticeProblem`, `QuizQuestion`, `ConceptIntro`, `OPERATION_META`, `EMOJI_SAFE_LIMIT`).

Each route's page.tsx is a thin Client Component wrapper importing `OperationFlow` and the 4 generation functions.

### Component tree

- `OperationFlow` (state machine driven by `useParams()` URL segments)
- `DifficultySelector` → `ConceptIntroCard` (optional) → `WorkedExample` (5) → `PracticeProblemView` (6) → `ProblemSummaryList` → `QuizOverlay`
- **`QuizOverlay` is conditionally mounted** (no `isOpen` prop — render it only when quiz starts to avoid cascade warning)
- `NameModal` only shows on landing page when `isLoaded && !state.playerName`

### State management

`AppContext` via `useAppState()` hook (`src/lib/hooks/useAppState.ts`).
- `isLoaded` signals localStorage hydration complete — **must wait for it** before reading `state.playerName`.
- Exports `state`, `setPlayerName`, and other app state.

### Color conventions (inline, no theme tokens)

- Header background: `#1E293B`
- Primary indigo: `#4F46E5`, `#6366F1`
- Orange accent (landing heading): `#C2410C`
- Green success: `#15803D`
- Body background: `#F5F5F5`
- Font: `font-display` (ui-rounded stack) for headings/buttons, `font-body` (system-ui) for body

### Tables module (`/tables`)

Legacy feature with its own components in `src/components/` (app-header, celebration, certificate, leaderboard, fact-card, illustration-panel, landing-screen, table-selector, progress-bar). Has audio (Web Speech), SVG generation, hamburger drawer. No name modal.

## Key conventions

- **Scroll to top** on stage change with `window.scrollTo({ top: 0, behavior: 'instant' })`
- **State reset** for practice problems via `key={currentProblemIndex}` on the component
- **Negative numbers** display as `-10` not `(-10)` — `padNumber` returns `String(n)`
- **Emoji rendering** only when all operands and result > 0; multiplication/division show horizontal equation, addition/subtraction show right-aligned vertical stacked
- **Practice problems** have 3 attempts before revealing answer
- **Input width**: `w-[clamp(90px,35vw,140px)]` for number blanks; no `+/-` toggle; `-` accepted via keyboard
- **shadcn `@acme` registries in docs are placeholders** — no public ACME registry exists
