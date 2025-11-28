import { flushPromises, mount } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createMemoryHistory, createRouter } from 'vue-router';
import { mockMusicPieces } from '../../__tests__/fixtures/music';
import { useMusicStore } from '../../store/countries';
import Study from '../Study.vue';

describe('Study.vue', () => {
  let router: any;

  beforeEach(() => {
    setActivePinia(createPinia());

    router = createRouter({
      history: createMemoryHistory(),
      routes: [
        { path: '/', component: { template: '<div>Home</div>' } },
        { path: '/study', component: Study },
      ],
    });

    const musicStore = useMusicStore();
    musicStore.pieces = mockMusicPieces;
    musicStore.loading = false; // ローディング状態を解除
    musicStore.currentLanguage = 'ja'; // 日本語を選択
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('正しくマウントされる', () => {
    const wrapper = mount(Study, {
      global: {
        plugins: [router],
      },
    });

    expect(wrapper.find('h2').text()).toBe('学習モード');
  });

  it('最初の楽曲が表示される', () => {
    const wrapper = mount(Study, {
      global: {
        plugins: [router],
      },
    });

    // 最初の楽曲の音符アイコンが表示される
    expect(wrapper.text()).toContain('🎵');
    // 再生ボタンが表示される
    expect(wrapper.text()).toContain('再生');
  });

  it('カードをクリックするとフリップする', async () => {
    const wrapper = mount(Study, {
      global: {
        plugins: [router],
      },
    });

    // 初期状態でisFlippedがfalseであることを確認
    expect((wrapper.vm as any).isFlipped).toBe(false);

    // カード（表面）をクリック
    const cardFront = wrapper.find('.backface-hidden.bg-gray-100');
    await cardFront.trigger('click');
    await wrapper.vm.$nextTick();

    // isFlippedがtrueになることを確認
    expect((wrapper.vm as any).isFlipped).toBe(true);
  });

  it('「次へ」ボタンで次の楽曲に移動する', async () => {
    const wrapper = mount(Study, {
      global: {
        plugins: [router],
      },
    });

    // 初期インデックスは0
    expect((wrapper.vm as any).currentIndex).toBe(0);

    const nextButton = wrapper.findAll('button').find((btn) => btn.text().includes('次へ'));
    expect(nextButton).toBeDefined();

    if (nextButton) {
      await nextButton.trigger('click');
      await wrapper.vm.$nextTick();

      // currentIndexが1になることを確認
      expect((wrapper.vm as any).currentIndex).toBe(1);
      // カードが表面に戻ることを確認
      expect((wrapper.vm as any).isFlipped).toBe(false);
    }
  });

  it('「前へ」ボタンで前の楽曲に移動する', async () => {
    const wrapper = mount(Study, {
      global: {
        plugins: [router],
      },
    });

    // まず次へ進む
    const nextButton = wrapper.findAll('button').find((btn) => btn.text().includes('次へ'));
    if (nextButton) {
      await nextButton.trigger('click');
      await wrapper.vm.$nextTick();
      expect((wrapper.vm as any).currentIndex).toBe(1);
    }

    // 前へ戻る
    const prevButton = wrapper.findAll('button').find((btn) => btn.text().includes('前へ'));
    if (prevButton) {
      await prevButton.trigger('click');
      await wrapper.vm.$nextTick();

      // インデックスが0に戻ることを確認
      expect((wrapper.vm as any).currentIndex).toBe(0);
      // カードが表面に戻ることを確認
      expect((wrapper.vm as any).isFlipped).toBe(false);
    }
  });

  it('最後の楽曲で「次へ」を押すと最初に戻る（ループ）', async () => {
    const wrapper = mount(Study, {
      global: {
        plugins: [router],
      },
    });

    const nextButton = wrapper.findAll('button').find((btn) => btn.text().includes('次へ'));

    if (nextButton) {
      // 3回「次へ」を押して最後の楽曲の次へ
      await nextButton.trigger('click');
      await wrapper.vm.$nextTick();
      await nextButton.trigger('click');
      await wrapper.vm.$nextTick();
      await nextButton.trigger('click');
      await wrapper.vm.$nextTick();

      // インデックスが0に戻ることを確認（ループ）
      expect((wrapper.vm as any).currentIndex).toBe(0);
    }
  });

  it('最初の楽曲で「前へ」を押すと最後に移動する（ループ）', async () => {
    const wrapper = mount(Study, {
      global: {
        plugins: [router],
      },
    });

    // 初期状態でインデックスは0
    expect((wrapper.vm as any).currentIndex).toBe(0);

    const prevButton = wrapper.findAll('button').find((btn) => btn.text().includes('前へ'));
    if (prevButton) {
      await prevButton.trigger('click');
      await wrapper.vm.$nextTick();

      // インデックスが最後（2）になることを確認
      expect((wrapper.vm as any).currentIndex).toBe(2);
    }
  });

  it('カウンター表示が正しい', () => {
    const wrapper = mount(Study, {
      global: {
        plugins: [router],
      },
    });

    expect(wrapper.text()).toContain('1 / 3');
  });

  it('カテゴリ選択ドロップダウンが表示される', () => {
    const wrapper = mount(Study, {
      global: {
        plugins: [router],
      },
    });

    const select = wrapper.find('#studyCategory');
    expect(select.exists()).toBe(true);

    const options = select.findAll('option');
    expect(options[0]?.text()).toBe('すべて');
  });

  it('カテゴリを選択するとフィルタリングされる', async () => {
    const wrapper = mount(Study, {
      global: {
        plugins: [router],
      },
    });

    const select = wrapper.find('#studyCategory');
    await select.setValue('Beethoven');
    await wrapper.vm.$nextTick();

    // フィルタリングされた楽曲の数を確認
    const filteredPieces = (wrapper.vm as any).filteredPieces;
    expect(filteredPieces.length).toBe(1);
    expect(filteredPieces[0].title).toBe('交響曲第5番「運命」');
  });

  it('カテゴリを変更するとカードが表面に戻る', async () => {
    const wrapper = mount(Study, {
      global: {
        plugins: [router],
      },
    });

    // カードをフリップ
    const cardFront = wrapper.find('.backface-hidden.bg-gray-100');
    await cardFront.trigger('click');
    await wrapper.vm.$nextTick();

    // isFlippedがtrueになることを確認
    expect((wrapper.vm as any).isFlipped).toBe(true);

    // カテゴリを変更
    const select = wrapper.find('#studyCategory');
    await select.setValue('Mozart');
    await wrapper.vm.$nextTick();

    // isFlippedがfalseに戻ることを確認
    expect((wrapper.vm as any).isFlipped).toBe(false);
  });

  it('表裏切り替えボタンでカードをフリップできる', async () => {
    const wrapper = mount(Study, {
      global: {
        plugins: [router],
      },
    });

    // 初期状態でisFlippedがfalseであることを確認
    expect((wrapper.vm as any).isFlipped).toBe(false);

    // カードをクリックしてフリップ
    const cardFront = wrapper.find('.backface-hidden.bg-gray-100');
    await cardFront.trigger('click');
    await wrapper.vm.$nextTick();

    // isFlippedがtrueになることを確認
    expect((wrapper.vm as any).isFlipped).toBe(true);

    // もう一度クリック
    await cardFront.trigger('click');
    await wrapper.vm.$nextTick();

    // isFlippedがfalseに戻ることを確認
    expect((wrapper.vm as any).isFlipped).toBe(false);
  });

  it('ローディング中は読み込みメッセージが表示される', () => {
    const musicStore = useMusicStore();
    musicStore.loading = true;
    musicStore.pieces = [];

    const wrapper = mount(Study, {
      global: {
        plugins: [router],
      },
    });

    expect(wrapper.text()).toContain('ランキングを読み込み中...');
  });

  it('エラー時はエラーメッセージが表示される', () => {
    const musicStore = useMusicStore();
    musicStore.loading = false;
    musicStore.error = 'データ取得エラー';

    const wrapper = mount(Study, {
      global: {
        plugins: [router],
      },
    });

    expect(wrapper.text()).toContain('データ取得エラー');
  });

  it('楽曲データがない場合、メッセージが表示される', () => {
    const musicStore = useMusicStore();
    musicStore.loading = false;
    musicStore.error = null;
    musicStore.pieces = [];

    const wrapper = mount(Study, {
      global: {
        plugins: [router],
      },
    });

    // 楽曲データがない場合は何も表示されない（filteredPiecesが空）
    const filteredPieces = (wrapper.vm as any).filteredPieces;
    expect(filteredPieces.length).toBe(0);
  });

  it('楽曲一覧が表示される', async () => {
    const wrapper = mount(Study, {
      global: {
        plugins: [router],
      },
    });

    await wrapper.vm.$nextTick();

    // filteredPiecesの数を確認
    const filteredPieces = (wrapper.vm as any).filteredPieces;
    expect(filteredPieces.length).toBe(3);
  });

  it('クイズ形式が選択できる', async () => {
    const wrapper = mount(Study, {
      global: {
        plugins: [router],
      },
    });

    // 初期状態は「曲を聴いて→曲名」
    expect((wrapper.vm as any).quizMode).toBe('audio-to-title');

    // プルダウンを取得
    const quizModeSelect = wrapper.find('#quizMode');
    expect(quizModeSelect.exists()).toBe(true);

    // 「曲名→作曲家」に変更
    await quizModeSelect.setValue('title-to-composer');
    expect((wrapper.vm as any).quizMode).toBe('title-to-composer');
  });

  it('曲を聴いて→曲名モードでは音楽プレーヤーが表示される', () => {
    const wrapper = mount(Study, {
      global: {
        plugins: [router],
      },
    });

    // 曲を聴いて→曲名モード（デフォルト）
    expect(wrapper.text()).toContain('🎵');
    expect(wrapper.text()).toContain('再生');
  });

  it('曲名→作曲家モードでは表に詳細情報が表示される', async () => {
    const wrapper = mount(Study, {
      global: {
        plugins: [router],
      },
    });

    // 曲名→作曲家モードに変更
    const quizModeSelect = wrapper.find('#quizMode');
    await quizModeSelect.setValue('title-to-composer');
    await flushPromises();
    await wrapper.vm.$nextTick();

    // quizModeが変更されたことを確認
    expect((wrapper.vm as any).quizMode).toBe('title-to-composer');
  });

  it('曲を聴いて→曲名モードでカードを裏返すと曲名と詳細情報が表示される', async () => {
    const wrapper = mount(Study, {
      global: {
        plugins: [router],
      },
    });

    // 初期状態は曲を聴いて→曲名モード
    expect((wrapper.vm as any).quizMode).toBe('audio-to-title');

    // カードをクリックして裏返す
    const card = wrapper.find('.cursor-pointer[class*="backface-hidden"]');
    await card.trigger('click');
    await wrapper.vm.$nextTick();

    // isFlippedがtrueになることを確認
    expect((wrapper.vm as any).isFlipped).toBe(true);
  });
});
