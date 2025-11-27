<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import LoadingSpinner from '../components/LoadingSpinner.vue';
import ErrorMessage from '../components/ErrorMessage.vue';
import AppButton from '../components/AppButton.vue';
import { useTranslation } from '../composables/useTranslation';
import type { MusicPiece } from '../store/countries';
import { useMusicStore } from '../store/countries';
import { useQuizStore } from '../store/quiz';

const router = useRouter();
const quizStore = useQuizStore();
const musicStore = useMusicStore();
const { t } = useTranslation();

const elapsedTime = ref(0);
let timer: number;

// 選択中の選択肢のインデックス（0-3）
const selectedIndex = ref(0);

// タップされた選択肢のインデックス（スマホ用の一時的な強調表示）
const tappedIndex = ref<number | null>(null);

// 音声再生状態
const isPlaying = ref(false);
const audioElement = ref<HTMLAudioElement | null>(null);

// データ読み込み完了状態
const dataLoaded = ref(false);

// 音声の再生/一時停止を切り替え（キーボード等から）
const toggleAudio = () => {
  if (!audioElement.value) return;

  if (isPlaying.value) {
    audioElement.value.pause();
  } else {
    audioElement.value.play();
  }
};

const onAudioPlay = (ev?: Event) => {
  isPlaying.value = true;
  // 再生時は他の audio を停止
  const current = ev ? (ev.target as HTMLAudioElement) : audioElement.value;
  const audios = Array.from(document.querySelectorAll('audio')) as HTMLAudioElement[];
  audios.forEach((a) => {
    if (a !== current) {
      try {
        a.pause();
        a.currentTime = 0;
      } catch (e) {}
    }
  });
};

const onAudioPause = () => {
  isPlaying.value = false;
};

const onAudioEnded = () => {
  isPlaying.value = false;
};

// 問題が変わったらリセット
watch(
  () => quizStore.currentQuestionIndex,
  () => {
    selectedIndex.value = 0;
    isPlaying.value = false;
    if (audioElement.value) {
      audioElement.value.pause();
      audioElement.value.currentTime = 0;
    }
  }
);

onMounted(async () => {
  if (musicStore.pieces.length === 0 && !musicStore.loading) {
    await musicStore.fetchPieces();
  }

  if (musicStore.error) {
    return;
  }

  if (quizStore.questions.length === 0) {
    router.push('/quiz');
    return;
  }

  dataLoaded.value = true;
  quizStore.startQuiz();
  timer = setInterval(() => {
    elapsedTime.value = Math.floor((Date.now() - quizStore.startTime) / 1000);
  }, 1000);

  // キーボードイベントリスナーを追加
  window.addEventListener('keydown', handleKeydown);
});

onUnmounted(() => {
  clearInterval(timer);
  window.removeEventListener('keydown', handleKeydown);
  if (audioElement.value) {
    audioElement.value.pause();
  }
});

watch(
  () => quizStore.endTime,
  (newEndTime) => {
    if (newEndTime > 0) {
      clearInterval(timer);
      router.push('/quiz/result');
    }
  }
);

// キーボード操作
const handleKeydown = (e: KeyboardEvent) => {
  if (!quizStore.currentQuestion || !dataLoaded.value) return;

  const optionsCount = quizStore.currentQuestion.options.length;
  // 画面幅をチェック（768px未満はモバイル、1列表示）
  const isMobile = window.innerWidth < 768;

  switch (e.key) {
    case 'ArrowUp':
      e.preventDefault();
      if (isMobile) {
        // モバイル: 1つ上に移動
        selectedIndex.value = selectedIndex.value > 0 ? selectedIndex.value - 1 : selectedIndex.value;
      } else {
        // デスクトップ: 2つ上に移動（2列グリッド）
        selectedIndex.value =
          selectedIndex.value === 0 || selectedIndex.value === 1 ? selectedIndex.value : selectedIndex.value - 2;
      }
      break;
    case 'ArrowDown':
      e.preventDefault();
      if (isMobile) {
        // モバイル: 1つ下に移動
        selectedIndex.value = selectedIndex.value < optionsCount - 1 ? selectedIndex.value + 1 : selectedIndex.value;
      } else {
        // デスクトップ: 2つ下に移動（2列グリッド）
        selectedIndex.value = selectedIndex.value >= optionsCount - 2 ? selectedIndex.value : selectedIndex.value + 2;
      }
      break;
    case 'ArrowLeft':
      e.preventDefault();
      if (!isMobile && selectedIndex.value % 2 === 1) {
        selectedIndex.value--;
      }
      break;
    case 'ArrowRight':
      e.preventDefault();
      if (!isMobile && selectedIndex.value % 2 === 0 && selectedIndex.value < optionsCount - 1) {
        selectedIndex.value++;
      }
      break;
    case ' ':
      e.preventDefault();
      toggleAudio();
      break;
    case 'Enter': {
      e.preventDefault();
      const selectedOption = quizStore.currentQuestion.options[selectedIndex.value];
      if (selectedOption) {
        handleAnswer(selectedOption, selectedIndex.value);
      }
      break;
    }
  }
};

const handleAnswer = (option: MusicPiece, index: number) => {
  if (!dataLoaded.value) return; // データが読み込まれるまで回答を無効化

  // スマホの場合は一瞬だけ強調表示
  const isMobile = window.innerWidth < 768;
  if (isMobile) {
    tappedIndex.value = index;
    setTimeout(() => {
      tappedIndex.value = null;
      quizStore.answerQuestion(option.id);
    }, 200); // 200msだけ強調表示
  } else {
    quizStore.answerQuestion(option.id);
  }
};

// マウスホバー時に選択状態を更新
const handleMouseEnter = (index: number) => {
  selectedIndex.value = index;
};
</script>

<template>
  <div class="container mx-auto p-4 max-w-3xl">
    <LoadingSpinner 
      v-if="musicStore.loading" 
      full-screen 
    />

    <ErrorMessage
      v-else-if="musicStore.error"
      :message="`${t.quizPlay.loadError}: ${musicStore.error}`"
      retryable
      @retry="musicStore.fetchPieces(true)"
    />

    <div v-else-if="quizStore.currentQuestion">
      <div class="flex justify-between items-center mb-6">
        <div class="text-xl font-bold">
          {{ t.quizPlay.question }} {{ quizStore.currentQuestionIndex + 1 }} / {{ quizStore.questions.length }}
        </div>
        <div class="text-xl font-bold">
          {{ t.quizPlay.elapsedTime }}: {{ elapsedTime }}{{ t.quizPlay.seconds }}
        </div>
      </div>

      <div class="text-center p-8 border-2 border-gray-300 rounded-lg shadow-lg bg-gray-100 min-h-[200px] flex flex-col items-center justify-center relative">
        <!-- 曲を聴いて曲名を選ぶ場合: 音声プレーヤー表示 -->
          <template v-if="quizStore.quizFormat === 'audio-to-title'">
            <div class="text-6xl mb-4">🎵</div>
            <audio
              ref="audioElement"
              :src="quizStore.currentQuestion.correctAnswer.audio_url"
              @play="onAudioPlay($event)"
              @pause="onAudioPause"
              @ended="onAudioEnded"
              preload="auto"
              controls
              class="w-full mb-2"
            />
          </template>

          <!-- 曲名を見て作曲家を選ぶ場合: 曲名表示 -->
          <h2 v-if="quizStore.quizFormat === 'title-to-composer'" class="text-4xl font-bold">
            {{ quizStore.currentQuestion.correctAnswer.title }}
          </h2>

          <!-- 曲名を見て音声を選ぶ場合: 曲名・作曲家・詳細を表示 -->
          <div v-if="quizStore.quizFormat === 'title-to-track'" class="text-center">
            <h2 class="text-4xl font-bold mb-2">{{ quizStore.currentQuestion.correctAnswer.title }}</h2>
            <div class="text-lg text-gray-700 mb-2">{{ quizStore.currentQuestion.correctAnswer.composer }}</div>
            <p v-if="quizStore.currentQuestion.correctAnswer.description" class="text-sm text-gray-600 max-w-xl mx-auto">{{ quizStore.currentQuestion.correctAnswer.description }}</p>
          </div>
      </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
          <template v-for="(option, index) in quizStore.currentQuestion.options" :key="option.id">
            <!-- title-to-track: options are audio choices (show small player + select) -->
            <div
              v-if="quizStore.quizFormat === 'title-to-track'"
              class="p-4 border-2 rounded-lg bg-gray-50"
            >
              <div class="flex flex-col items-center">
                <audio :src="option.audio_url" controls preload="none" class="w-full mb-2" />
                <button
                  @click="handleAnswer(option, index)"
                  :disabled="!dataLoaded"
                  class="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded font-semibold"
                >
                  {{ t.quizPlay.select }}
                </button>
              </div>
            </div>

            <!-- other formats (audio-to-title, title-to-composer) keep existing button UI -->
            <button
              v-else
              @click="handleAnswer(option, index)"
              @mouseenter="handleMouseEnter(index)"
              @touchstart="handleMouseEnter(index)"
              :disabled="!dataLoaded"
              class="p-4 border-2 rounded-lg focus:outline-none bg-gray-50 transition-all"
              :class="{
                'border-indigo-500 ring-2 ring-indigo-500 bg-indigo-50': tappedIndex === index || (selectedIndex === index && dataLoaded),
                'border-gray-300 hover:bg-gray-100': tappedIndex !== index && selectedIndex !== index && dataLoaded,
                'opacity-50 cursor-not-allowed': !dataLoaded,
                'max-md:!border-gray-300 max-md:!ring-0 max-md:!bg-gray-50': tappedIndex !== index && selectedIndex === index
              }"
            >
              <span v-if="quizStore.quizFormat === 'audio-to-title'" class="text-2xl">{{ option.title }}</span>
              <span v-if="quizStore.quizFormat === 'title-to-composer'" class="text-2xl">{{ option.composer }}</span>
            </button>
          </template>
        </div>
    </div>
    <div v-else class="text-center py-10">
      <p>{{ t.quizPlay.noData }}</p>
      <AppButton variant="primary" @click="router.push('/quiz')" class="mt-4">
        {{ t.quizPlay.goToSetup }}
      </AppButton>
    </div>
  </div>
</template>
