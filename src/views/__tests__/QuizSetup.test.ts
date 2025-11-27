import { flushPromises, mount } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createMemoryHistory, createRouter } from 'vue-router';
import { mockMusicPieces } from '../../__tests__/fixtures/music';
import { useMusicStore } from '../../store/countries';
import { useQuizStore } from '../../store/quiz';
import QuizSetup from '../QuizSetup.vue';

const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, 'localStorage', { value: localStorageMock });

describe('QuizSetup.vue', () => {
  let router: any;

  beforeEach(() => {
    setActivePinia(createPinia());
    localStorageMock.clear();

    router = createRouter({
      history: createMemoryHistory(),
      routes: [
        { path: '/', component: { template: '<div>Home</div>' } },
        { path: '/quiz', component: QuizSetup },
        { path: '/quiz/play', component: { template: '<div>Quiz Play</div>' } },
      ],
    });

    const musicStore = useMusicStore();
    musicStore.pieces = mockMusicPieces;
    musicStore.currentLanguage = 'ja'; // 日本語を選択
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('正しくマウントされる', () => {
    const wrapper = mount(QuizSetup, {
      global: {
        plugins: [router],
      },
    });

    expect(wrapper.find('h2').text()).toBe('クイズ設定');
  });

  it('localStorageに保存されたニックネームを読み込む', () => {
    localStorageMock.setItem('quiz_nickname', 'テストユーザー');

    const wrapper = mount(QuizSetup, {
      global: {
        plugins: [router],
      },
    });

    const input = wrapper.find('#nickname');
    expect((input.element as HTMLInputElement).value).toBe('テストユーザー');
  });

  it('クイズ形式の選択ができる', async () => {
    const wrapper = mount(QuizSetup, {
      global: {
        plugins: [router],
      },
    });

    const radios = wrapper.findAll('input[name="quizFormat"]');
    expect(radios).toHaveLength(2);

    const radio = radios[1];
    await radio?.setValue(true);
    expect((radio?.element as HTMLInputElement).checked).toBe(true);
  });

  it('出題範囲の選択ができる', async () => {
    const wrapper = mount(QuizSetup, {
      global: {
        plugins: [router],
      },
    });

    // CategorySelectorコンポーネント内のselectを探す
    const select = wrapper.find('select');
    await select.setValue('Beethoven');

    expect((select.element as HTMLSelectElement).value).toBe('Beethoven');
  });

  it('問題数の選択ができる', async () => {
    const wrapper = mount(QuizSetup, {
      global: {
        plugins: [router],
      },
    });

    const select = wrapper.find('#numQuestions');
    const options = select.findAll('option');

    expect(options).toHaveLength(4);
    expect(options[0]?.text()).toBe('5問');
    expect(options[1]?.text()).toBe('10問');
    expect(options[2]?.text()).toBe('30問');
    expect(options[3]?.text()).toBe('すべて');

    await select.setValue('30');
    expect((select.element as HTMLSelectElement).value).toBe('30');
  });

  it('ニックネームが空の場合、エラーメッセージが表示される', async () => {
    const wrapper = mount(QuizSetup, {
      global: {
        plugins: [router],
      },
    });

    const input = wrapper.find('#nickname');
    await input.setValue('   '); // 空白のみ

    const form = wrapper.find('form');
    await form.trigger('submit');

    await wrapper.vm.$nextTick();

    expect(wrapper.text()).toContain('ニックネームを入力してください。');
  });

  it('ニックネームが21文字以上の場合、エラーメッセージが表示される', async () => {
    const wrapper = mount(QuizSetup, {
      global: {
        plugins: [router],
      },
    });

    const input = wrapper.find('#nickname');
    await input.setValue('a'.repeat(21));

    const form = wrapper.find('form');
    await form.trigger('submit');

    await wrapper.vm.$nextTick();

    expect(wrapper.text()).toContain('ニックネームは20文字以内で入力してください。');
  });

  it('HTMLタグを含むニックネームは拒否される', async () => {
    const wrapper = mount(QuizSetup, {
      global: {
        plugins: [router],
      },
    });

    const input = wrapper.find('#nickname');
    await input.setValue('<b>test</b>');

    const form = wrapper.find('form');
    await form.trigger('submit');

    await wrapper.vm.$nextTick();

    expect(wrapper.text()).toContain('ニックネームに使用できない文字が含まれています。');
  });

  it('正常なニックネームでクイズが開始される', async () => {
    const wrapper = mount(QuizSetup, {
      global: {
        plugins: [router],
      },
    });

    await router.isReady();

    const input = wrapper.find('#nickname');
    await input.setValue('テストユーザー');

    const form = wrapper.find('form');
    await form.trigger('submit');

    await flushPromises();

    // クイズストアが更新されることを確認
    const quizStore = useQuizStore();
    expect(quizStore.nickname).toBe('テストユーザー');

    // localStorageに保存されることを確認
    expect(localStorageMock.getItem('quiz_nickname')).toBe('テストユーザー');
  });

  it('利用可能な作曲家が正しく表示される', () => {
    const wrapper = mount(QuizSetup, {
      global: {
        plugins: [router],
      },
    });

    // CategorySelectorコンポーネント内のselectとoptionsを探す
    const select = wrapper.find('select');
    const options = select.findAll('option');

    // "すべて" + Beethoven, Mozart, Bach
    expect(options.length).toBeGreaterThanOrEqual(4);
  });

  it('楽曲データがロード中の場合、ボタンが無効化される', () => {
    const musicStore = useMusicStore();
    musicStore.loading = true;

    const wrapper = mount(QuizSetup, {
      global: {
        plugins: [router],
      },
    });

    const button = wrapper.find('button[type="submit"]');
    expect((button.element as HTMLButtonElement).disabled).toBe(true);
    expect(button.text()).toBe('データ準備中...');
  });
});
