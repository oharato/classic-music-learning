export type Language = 'ja' | 'en';

export interface Translations {
  common: {
    backToHome: string;
  };
  home: {
    title: string;
    startQuiz: string;
    study: string;
    viewRanking: string;
  };
  quizSetup: {
    title: string;
    nickname: string;
    nicknamePlaceholder: string;
    quizFormat: string;
    audioToTitle: string;
    titleToComposer: string;
    category: string;
    numberOfQuestions: string;
    questions5: string;
    questions10: string;
    questions30: string;
    questionsAll: string;
    start: string;
    preparingData: string;
    error: string;
    noData: string;
    keyboardHint: string;
    // バリデーションエラー
    nicknameRequired: string;
    nicknameTooLong: string;
    nicknameInvalidChars: string;
  };
  quizPlay: {
    question: string;
    elapsedTime: string;
    seconds: string;
    loadError: string;
    playAudio: string;
    pauseAudio: string;
    noData: string;
    goToSetup: string;
  };
  quizResult: {
    title: string;
    settings: string;
    nickname: string;
    quizFormat: string;
    category: string;
    questionCount: string;
    questions: string;
    correctAnswers: string;
    time: string;
    seconds: string;
    score: string;
    points: string;
    answerDetails: string;
    question: string;
    questionLabel: string;
    yourAnswer: string;
    correctAnswer: string;
    unknown: string;
    goToRanking: string;
    backToTop: string;
  };
  ranking: {
    title: string;
    display: string;
    dailyRanking: string;
    allTimeTop5: string;
    rank: string;
    nicknameLabel: string;
    scoreLabel: string;
    registeredAt: string;
    loading: string;
    noData: string;
    category: string;
    quizFormat: string;
  };
  study: {
    title: string;
    quizMode: string;
    audioToTitle: string;
    titleToComposer: string;
    category: string;
    title_label: string;
    composer: string;
    genre: string;
    description: string;
    trivia: string;
    noInformation: string;
    keyboardHint: string;
    next: string;
    prev: string;
    playAudio: string;
    pauseAudio: string;
  };
  quizFormat: {
    audioToTitle: string;
    titleToComposer: string;
    audioToTitleLong: string;
    titleToComposerLong: string;
  };
  category: {
    all: string;
    beethoven: string;
    mozart: string;
    bach: string;
    chopin: string;
    tchaikovsky: string;
    vivaldi: string;
    brahms: string;
    pachelbel: string;
  };
}

export const translations: Record<Language, Translations> = {
  ja: {
    common: {
      backToHome: '< トップページに戻る',
    },
    home: {
      title: 'クラシック音楽学習ゲーム',
      startQuiz: 'クイズに挑戦する',
      study: '楽曲を学習する',
      viewRanking: 'ランキングを見る',
    },
    quizSetup: {
      title: 'クイズ設定',
      nickname: 'ニックネーム（最大20文字）',
      nicknamePlaceholder: 'ニックネームを入力',
      quizFormat: 'クイズ形式',
      audioToTitle: '曲を聴いて → 曲名',
      titleToComposer: '曲名 → 作曲家',
      titleToTrack: '曲名 → 曲',
      category: '出題範囲',
      numberOfQuestions: '問題数',
      questions5: '5問',
      questions10: '10問',
      questions30: '30問',
      questionsAll: 'すべて',
      start: 'スタート',
      preparingData: 'データ準備中...',
      error: 'エラー発生',
      noData: 'データなし',
      keyboardHint: 'ヒント: Ctrl+Enter でクイズ開始',
      nicknameRequired: 'ニックネームを入力してください。',
      nicknameTooLong: 'ニックネームは20文字以内で入力してください。',
      nicknameInvalidChars: 'ニックネームに使用できない文字が含まれています。',
    },
    quizPlay: {
      question: '問題',
      elapsedTime: '経過時間',
      seconds: '秒',
      loadError: 'データの読み込みに失敗しました',
      playAudio: '再生',
      pauseAudio: '一時停止',
      select: '選択',
      noData: 'クイズデータがありません。設定画面に戻ってください。',
      goToSetup: 'クイズ設定へ',
    },
    quizResult: {
      title: '結果発表',
      settings: 'クイズ設定',
      nickname: 'ニックネーム',
      quizFormat: 'クイズ形式',
      category: '出題範囲',
      questionCount: '問題数',
      questions: '問',
      correctAnswers: '正解数',
      time: 'タイム',
      seconds: '秒',
      score: 'スコア',
      points: 'pt',
      answerDetails: '回答詳細',
      question: '問題',
      questionLabel: '問題',
      yourAnswer: 'あなたの回答',
      correctAnswer: '正解',
      unknown: '不明',
      goToRanking: 'ランキングを見る',
      backToTop: 'トップに戻る',
    },
    ranking: {
      title: 'ランキング',
      display: '表示',
      dailyRanking: '今日のランキング',
      allTimeTop5: '歴代トップ5',
      rank: '順位',
      nicknameLabel: 'ニックネーム',
      scoreLabel: 'スコア',
      registeredAt: '登録日時',
      loading: 'ランキングを読み込み中...',
      noData: 'まだランキングデータがありません。',
      category: '出題範囲',
      quizFormat: 'クイズ形式',
    },
    study: {
      title: '学習モード',
      quizMode: 'クイズ形式',
      audioToTitle: '曲を聴いて → 曲名',
      titleToComposer: '曲名 → 作曲家',
      category: 'カテゴリ',
      title_label: '曲名',
      composer: '作曲家',
      genre: 'ジャンル',
      description: '解説',
      trivia: 'トリビア',
      noInformation: '情報がありません',
      keyboardHint: '矢印キーで移動、スペースキーで表裏切り替え',
      next: '次へ →',
      prev: '← 前へ',
      playAudio: '再生',
      pauseAudio: '一時停止',
    },
    quizFormat: {
      audioToTitle: '曲 → 曲名',
      titleToComposer: '曲名 → 作曲家',
      titleToTrack: '曲名 → 曲',
      audioToTitleLong: '曲を聴いて曲名を選ぶ',
      titleToComposerLong: '曲名を見て作曲家を選ぶ',
    },
    category: {
      all: 'すべて',
      beethoven: 'ベートーヴェン',
      mozart: 'モーツァルト',
      bach: 'バッハ',
      chopin: 'ショパン',
      tchaikovsky: 'チャイコフスキー',
      vivaldi: 'ヴィヴァルディ',
      brahms: 'ブラームス',
      pachelbel: 'パッヘルベル',
    },
  },
  en: {
    common: {
      backToHome: '< Back to Home',
    },
    home: {
      title: 'Classical Music Learning Game',
      startQuiz: 'Start Quiz',
      study: 'Study Music',
      viewRanking: 'View Ranking',
    },
    quizSetup: {
      title: 'Quiz Setup',
      nickname: 'Nickname (max 20 characters)',
      nicknamePlaceholder: 'Enter nickname',
      quizFormat: 'Quiz Format',
      audioToTitle: 'Listen -> Title',
      titleToComposer: 'Title -> Composer',
      titleToTrack: 'Title -> Track',
      category: 'Category',
      numberOfQuestions: 'Number of Questions',
      questions5: '5 questions',
      questions10: '10 questions',
      questions30: '30 questions',
      questionsAll: 'All',
      start: 'Start',
      preparingData: 'Preparing data...',
      error: 'Error occurred',
      noData: 'No data',
      keyboardHint: 'Hint: Ctrl+Enter to start quiz',
      nicknameRequired: 'Please enter a nickname.',
      nicknameTooLong: 'Nickname must be 20 characters or less.',
      nicknameInvalidChars: 'Nickname contains invalid characters.',
    },
    quizPlay: {
      question: 'Question',
      elapsedTime: 'Elapsed Time',
      seconds: 'seconds',
      loadError: 'Failed to load data',
      playAudio: 'Play',
      pauseAudio: 'Pause',
      select: 'Select',
      noData: 'No quiz data. Please return to the setup screen.',
      goToSetup: 'Go to Quiz Setup',
    },
    quizResult: {
      title: 'Results',
      settings: 'Quiz Settings',
      nickname: 'Nickname',
      quizFormat: 'Quiz Format',
      category: 'Category',
      questionCount: 'Questions',
      questions: 'questions',
      correctAnswers: 'Correct',
      time: 'Time',
      seconds: 'seconds',
      score: 'Score',
      points: 'pt',
      answerDetails: 'Answer Details',
      question: 'Question',
      questionLabel: 'Question',
      yourAnswer: 'Your Answer',
      correctAnswer: 'Correct Answer',
      unknown: 'Unknown',
      goToRanking: 'View Ranking',
      backToTop: 'Back to Home',
    },
    ranking: {
      title: 'Ranking',
      display: 'Display',
      dailyRanking: "Today's Ranking",
      allTimeTop5: 'All-Time Top 5',
      rank: 'Rank',
      nicknameLabel: 'Nickname',
      scoreLabel: 'Score',
      registeredAt: 'Registered At',
      loading: 'Loading ranking...',
      noData: 'No ranking data yet.',
      category: 'Category',
      quizFormat: 'Quiz Format',
    },
    study: {
      title: 'Study Mode',
      quizMode: 'Quiz Format',
      audioToTitle: 'Listen -> Title',
      titleToComposer: 'Title -> Composer',
      category: 'Category',
      title_label: 'Title',
      composer: 'Composer',
      genre: 'Genre',
      description: 'Description',
      trivia: 'Trivia',
      noInformation: 'No information available',
      keyboardHint: 'Arrow keys to navigate, Space to flip',
      next: 'Next →',
      prev: '← Prev',
      playAudio: 'Play',
      pauseAudio: 'Pause',
    },
    quizFormat: {
      audioToTitle: 'Music -> Title',
      titleToComposer: 'Title -> Composer',
      titleToTrack: 'Title -> Track',
      audioToTitleLong: 'Listen to music, choose title',
      titleToComposerLong: 'See title, choose composer',
    },
    category: {
      all: 'All',
      beethoven: 'Beethoven',
      mozart: 'Mozart',
      bach: 'Bach',
      chopin: 'Chopin',
      tchaikovsky: 'Tchaikovsky',
      vivaldi: 'Vivaldi',
      brahms: 'Brahms',
      pachelbel: 'Pachelbel',
    },
  },
};
