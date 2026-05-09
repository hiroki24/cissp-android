# Release Automation Runbook

## Overview

Every merge to `main` triggers a fully automated release pipeline with zero additional human steps:

```
Feature branch merge to main
        │
        ├──► distribute.yml  →  EAS preview APK  →  shareable link for testers
        │
        └──► auto-release.yml
                │  bumps patch version in package.json
                │  commits [skip ci]  →  pushes v*.*.* tag
                │
                └──► release.yml  (triggered by tag)
                        │  EAS build: production AAB  (~10-20 min)
                        │  EAS submit → Play Store internal track
                        └──► GitHub Release created with auto-generated notes
```

To promote a verified build from internal → production, run the **Promote to Production** workflow manually (one click in the Actions tab).

---

## One-Time Setup

### 1. Expo account and project link

```bash
npm install -g eas-cli
eas login
eas build:configure   # links the project; eas.json is already committed
```

### 2. GitHub secrets

Go to **Settings → Secrets and variables → Actions** and add:

| Secret | Value |
|--------|-------|
| `EXPO_TOKEN` | Personal access token from https://expo.dev/accounts/[username]/settings/access-tokens |
| `GOOGLE_SERVICE_ACCOUNT_KEY_JSON` | Full JSON content of a Google Play service account key (see below) |

> `GOOGLE_SERVICE_ACCOUNT_KEY_JSON` is written to `/tmp/google-service-account.json` during CI and is never committed.

### 3. Google Play service account key

1. Open [Google Play Console](https://play.google.com/console) → **Setup → API access**
2. Link to a Google Cloud project
3. Create a service account with the **Release Manager** role
4. Download the JSON key file
5. Paste the **entire JSON content** as the `GOOGLE_SERVICE_ACCOUNT_KEY_JSON` GitHub secret

### 4. First Play Store upload (one-time manual step)

Google requires the first build to be uploaded manually to establish the app listing:

1. Build a production AAB locally:
   ```bash
   APP_VARIANT=production eas build --platform android --profile production
   ```
2. In Play Console: create the app, complete the store listing, and upload the AAB to the **internal testing** track
3. After this, all future releases are automated

---

## Normal Development Flow

```bash
git checkout -b feature/my-feature
# make changes, open PR
# ci.yml runs: typecheck → lint → test

git merge # merge PR to main
# auto-release.yml runs:  1.0.0 → 1.0.1,  pushes tag v1.0.1
# release.yml runs:       builds AAB, submits to Play Store internal track
# distribute.yml runs:    builds preview APK for testers
```

After ~20 minutes, the new version is available to internal testers in Play Store.

---

## Promoting to Production

Once a build is verified in internal testing:

1. Go to **Actions → Promote to Production**
2. Click **Run workflow**
3. Leave "EAS Build ID" empty to promote the latest production build, or paste a specific build ID
4. Click **Run workflow**

This runs `eas submit --profile promote` which submits to the Play Store **production track** (100% rollout).

For a staged rollout instead, promote manually in Play Console: **Release → Internal testing → [release] → Promote to production** and set your desired rollout percentage.

---

## Manual Release Override

To release a specific version without auto-tagging:

```bash
# Edit package.json version manually, e.g. 2.0.0
git add package.json
git commit -m "chore: bump version to v2.0.0"
git tag -a v2.0.0 -m "Release v2.0.0"
git push origin main
git push origin v2.0.0
```

The tag push triggers `release.yml` as normal.

---

## Workflow Reference

| Workflow | Trigger | What it does |
|----------|---------|--------------|
| `ci.yml` | Every push / PR | typecheck → lint → test |
| `distribute.yml` | Push to `main`/`develop`, manual | EAS preview APK → shareable install link |
| `auto-release.yml` | Push to `main` (non-bot) | Bumps patch version, pushes `v*.*.*` tag |
| `release.yml` | Push `v*.*.*` tag | EAS production AAB → Play Store internal → GitHub Release |
| `promote-to-production.yml` | Manual (`workflow_dispatch`) | Promotes build to Play Store production track |
| `deploy-privacy-policy.yml` | Push to `main` (docs/store-listing/**), manual | Deploys privacy policy to Cloudflare Pages |

---

## Secrets Reference

| Secret | Used by | Purpose |
|--------|---------|---------|
| `EXPO_TOKEN` | All EAS workflows | Authenticate with Expo / EAS |
| `GOOGLE_SERVICE_ACCOUNT_KEY_JSON` | `release.yml`, `promote-to-production.yml` | Authenticate with Google Play |
| `CLOUDFLARE_API_TOKEN` | `deploy-privacy-policy.yml` | Authenticate with Cloudflare Pages |
| `CLOUDFLARE_ACCOUNT_ID` | `deploy-privacy-policy.yml` | Cloudflare account identifier |

---

## Monitoring

- **EAS builds**: https://expo.dev/accounts/[username]/projects/cisspquiz/builds
- **GitHub Actions**: Actions tab in this repository
- **Play Store status**: Play Console → Release → Internal testing
- **Privacy policy**: https://cissp-quiz-privacy.pages.dev/privacy-policy.html

---

## Troubleshooting

**`eas submit` fails: "Service account key not found"**
- Verify `GOOGLE_SERVICE_ACCOUNT_KEY_JSON` is set in GitHub secrets
- The value must be complete JSON (starts with `{`, ends with `}`)

**`eas submit` fails: "App not found in Play Console"**
- The app must be uploaded once manually to create the Play Store listing (see One-Time Setup step 4)

**`release.yml` timed out**
- EAS builds occasionally take longer than 30 minutes under heavy queue load
- Re-run the workflow from the Actions tab; `--latest` in `eas submit` will pick up the completed build

**Version number keeps incrementing even for small changes**
- This is expected: every merge to `main` = one patch version bump
- Use a `develop` branch for work-in-progress and merge to `main` only when ready to release

**`versionCode` vs `version` discrepancy**
- `version` (e.g. `1.0.3`) comes from `package.json`, bumped by `auto-release.yml`
- `versionCode` (Android integer) is managed by EAS via `autoIncrement: true` in `eas.json`
- Both increment independently; the Play Store only enforces `versionCode` uniqueness
