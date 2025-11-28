import { computed } from 'vue';
import { type Translations, translations } from '../i18n/translations';
import { useMusicStore } from '../store/countries';

export function useTranslation() {
  const musicStore = useMusicStore();

  const t = computed<Translations>(() => {
    return translations[musicStore.currentLanguage];
  });

  return { t };
}
