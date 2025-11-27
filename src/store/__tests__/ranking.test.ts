import { createPinia, setActivePinia } from 'pinia';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useRankingStore } from '../ranking';

globalThis.fetch = vi.fn() as any;

describe('Ranking Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
  });

  describe('初期状態', () => {
    it('デフォルト値が正しく設定されている', () => {
      const store = useRankingStore();

      expect(store.ranking).toEqual([]);
      expect(store.myRank).toBeNull();
      expect(store.loading).toBe(false);
      expect(store.error).toBeNull();
      expect(store.currentCategory).toBe('all');
      expect(store.currentType).toBe('daily');
      expect(store.currentFormat).toBe('audio-to-title');
    });
  });

  describe('fetchRanking', () => {
    it('ランキングを正常に取得できる', async () => {
      const mockRanking = [
        { rank: 1, nickname: 'Player1', score: 9500, created_at: '2025-01-01T00:00:00Z' },
        { rank: 2, nickname: 'Player2', score: 9000, created_at: '2025-01-01T00:01:00Z' },
      ];

      (globalThis.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ ranking: mockRanking }),
      });

      const store = useRankingStore();
      await store.fetchRanking('all', 'daily', 'audio-to-title');

      expect(store.ranking).toEqual(mockRanking);
      expect(store.loading).toBe(false);
      expect(store.error).toBeNull();
      expect(store.currentCategory).toBe('all');
      expect(store.currentType).toBe('daily');
      expect(store.currentFormat).toBe('audio-to-title');
    });

    it('エラー時にエラーメッセージが設定される', async () => {
      (globalThis.fetch as any).mockResolvedValueOnce({
        ok: false,
      });

      const store = useRankingStore();
      await store.fetchRanking();

      expect(store.error).toBe('ランキングの取得に失敗しました。');
      expect(store.loading).toBe(false);
    });

    it('ネットワークエラー時にエラーメッセージが設定される', async () => {
      (globalThis.fetch as any).mockRejectedValueOnce(new Error('Network error'));

      const store = useRankingStore();
      await store.fetchRanking();

      expect(store.error).toBe('Network error');
      expect(store.loading).toBe(false);
    });
  });

  describe('submitScore', () => {
    it('スコアを正常に送信できる', async () => {
      const mockResponse = {
        data: {
          rank: 1,
          nickname: 'TestPlayer',
          score: 9500,
        },
        message: 'スコアが正常に登録されました。',
      };

      (globalThis.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const store = useRankingStore();
      await store.submitScore('TestPlayer', 9500, 'all', 'audio-to-title');

      expect(store.myRank).toEqual(mockResponse.data);
      expect(store.loading).toBe(false);
      expect(store.error).toBeNull();
    });

    it('送信時に正しいパラメータが渡される', async () => {
      (globalThis.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: {} }),
      });

      const store = useRankingStore();
      await store.submitScore('TestPlayer', 9500, 'Beethoven', 'title-to-composer');

      expect(globalThis.fetch).toHaveBeenCalledWith('/api/ranking', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nickname: 'TestPlayer',
          score: 9500,
          region: 'Beethoven',
          format: 'title-to-composer',
        }),
      });
    });

    it('エラー時にエラーメッセージが設定される', async () => {
      (globalThis.fetch as any).mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: 'Invalid data' }),
      });

      const store = useRankingStore();
      await store.submitScore('TestPlayer', 9500);

      expect(store.error).toBe('Invalid data');
      expect(store.loading).toBe(false);
    });
  });
});
