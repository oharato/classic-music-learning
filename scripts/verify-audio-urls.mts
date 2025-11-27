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

// Wikimedia Commons APIで音声ファイルの正確なURLを取得・検証
const verifyAndGetCorrectUrl = async (audioUrl: string): Promise<{ valid: boolean; correctUrl: string | null }> => {
  try {
    // URLからファイル名を抽出
    const urlMatch = audioUrl.match(/upload\.wikimedia\.org\/wikipedia\/commons\/[a-f0-9]\/[a-f0-9]{2}\/(.+)$/);
    if (!urlMatch) {
      return { valid: false, correctUrl: null };
    }

    const fileName = decodeURIComponent(urlMatch[1]);

    // Wikimedia Commons APIを使用してファイル情報を取得
    const apiUrl = `https://commons.wikimedia.org/w/api.php?action=query&titles=File:${encodeURIComponent(fileName)}&prop=imageinfo&iiprop=url&format=json&origin=*`;

    const response = await fetch(apiUrl);
    const data: any = await response.json();

    const pages = data.query?.pages;
    if (!pages) return { valid: false, correctUrl: null };

    const pageId = Object.keys(pages)[0];
    if (pageId === '-1') {
      // ファイルが見つからない場合、ファイル名で検索
      console.log(`  Searching for similar file: ${fileName}`);
      return await searchForFile(fileName);
    }

    const imageInfo = pages[pageId]?.imageinfo?.[0];
    if (imageInfo?.url) {
      // URLが一致するか確認
      if (imageInfo.url === audioUrl) {
        return { valid: true, correctUrl: audioUrl };
      }
      // 正しいURLを返す
      return { valid: false, correctUrl: imageInfo.url };
    }
  } catch (e: any) {
    console.warn(`  - Error verifying URL: ${e.message}`);
  }

  return { valid: false, correctUrl: null };
};

// ファイル名で類似ファイルを検索
const searchForFile = async (fileName: string): Promise<{ valid: boolean; correctUrl: string | null }> => {
  try {
    // ファイル名のバリエーションを試す
    const variations = [
      fileName,
      fileName.replace(/_/g, ' '),
      fileName.replace(/-/g, '_'),
      fileName.replace(/ /g, '_'),
    ];

    for (const variant of variations) {
      const searchUrl = `https://commons.wikimedia.org/w/api.php?action=query&list=search&srsearch=intitle:${encodeURIComponent(variant)}&srnamespace=6&srlimit=5&format=json&origin=*`;

      const response = await fetch(searchUrl);
      const data: any = await response.json();

      const results = data.query?.search;
      if (results && results.length > 0) {
        // 最初の結果のファイル情報を取得
        const foundTitle = results[0].title;
        const infoUrl = `https://commons.wikimedia.org/w/api.php?action=query&titles=${encodeURIComponent(foundTitle)}&prop=imageinfo&iiprop=url&format=json&origin=*`;

        const infoResponse = await fetch(infoUrl);
        const infoData: any = await infoResponse.json();

        const pages = infoData.query?.pages;
        if (pages) {
          const pageId = Object.keys(pages)[0];
          if (pageId !== '-1') {
            const url = pages[pageId]?.imageinfo?.[0]?.url;
            if (url?.endsWith('.ogg')) {
              console.log(`  ✓ Found alternative: ${foundTitle}`);
              return { valid: false, correctUrl: url };
            }
          }
        }
      }
    }
  } catch (e: any) {
    console.warn(`  - Error searching for file: ${e.message}`);
  }

  return { valid: false, correctUrl: null };
};

// メイン処理
const main = async () => {
  console.log('Verifying audio URLs in music data...\n');

  const musicPathJa = path.resolve(process.cwd(), 'public', 'music.ja.json');
  const musicPathEn = path.resolve(process.cwd(), 'public', 'music.en.json');

  // 既存のデータを読み込む
  const dataJaRaw = await fs.readFile(musicPathJa, 'utf-8');
  const dataEnRaw = await fs.readFile(musicPathEn, 'utf-8');

  const musicJa: MusicPiece[] = JSON.parse(dataJaRaw);
  const musicEn: MusicPiece[] = JSON.parse(dataEnRaw);

  let hasErrors = false;
  const fixes: { id: string; oldUrl: string; newUrl: string }[] = [];

  for (let i = 0; i < musicEn.length; i++) {
    const piece = musicEn[i];
    console.log(`Checking: ${piece.title} (${piece.composer})...`);

    const result = await verifyAndGetCorrectUrl(piece.audio_url);

    if (result.valid) {
      console.log(`  ✓ URL is valid`);
    } else if (result.correctUrl) {
      console.log(`  ✗ URL invalid, found correct URL`);
      fixes.push({
        id: piece.id,
        oldUrl: piece.audio_url,
        newUrl: result.correctUrl,
      });

      // 両方のJSONを更新
      musicEn[i].audio_url = result.correctUrl;
      const jaIndex = musicJa.findIndex((p) => p.id === piece.id);
      if (jaIndex >= 0) {
        musicJa[jaIndex].audio_url = result.correctUrl;
      }
      hasErrors = true;
    } else {
      console.log(`  ✗ URL invalid, no alternative found`);
      hasErrors = true;
    }

    // API負荷軽減
    await new Promise((resolve) => setTimeout(resolve, 500));
  }

  if (fixes.length > 0) {
    console.log('\n=== Fixed URLs ===');
    for (const fix of fixes) {
      console.log(`\n${fix.id}:`);
      console.log(`  Old: ${fix.oldUrl}`);
      console.log(`  New: ${fix.newUrl}`);
    }

    // 更新したデータを保存
    await fs.writeFile(musicPathJa, JSON.stringify(musicJa, null, 2));
    await fs.writeFile(musicPathEn, JSON.stringify(musicEn, null, 2));
    console.log('\n✓ Updated music.ja.json and music.en.json');
  } else if (!hasErrors) {
    console.log('\n✓ All audio URLs are valid!');
  } else {
    console.log('\n✗ Some URLs could not be fixed automatically. Manual intervention required.');
  }
};

main();
