import fs from 'node:fs/promises';
import path from 'node:path';

// 楽曲データの型定義
interface MusicPiece {
  id: string;
  title: string;
  composer: string;
  genre: string;
  audio_url: string;
  description: string;
  trivia: string;
}

interface WikidataResult {
  item: { value: string };
  itemLabel: { value: string };
  composerLabel: { value: string };
  audio: { value: string };
}

// Wikimedia Commons APIで音声ファイルの正確なURLを取得
const getCorrectAudioUrl = async (commonsFileName: string): Promise<string | null> => {
  try {
    // ファイル名をデコード（URLエンコードされている場合）
    const decodedFileName = decodeURIComponent(commonsFileName.replace(/^File:/, ''));

    // Wikimedia Commons APIを使用してファイル情報を取得
    const apiUrl = `https://commons.wikimedia.org/w/api.php?action=query&titles=File:${encodeURIComponent(decodedFileName)}&prop=imageinfo&iiprop=url&format=json&origin=*`;

    const response = await fetch(apiUrl);
    const data: any = await response.json();

    const pages = data.query?.pages;
    if (!pages) return null;

    const pageId = Object.keys(pages)[0];
    if (pageId === '-1') {
      console.warn(`  - File not found: ${decodedFileName}`);
      return null;
    }

    const imageInfo = pages[pageId]?.imageinfo?.[0];
    if (imageInfo?.url) {
      console.log(`  ✓ Verified audio URL: ${imageInfo.url}`);
      return imageInfo.url;
    }
  } catch (e: any) {
    console.warn(`  - Error getting audio URL: ${e.message}`);
  }

  return null;
};

// Wikidata SPARQL クエリを実行して楽曲データを取得
const fetchMusicDataFromWikidata = async (lang: 'ja' | 'en'): Promise<WikidataResult[]> => {
  const endpoint = 'https://query.wikidata.org/sparql';

  // Issueに記載されたSPARQLクエリを使用（言語に応じて調整）
  const query = `
SELECT DISTINCT ?item ?itemLabel ?composerLabel ?audio WHERE {
  # 元の「楽曲(Q218818)」型制約を外してヒットを増やす（後で絞り込み可）
  # ?item wdt:P31/wdt:P279* wd:Q218818.
  
  # 作曲者(P86)がいる
  ?item wdt:P86 ?composer.
  
  # 音声ファイル(P51)、P2042、P9901 のいずれかを持っている (= 音源があるものに限定)
  ?item wdt:P51|wdt:P2042|wdt:P9901 ?audio.
  
  # 有名な作曲家に絞るフィルタリング（リストを拡張）
  VALUES ?composer { 
    wd:Q255     # Beethoven
    wd:Q254     # Mozart
    wd:Q1340    # Bach
    wd:Q7349    # Haydn
    wd:Q9359    # Chopin
    wd:Q7302    # Verdi
    wd:Q29973   # Tchaikovsky
    wd:Q1268    # Vivaldi
    wd:Q7294    # Brahms
    wd:Q106630  # Pachelbel
    wd:Q7312    # Handel
    wd:Q7315    # Schubert
    wd:Q2543    # Wagner
    wd:Q30312   # Liszt
    wd:Q35730   # Debussy
    wd:Q16299   # Ravel
    wd:Q36314   # Mendelssohn
    wd:Q3871    # Schumann
    wd:Q7600    # Mahler
    wd:Q28285   # Puccini
    wd:Q31202   # Rossini
    wd:Q34428   # Saint-Saëns
  }

  SERVICE wikibase:label { bd:serviceParam wikibase:language "${lang},en". }
}
LIMIT 1000
`;

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Accept: 'application/sparql-results+json',
        'User-Agent': 'ClassicMusicLearningApp/1.0',
      },
      body: `query=${encodeURIComponent(query)}`,
    });

    if (!response.ok) {
      throw new Error(`SPARQL query failed: ${response.status}`);
    }

    const data: any = await response.json();
    return data.results?.bindings || [];
  } catch (e: any) {
    console.error(`Error fetching data from Wikidata: ${e.message}`);
    return [];
  }
};

// Wikimedia CommonsのURLからファイル名を抽出
const extractFileNameFromUrl = (url: string): string => {
  // URL形式: http://commons.wikimedia.org/wiki/Special:FilePath/FileName.ogg
  const match = url.match(/Special:FilePath\/(.+)$/);
  if (match) {
    return decodeURIComponent(match[1]);
  }
  return '';
};

// IDを生成
const generateId = (title: string, composer: string): string => {
  const cleanTitle = title
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, '_')
    .substring(0, 30);

  const cleanComposer = composer
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')
    .substring(0, 15);

  return `${cleanTitle}_${cleanComposer}`;
};

// メイン処理
const main = async () => {
  console.log('Fetching music data from Wikidata...\n');

  // 日本語と英語のデータを取得
  const [dataJa, dataEn] = await Promise.all([fetchMusicDataFromWikidata('ja'), fetchMusicDataFromWikidata('en')]);

  console.log(`Found ${dataJa.length} Japanese results`);
  console.log(`Found ${dataEn.length} English results\n`);

  // 英語データをベースにマップを作成（audio URLで紐付け）
  const musicPiecesJa: MusicPiece[] = [];
  const musicPiecesEn: MusicPiece[] = [];
  const processedUrls = new Set<string>();
  // 作曲家ごとの追加数を制限（最大 10 曲／作曲家）
  const composerCounts: Record<string, number> = {};

  for (const item of dataEn) {
    const audioUrl = item.audio?.value;
    if (!audioUrl || processedUrls.has(audioUrl)) continue;

    processedUrls.add(audioUrl);

    const fileName = extractFileNameFromUrl(audioUrl);
    if (!fileName) continue;

    const composerName = item.composerLabel?.value || 'unknown';
    if ((composerCounts[composerName] || 0) >= 10) {
      // この作曲家は既に最大件数に達しているためスキップ
      continue;
    }

    console.log(`Processing: ${item.itemLabel?.value}...`);

    // 正確なURLを取得
    const verifiedUrl = await getCorrectAudioUrl(fileName);
    if (!verifiedUrl) {
      console.warn(`  - Skipping (audio URL not verified)`);
      continue;
    }

    const id = generateId(item.itemLabel?.value || '', item.composerLabel?.value || '');

    // 対応する日本語データを探す
    const jaItem = dataJa.find((ja) => ja.audio?.value === audioUrl);

    const pieceEn: MusicPiece = {
      id,
      title: item.itemLabel?.value || '',
      composer: item.composerLabel?.value || '',
      genre: '', // ジャンルはWikidataから追加取得が必要
      audio_url: verifiedUrl,
      description: '', // 説明は手動または別APIで追加
      trivia: '', // トリビアは手動または別APIで追加
    };

    const pieceJa: MusicPiece = {
      id,
      title: jaItem?.itemLabel?.value || item.itemLabel?.value || '',
      composer: jaItem?.composerLabel?.value || item.composerLabel?.value || '',
      genre: '',
      audio_url: verifiedUrl,
      description: '',
      trivia: '',
    };

    musicPiecesEn.push(pieceEn);
    musicPiecesJa.push(pieceJa);

    // 作曲家のカウントを増やす
    composerCounts[composerName] = (composerCounts[composerName] || 0) + 1;

    console.log(`  ✓ Added: ${pieceEn.title} (${pieceEn.composer})`);

    // API負荷軽減のためウェイト
    await new Promise((resolve) => setTimeout(resolve, 300));
  }

  // 結果を保存
  const outputPathJa = path.resolve(process.cwd(), 'public', 'music-wikidata.ja.json');
  const outputPathEn = path.resolve(process.cwd(), 'public', 'music-wikidata.en.json');

  await fs.writeFile(outputPathJa, JSON.stringify(musicPiecesJa, null, 2));
  await fs.writeFile(outputPathEn, JSON.stringify(musicPiecesEn, null, 2));

  console.log(`\n✓ Generated ${musicPiecesJa.length} music pieces`);
  console.log(`  - ${outputPathJa}`);
  console.log(`  - ${outputPathEn}`);

  console.log('\n注意: 生成されたデータには以下が必要です:');
  console.log('  1. genre (ジャンル) の手動追加');
  console.log('  2. description (説明) の追加');
  console.log('  3. trivia (トリビア) の追加');
  console.log('\n現在の music.ja.json / music.en.json とマージしてください。');
};

main();
