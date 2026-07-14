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

## 次の本番化ステップ

- Supabaseでログイン、顧客、案件、問い合わせ、写真保存を追加
- Push通知を追加
- LINE/メール配信連携を追加
- EAS BuildでApp Store / Google Play用ビルドを作成
