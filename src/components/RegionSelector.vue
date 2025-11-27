<script setup lang="ts">
import { computed } from 'vue';
import { useTranslation } from '../composables/useTranslation';
import { useMusicStore } from '../store/countries';

interface Props {
  modelValue: string;
  label?: string;
  includeAll?: boolean;
  alwaysShowLabel?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  label: '',
  includeAll: true,
  alwaysShowLabel: false,
});

const emit = defineEmits<{
  'update:modelValue': [value: string];
}>();

const musicStore = useMusicStore();
const { t } = useTranslation();

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

// 利用可能な作曲家のリスト
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

// 表示用の作曲家名を取得
const getDisplayComposerName = (composer: string) => {
  const composerMap: Record<string, string> = {
    Beethoven: t.value.category.beethoven,
    Mozart: t.value.category.mozart,
    Bach: t.value.category.bach,
    Chopin: t.value.category.chopin,
    Tchaikovsky: t.value.category.tchaikovsky,
    Vivaldi: t.value.category.vivaldi,
    Brahms: t.value.category.brahms,
    Pachelbel: t.value.category.pachelbel,
    all: t.value.category.all,
  };
  return composerMap[composer] || composer;
};

const selectedValue = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
});

const displayLabel = computed(() => props.label || t.value.quizSetup.category);
</script>

<template>
  <div>
    <label v-if="displayLabel" :class="alwaysShowLabel ? 'block text-sm font-medium text-gray-700 mb-1' : 'hidden md:block text-sm font-medium text-gray-700 mb-1'">
      {{ displayLabel }}
    </label>
    <select
      v-model="selectedValue"
      class="w-full px-2 py-1.5 md:px-3 md:py-2 text-sm md:text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
    >
      <option v-if="includeAll" value="all">{{ getDisplayComposerName('all') }}</option>
      <option 
        v-for="composer in availableComposers" 
        :key="composer" 
        :value="composer"
      >
        {{ getDisplayComposerName(composer) }}
      </option>
    </select>
  </div>
</template>
