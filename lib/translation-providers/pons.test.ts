/**
 * Integration tests for PonsProvider — hits the real PONS API.
 * Requires PONS_API_SECRET env var to be set.
 *
 * Run with:
 *   PONS_API_SECRET=<key> npm test
 */

import { PonsProvider } from './pons';

const apiKey = process.env.PONS_API_SECRET;

if (!apiKey) {
  throw new Error('PONS_API_SECRET env var is required to run PONS integration tests');
}

const provider = new PonsProvider(apiKey);

type TranslateResult = Awaited<ReturnType<typeof provider.translate>>;

// ──────────────────────────────────────────────────────────────────────────────
// Section 1: English → all PONS languages, four representative words
// ──────────────────────────────────────────────────────────────────────────────

const words: Array<{
  word: string;
  de: string; fr: string; es: string; italian: string;
  pl: string; pt: string; ru: string; zh: string;
}> = [
  { word: 'cat',   de: 'Katze',     fr: 'chat',    es: 'gato',  italian: 'gatto',       pl: 'kot',       pt: 'gato',  ru: 'кошка',    zh: '猫'  },
  { word: 'dog',   de: 'Hund',      fr: 'chien',   es: 'perro', italian: 'cane',        pl: 'pies',      pt: 'cão',   ru: 'собака',   zh: '狗'  },
  { word: 'car',   de: 'Auto',      fr: 'voiture', es: 'coche', italian: 'automobile',  pl: 'samochód',  pt: 'carro', ru: 'машина',   zh: '车'  },
  { word: 'maize', de: 'Mais',      fr: 'maïs',    es: 'maíz',  italian: 'mais',        pl: 'kukurydza', pt: 'milho', ru: 'кукуруза', zh: '玉米' },
];

describe('PonsProvider — en → all', () => {
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

// ──────────────────────────────────────────────────────────────────────────────
// Section 2: All PONS languages → all others, using "cat" in each language
// ──────────────────────────────────────────────────────────────────────────────

// The word "cat" in each PONS-supported language and the expected translation
// for each target language
const CAT_WORD: Record<string, string> = {
  en: 'cat', de: 'Katze', fr: 'chat', es: 'gato',
  it: 'gatto', pl: 'kot', pt: 'gato', ru: 'кошка', zh: '猫',
};

const PONS_LANGS = Object.keys(CAT_WORD);

describe('PonsProvider — all → all (word: "cat")', () => {
  for (const src of PONS_LANGS) {
    const srcWord = CAT_WORD[src];
    const targets = PONS_LANGS.filter(l => l !== src);

    describe(`translate("${srcWord}", ${src} → *)`, () => {
      const results: Record<string, TranslateResult> = {};

      beforeAll(async () => {
        const translations = await Promise.all(
          targets.map(tgt => provider.translate(srcWord, src, tgt))
        );
        targets.forEach((tgt, i) => { results[tgt] = translations[i]; });
      }, 30000);

      for (const tgt of targets) {
        const expected = CAT_WORD[tgt];
        it(`${tgt} contains "${expected}"`, () => {
          const r = results[tgt];
          const all = [r.translatedText, ...(r.alternatives ?? [])].join(' ');
          expect(all).toContain(expected);
        });
      }
    });
  }
});
