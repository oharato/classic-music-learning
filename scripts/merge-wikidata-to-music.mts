import fs from 'node:fs/promises';
import path from 'node:path';

interface MusicPiece {
  id: string;
  title: string;
  composer: string;
  genre: string;
  audio_url: string;
  description: string;
  trivia: string;
}

const musicWikidataPath = path.resolve(process.cwd(), 'public', 'music-wikidata.ja.json');
const musicPath = path.resolve(process.cwd(), 'public', 'music.ja.json');

const normalizeComposer = (name: string) => (name || 'unknown').trim();

const main = async () => {
  console.log('Merging `music-wikidata.ja.json` -> `music.ja.json`');

  const [wikidataRaw, musicRaw] = await Promise.all([
    fs.readFile(musicWikidataPath, 'utf-8').catch(() => '[]'),
    fs.readFile(musicPath, 'utf-8').catch(() => '[]'),
  ]);

  const wikidata: Partial<MusicPiece>[] = JSON.parse(wikidataRaw || '[]');
  const music: MusicPiece[] = JSON.parse(musicRaw || '[]');

  const byId = new Map<string, MusicPiece>();
  const byAudio = new Map<string, MusicPiece>();
  const composerCounts: Record<string, number> = {};

  for (const m of music) {
    byId.set(m.id, m);
    if (m.audio_url) byAudio.set(m.audio_url, m);
    const c = normalizeComposer(m.composer);
    composerCounts[c] = (composerCounts[c] || 0) + 1;
  }

  const added: MusicPiece[] = [];
  const updated: { id: string; fields: string[] }[] = [];
  let skippedDuplicateAudio = 0;
  let skippedComposerLimit = 0;

  for (const w of wikidata) {
    const id = (w.id || '').toString();
    const audio = (w.audio_url || (w as any).audio || '') as string;
    if (!audio) continue;

    // Skip if audio already present in canonical music
    if (byAudio.has(audio)) {
      skippedDuplicateAudio++;
      continue;
    }

    const composerName = normalizeComposer((w.composer as any) || (w as any).composerLabel || 'unknown');
    if ((composerCounts[composerName] || 0) >= 10) {
      skippedComposerLimit++;
      continue;
    }

    if (id && byId.has(id)) {
      // update existing entry: fill empty fields
      const existing = byId.get(id)!;
      const changed: string[] = [];
      if (!existing.title && w.title) {
        existing.title = w.title as string;
        changed.push('title');
      }
      if (!existing.composer && w.composer) {
        existing.composer = w.composer as string;
        changed.push('composer');
      }
      if (!existing.audio_url && audio) {
        existing.audio_url = audio;
        changed.push('audio_url');
      }
      if (changed.length > 0) updated.push({ id: existing.id, fields: changed });
      // mark audio as used
      if (existing.audio_url) byAudio.set(existing.audio_url, existing);
      composerCounts[composerName] = (composerCounts[composerName] || 0) + 1;
      continue;
    }

    // New entry
    const newId =
      id ||
      `${(w.title || 'unknown')
        .toString()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '_')
        .substring(0, 30)}_${composerName.toLowerCase().replace(/[^a-z0-9]+/g, '')}`;
    const piece: MusicPiece = {
      id: newId,
      title: (w.title as string) || '',
      composer: composerName,
      genre: (w.genre as string) || '',
      audio_url: audio,
      description: (w.description as string) || '',
      trivia: (w.trivia as string) || '',
    };

    music.push(piece);
    added.push(piece);
    byId.set(piece.id, piece);
    byAudio.set(piece.audio_url, piece);
    composerCounts[composerName] = (composerCounts[composerName] || 0) + 1;
  }

  // Backup existing music.ja.json
  try {
    const bakPath = `${musicPath}.bak.${Date.now()}`;
    await fs.copyFile(musicPath, bakPath).catch(() => {});
    console.log(`Backup written to ${path.basename(bakPath)}`);
  } catch (e) {
    // ignore
  }

  // Save merged file (pretty-printed)
  await fs.writeFile(musicPath, JSON.stringify(music, null, 2), 'utf-8');

  console.log('\nMerge summary:');
  console.log(`  Existing entries: ${byId.size}`);
  console.log(`  Added: ${added.length}`);
  if (added.length > 0)
    console.log(
      `    - Examples: ${added
        .slice(0, 3)
        .map((p) => p.title)
        .join(', ')}`
    );
  console.log(`  Updated: ${updated.length}`);
  if (updated.length > 0)
    console.log(
      `    - Updated fields examples: ${updated
        .slice(0, 3)
        .map((u) => `${u.id}:${u.fields.join(',')}`)
        .join(', ')}`
    );
  console.log(`  Skipped (duplicate audio): ${skippedDuplicateAudio}`);
  console.log(`  Skipped (composer limit reached): ${skippedComposerLimit}`);
  console.log('\n✓ Done. `public/music.ja.json` updated.');
};

main().catch((e) => {
  console.error('Merge failed:', e);
  process.exit(1);
});
