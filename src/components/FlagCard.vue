<script setup lang="ts">
import { ref } from 'vue';
import type { MusicPiece } from '../store/countries';
import { useTranslation } from '../composables/useTranslation';

defineProps<{
  piece: MusicPiece;
  flipped?: boolean;
}>();

const { t } = useTranslation();
const audioElement = ref<HTMLAudioElement | null>(null);

const onPlay = (ev: Event) => {
  // 再生時は他の audio を停止
  const current = ev.target as HTMLAudioElement;
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

const onAudioEnded = () => {
  // noop for now
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
        @play="onPlay"
        @ended="onAudioEnded"
        preload="auto"
        controls
        class="w-full"
      />
      <span class="sr-only">{{ t.study.playAudio }}</span>
    </div>
    
    <!-- フリップ時は曲名を表示 -->
    <div v-if="flipped" class="text-center mt-4">
      <h3 class="text-2xl font-bold">{{ piece.title }}</h3>
      <p class="text-lg text-gray-600">{{ piece.composer }}</p>
    </div>
  </div>
</template>
