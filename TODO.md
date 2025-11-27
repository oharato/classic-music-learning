# TODOリスト - クラシック音楽学習アプリ

- 他から更新されることがあるので毎回読み込みしなおすこと

## フェーズ1: 国旗アプリからの変換 (完了)

- [x] 1.1. データモデルの変更
    - [x] Country型 → MusicPiece型への変換
    - [x] id, title, composer, genre, audio_url, description, trivia フィールドの定義
- [x] 1.2. ストアの更新
    - [x] useCountriesStore → useMusicStore への変換
    - [x] fetchCountries → fetchPieces への変更
    - [x] getCountryById → getPieceById への変更
    - [x] getRandomCountries → getRandomPieces への変更
- [x] 1.3. 翻訳の更新
    - [x] region → category（作曲家カテゴリ）への変更
    - [x] 国旗関連用語 → 音楽関連用語への変更
    - [x] クイズ形式の変更（flag-to-name → audio-to-title, name-to-flag → title-to-composer）

## フェーズ2: コンポーネントの変換 (完了)

- [x] 2.1. FlagCard → MusicCard
    - [x] 国旗画像 → 音声プレーヤーへの変更
    - [x] 再生/一時停止ボタンの実装
- [x] 2.2. CountryDetailCard → MusicDetailCard
    - [x] 国情報 → 楽曲情報への変更
    - [x] 曲名、作曲家、ジャンル、解説、トリビアの表示
- [x] 2.3. RegionSelector → CategorySelector
    - [x] 大陸選択 → 作曲家選択への変更
    - [x] 利用可能な作曲家の動的生成

## フェーズ3: ビューの更新 (完了)

- [x] 3.1. Home.vue
    - [x] タイトルの変更（国旗学習ゲーム → クラシック音楽学習ゲーム）
- [x] 3.2. Study.vue
    - [x] 国旗フラッシュカード → 音楽フラッシュカードへの変更
    - [x] 地域フィルター → 作曲家フィルターへの変更
    - [x] クイズモード選択の追加（曲→曲名、曲名→作曲家）
- [x] 3.3. QuizSetup.vue
    - [x] 出題範囲の変更（大陸 → 作曲家）
    - [x] クイズ形式の変更
- [x] 3.4. QuizPlay.vue
    - [x] 国旗表示 → 音声プレーヤーへの変更
    - [x] 選択肢表示の変更（国名 → 曲名/作曲家）
- [x] 3.5. QuizResult.vue
    - [x] 結果表示の変更
    - [x] 回答詳細の変更
- [x] 3.6. Ranking.vue
    - [x] 地域選択 → カテゴリ選択への変更

## フェーズ4: データ準備 (完了)

- [x] 4.1. サンプル楽曲データの作成
    - [x] music.ja.json（日本語版）
    - [x] music.en.json（英語版）
- [x] 4.2. Wikimedia Commons音源のURL取得
    - [x] ベートーヴェン: 交響曲第5番、エリーゼのために、月光ソナタ
    - [x] モーツァルト: アイネ・クライネ・ナハトムジーク、交響曲第40番、トルコ行進曲
    - [x] バッハ: トッカータとフーガ、G線上のアリア
    - [x] ショパン: ノクターン第2番、小犬のワルツ
    - [x] チャイコフスキー: 白鳥の湖、くるみ割り人形
    - [x] ヴィヴァルディ: 四季「春」
    - [x] ブラームス: ハンガリー舞曲第5番
    - [x] パッヘルベル: カノン

## フェーズ5: テストの更新 (完了)

- [x] 5.1. フィクスチャの更新
    - [x] mockCountries → mockMusicPieces
- [x] 5.2. ストアテストの更新
    - [x] countries.test.ts
    - [x] quiz.test.ts
    - [x] ranking.test.ts
- [x] 5.3. ビューテストの更新
    - [x] Home.test.ts
    - [x] QuizSetup.test.ts
    - [x] Study.test.ts
    - [x] Ranking.test.ts

## フェーズ6: ドキュメント更新 (完了)

- [x] 6.1. README.md
- [x] 6.2. docs/01_requirements.md
- [x] 6.3. docs/02_basic_design.md
- [x] 6.4. index.html（メタ情報）
- [x] 6.5. favicon.svg

## フェーズ7: ビルドと検証 (完了)

- [x] 7.1. npm run build の成功確認
- [x] 7.2. npm run test:run の成功確認（132テスト全て成功）
- [ ] 7.3. UIの動作確認（開発サーバーでの検証）

## 今後の改善候補

- [ ] 楽曲データの拡充
    - [ ] Open Opus APIからの楽曲メタデータ取得スクリプトの作成
    - [ ] Wikidata SPARQLクエリによる音源URL一括取得
    - [ ] 楽曲数の拡大（現在15曲 → 50曲以上）
- [ ] 音質改善
    - [ ] Musopenからの高音質音源のダウンロードと統合
    - [ ] 音質の悪い音源の差し替え
- [ ] 機能拡張
    - [ ] 作曲家別の学習進捗表示
    - [ ] お気に入り機能
    - [ ] 聴いた曲の履歴機能
- [ ] パフォーマンス最適化
    - [ ] 音声ファイルのプリロード
    - [ ] Service Workerによる音声キャッシュ
