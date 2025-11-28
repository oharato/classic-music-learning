import { defineStore } from 'pinia';
import { type MusicPiece, useMusicStore } from './countries';

export type QuizFormat = 'audio-to-title' | 'title-to-composer' | 'title-to-track';
// QuizCategoryの型定義（作曲家別または全体）
export type QuizCategory =
  | 'all'
  | 'Beethoven'
  | 'Mozart'
  | 'Bach'
  | 'Chopin'
  | 'Tchaikovsky'
  | 'Vivaldi'
  | 'Brahms'
  | 'Pachelbel';

// 問題の型定義
export interface Question {
  correctAnswer: MusicPiece;
  options: MusicPiece[];
  questionType: QuizFormat;
}

// 回答履歴の型定義
export interface AnswerRecord {
  question: Question;
  selectedAnswerId: string;
  isCorrect: boolean;
}

export const useQuizStore = defineStore('quiz', {
  state: () => ({
    nickname: 'Guest',
    quizFormat: 'audio-to-title' as QuizFormat,
    quizCategory: 'all' as QuizCategory,
    numberOfQuestions: 5, // 問題数を追加
    questions: [] as Question[],
    currentQuestionIndex: 0,
    correctAnswers: 0,
    startTime: 0,
    endTime: 0,
    answerHistory: [] as AnswerRecord[], // 回答履歴を追加
  }),
  actions: {
    generateQuestions() {
      const musicStore = useMusicStore();
      if (musicStore.pieces.length === 0) {
        return;
      }

      // 作曲家名の正規化マップ（日本語/英語 → 英語に統一）
      const normalizeComposerMap: Record<string, string> = {
        Beethoven: 'Beethoven',
        ベートーヴェン: 'Beethoven',
        Mozart: 'Mozart',
        モーツァルト: 'Mozart',
        Bach: 'Bach',
        バッハ: 'Bach',
        Chopin: 'Chopin',
        ショパン: 'Chopin',
        Tchaikovsky: 'Tchaikovsky',
        チャイコフスキー: 'Tchaikovsky',
        Vivaldi: 'Vivaldi',
        ヴィヴァルディ: 'Vivaldi',
        Brahms: 'Brahms',
        ブラームス: 'Brahms',
        Pachelbel: 'Pachelbel',
        パッヘルベル: 'Pachelbel',
      };

      // 選択されたカテゴリに基づいて楽曲をフィルタリング
      const filteredPieces =
        this.quizCategory === 'all'
          ? musicStore.pieces
          : musicStore.pieces.filter((piece) => {
              const normalizedComposer = normalizeComposerMap[piece.composer] || piece.composer;
              return normalizedComposer === this.quizCategory;
            });

      // 実際の問題数を決定（「すべて」が選択された場合は利用可能な全ての楽曲）
      const actualNumberOfQuestions =
        this.numberOfQuestions >= 999 ? filteredPieces.length : Math.min(this.numberOfQuestions, filteredPieces.length);

      // フィルタリングされた楽曲からランダムに問題数分を選択
      const selectedPiecesForQuiz = [...filteredPieces]
        .sort(() => 0.5 - Math.random())
        .slice(0, actualNumberOfQuestions);

      this.questions = selectedPiecesForQuiz.map((correctPiece) => {
        // 選択肢もフィルタリングされた楽曲の中から選ぶ
        const otherOptions = [...filteredPieces]
          .filter((p) => p.id !== correctPiece.id)
          .sort(() => 0.5 - Math.random())
          .slice(0, 3);
        const options = [...otherOptions, correctPiece].sort(() => 0.5 - Math.random());
        return {
          correctAnswer: correctPiece,
          options: options,
          questionType: this.quizFormat,
        };
      });
    },
    setupQuiz(nickname: string, format: QuizFormat, category: QuizCategory, numQuestions: number) {
      this.nickname = nickname;
      this.quizFormat = format;
      this.quizCategory = category;
      this.numberOfQuestions = numQuestions;
      this.generateQuestions();
      this.answerHistory = []; // クイズ設定時に履歴をリセット
    },
    startQuiz() {
      this.correctAnswers = 0;
      this.currentQuestionIndex = 0;
      this.startTime = Date.now();
      this.endTime = 0;
    },
    answerQuestion(selectedPieceId: string) {
      const currentQuestion = this.questions[this.currentQuestionIndex];
      if (!currentQuestion) {
        return;
      }

      const isCorrect = selectedPieceId === currentQuestion.correctAnswer.id;

      this.answerHistory.push({
        question: currentQuestion,
        selectedAnswerId: selectedPieceId,
        isCorrect: isCorrect,
      });

      if (isCorrect) {
        this.correctAnswers++;
      }

      if (this.currentQuestionIndex < this.questions.length - 1) {
        this.currentQuestionIndex++;
      } else {
        this.endQuiz();
      }
    },
    endQuiz() {
      this.endTime = Date.now();
    },
  },
  getters: {
    totalTime: (state) => {
      if (state.startTime === 0 || state.endTime === 0) {
        return 0;
      }
      return (state.endTime - state.startTime) / 1000; // 秒単位
    },
    finalScore: (state) => {
      if (state.startTime === 0 || state.endTime === 0) return 0;
      const time = (state.endTime - state.startTime) / 1000;
      // スコア = (正解数 * 1000) - (回答時間[秒] * 10)
      return Math.max(0, state.correctAnswers * 1000 - Math.round(time) * 10);
    },
    currentQuestion: (state): Question | null => {
      if (state.questions.length === 0) return null;
      return state.questions[state.currentQuestionIndex] ?? null;
    },
  },
});
