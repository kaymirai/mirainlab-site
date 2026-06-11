# mirainlab-site

AIとEtsy海外販売の無料プレゼント導線用サイトです。

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
assets/js/home-experience.js
assets/js/unsubscribe.js
```

## 公開までの流れ

1. GitHubで `mirainlab-site` リポジトリを作る
2. このフォルダの中身をpushする
3. Cloudflare PagesでGitHubリポジトリを接続する
4. `main` ブランチをProductionとして公開する
5. 独自ドメインを使う場合はCloudflare DNSで `www.mirainlab.com` をPagesへ向ける

## 差し替え必須

- `free-gift.html`: 無料プレゼント3点セットの内容
- `mentor.html`: 3ヶ月伴走と申込み導線
- `privacy.html`: 問い合わせ先と運営者情報
- `legal.html`: 特定商取引法に基づく表記

## テスト項目

- メール内の無料プレゼントURLが開く
- スマホ表示で見出し、ボタン、固定CTAが崩れない
- 無料プレゼント3点セットの各ページが開く
- `prefers-reduced-motion` 環境で動きが抑制される

## 運用ルール

- 顧客メールアドレスをGitHubに置かない
- APIキーをGitHubに置かない
- 売上保証に見える表現を使わない
- Etsyではオリジナルデザイン、AI利用開示、生産パートナー開示を前提にする
- 一斉配信は少量テスト後にResend Audience / Broadcastへ移行する
