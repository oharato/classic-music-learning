<script setup lang="ts">
import { computed } from 'vue';
import { useTranslation } from '../composables/useTranslation';

interface Props {
  modelValue: string;
  label?: string;
  variant?: 'radio' | 'select';
}

const props = withDefaults(defineProps<Props>(), {
  label: '',
  variant: 'select',
});

const emit = defineEmits<{
  'update:modelValue': [value: string];
}>();

const { t } = useTranslation();

const selectedValue = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
});

const displayLabel = computed(() => props.label || t.value.quizSetup.quizFormat);
</script>

<template>
  <div>
    <label v-if="displayLabel" class="hidden md:block text-sm font-medium text-gray-700 mb-1">
      {{ displayLabel }}
    </label>
    
    <!-- セレクトボックス版 -->
    <select
      v-if="variant === 'select'"
      v-model="selectedValue"
      class="w-full px-2 py-1.5 md:px-3 md:py-2 text-sm md:text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
    >
      <option value="audio-to-title">{{ t.quizFormat.audioToTitle }}</option>
        <option value="title-to-composer">{{ t.quizFormat.titleToComposer }}</option>
        <option value="title-to-track">{{ t.quizFormat.titleToTrack }}</option>
    </select>
    
    <!-- ラジオボタン版 -->
    <div v-else class="mt-2 space-y-2">
      <label class="inline-flex items-center">
        <input 
          type="radio" 
          class="form-radio" 
          name="quizFormat" 
          value="audio-to-title" 
          v-model="selectedValue"
        >
        <span class="ml-2">{{ t.quizFormat.audioToTitleLong }}</span>
      </label>
      <br>
      <label class="inline-flex items-center">
        <input 
          type="radio" 
          class="form-radio" 
          name="quizFormat" 
          value="title-to-composer" 
          v-model="selectedValue"
        >
        <span class="ml-2">{{ t.quizFormat.titleToComposerLong }}</span>
      </label>
    </div>
  </div>
</template>
