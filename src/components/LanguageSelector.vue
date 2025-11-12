<script setup lang="ts">
import { ref, watch } from 'vue';
import { type Language, useCountriesStore } from '../store/countries';

const countriesStore = useCountriesStore();
const selectedLanguage = ref<Language>(countriesStore.currentLanguage);

watch(selectedLanguage, (newLang) => {
  countriesStore.setLanguage(newLang);
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
