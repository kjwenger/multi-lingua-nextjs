/**
 * Integration tests for LibreTranslateProvider — hits a real LibreTranslate instance.
 * Requires LIBRETRANSLATE_URL env var to be set (e.g. http://localhost:5000).
 * LIBRETRANSLATE_API_KEY is optional.
 *
 * Run with:
 *   LIBRETRANSLATE_URL=http://localhost:5000 npm test
 */

import { LibreTranslateProvider } from './libretranslate';

const apiUrl = process.env.LIBRETRANSLATE_URL;
const apiKey = process.env.LIBRETRANSLATE_API_KEY;

if (!apiUrl) {
  throw new Error('LIBRETRANSLATE_URL env var is required to run LibreTranslate integration tests');
}

const provider = new LibreTranslateProvider(apiUrl, apiKey);

type TranslateResult = Awaited<ReturnType<typeof provider.translate>>;

const words: Array<{
  word: string;
  de: string; fr: string; es: string; italian: string;
  pl: string; pt: string; ru: string; zh: string;
}> = [
  { word: 'cat',   de: 'Katze',    fr: 'chat',    es: 'gato',  italian: 'gatto',      pl: 'kot',       pt: 'gato',  ru: 'кошка',    zh: '猫'  },
  { word: 'dog',   de: 'Hund',     fr: 'chien',   es: 'perro', italian: 'cane',       pl: 'pies',      pt: 'cão',   ru: 'собака',   zh: '狗'  },
  { word: 'car',   de: 'Auto',     fr: 'voiture', es: 'coche', italian: 'automobile', pl: 'samochód',  pt: 'carro', ru: 'машина',   zh: '车'  },
  { word: 'maize', de: 'Mais',     fr: 'maïs',    es: 'maíz',  italian: 'mais',       pl: 'kukurydza', pt: 'milho', ru: 'кукуруза', zh: '玉米' },
];

describe('LibreTranslateProvider — en → all', () => {
  for (const { word, de, fr, es, italian, pl, pt, ru, zh } of words) {
    describe(`translate("${word}", en → *)`, () => {
      let rDE: TranslateResult, rFR: TranslateResult, rES: TranslateResult, rIT: TranslateResult;
      let rPL: TranslateResult, rPT: TranslateResult, rRU: TranslateResult, rZH: TranslateResult;

      beforeAll(async () => {
        [rDE, rFR, rES, rIT, rPL, rPT, rRU, rZH] = await Promise.all([
          provider.translate(word, 'en', 'de'),
          provider.translate(word, 'en', 'fr'),
          provider.translate(word, 'en', 'es'),
          provider.translate(word, 'en', 'it'),
          provider.translate(word, 'en', 'pl'),
          provider.translate(word, 'en', 'pt'),
          provider.translate(word, 'en', 'ru'),
          provider.translate(word, 'en', 'zh'),
        ]);
      }, 30000);

      const check = (r: TranslateResult, expected: string, lang: string) => {
        it(`${lang} contains "${expected}"`, () => {
          const all = [r.translatedText, ...(r.alternatives ?? [])].join(' ');
          expect(all).toContain(expected);
        });
      };

      check(rDE!, de, 'German');
      check(rFR!, fr, 'French');
      check(rES!, es, 'Spanish');
      check(rIT!, italian, 'Italian');
      check(rPL!, pl, 'Polish');
      check(rPT!, pt, 'Portuguese');
      check(rRU!, ru, 'Russian');
      check(rZH!, zh, 'Chinese');
    });
  }
});
