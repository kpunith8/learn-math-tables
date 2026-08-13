# Kids Learning Next — Math Adventure

An interactive math learning app for kids aged 5–8: learn **addition, subtraction,
multiplication, division**, and **times tables** with stories, characters, stars,
badges, and a daily mission system. Available in **English, Hindi, and Kannada**.

## Tech stack

- **Next.js 16** (App Router) + **React 19**
- **Tailwind CSS v4** + **shadcn v4** (`base-nova` style)
- **Base UI** (`@base-ui/react`) for menus, toasts, and the language select
- **i18next** + **react-i18next** for client-side i18n (en/hi/kn)
- **Kinde** (`@kinde-oss/kinde-auth-nextjs`) for Google **and** Facebook sign-in/sign-out (both enabled on the Kinde dashboard)
- **lucide-react** for all icons (SVG icons instead of emoji)
- **TypeScript** (strict), `@/*` → `src/*`

## Getting started

```bash
npm install
npm run dev        # dev server at localhost:3000
npm run build      # production build (also type-checks)
npm run lint       # ESLint
```

No test framework is configured.

## Routes

| Route | Description |
| --- | --- |
| `/` | Landing page: mission postcard, stats, expedition trail |
| `/addition`, `/subtraction`, `/multiplication`, `/division` | Operation modules (`/…/difficulty`, `/…/practice`, `/…/quiz`) |
| `/tables` | Times tables app (audio, certificates, leaderboard) |

## Multi-language support

The app is fully translated into **English (`en`), Hindi (`hi`), and Kannada (`kn`)**
using client-side `i18next`. All UI strings live in `src/i18n/locales/{en,hi,kn}.json`.
The language picker is a Base UI `Select` in the landing header only (single global
place to switch); every other page auto-detects the language from the browser
(`navigator`) on first load and persists the choice in localStorage.

**Adding a new string**: add the key to **all three** locale files and keep key
parity (only `_note` doc keys are English-only). See `AGENTS.md` → *i18n /
Multi-language* for the full workflow and a key-parity verification command.

## Recent changes

- **Multi-language support (en/hi/kn)** — every route, operation generator, and
  the tables app now render translated copy; language persists via localStorage.
- **Language picker rebuilt on Base UI `Select`** — replaces a native `<select>`
  whose OS dropdown spilled outside the header on mobile; the new popup is
  portaled and `z-50` so it can't be clipped.
- **+2px font bump for Hindi/Kannada** — Devanagari/Kannada glyphs render smaller
  at the same px, so common text sizes get a +2px bump (all languages on mobile,
  hi/kn only on desktop).
- **Table pattern discovery supports tables up to 20** — `buildPattern(tableNumber)`
  generates the discovery view dynamically, fixing tables 12+ rendering blank.
- **Mission tasks use translated `descriptionKey`** with a legacy `description`
  fallback; stored missions are migrated via `ensureDescriptionKeys()`.
- **SEO**: unique `title`/`description`/`canonical` per route via server
  `layout.tsx` files (operations + tables + per-table `/tables/1..20`),
  `metadataBase` (`src/lib/site.ts` → `https://learn-math-tables.vercel.app`),
  generated `sitemap.xml` (38 URLs) and `robots.txt`, plus OG/Twitter share
  images via `next/og` (`opengraph-image.tsx` / `twitter-image.tsx`). `/tables/[table]`
  deep-links seed the tables app to that table.
- **Operation cards only show ✓/DONE once all three difficulties are
  completed** (`isOperationFullyCompleted` in `star-economy.ts` requires the quiz
  milestone for easy+medium+hard); a single difficulty quiz no longer completes the
  trail card. The landing page derives completion from `milestoneStars`, and
  `markOperationComplete` + the `math-explorer` badge are gated the same way.
- **Universal difficulty** — a single difficulty level is chosen once via the
  `UniversalDifficultySelector` (Base UI Select, mirroring the language selector) in
  the landing header and applies everywhere. It lives in a global
  `DifficultyProvider` (context) persisted to `localStorage['mathAdvDifficulty']`;
  there is no per-operation difficulty chooser page anymore (operation URLs are now
  `/addition`, `/addition/practice`, `/addition/quiz` — legacy `/addition/easy/...`
  links client-redirect). The tables app maps `medium → normal` and mirrors the
  universal level into its legacy `state.difficulty`; its old nav difficulty buttons
  were removed. All app-wide context is composed in `src/lib/contexts/Providers.tsx`
  (add future session/login providers there).
- **Google & Facebook sign-in (Kinde)** — `@kinde-oss/kinde-auth-nextjs` provides sign-in/sign-out
  via `useKindeBrowserClient()` + `<LoginLink>`/`<LogoutLink>`. Both providers are enabled in the
  Kinde dashboard; the hosted login screen shows them together (no code-level difference). The
  authenticated name comes from `user?.given_name`; guests use the "Add Name" modal instead. The
  session name is never persisted to localStorage.
- **All icons use lucide-react** — buttons, feedback, and decorative marks render
  lucide SVGs (`Check`, `ArrowRight`, `RefreshCcw`, `BicepsFlexed`, `ThumbsUp`,
  `User`, `Plus`/`Minus`/`X`/`Divide`) instead of emoji; `OPERATION_META` stores each
  operation's `icon: LucideIcon`.
