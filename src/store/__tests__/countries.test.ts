import { createPinia, setActivePinia } from 'pinia';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useMusicStore } from '../countries';

globalThis.fetch = vi.fn() as any;

describe('Music Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
  });

  it('初期状態が正しく設定されている', () => {
    const store = useMusicStore();

    expect(store.pieces).toEqual([]);
    expect(store.loading).toBe(false);
    expect(store.error).toBe(null);
    expect(store.currentLanguage).toBe('ja');
  });

  it('fetchPieces で日本語の楽曲データを正常に取得できる', async () => {
    const mockPieces = [
      {
        id: 'symphony_5',
        title: '交響曲第5番「運命」',
        composer: 'ベートーヴェン',
        genre: '交響曲',
        audio_url: 'https://example.com/symphony5.ogg',
        description: '説明',
        trivia: 'トリビア',
      },
      {
        id: 'nachtmusik',
        title: 'アイネ・クライネ・ナハトムジーク',
        composer: 'モーツァルト',
        genre: 'セレナーデ',
        audio_url: 'https://example.com/nachtmusik.ogg',
        description: '説明',
        trivia: 'トリビア',
      },
    ];

    (globalThis.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => mockPieces,
    });

    const store = useMusicStore();
    await store.fetchPieces();

    expect(store.pieces).toEqual(mockPieces);
    expect(store.loading).toBe(false);
    expect(store.error).toBe(null);
    expect(globalThis.fetch).toHaveBeenCalledWith('/music.ja.json');
  });

  it('fetchPieces で英語の楽曲データを正常に取得できる', async () => {
    const mockPieces = [
      {
        id: 'symphony_5',
        title: 'Symphony No. 5',
        composer: 'Beethoven',
        genre: 'Symphony',
        audio_url: 'https://example.com/symphony5.ogg',
        description: 'Description',
        trivia: 'Trivia',
      },
    ];

    (globalThis.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => mockPieces,
    });

    const store = useMusicStore();
    store.currentLanguage = 'en';
    await store.fetchPieces();

    expect(store.pieces).toEqual(mockPieces);
    expect(globalThis.fetch).toHaveBeenCalledWith('/music.en.json');
  });

  it('fetchPieces でエラーが発生した場合、エラーメッセージが設定される', async () => {
    (globalThis.fetch as any).mockResolvedValueOnce({
      ok: false,
    });

    const store = useMusicStore();
    await store.fetchPieces();

    expect(store.error).toBe('Failed to fetch music data for ja');
    expect(store.loading).toBe(false);
  });

  it('fetchPieces でネットワークエラーが発生した場合、エラーメッセージが設定される', async () => {
    (globalThis.fetch as any).mockRejectedValueOnce(new Error('Network error'));

    const store = useMusicStore();
    await store.fetchPieces();

    expect(store.error).toBe('Network error');
    expect(store.loading).toBe(false);
  });

  it('既にデータがある場合、forceReload=false では再取得しない', async () => {
    const store = useMusicStore();
    store.pieces = [
      {
        id: 'symphony_5',
        title: '交響曲第5番「運命」',
        composer: 'ベートーヴェン',
        genre: '交響曲',
        audio_url: 'https://example.com/symphony5.ogg',
        description: '説明',
        trivia: 'トリビア',
      },
    ];

    await store.fetchPieces(false);

    expect(globalThis.fetch).not.toHaveBeenCalled();
  });

  it('forceReload=true の場合、既にデータがあっても再取得する', async () => {
    const mockPieces = [
      {
        id: 'nachtmusik',
        title: 'アイネ・クライネ・ナハトムジーク',
        composer: 'モーツァルト',
        genre: 'セレナーデ',
        audio_url: 'https://example.com/nachtmusik.ogg',
        description: '説明',
        trivia: 'トリビア',
      },
    ];

    (globalThis.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => mockPieces,
    });

    const store = useMusicStore();
    store.pieces = [
      {
        id: 'symphony_5',
        title: '交響曲第5番「運命」',
        composer: 'ベートーヴェン',
        genre: '交響曲',
        audio_url: 'https://example.com/symphony5.ogg',
        description: '説明',
        trivia: 'トリビア',
      },
    ];

    await store.fetchPieces(true);

    expect(globalThis.fetch).toHaveBeenCalled();
    expect(store.pieces).toEqual(mockPieces);
  });

  it('setLanguage で言語を変更すると、データが再取得される', async () => {
    const mockPieces = [
      {
        id: 'symphony_5',
        title: 'Symphony No. 5',
        composer: 'Beethoven',
        genre: 'Symphony',
        audio_url: 'https://example.com/symphony5.ogg',
        description: 'Description',
        trivia: 'Trivia',
      },
    ];

    (globalThis.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => mockPieces,
    });

    const store = useMusicStore();
    store.currentLanguage = 'ja';
    store.setLanguage('en');

    await vi.waitFor(() => {
      expect(store.currentLanguage).toBe('en');
      expect(globalThis.fetch).toHaveBeenCalledWith('/music.en.json');
    });
  });

  it('setLanguage で同じ言語を設定しても再取得しない', async () => {
    const store = useMusicStore();
    store.currentLanguage = 'ja';
    store.setLanguage('ja');

    expect(globalThis.fetch).not.toHaveBeenCalled();
  });

  it('getPieceById で指定したIDの楽曲を取得できる', () => {
    const store = useMusicStore();
    store.pieces = [
      {
        id: 'symphony_5',
        title: '交響曲第5番「運命」',
        composer: 'ベートーヴェン',
        genre: '交響曲',
        audio_url: 'https://example.com/symphony5.ogg',
        description: '説明',
        trivia: 'トリビア',
      },
      {
        id: 'nachtmusik',
        title: 'アイネ・クライネ・ナハトムジーク',
        composer: 'モーツァルト',
        genre: 'セレナーデ',
        audio_url: 'https://example.com/nachtmusik.ogg',
        description: '説明',
        trivia: 'トリビア',
      },
    ];

    const piece = store.getPieceById('symphony_5');
    expect(piece?.title).toBe('交響曲第5番「運命」');
  });

  it('getPieceById で存在しないIDを指定するとundefinedが返る', () => {
    const store = useMusicStore();
    store.pieces = [
      {
        id: 'symphony_5',
        title: '交響曲第5番「運命」',
        composer: 'ベートーヴェン',
        genre: '交響曲',
        audio_url: 'https://example.com/symphony5.ogg',
        description: '説明',
        trivia: 'トリビア',
      },
    ];

    const piece = store.getPieceById('invalid');
    expect(piece).toBeUndefined();
  });

  it('getRandomPieces で指定した数のランダムな楽曲を取得できる', () => {
    const store = useMusicStore();
    store.pieces = [
      {
        id: 'symphony_5',
        title: '交響曲第5番「運命」',
        composer: 'ベートーヴェン',
        genre: '交響曲',
        audio_url: 'https://example.com/symphony5.ogg',
        description: '説明',
        trivia: 'トリビア',
      },
      {
        id: 'nachtmusik',
        title: 'アイネ・クライネ・ナハトムジーク',
        composer: 'モーツァルト',
        genre: 'セレナーデ',
        audio_url: 'https://example.com/nachtmusik.ogg',
        description: '説明',
        trivia: 'トリビア',
      },
      {
        id: 'toccata',
        title: 'トッカータとフーガ ニ短調',
        composer: 'バッハ',
        genre: 'オルガン曲',
        audio_url: 'https://example.com/toccata.ogg',
        description: '説明',
        trivia: 'トリビア',
      },
      {
        id: 'nocturne',
        title: 'ノクターン第2番',
        composer: 'ショパン',
        genre: 'ノクターン',
        audio_url: 'https://example.com/nocturne.ogg',
        description: '説明',
        trivia: 'トリビア',
      },
    ];

    const randomPieces = store.getRandomPieces(2);
    expect(randomPieces.length).toBe(2);
  });

  it('getRandomPieces で excludeId を指定すると、その楽曲が除外される', () => {
    const store = useMusicStore();
    store.pieces = [
      {
        id: 'symphony_5',
        title: '交響曲第5番「運命」',
        composer: 'ベートーヴェン',
        genre: '交響曲',
        audio_url: 'https://example.com/symphony5.ogg',
        description: '説明',
        trivia: 'トリビア',
      },
      {
        id: 'nachtmusik',
        title: 'アイネ・クライネ・ナハトムジーク',
        composer: 'モーツァルト',
        genre: 'セレナーデ',
        audio_url: 'https://example.com/nachtmusik.ogg',
        description: '説明',
        trivia: 'トリビア',
      },
      {
        id: 'toccata',
        title: 'トッカータとフーガ ニ短調',
        composer: 'バッハ',
        genre: 'オルガン曲',
        audio_url: 'https://example.com/toccata.ogg',
        description: '説明',
        trivia: 'トリビア',
      },
    ];

    const randomPieces = store.getRandomPieces(3, 'symphony_5');
    expect(randomPieces.every((p) => p.id !== 'symphony_5')).toBe(true);
    expect(randomPieces.length).toBe(2); // 除外後は2つ
  });
});
