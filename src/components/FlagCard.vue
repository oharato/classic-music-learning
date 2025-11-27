<script setup lang="ts">
import { ref } from 'vue';
import type { MusicPiece } from '../store/countries';
import { useTranslation } from '../composables/useTranslation';

defineProps<{
  piece: MusicPiece;
  flipped?: boolean;
}>();

const { t } = useTranslation();
const isPlaying = ref(false);
const audioElement = ref<HTMLAudioElement | null>(null);

const toggleAudio = () => {
  if (!audioElement.value) return;

  if (isPlaying.value) {
    audioElement.value.pause();
    isPlaying.value = false;
  } else {
    audioElement.value.play();
    isPlaying.value = true;
  }
};

const onAudioEnded = () => {
  isPlaying.value = false;
};
</script>

<template>
  <div class="w-full h-full bg-gray-100 rounded flex flex-col items-center justify-center p-4">
    <!-- 音声プレーヤー -->
    <div class="mb-4 flex flex-col items-center">
      <div class="text-6xl mb-4">🎵</div>
      <audio 
        ref="audioElement"
        :src="piece.audio_url"
        @ended="onAudioEnded"
        preload="auto"
      />
      <button
        @click.stop="toggleAudio"
        class="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full font-bold text-lg transition-colors"
      >
        {{ isPlaying ? t.study.pauseAudio : t.study.playAudio }}
      </button>
    </div>
    
    <!-- フリップ時は曲名を表示 -->
    <div v-if="flipped" class="text-center mt-4">
      <h3 class="text-2xl font-bold">{{ piece.title }}</h3>
      <p class="text-lg text-gray-600">{{ piece.composer }}</p>
    </div>
  </div>
</template>
