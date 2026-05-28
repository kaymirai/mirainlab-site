# mirainlab-site

AI×Etsy海外PODの無料プレゼント導線用サイトです。

## 構成

```text
index.html
free-present.html
free-gift.html
mentor.html
privacy.html
legal.html
unsubscribe.html
assets/css/style.css
assets/js/lead-form.js
assets/js/unsubscribe.js
docs/
supabase/schema.sql
supabase/functions/register-lead/index.ts
supabase/functions/unsubscribe/index.ts
.env.example
```

## 初期公開までの流れ

1. GitHubで `mirainlab-site` リポジトリを作る
2. このフォルダの中身をpushする
3. GitHub Pagesを有効化する
4. Supabaseでプロジェクトを作る
5. `supabase/schema.sql` をSQL Editorで実行する
6. Resendで送信用ドメインを認証する
7. Supabase Secretsに `.env.example` の値を登録する
8. Edge Function `register-lead` と `unsubscribe` をデプロイする
9. HTML内の `YOUR-PROJECT` URLを実際のEdge Function URLへ差し替える
10. GoogleドライブのPDF共有URLを `free-gift.html` に設定する

## 差し替え必須

- `free-present.html`: `register-lead` のURL
- `unsubscribe.html`: `unsubscribe` のURL
- `free-gift.html`: PDFのGoogleドライブURL
- `mentor.html`: ココナラ相談URL
- `privacy.html`: 問い合わせ先と運営者情報
- `legal.html`: 特定商取引法に基づく表記
- Supabase Secrets: `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `RESEND_API_KEY`, `FROM_EMAIL`, `FREE_GIFT_URL`, `PUBLIC_SITE_URL`, `ALLOWED_ORIGIN`

## テスト項目

- フォーム未同意では送信できない
- 正常登録で `leads` に保存される
- 自動返信メールが届く
- メール内の無料プレゼントURLが開く
- メール内の配信停止URLから停止できる
- `lead_status` が `unsubscribed` になる
- スマホ表示でフォームとボタンが崩れない

## 運用ルール

- 顧客メールアドレスをGitHubに置かない
- APIキーをGitHubに置かない
- 売上保証に見える表現を使わない
- Etsyではオリジナルデザイン、AI利用開示、生産パートナー開示を前提にする
- 一斉配信は少量テスト後にResend Audience / Broadcastへ移行する
