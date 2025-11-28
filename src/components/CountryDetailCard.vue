<script setup lang="ts">
import type { MusicPiece } from '../store/countries';
import { useTranslation } from '../composables/useTranslation';

defineProps<{
  piece: MusicPiece;
}>();

const { t } = useTranslation();
</script>

<template>
  <div class="relative flex flex-col h-full overflow-y-auto">
    <h3 class="text-2xl font-bold mb-2">{{ piece.title }}</h3>
    <p><strong>{{ t.study.composer }}:</strong> {{ piece.composer }}</p>
    <p><strong>{{ t.study.genre }}:</strong> {{ piece.genre }}</p>
    <hr class="my-4">
    <h4 class="font-bold mt-2">{{ t.study.description }}</h4>
    <p class="text-sm overflow-y-auto max-h-24">{{ piece.description || t.study.noInformation }}</p>
    <h4 class="font-bold mt-4">{{ t.study.trivia }}</h4>
    <p class="text-sm overflow-y-auto max-h-24">{{ piece.trivia || t.study.noInformation }}</p>
  </div>
</template>
