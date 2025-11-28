import type { MusicPiece } from '../../store/countries';

export const mockMusicPieces: MusicPiece[] = [
  {
    id: 'symphony_5_beethoven',
    title: '交響曲第5番「運命」',
    composer: 'ベートーヴェン',
    genre: '交響曲',
    audio_url: 'https://example.com/symphony5.ogg',
    description: 'ベートーヴェンの交響曲第5番の説明',
    trivia: '運命についてのトリビア',
  },
  {
    id: 'eine_kleine_nachtmusik',
    title: 'アイネ・クライネ・ナハトムジーク',
    composer: 'モーツァルト',
    genre: 'セレナーデ',
    audio_url: 'https://example.com/nachtmusik.ogg',
    description: 'アイネ・クライネ・ナハトムジークの説明',
    trivia: 'セレナーデについてのトリビア',
  },
  {
    id: 'toccata_fugue',
    title: 'トッカータとフーガ ニ短調',
    composer: 'バッハ',
    genre: 'オルガン曲',
    audio_url: 'https://example.com/toccata.ogg',
    description: 'バッハのオルガン曲の説明',
    trivia: 'オルガン曲についてのトリビア',
  },
];
