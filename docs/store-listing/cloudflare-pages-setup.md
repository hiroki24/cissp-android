# Cloudflare Pages セットアップ手順

プライバシーポリシーを `https://cissp-quiz-privacy.pages.dev/privacy-policy.html` で公開するための手順です。

## 1. Cloudflare アカウント準備

1. [Cloudflare](https://dash.cloudflare.com/sign-up) にサインアップ（無料プランで可）

## 2. API トークン取得

1. [Cloudflare ダッシュボード](https://dash.cloudflare.com) → 右上のアイコン → **My Profile**
2. **API Tokens** タブ → **Create Token**
3. テンプレート「**Cloudflare Pages: Edit**」を選択 → Continue to summary → Create Token
4. 表示されたトークンをコピー（一度しか表示されません）

## 3. Account ID 取得

1. Cloudflare ダッシュボード → 任意のドメイン（または Workers & Pages）
2. 右サイドバーの **Account ID** をコピー

## 4. GitHub Secrets に登録

```
gh secret set CLOUDFLARE_API_TOKEN   # → ステップ2のトークン
gh secret set CLOUDFLARE_ACCOUNT_ID  # → ステップ3のID
```

または GitHub リポジトリの Settings → Secrets and variables → Actions から追加。

## 5. デプロイ実行

シークレット設定後、以下のいずれかで自動デプロイ：
- `docs/store-listing/` 配下のファイルを変更して `main` にプッシュ
- または Actions → **Deploy Privacy Policy to Cloudflare Pages** → Run workflow

## 6. 公開URL

デプロイ後のURL:
```
https://cissp-quiz-privacy.pages.dev/privacy-policy.html
```

このURLを Google Play Console → **ストアの掲載情報** → **プライバシーポリシー** に登録してください。

## 7. eas.json の releaseStatus を変更

Play Store の全 listing 設定完了後：

```json
// eas.json の submit.production.android
"releaseStatus": "completed"  // "draft" から変更
```
