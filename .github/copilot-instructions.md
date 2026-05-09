# Copilot Instructions

## Tech Stack

- **React Native 0.81.5**, **Expo SDK 54**, **expo-router 6** (file-based routing)
- **TypeScript 5.8.3** (strict mode), React 19.1.0
- **expo-sqlite** for local quiz statistics (no backend)
- Build/distribution via **Expo EAS** (cloud builds); Metro bundler for local dev

## Commands

```bash
npm install --legacy-peer-deps   # Required — peer dependency conflicts in React 19 + Expo SDK 54
npm start                        # Start Metro dev server
npm run android                  # Build and run on Android device/emulator
npm test                         # Run Jest tests (jest-expo preset)
npm test -- --testPathPattern=<file>  # Run a single test file
npm run lint                     # ESLint (src/ only)
npm run typecheck                # TypeScript check (no emit)
npm run prebuild                 # Regenerate native Android/iOS code

# EAS cloud builds
npm run build:dev                # Development APK (expo-dev-client)
npm run build:preview            # Preview APK (internal distribution)
npm run build:production         # Production AAB (Play Store)
```

## Architecture

### File-Based Routing

All screens live in `src/app/`. File paths map directly to routes:
- `src/app/_layout.tsx` — Root layout (Stack navigator, SafeAreaProvider, status bar theming)
- `src/app/index.tsx` — Home screen (`/`) — test selection and mode toggle
- `src/app/quiz.tsx` — Quiz screen (`/quiz`) — question display with 4-choice answers
- `src/app/result.tsx` — Result screen (`/result`) — score summary
- `src/app/stats.tsx` — Stats screen (`/stats`) — per-domain accuracy statistics

### Path Aliases

`@/` resolves to `src/`. Use it for all cross-module imports (configured in both `tsconfig.json` and `babel.config.js`).

### Theming System

All new components must use `ThemedText` and `ThemedView` (`src/components/`) as base primitives — never raw `Text`/`View` for user-visible content.

- `useColorScheme` (`src/hooks/useColorScheme.ts`) — detects `'light'` | `'dark'`
- `useThemeColor` (`src/hooks/useThemeColor.ts`) — resolves a token from `Colors.ts` for the active scheme
- Color palette: `src/constants/Colors.ts`

### App Variants & Environment Config

`app.config.ts` reads `APP_VARIANT` env var to set bundle ID and display name:
- `development` → `com.cisspquiz.dev`
- `preview` → `com.cisspquiz.preview`
- `production` (default) → `com.cisspquiz`

### Quiz Data

- 6 JSON files in `src/data/`: `test1.json` through `test6.json`
- Each file contains 100 multiple-choice questions (4 choices each)
- Questions cover all 8 CISSP domains
- Data is bundled with the app — no network access required

### Local Statistics (expo-sqlite)

- `question_stats` table — per-question correct/incorrect counts
- `answers` table — individual answer records for review mode
- All data stored locally on device only

### CI/CD Pipelines

| Workflow | Trigger | Action |
|---|---|---|
| `ci.yml` | Every push/PR | typecheck → lint → test |
| `distribute.yml` | Push to `main`/`develop` or manual | EAS preview APK → shareable install link |
| `auto-release.yml` | Push to `main` (non-bot commits) | Bumps patch version in `package.json`, pushes `v*.*.*` tag |
| `release.yml` | Push `v*.*.*` tag | EAS production AAB (`--wait`) → Play Store internal track → GitHub Release |
| `promote-to-production.yml` | Manual (`workflow_dispatch`) | Promotes latest (or specified) build to Play Store production track |
| `deploy-privacy-policy.yml` | Push to `main` (docs/store-listing/**) or manual | Deploys privacy policy to Cloudflare Pages |

> Full runbook: `docs/release-automation.md`

## Key Conventions

- **`android/` is generated** — do not manually edit it. It will be overwritten by `npm run prebuild`.
- **Run `npm run prebuild`** whenever `app.config.ts` changes or a new native module is added.
- **`APP_VARIANT` must be set** for local dev/preview builds. Omitting it defaults to the production bundle ID (`com.cisspquiz`), which conflicts with a Play Store install on the same device.
- **expo-sqlite** for local stats — no backend, no network access.
- **Bundled JSON data** — quiz questions are static assets shipped with the app.
- **No global state library** — use component-local state. Add Zustand/Jotai when shared state becomes necessary.
- Tests live in `__tests__/`. Setup file: `jest.setup.ts`. The `jest-expo` preset handles transforms.
