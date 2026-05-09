# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Tech Stack

- **React Native 0.81.5** with **Expo SDK 54** and **expo-router 6** (file-based routing)
- **TypeScript 5.8.3**, React 19.1.0
- **expo-sqlite** for local quiz statistics
- Build/distribution via **Expo EAS** (cloud builds), **Metro** bundler locally
- CI/CD via GitHub Actions (`.github/workflows/`)

## Commands

```bash
npm start                  # Start Metro dev server
npm run android            # Build and run on Android device/emulator
npm test                   # Run Jest tests
npm test -- --testPathPattern=<file>  # Run a single test file
npm run lint               # ESLint (src/ only)
npm run typecheck          # TypeScript type check (no emit)
npm run prebuild           # Regenerate native Android/iOS code — run after changing app.config.ts or adding native modules

# EAS cloud builds
npm run build:dev          # Development APK (dev client)
npm run build:preview      # Preview APK (internal distribution)
npm run build:production   # Production AAB (Play Store)
```

> **Note:** Use `npm install --legacy-peer-deps` — this flag is required due to peer dependency conflicts. An `.npmrc` file is configured to apply this automatically.

## Architecture

### File-Based Routing (expo-router)

All screens live in `src/app/`. The router maps file paths directly to routes:

- `src/app/_layout.tsx` — Root layout (Stack navigator, SafeAreaProvider, status bar theming)
- `src/app/index.tsx` — Home screen (`/`) — test selection, mode toggle (normal/review)
- `src/app/quiz.tsx` — Quiz screen (`/quiz`) — question display with 4-choice answers
- `src/app/result.tsx` — Result screen (`/result`) — score summary after completing a test
- `src/app/stats.tsx` — Stats screen (`/stats`) — per-domain accuracy statistics

### Quiz Data

- 6 JSON files in `src/data/`: `test1.json` through `test6.json`
- Each file contains 100 multiple-choice questions (4 choices each)
- Questions cover all 8 CISSP domains
- Bundled with the app — no network access required

### Local Statistics (expo-sqlite)

- `question_stats` — per-question correct/incorrect counts
- `answers` — individual answer records for review mode
- All data stored locally on device only, no backend

### Theming

Components are theme-aware via two hooks:
- `src/hooks/useColorScheme.ts` — detects system light/dark preference
- `src/hooks/useThemeColor.ts` — resolves a color token to its light/dark value

Base themed primitives: `ThemedText` and `ThemedView` in `src/components/`. The color palette is defined in `src/constants/Colors.ts`.

### Language Toggle

Supports Japanese (JA) and English (EN) via in-app toggle. No i18n library — simple key-value mapping.

### App Variants

`app.config.ts` uses the `APP_VARIANT` env var to switch bundle IDs and display names:
- `development` → `com.cisspquiz.dev`
- `preview` → `com.cisspquiz.preview`
- `production` (default) → `com.cisspquiz`

## CI/CD Pipelines

| Workflow | Trigger | Action |
|---|---|---|
| `ci.yml` | Every push/PR | typecheck → lint → test |
| `distribute.yml` | Push to `main`/`develop` or manual | EAS preview APK → shareable install link |
| `auto-release.yml` | Push to `main` (non-bot commits) | Bumps patch version in `package.json`, pushes `v*.*.*` tag |
| `release.yml` | Push `v*.*.*` tag | EAS production AAB (`--wait`) → Play Store internal track → GitHub Release |
| `promote-to-production.yml` | Manual (`workflow_dispatch`) | Promotes latest (or specified) build to Play Store production track |
| `deploy-privacy-policy.yml` | Push to `main` (docs/store-listing/**) or manual | Deploys privacy policy to Cloudflare Pages |

> Full runbook: `docs/release-automation.md`

## Per-Project Files

| File/Dir | Purpose |
|----------|---------|
| `KNOWLEDGE.md` | Living lessons-learned log — read before debugging or making significant changes |
| `TODO.md` | Persistent task tracking across sessions |
| `docs/` | Architecture notes, ADRs, runbooks |

## Testing

Jest with `@testing-library/react-native`. Tests live in `__tests__/`. Setup file: `jest.setup.ts`. Coverage output goes to `coverage/`.
