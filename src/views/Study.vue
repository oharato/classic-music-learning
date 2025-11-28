<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch, nextTick } from 'vue';
import MusicDetailCard from '../components/CountryDetailCard.vue';
import MusicCard from '../components/FlagCard.vue';
import { useTranslation } from '../composables/useTranslation';
import type { MusicPiece } from '../store/countries';
import { useMusicStore } from '../store/countries';

const musicStore = useMusicStore();
const { t } = useTranslation();

const currentIndex = ref(0);
const isFlipped = ref(false);
const selectedCategory = ref('all');
const disableTransition = ref(false);
const quizMode = ref<'audio-to-title' | 'title-to-composer' | 'title-to-track'>('audio-to-title');

// Options for title-to-track mode
const options = ref<MusicPiece[]>([]);
const selectedOptionId = ref<string | null>(null);
const revealAnswer = ref<boolean>(false);

const shuffleArray = <T>(arr: T[]) => arr.sort(() => 0.5 - Math.random());

const generateOptions = () => {
  selectedOptionId.value = null;
  revealAnswer.value = false;
  if (!currentPiece.value) {
    options.value = [];
    return;
  }
  const pool = filteredPieces.value.filter((p) => p.id !== currentPiece.value!.id);
  const picks = shuffleArray(pool).slice(0, 3);
  const all = [...picks, currentPiece.value!];
  options.value = shuffleArray(all);
};

// stop other audios when one option starts playing
const handleOptionPlay = (ev: Event) => {
  const playing = ev.target as HTMLAudioElement;
  const audios = Array.from(document.querySelectorAll('audio')) as HTMLAudioElement[];
  audios.forEach((a) => {
    if (a !== playing) {
      try {
        a.pause();
        a.currentTime = 0;
      } catch (e) {}
    }
  });
};

const selectOption = (piece: MusicPiece) => {
  if (revealAnswer.value) return; // 既に回答済みなら無視
  selectedOptionId.value = piece.id;
  revealAnswer.value = true;
  // stop all audios
  const audios = Array.from(document.querySelectorAll('audio')) as HTMLAudioElement[];
  audios.forEach((a) => {
    try {
      a.pause();
      a.currentTime = 0;
    } catch (e) {}
  });
};

onMounted(() => {
  musicStore.fetchPieces(true);
  window.addEventListener('keydown', handleKeyDown);
});

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyDown);
});

const handleKeyDown = (event: KeyboardEvent) => {
  if (event.code === 'ArrowLeft') {
    prevPiece();
  } else if (event.code === 'ArrowRight') {
    nextPiece();
  } else if (event.code === 'Space') {
    event.preventDefault();
    isFlipped.value = !isFlipped.value;
  }
};

// 作曲家の正規化マップ
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

const availableComposers = computed(() => {
  const composers = new Set<string>();
  musicStore.pieces.forEach((piece) => {
    if (piece.composer) {
      const normalized = normalizeComposerMap[piece.composer] || piece.composer;
      composers.add(normalized);
    }
  });
  return Array.from(composers).sort();
});

const filteredPieces = computed<MusicPiece[]>(() => {
  if (selectedCategory.value === 'all') {
    return musicStore.pieces;
  }
  return musicStore.pieces.filter((piece) => {
    const normalized = normalizeComposerMap[piece.composer] || piece.composer;
    return normalized === selectedCategory.value;
  });
});

const currentPiece = computed(() => {
  if (filteredPieces.value.length === 0) {
    return null;
  }
  return filteredPieces.value[currentIndex.value];
});

watch(selectedCategory, () => {
  currentIndex.value = 0;
  isFlipped.value = false;
  generateOptions();
});

watch(quizMode, () => {
  isFlipped.value = false;
  generateOptions();
});

// 再生候補はデータロード後に生成
watch(
  () => musicStore.pieces.length,
  () => {
    generateOptions();
  }
);

const nextPiece = () => {
  if (filteredPieces.value.length === 0) return;

  // Change index first, then flip the card
  if (currentIndex.value < filteredPieces.value.length - 1) {
    currentIndex.value++;
  } else {
    currentIndex.value = 0;
  }

  if (isFlipped.value) {
    disableTransition.value = true;
    isFlipped.value = false;
    setTimeout(() => {
      disableTransition.value = false;
    }, 0);
  }
  // 停止中の音声を止め、次のカードの音声を自動再生
  stopAllAudio();
  playCurrentAudio();
  generateOptions();
};

const prevPiece = () => {
  if (filteredPieces.value.length === 0) return;

  // Change index first, then flip the card
  if (currentIndex.value > 0) {
    currentIndex.value--;
  } else {
    currentIndex.value = filteredPieces.value.length - 1;
  }

  if (isFlipped.value) {
    disableTransition.value = true;
    isFlipped.value = false;
    setTimeout(() => {
      disableTransition.value = false;
    }, 0);
  }
  // 停止中の音声を止め、前のカードの音声を自動再生
  stopAllAudio();
  playCurrentAudio();
  generateOptions();
};

const toggleFlip = () => {
  isFlipped.value = !isFlipped.value;
};

const goToPiece = (index: number) => {
  isFlipped.value = false;
  currentIndex.value = index;
  stopAllAudio();
  playCurrentAudio();
  generateOptions();
};

// DOM上の全ての audio を停止（再生中の音を止める）
const stopAllAudio = () => {
  try {
    const audios = Array.from(document.querySelectorAll('audio')) as HTMLAudioElement[];
    audios.forEach((a) => {
      try {
        a.pause();
        a.currentTime = 0;
      } catch (e) {
        // ignore
      }
    });
  } catch (e) {
    // ignore
  }
};

// 現在表示されているカード内の audio を自動再生する
const playCurrentAudio = async () => {
  await nextTick();
  try {
    // カード領域内の audio を選択
    const audio = document.querySelector('.perspective-1000 audio') as HTMLAudioElement | null;
    if (audio) {
      try {
        await audio.play();
      } catch (e) {
        // 自動再生がブラウザにより制限される場合があるので例外は無視
      }
    }
  } catch (e) {
    // ignore
  }
};

// 作曲家表示名取得
const getComposerDisplayName = (composer: string) => {
  const composerMap: Record<string, string> = {
    Beethoven: t.value.category.beethoven,
    Mozart: t.value.category.mozart,
    Bach: t.value.category.bach,
    Chopin: t.value.category.chopin,
    Tchaikovsky: t.value.category.tchaikovsky,
    Vivaldi: t.value.category.vivaldi,
    Brahms: t.value.category.brahms,
    Pachelbel: t.value.category.pachelbel,
  };
  return composerMap[composer] || composer;
};
</script>

<template>
  <div class="h-screen flex flex-col overflow-hidden">
    <div class="container mx-auto p-4 flex-shrink-0">
      <div class="w-full max-w-2xl mx-auto">
        <router-link to="/" class="text-blue-500 hover:underline">{{ t.common.backToHome }}</router-link>
        <h2 class="text-3xl font-bold my-6 text-center">{{ t.study.title }}</h2>

        <!-- 設定エリア -->
        <div class="mb-4 flex justify-between items-center gap-4">
          <!-- クイズ形式選択 -->
          <div>
            <label for="quizMode" class="mr-2">{{ t.study.quizMode }}:</label>
            <select
              id="quizMode"
              v-model="quizMode"
              class="p-2 border rounded-md"
            >
              <option value="audio-to-title">{{ t.study.audioToTitle }}</option>
              <option value="title-to-composer">{{ t.study.titleToComposer }}</option>
              <option value="title-to-track">{{ t.quizFormat.titleToTrack || t.quizSetup.titleToTrack }}</option>
            </select>
          </div>

          <!-- カテゴリ選択ドロップダウン -->
          <div>
            <label for="studyCategory" class="mr-2">{{ t.study.category }}:</label>
            <select
              id="studyCategory"
              v-model="selectedCategory"
              class="p-2 border rounded-md"
            >
              <option value="all">{{ t.category.all }}</option>
              <option v-for="composer in availableComposers" :key="composer" :value="composer">
                {{ getComposerDisplayName(composer) }}
              </option>
            </select>
          </div>
        </div>
      </div>
    </div>

    <div v-if="musicStore.loading" class="flex-1 flex items-center justify-center">
      <div class="text-center">
        <div class="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mx-auto mb-4"></div>
        <p>{{ t.ranking.loading }}</p>
      </div>
    </div>

    <div v-else-if="musicStore.error" class="flex-1 flex items-center justify-center">
      <div class="text-center text-red-500">
        <p>{{ musicStore.error }}</p>
        <button @click="musicStore.fetchPieces(true)" class="mt-4 bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded">
          {{ t.quizSetup.error }}
        </button>
      </div>
    </div>

    <div v-else-if="currentPiece" class="flex-1 flex flex-col overflow-hidden">
      <div class="w-full max-w-2xl mx-auto flex-shrink-0 px-4">
        <div class="perspective-1000">
          <div 
            class="relative w-full h-96 transform-style-3d"
            :class="[
              { 'rotate-y-180': isFlipped },
              disableTransition ? '' : 'transition-transform duration-700'
            ]"
          >
            <!-- Card Front -->
            <div class="absolute w-full h-full backface-hidden border-2 border-gray-300 rounded-lg shadow-lg p-8 bg-gray-100 cursor-pointer"
                 @click="toggleFlip">
              <MusicCard v-if="quizMode === 'audio-to-title'" :piece="currentPiece" />

              <template v-else-if="quizMode === 'title-to-track'">
                <div class="h-full overflow-auto p-2" @click.stop>
                  <h3 class="text-2xl font-semibold mb-2">{{ currentPiece.title }}</h3>
                  <p class="text-sm text-gray-600 mb-2">{{ getComposerDisplayName(currentPiece.composer) }}</p>
                  <p class="text-sm text-gray-700 mb-4">{{ currentPiece.description || t.study.noInformation }}</p>

                  <div class="grid gap-4 grid-cols-1 sm:grid-cols-2">
                    <div v-for="option in options" :key="option.id"
                         @click="selectOption(option)"
                         @keydown.enter="selectOption(option)"
                         role="button"
                         tabindex="0"
                         :class="[
                           'p-3 border rounded-lg bg-gray-50 cursor-pointer',
                           revealAnswer && option.id === currentPiece.id ? 'border-green-500' : '',
                           revealAnswer && selectedOptionId === option.id && option.id !== currentPiece.id ? 'border-red-500' : ''
                         ]">
                      <audio :src="option.audio_url" controls @play="handleOptionPlay($event)" @click.stop preload="none" class="w-full mb-2" />
                      <!-- result labels removed as per request -->
                    </div>
                  </div>
                </div>
              </template>

              <MusicDetailCard v-else :piece="currentPiece" />
            </div>
            
            <!-- Card Back -->
            <div class="absolute w-full h-full backface-hidden rotate-y-180 border-2 border-gray-300 rounded-lg shadow-lg p-6 bg-gray-100 cursor-pointer"
                 @click="toggleFlip">
              <MusicDetailCard v-if="quizMode === 'audio-to-title'" :piece="currentPiece" />
              <MusicCard v-else :piece="currentPiece" :flipped="true" />
            </div>
          </div>
        </div>
      </div>

      <div class="w-full max-w-2xl mx-auto px-4 flex-shrink-0">
        <div class="flex justify-between items-center mb-4 mt-4">
          <button 
            @click="prevPiece" 
            class="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            aria-label="前の曲へ"
          >
            {{ t.study.prev }}
          </button>
          <span class="text-lg font-semibold">
            {{ currentIndex + 1 }} / {{ filteredPieces.length }}
          </span>
          <button 
            @click="nextPiece" 
            class="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            aria-label="次の曲へ"
          >
            {{ t.study.next }}
          </button>
        </div>
        <p class="text-sm text-gray-500 text-center mt-2">
          {{ t.study.keyboardHint }}
        </p>
      </div>

      <div class="flex-1 overflow-y-auto px-4 mt-4 pb-4">
        <!-- 曲名→曲 モード: 選択肢を表示 -->
        <!-- title-to-track の専用ブロックはカード内に統合しました -->
        <div class="w-full max-w-2xl mx-auto grid gap-2 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          <div
            v-for="(piece, index) in filteredPieces"
            :key="piece.id"
            @click="goToPiece(index)"
            :class="{
              'border-4 border-blue-500': index === currentIndex,
              'border-4 border-transparent': index !== currentIndex,
            }"
            class="cursor-pointer rounded overflow-hidden hover:shadow-lg transition-shadow bg-gray-100 flex items-center justify-center p-2 box-border"
          >
            <span class="text-xs sm:text-sm font-medium text-center px-2 py-4">
              {{ piece.title }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="flex-1 flex items-center justify-center">
      <p class="text-gray-500">{{ t.ranking.noData }}</p>
    </div>
  </div>
</template>

<style scoped>
.perspective-1000 {
  perspective: 1000px;
}

.transform-style-3d {
  transform-style: preserve-3d;
}

.rotate-y-180 {
  transform: rotateY(180deg);
}

.backface-hidden {
  backface-visibility: hidden;
}
</style>
