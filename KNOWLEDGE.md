# KNOWLEDGE.md

Living lessons-learned log for `cissp-android`. Update this whenever you discover non-obvious behaviour, fix a tricky bug, or make a decision worth remembering.

---

## Dependencies

- `npm install` requires `--legacy-peer-deps` due to peer dependency conflicts in the React 19 + Expo SDK 54 combination. An `.npmrc` file is configured to apply this flag automatically.

## Native Builds

- Run `npm run prebuild` any time `app.config.ts` changes or a new native module is added. Skipping this will cause mismatches between the JS config and the generated Android/iOS project files.
- The `android/` directory is generated — avoid manual edits there unless absolutely necessary, as they will be overwritten on the next `prebuild`.

## App Variants

The `APP_VARIANT` env var must be set when building locally for dev/preview profiles; omitting it defaults to `production` bundle ID (`com.cisspquiz`), which can conflict with a Play Store install on the same device.

## Quiz Data

- 6 JSON files in `src/data/` (`test1.json` through `test6.json`), each containing 100 multiple-choice questions
- Questions are bundled with the app as static assets — no network fetch required
- Each question has 4 choices, a correct answer index, and domain metadata

## Local Statistics (expo-sqlite)

- `question_stats` table tracks per-question correct/incorrect counts
- `answers` table stores individual answer records for review mode
- All data is device-local only — no cloud sync, no backend

## CI/CD & Release Pipeline

- **GITHUB_TOKEN tag pushes don't trigger workflows.** Tags pushed by `github-actions[bot]` using `GITHUB_TOKEN` (or GitHub App OAuth tokens `gho_*`) do NOT fire `on: push: tags` events. Use `workflow_call` to chain workflows instead.
- **`secrets` context cannot be used in `if:` conditions.** Using `if: secrets.X != ''` causes `startup_failure`. Use `${{ secrets.X || fallback }}` in value expressions instead.
- **`permissions` must be at workflow level** in the caller when using `workflow_call` with `secrets: inherit`.
- **New Play Store apps need `releaseStatus: "draft"`** in `eas.json` until the store listing metadata (description, screenshots, content rating) is completed in Google Play Console. Change to `"completed"` once the listing is ready.
- **`autoIncrement: true`** in `eas.json` manages `versionCode` (Android integer) remotely via EAS. The semver `version` in `package.json` is bumped by `auto-release.yml`.
