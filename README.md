# Takumi Concierge MVP

匠工務店向けの iOS / Android 多言語MVPアプリです。Expo / React Nativeで作成しています。

## 対応内容

- 日本語 / 英語 / 中国語の切り替え
- 利用者側と業者側のモード切り替え
- 利用者側: 簡単見積もり、相談、施工事例、進捗確認
- 業者側: 顧客管理、案件管理、宣伝配信、分析
- バックエンドなしで動くMVPプロトタイプ

## GitHubへアップロード

この `takumi-mobile-app` フォルダの中身をGitHubリポジトリにアップロードしてください。

## 起動方法

```bash
npm install
npm start
```

表示されたQRコードをiPhone/AndroidのExpo Goで読み取ると確認できます。

## スタッフ向けAI施工スタジオ

`staff-ai.html` はスマホ・PC両対応のWebアプリ型スタッフツールです。
現場写真、家具・ウッドデッキ等の参考写真、写真上の範囲指定、配置、寸法メモから生成指示を作り、AI API接続前でもブラウザ内で合成プレビューを確認できます。

静的確認:

```bash
python3 -m http.server 8000
```

その後 `http://localhost:8000/staff-ai.html` を開きます。

テスト:

```bash
npm run test:ai-studio
```

### Gemini API接続

`api/ai-render.mjs` は Vercel Functions で動かすサーバー側APIです。
GitHub PagesだけではAPIキーを安全に保持できないため、AI生成を有効にする場合はVercel等にデプロイし、環境変数 `GEMINI_API_KEY` を設定してください。

推奨モデル:

```text
GEMINI_IMAGE_MODEL=gemini-3.1-flash-image
GEMINI_IMAGE_SIZE=1K
GEMINI_ASPECT_RATIO=4:3
```

別ドメインのGitHub PagesからAPIを呼ぶ場合は、Vercel側に以下のように許可ドメインを設定します。

```text
ALLOWED_ORIGINS=https://your-github-username.github.io,https://your-domain.example
```

スタッフ画面の `AI API endpoint` には、同じVercelプロジェクトで運用するなら `/api/ai-render` を入力します。一度入力した値はブラウザに保存されます。

## 次の本番化ステップ

- Supabaseでログイン、顧客、案件、問い合わせ、写真保存を追加
- Push通知を追加
- LINE/メール配信連携を追加
- EAS BuildでApp Store / Google Play用ビルドを作成
