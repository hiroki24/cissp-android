# Expo EAS Build — Setup & Distribution Guide

> **For the full automated release pipeline, see [docs/release-automation.md](docs/release-automation.md).**

This guide covers the one-time setup steps and tester distribution details.

## One-Time Setup

### 1. Create an Expo account

Sign up at https://expo.dev/signup (free). Note your username.

### 2. Install EAS CLI and link the project

```bash
npm install -g eas-cli
eas login
eas build:configure   # links the project; eas.json is already committed
```

### 3. Get an Expo access token

1. Go to https://expo.dev/accounts/[username]/settings/access-tokens
2. Click **Create Token**, name it "GitHub Actions", and copy it immediately

### 4. Create a Google Play service account key

Required for automated Play Store submission:

1. Open [Google Play Console](https://play.google.com/console) → **Setup → API access**
2. Link to a Google Cloud project
3. Create a service account with the **Release Manager** role
4. Download the JSON key file

### 5. Add GitHub secrets

Go to **Settings → Secrets and variables → Actions** in your repository:

| Secret | Value |
|--------|-------|
| `EXPO_TOKEN` | Access token from step 3 |
| `GOOGLE_SERVICE_ACCOUNT_KEY_JSON` | Full JSON content of the key file from step 4 |

### 6. First Play Store upload (manual, one-time)

Google requires the first build to be uploaded manually:

1. `APP_VARIANT=production eas build --platform android --profile production`
2. In Play Console, create the app listing and upload the AAB to the **internal testing** track
3. All future releases are automated from this point

---

## Build Profiles

| Profile | Output | Use case |
|---------|--------|----------|
| `development` | APK (debug client) | Local development with expo-dev-client |
| `preview` | APK | Internal testers via direct install link |
| `production` | AAB | Google Play Store |

```bash
# Trigger a specific profile manually
eas build --platform android --profile preview
eas build --platform android --profile production
```

---

## Installing a Preview Build (Tester Instructions)

1. Open the installation link on your Android device (from the Expo dashboard or shared link)
2. Tap **Download**
3. If prompted, enable **Install from unknown sources**:
   - Android 8.0+: Settings → Apps → Special access → Install unknown apps → [Your Browser] → Allow
4. Open the downloaded APK and tap **Install**

Preview builds are available at:
`https://expo.dev/accounts/[username]/projects/cisspquiz/builds`

---

## Promoting to the Play Store Production Track

After a build passes internal testing, promote it with one click:

1. Go to **Actions → Promote to Production** in this repository
2. Click **Run workflow** (optionally paste a specific EAS Build ID)

Or promote manually in Play Console: **Release → Internal testing → [release] → Promote to production**.

---

## Troubleshooting

| Issue | Fix |
|-------|-----|
| "Not authenticated" | Verify `EXPO_TOKEN` is set and not expired |
| "App not found" | Complete the first manual Play Store upload (step 6) |
| Build queue is slow | Check https://expo.dev/builds/queue; re-run the workflow when the build completes |
| "Install from unknown sources" blocked | Follow the device-specific instructions above |
