import { createPinia, setActivePinia } from 'pinia';
import { beforeEach, describe, expect, it } from 'vitest';
import { useMusicStore } from '../countries';
import { useQuizStore } from '../quiz';

describe('Quiz Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  describe('初期状態', () => {
    it('デフォルト値が正しく設定されている', () => {
      const store = useQuizStore();

      expect(store.nickname).toBe('Guest');
      expect(store.quizFormat).toBe('audio-to-title');
      expect(store.quizCategory).toBe('all');
      expect(store.numberOfQuestions).toBe(5);
      expect(store.questions).toEqual([]);
      expect(store.currentQuestionIndex).toBe(0);
      expect(store.correctAnswers).toBe(0);
    });
  });

  describe('setupQuiz', () => {
    it('クイズ設定を正しく保存する', () => {
      const store = useQuizStore();
      const musicStore = useMusicStore();

      musicStore.pieces = [
        {
          id: '1',
          title: '交響曲第5番',
          composer: 'ベートーヴェン',
          genre: '交響曲',
          audio_url: '',
          description: '',
          trivia: '',
        },
        {
          id: '2',
          title: 'アイネ・クライネ・ナハトムジーク',
          composer: 'モーツァルト',
          genre: 'セレナーデ',
          audio_url: '',
          description: '',
          trivia: '',
        },
        {
          id: '3',
          title: 'トッカータとフーガ',
          composer: 'バッハ',
          genre: 'オルガン曲',
          audio_url: '',
          description: '',
          trivia: '',
        },
      ];

      store.setupQuiz('TestUser', 'title-to-composer', 'all', 5);

      expect(store.nickname).toBe('TestUser');
      expect(store.quizFormat).toBe('title-to-composer');
      expect(store.quizCategory).toBe('all');
      expect(store.numberOfQuestions).toBe(5);
    });
  });

  describe('generateQuestions', () => {
    it('指定された問題数の問題を生成する', () => {
      const store = useQuizStore();
      const musicStore = useMusicStore();

      musicStore.pieces = Array.from({ length: 50 }, (_, i) => ({
        id: String(i + 1),
        title: `曲${i + 1}`,
        composer: 'ベートーヴェン',
        genre: '交響曲',
        audio_url: '',
        description: '',
        trivia: '',
      }));

      store.setupQuiz('Test', 'audio-to-title', 'all', 10);

      expect(store.questions).toHaveLength(10);
      store.questions.forEach((question) => {
        expect(question.options).toHaveLength(4);
        expect(question.options).toContain(question.correctAnswer);
      });
    });

    it('作曲家でフィルタリングされた問題を生成する', () => {
      const store = useQuizStore();
      const musicStore = useMusicStore();

      musicStore.pieces = [
        {
          id: '1',
          title: '交響曲第5番',
          composer: 'ベートーヴェン',
          genre: '交響曲',
          audio_url: '',
          description: '',
          trivia: '',
        },
        {
          id: '2',
          title: 'エリーゼのために',
          composer: 'ベートーヴェン',
          genre: 'ピアノ曲',
          audio_url: '',
          description: '',
          trivia: '',
        },
        {
          id: '3',
          title: 'アイネ・クライネ・ナハトムジーク',
          composer: 'モーツァルト',
          genre: 'セレナーデ',
          audio_url: '',
          description: '',
          trivia: '',
        },
      ];

      store.setupQuiz('Test', 'audio-to-title', 'Beethoven', 5);

      store.questions.forEach((question) => {
        const normalizedComposer =
          question.correctAnswer.composer === 'ベートーヴェン' ? 'Beethoven' : question.correctAnswer.composer;
        expect(normalizedComposer).toBe('Beethoven');
      });
    });

    it('「すべて」を選択した場合、利用可能な全ての楽曲で問題を生成する', () => {
      const store = useQuizStore();
      const musicStore = useMusicStore();

      musicStore.pieces = Array.from({ length: 10 }, (_, i) => ({
        id: String(i + 1),
        title: `曲${i + 1}`,
        composer: 'ベートーヴェン',
        genre: '交響曲',
        audio_url: '',
        description: '',
        trivia: '',
      }));

      store.setupQuiz('Test', 'audio-to-title', 'all', 999);

      expect(store.questions).toHaveLength(10);
    });
  });

  describe('startQuiz', () => {
    it('クイズ開始時に状態をリセットする', () => {
      const store = useQuizStore();

      store.correctAnswers = 5;
      store.currentQuestionIndex = 3;

      store.startQuiz();

      expect(store.correctAnswers).toBe(0);
      expect(store.currentQuestionIndex).toBe(0);
      expect(store.startTime).toBeGreaterThan(0);
      expect(store.endTime).toBe(0);
    });
  });

  describe('answerQuestion', () => {
    beforeEach(() => {
      const store = useQuizStore();
      const musicStore = useMusicStore();

      musicStore.pieces = Array.from({ length: 20 }, (_, i) => ({
        id: String(i + 1),
        title: `曲${i + 1}`,
        composer: 'ベートーヴェン',
        genre: '交響曲',
        audio_url: '',
        description: '',
        trivia: '',
      }));

      store.setupQuiz('Test', 'audio-to-title', 'all', 5);
      store.startQuiz();
    });

    it('正解時に正解数が増加する', () => {
      const store = useQuizStore();
      const correctId = store.questions[0]!.correctAnswer.id;

      store.answerQuestion(correctId);

      expect(store.correctAnswers).toBe(1);
      expect(store.answerHistory).toHaveLength(1);
      expect(store.answerHistory[0]!.isCorrect).toBe(true);
    });

    it('不正解時に正解数が増加しない', () => {
      const store = useQuizStore();
      const wrongId = store.questions[0]!.options.find((o) => o.id !== store.questions[0]!.correctAnswer.id)!.id;

      store.answerQuestion(wrongId);

      expect(store.correctAnswers).toBe(0);
      expect(store.answerHistory).toHaveLength(1);
      expect(store.answerHistory[0]!.isCorrect).toBe(false);
    });

    it('全問回答後にクイズが終了する', () => {
      const store = useQuizStore();

      for (let i = 0; i < store.questions.length; i++) {
        store.answerQuestion(store.questions[store.currentQuestionIndex]!.correctAnswer.id);
      }

      expect(store.endTime).toBeGreaterThan(0);
    });
  });

  describe('ゲッター', () => {
    it('totalTimeが正しく計算される', () => {
      const store = useQuizStore();

      store.startTime = Date.now() - 5000; // 5秒前
      store.endTime = Date.now();

      expect(store.totalTime).toBeGreaterThanOrEqual(4.9);
      expect(store.totalTime).toBeLessThanOrEqual(5.1);
    });

    it('finalScoreが正しく計算される', () => {
      const store = useQuizStore();

      store.correctAnswers = 10;
      store.startTime = Date.now() - 30000; // 30秒前
      store.endTime = Date.now();

      const expectedScore = 10 * 1000 - 30 * 10;
      expect(store.finalScore).toBeGreaterThanOrEqual(expectedScore - 10);
      expect(store.finalScore).toBeLessThanOrEqual(expectedScore + 10);
    });
  });
});
