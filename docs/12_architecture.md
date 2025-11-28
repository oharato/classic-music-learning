# アーキテクチャ図

## システム全体構成図

以下の図は、クラシック音楽学習アプリの全体アーキテクチャを示しています。各コンポーネント間のやりとり、外部サイトからの情報取得、ランキング情報登録のデータフローが一目でわかるようになっています。

```mermaid
flowchart TB
    subgraph External["外部サービス"]
        Wikidata["Wikidata<br/>(SPARQL API)"]
        WikimediaCommons["Wikimedia Commons<br/>(音声ファイル)"]
    end

    subgraph BatchScripts["バッチスクリプト (開発時)"]
        GenerateMusic["generate-music-data.mts<br/>楽曲データ生成"]
        VerifyAudio["verify-audio-urls.mts<br/>音声URL検証"]
    end

    subgraph StaticData["静的データ"]
        MusicJSON["music.ja.json<br/>music.en.json<br/>(楽曲データ)"]
    end

    subgraph Frontend["フロントエンド (Vue.js SPA)"]
        subgraph Views["ビュー"]
            Home["Home.vue<br/>ホーム画面"]
            Study["Study.vue<br/>学習モード"]
            QuizSetup["QuizSetup.vue<br/>クイズ設定"]
            QuizPlay["QuizPlay.vue<br/>クイズ実行"]
            QuizResult["QuizResult.vue<br/>結果表示"]
            Ranking["Ranking.vue<br/>ランキング"]
        end

        subgraph Components["コンポーネント"]
            MusicCard["MusicCard.vue<br/>楽曲カード"]
            MusicDetailCard["MusicDetailCard.vue<br/>詳細カード"]
            CategorySelector["CategorySelector.vue<br/>作曲家選択"]
            AudioPlayer["Audio Player<br/>(HTML audio)"]
        end

        subgraph Stores["Pinia ストア"]
            MusicStore["useMusicStore<br/>楽曲データ管理"]
            QuizStore["useQuizStore<br/>クイズ状態管理"]
            RankingStore["useRankingStore<br/>ランキング管理"]
        end
    end

    subgraph Backend["バックエンド (Hono / Cloudflare Pages Functions)"]
        API["API Server<br/>/api/ranking"]
    end

    subgraph Database["データベース"]
        D1["Cloudflare D1<br/>(SQLite)"]
        DailyTable["ranking_daily<br/>日次ランキング"]
        AllTimeTable["ranking_all_time<br/>全期間ランキング"]
    end

    %% バッチ処理フロー (開発時)
    Wikidata -->|"SPARQL クエリ<br/>楽曲メタデータ取得"| GenerateMusic
    GenerateMusic -->|"JSON生成"| MusicJSON
    MusicJSON -->|"URL検証"| VerifyAudio
    VerifyAudio -->|"修正済みJSON"| MusicJSON

    %% 静的データの読み込み
    MusicJSON -->|"fetch"| MusicStore

    %% 音声再生フロー
    MusicStore -->|"audio_url"| AudioPlayer
    AudioPlayer -->|"音声ストリーミング"| WikimediaCommons

    %% ビュー間の遷移
    Home -->|"学習開始"| Study
    Home -->|"クイズ開始"| QuizSetup
    Home -->|"ランキング"| Ranking
    QuizSetup -->|"開始"| QuizPlay
    QuizPlay -->|"完了"| QuizResult
    QuizResult -->|"登録"| Ranking

    %% コンポーネント利用
    Study --> MusicCard
    Study --> MusicDetailCard
    Study --> CategorySelector
    QuizPlay --> MusicCard
    MusicCard --> AudioPlayer

    %% ストア利用
    Study --> MusicStore
    QuizSetup --> MusicStore
    QuizPlay --> QuizStore
    QuizResult --> QuizStore
    QuizResult --> RankingStore
    Ranking --> RankingStore

    %% ランキング登録・取得フロー
    RankingStore -->|"POST /api/ranking<br/>スコア登録"| API
    RankingStore -->|"GET /api/ranking<br/>ランキング取得"| API
    API -->|"INSERT"| D1
    API -->|"SELECT"| D1
    D1 --> DailyTable
    D1 --> AllTimeTable

    %% スタイル定義
    classDef external fill:#e1f5fe,stroke:#01579b
    classDef batch fill:#fff3e0,stroke:#e65100
    classDef static fill:#f3e5f5,stroke:#7b1fa2
    classDef frontend fill:#e8f5e9,stroke:#2e7d32
    classDef backend fill:#fce4ec,stroke:#c2185b
    classDef database fill:#fff8e1,stroke:#f57f17

    class Wikidata,WikimediaCommons external
    class GenerateMusic,VerifyAudio batch
    class MusicJSON static
    class Home,Study,QuizSetup,QuizPlay,QuizResult,Ranking,MusicCard,MusicDetailCard,CategorySelector,AudioPlayer,MusicStore,QuizStore,RankingStore frontend
    class API backend
    class D1,DailyTable,AllTimeTable database
```

## データフローの説明

### 1. 楽曲データ生成フロー (開発時)

```
Wikidata (SPARQL) → generate-music-data.mts → music.*.json → verify-audio-urls.mts → 検証済みJSON
```

1. **Wikidata SPARQL API** から有名な作曲家の楽曲メタデータを取得
2. **generate-music-data.mts** がJSONファイルを生成
3. **verify-audio-urls.mts** がWikimedia Commons APIで音声URLを検証・修正
4. 検証済みの `music.ja.json` / `music.en.json` を `public/` に配置

### 2. 音声再生フロー (実行時)

```
ユーザー操作 → MusicCard → AudioPlayer → Wikimedia Commons → 音声再生
```

1. ユーザーが再生ボタンをクリック
2. `MusicCard` コンポーネントが `audio_url` を取得
3. HTML `<audio>` 要素が **Wikimedia Commons** から音声をストリーミング再生

### 3. ランキング登録フロー

```
QuizResult → RankingStore → POST /api/ranking → Hono API → Cloudflare D1
```

1. クイズ完了後、**QuizResult** でスコアを計算
2. ニックネーム入力後、**RankingStore** がAPIにPOSTリクエスト
3. **Hono API** がリクエストを処理
4. **Cloudflare D1** に日次ランキングと全期間ランキングを登録

### 4. ランキング取得フロー

```
Ranking画面 → RankingStore → GET /api/ranking → Hono API → Cloudflare D1 → 表示
```

1. ランキング画面表示時、**RankingStore** がAPIにGETリクエスト
2. **Hono API** がD1から上位100件を取得
3. フロントエンドでランキングテーブル/カードを表示

## コンポーネント間の関係

| コンポーネント | 役割 | 依存先 |
|:---|:---|:---|
| `Home.vue` | ホーム画面、メニュー表示 | - |
| `Study.vue` | 学習モード、フラッシュカード | `MusicStore`, `MusicCard`, `CategorySelector` |
| `QuizSetup.vue` | クイズ設定画面 | `MusicStore`, `CategorySelector` |
| `QuizPlay.vue` | クイズ実行画面 | `QuizStore`, `MusicCard` |
| `QuizResult.vue` | 結果表示、ランキング登録 | `QuizStore`, `RankingStore` |
| `Ranking.vue` | ランキング表示 | `RankingStore` |
| `MusicCard.vue` | 楽曲カード (音声再生付き) | Wikimedia Commons |
| `MusicDetailCard.vue` | 楽曲詳細表示 | - |
| `CategorySelector.vue` | 作曲家フィルター | `MusicStore` |

## 技術スタック

| レイヤー | 技術 | 用途 |
|:---|:---|:---|
| フロントエンド | Vue 3 + TypeScript | SPA構築 |
| 状態管理 | Pinia | グローバルステート管理 |
| スタイリング | Tailwind CSS | レスポンシブUI |
| バックエンド | Hono | APIサーバー |
| ホスティング | Cloudflare Pages | 静的サイト + Functions |
| データベース | Cloudflare D1 (SQLite) | ランキングデータ永続化 |
| 外部データ | Wikidata + Wikimedia Commons | 楽曲メタデータ + 音声ファイル |
