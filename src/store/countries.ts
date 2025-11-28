import { defineStore } from 'pinia';

// 楽曲データの型定義
export interface MusicPiece {
  id: string;
  title: string;
  composer: string;
  genre: string;
  audio_url: string;
  description: string;
  trivia: string;
}

export type Language = 'ja' | 'en';

// localStorageから言語設定を読み込む
function getInitialLanguage(): Language {
  if (typeof window === 'undefined') return 'ja'; // SSR対応
  const saved = localStorage.getItem('language');
  return saved === 'en' || saved === 'ja' ? saved : 'ja';
}

export const useMusicStore = defineStore('music', {
  state: () => ({
    pieces: [] as MusicPiece[],
    loading: false,
    error: null as string | null,
    currentLanguage: getInitialLanguage(), // localStorageから読み込み
  }),
  actions: {
    async fetchPieces(forceReload: boolean = false) {
      if (this.pieces.length > 0 && !forceReload) {
        return; // 既に読み込み済みの場合は何もしない (強制リロードでない場合)
      }
      this.loading = true;
      this.error = null;
      try {
        const filename = `music.${this.currentLanguage}.json`;
        const response = await fetch(`/${filename}`);
        if (!response.ok) {
          throw new Error(`Failed to fetch music data for ${this.currentLanguage}`);
        }
        const data = await response.json();
        this.pieces = data;
      } catch (e: any) {
        this.error = e.message;
      } finally {
        this.loading = false;
      }
    },
    setLanguage(lang: Language) {
      if (this.currentLanguage !== lang) {
        this.currentLanguage = lang;
        // localStorageに保存
        if (typeof window !== 'undefined') {
          localStorage.setItem('language', lang);
        }
        this.fetchPieces(true); // 言語が変わったら強制的に再読み込み
      }
    },
  },
  getters: {
    getPieceById: (state) => (id: string) => {
      return state.pieces.find((piece) => piece.id === id);
    },
    // クイズ用のランダムな楽曲リストを取得するゲッター
    getRandomPieces: (state) => (count: number, excludeId?: string) => {
      const filteredPieces = excludeId ? state.pieces.filter((p) => p.id !== excludeId) : state.pieces;
      const shuffled = [...filteredPieces].sort(() => 0.5 - Math.random());
      return shuffled.slice(0, count);
    },
  },
});
