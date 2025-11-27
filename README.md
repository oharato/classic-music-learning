# クラシック音楽学習アプリ

ゲーム感覚で楽しみながらクラシック音楽の名曲を暗記できるWebアプリケーションです。

## ✨ 主な機能

- **クイズモード**: 曲を聴いて曲名を選ぶ、または曲名を見て作曲家を選ぶ2種類のクイズ形式で、スコアを競います。
  - キーボードショートカット対応: Ctrl+Enter でクイズ開始、矢印キーで選択、Enterで回答送信、スペースキーで再生/一時停止
  - 出題範囲設定: すべて、またはベートーヴェン、モーツァルト、バッハなど作曲家別
  - 音声プレーヤー: Wikimedia Commons の著作権フリー音源を使用
  
- **学習モード**: フラッシュカード形式で、楽曲の音声、曲名、作曲家、ジャンル、解説、トリビアをじっくり学習できます。
  - キーボードショートカット: 矢印キーで前後移動、スペースキーで表裏切り替え
  - 音声再生機能付き
  
- **ランキング機能**: クイズで獲得したスコアを作曲家別・期間別・形式別で競い合えます。
  - 作曲家別ランキング: すべて、ベートーヴェン、モーツァルト、バッハ など
  - 期間別ランキング: 日次ランキング（当日のスコア）、全期間トップ5
  - 形式別ランキング: 曲→曲名、曲名→作曲家で別々のランキング
  - トップ3にはメダル表示（🥇🥈🥉）
  - ニックネームの自動保存（localStorage）

- **多言語対応**: 日本語・英語の切り替えに対応

## 🎵 収録曲

- ベートーヴェン: 交響曲第5番「運命」、エリーゼのために、月光ソナタ
- モーツァルト: アイネ・クライネ・ナハトムジーク、交響曲第40番、トルコ行進曲
- バッハ: トッカータとフーガ ニ短調、G線上のアリア
- ショパン: ノクターン第2番、小犬のワルツ
- チャイコフスキー: 白鳥の湖、くるみ割り人形
- ヴィヴァルディ: 四季「春」
- ブラームス: ハンガリー舞曲第5番
- パッヘルベル: カノン

## 🛠️ 使用技術

### フロントエンド
- [Vue.js](https://vuejs.org/) (v3, Composition API)
- [Vite](https://vitejs.dev/)
- [Pinia](https://pinia.vuejs.org/)
- [Vue Router](https://router.vuejs.org/)
- [Tailwind CSS](https://tailwindcss.com/)

### アーキテクチャ
- **再利用可能コンポーネント**: DRY原則に基づいた設計
  - 共通UIコンポーネント: LanguageSelector, LoadingSpinner, ErrorMessage, AppButton
  - クイズ設定コンポーネント: CategorySelector, QuizFormatSelector
  - 学習用コンポーネント: MusicCard, MusicDetailCard
- **レスポンシブデザイン**: モバイルファーストの設計
  - スマホとPCで最適化された異なるレイアウト
  - ランキング: PC版はテーブル、スマホ版はカード形式
  - フォーム: 画面サイズに応じた適切なサイズとスペーシング
  - バリデーションエラーの画面内表示
- **CI/CD**: GitHub Actions による自動テスト・デプロイパイプライン

### バックエンド
- [Hono](https://hono.dev/)
- [Cloudflare Pages Functions](https://developers.cloudflare.com/pages/functions/)
- [Cloudflare D1](https://developers.cloudflare.com/d1/) (データベース)

### データソース
- **楽曲メタデータ**: 手動作成のJSON (Open Opus APIを参考)
- **音声ファイル**: [Wikimedia Commons](https://commons.wikimedia.org/) (著作権フリー音源)
- **楽曲情報**: AI生成 (Gemini/ChatGPT) による解説・トリビア

## 🚀 ローカルでの実行方法

### 1. 依存関係のインストール
```bash
npm install
```

### 2. データベースのセットアップ
ローカルのD1データベースにテーブルを作成します。

```bash
npx wrangler d1 migrations apply classic-music-learning-db --local
```
初回実行時に確認を求められた場合は `Y` を入力してください。

このコマンドで以下のテーブルが作成されます：
- `ranking_daily`: 日次ランキング（nickname, region, format, date ごとに UNIQUE）
- `ranking_all_time`: 全期間ランキング（region と format ごとのベストスコア）

### 3. 開発サーバーの起動
フロントエンド（Vite）とバックエンド（Wrangler）の開発サーバーを同時に起動します。

```bash
npm run dev
```
起動後、ブラウザで `http://localhost:5173` にアクセスしてください。

## 🧪 テスト

このプロジェクトでは [Vitest](https://vitest.dev/) を使用して包括的なテストを実行します。

### テストの実行
```bash
# 全テストを実行（ウォッチモード）
npm test

# 全テストを1回だけ実行
npm run test:run

# UIでテストを実行
npm run test:ui

# カバレッジレポート付きでテストを実行
npm run test:coverage
```

### コード品質チェック

このプロジェクトでは [Biome](https://biomejs.dev/) を使用した高速なリンティングとフォーマットを行っています。

```bash
# コードのリントチェック
npm run lint

# リンターのエラーを自動修正
npm run lint:fix

# コードのフォーマット
npm run format
```

## 📁 ディレクトリ構造

```
.
├── functions/       # Cloudflare Pages Functions (バックエンドAPI)
├── migrations/      # D1 データベースのマイグレーションファイル
├── public/          # 静的ファイル (楽曲データJSON)
│   ├── music.ja.json  # 日本語の楽曲データ
│   └── music.en.json  # 英語の楽曲データ
├── scripts/         # データ生成などのバッチスクリプト
└── src/
    ├── assets/      # 画像などのアセット
    ├── components/  # 共通コンポーネント
    ├── i18n/        # 国際化（翻訳ファイル）
    ├── router/      # Vue Router の設定
    ├── store/       # Pinia ストア (状態管理)
    ├── views/       # 各画面のVueコンポーネント
    ├── App.vue      # アプリケーションのルートコンポーネント
    ├── main.ts      # アプリケーションのエントリーポイント
    └── style.css    # グローバルスタイル
```

## 🚀 本番環境へのデプロイ

このアプリケーションは Cloudflare Pages にデプロイされます。

### デプロイ手順

#### 1. Cloudflare にログイン
```bash
npx wrangler login
```

#### 2. D1 データベースの作成（初回のみ）
```bash
npx wrangler d1 create classic-music-learning-db
```
出力された `database_id` を `wrangler.toml` に設定してください。

#### 3. マイグレーションの適用（初回のみ）
```bash
npx wrangler d1 migrations apply classic-music-learning-db --remote
```

#### 4. デプロイ
```bash
npm run deploy
```

## 📖 ドキュメント

- [要件定義書](./docs/01_requirements.md)
- [基本設計書](./docs/02_basic_design.md)
- [ワイヤーフレーム](./docs/03_wireframes.md)
- [API仕様書](./docs/04_api_spec.md)
- [技術仕様書](./docs/05_technical_specification.md)
- [テスト仕様書](./docs/06_test_specification.md)
- [デプロイ手順](./docs/07_deployment.md)
