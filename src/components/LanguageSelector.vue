<script setup lang="ts">
import { ref, watch } from 'vue';
import { type Language, useMusicStore } from '../store/countries';

const musicStore = useMusicStore();
const selectedLanguage = ref<Language>(musicStore.currentLanguage);

watch(selectedLanguage, (newLang) => {
  musicStore.setLanguage(newLang);
});
</script>

<template>
  <select 
    v-model="selectedLanguage" 
    class="p-2 border rounded"
    aria-label="言語選択 / Language selection"
  >
    <option value="ja">日本語</option>
    <option value="en">English</option>
  </select>
</template>
