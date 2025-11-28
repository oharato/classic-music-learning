import { defineStore } from 'pinia';

export interface Rank {
  rank: number;
  nickname: string;
  score: number;
  created_at: string;
}

export type RankingType = 'daily' | 'all_time';
export type QuizFormat = 'audio-to-title' | 'title-to-composer';

export const useRankingStore = defineStore('ranking', {
  state: () => ({
    ranking: [] as Rank[],
    myRank: null as Rank | null,
    loading: false,
    error: null as string | null,
    currentCategory: 'all' as string,
    currentType: 'daily' as RankingType,
    currentFormat: 'audio-to-title' as QuizFormat,
  }),
  actions: {
    async fetchRanking(category: string = 'all', type: RankingType = 'daily', format: QuizFormat = 'audio-to-title') {
      this.loading = true;
      this.error = null;
      this.currentCategory = category;
      this.currentType = type;
      this.currentFormat = format;
      try {
        const response = await fetch(`/api/ranking?region=${category}&type=${type}&format=${format}`);
        if (!response.ok) {
          throw new Error('ランキングの取得に失敗しました。');
        }
        const data = await response.json();
        this.ranking = data.ranking;
      } catch (e: any) {
        this.error = e.message;
      } finally {
        this.loading = false;
      }
    },
    async submitScore(
      nickname: string,
      score: number,
      category: string = 'all',
      format: QuizFormat = 'audio-to-title'
    ) {
      this.loading = true;
      this.error = null;
      try {
        const response = await fetch('/api/ranking', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ nickname, score, region: category, format }),
        });
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'スコアの登録に失敗しました。');
        }
        const result = await response.json();
        this.myRank = result.data;
      } catch (e: any) {
        this.error = e.message;
      } finally {
        this.loading = false;
      }
    },
  },
});
