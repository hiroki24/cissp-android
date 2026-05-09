# Architecture

## Overview

CISSP Quiz is a React Native app built on Expo SDK 54 with file-based routing via expo-router. It provides 600 practice questions for the CISSP certification exam, organized into 6 tests of 100 questions each. Targets Android only.

## Key Design Decisions

- **expo-router** for navigation — screens are files under `src/app/`, routes map 1:1 to file paths.
- **expo-sqlite** for local statistics — tracks per-question accuracy and answer history. No backend or cloud storage needed.
- **Bundled JSON quiz data** — all 600 questions are shipped with the app in `src/data/` as 6 JSON files (100 questions each). No network access required.
- **Theme system** — light/dark support built in via `useColorScheme` + `useThemeColor` hooks and `Colors.ts` palette. All new components should use `ThemedText`/`ThemedView` as base primitives.
- **Language toggle** — supports Japanese and English (JA/EN) via in-app toggle.
- **No backend** — the app is fully offline. Quiz data is bundled, stats are stored locally in SQLite.

## Screens

| Route | Screen | Description |
|-------|--------|-------------|
| `/` | Home | Test selection and mode toggle (normal/review) |
| `/quiz` | Quiz | Question display with 4-choice answers |
| `/result` | Result | Score summary after completing a test |
| `/stats` | Stats | Per-domain accuracy statistics |

## Data Model

### Quiz Data (JSON, bundled)
- 6 JSON files in `src/data/`: `test1.json` through `test6.json`
- Each file contains 100 multiple-choice questions with 4 options
- Questions cover all 8 CISSP domains

### Local Stats (expo-sqlite)
- `question_stats` — per-question correct/incorrect counts
- `answers` — individual answer records for review mode

## Build & Distribution Pipeline

```
Local dev  →  npm start (Metro)
                 │
                 ▼
Dev APK    →  EAS build:dev    (expo-dev-client, no OTA)
Preview    →  EAS build:preview (internal testers)
Production →  EAS build:production → Google Play (AAB, auto version increment)
```

Triggered automatically by GitHub Actions on push to `main`/`develop` (preview) and on `v*.*.*` tags (production).

## ADRs

<!-- Add Architecture Decision Records here as the project evolves -->
