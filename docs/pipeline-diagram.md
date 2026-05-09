# CI/CD Pipeline Diagram

## End-to-End Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           DEVELOPER WORKFLOW                                │
│                                                                             │
│   feature branch ──► Pull Request ──► Code Review ──► Merge to main        │
└──────────────────────────────┬──────────────────────────────────────────────┘
                               │
                               │ git push (main)
                               │
          ┌────────────────────┼────────────────────────┐
          │                    │                        │
          ▼                    ▼                        ▼
┌──────────────────┐  ┌──────────────────────┐  ┌─────────────────────────┐
│    ci.yml        │  │  distribute.yml       │  │   auto-release.yml      │
│                  │  │                       │  │                         │
│  ┌────────────┐  │  │  ┌─────────────────┐  │  │  ┌───────────────────┐  │
│  │ typecheck  │  │  │  │ EAS Build       │  │  │  │ npm version patch │  │
│  │     ▼      │  │  │  │ (preview APK)   │  │  │  │       ▼           │  │
│  │   lint     │  │  │  │       ▼         │  │  │  │ git commit        │  │
│  │     ▼      │  │  │  │ Shareable link  │  │  │  │ [skip ci]         │  │
│  │   test     │  │  │  │ for testers     │  │  │  │       ▼           │  │
│  └────────────┘  │  │  └─────────────────┘  │  │  │ git tag v1.0.x    │  │
│                  │  │                       │  │  │       ▼           │  │
│  ✅ Quality gate │  │  📱 Tester download   │  │  │ git push tag      │  │
└──────────────────┘  └──────────────────────┘  │  │       ▼           │  │
                                                │  │ calls release.yml │  │
                                                │  │ (workflow_call)   │  │
                                                │  └───────────────────┘  │
                                                └────────────┬────────────┘
                                                             │
                                                             │ workflow_call
                                                             │
                                                             ▼
                                                ┌─────────────────────────┐
                                                │     release.yml         │
                                                │                         │
                                                │  ┌───────────────────┐  │
                                                │  │ EAS Build         │  │
                                                │  │ (production AAB)  │  │
                                                │  │ --wait            │  │
                                                │  │       ▼           │  │
                                                │  │ eas submit        │  │
                                                │  │ → Play Store      │  │
                                                │  │   internal track  │  │
                                                │  │       ▼           │  │
                                                │  │ GitHub Release    │  │
                                                │  │ with release notes│  │
                                                │  └───────────────────┘  │
                                                │                         │
                                                │  🏪 Internal testers    │
                                                │     get the build       │
                                                └────────────┬────────────┘
                                                             │
                                                             │ verified ✅
                                                             │
                                                             ▼
                                                ┌─────────────────────────┐
                                                │ promote-to-production   │
                                                │     .yml                │
                                                │                         │
                                                │  Manual trigger         │
                                                │  (GitHub Actions UI)    │
                                                │         ▼               │
                                                │  eas submit             │
                                                │  → Play Store           │
                                                │    production track     │
                                                │                         │
                                                │  🚀 Public release!     │
                                                └─────────────────────────┘
```

## Secrets Required

```
GitHub Repository Secrets
├── EXPO_TOKEN                       ← Expo access token (all EAS workflows)
├── GOOGLE_SERVICE_ACCOUNT_KEY_JSON  ← Google Play API auth (release + promote)
├── CLOUDFLARE_API_TOKEN             ← Cloudflare Pages deploy (privacy policy)
└── CLOUDFLARE_ACCOUNT_ID            ← Cloudflare account ID
```

## Automation Summary

| Step | Human action? | Workflow |
|------|:---:|---|
| Push code / merge PR | ✅ | — |
| Type check + lint + test | ❌ | `ci.yml` |
| Preview APK for testers | ❌ | `distribute.yml` |
| Bump version + tag | ❌ | `auto-release.yml` |
| Production AAB build | ❌ | `release.yml` |
| Submit to Play Store internal | ❌ | `release.yml` |
| Create GitHub Release | ❌ | `release.yml` |
| Promote to production | ✅ one click | `promote-to-production.yml` |
| Deploy privacy policy | ❌ | `deploy-privacy-policy.yml` |
