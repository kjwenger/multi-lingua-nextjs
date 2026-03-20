/**
 * Integration tests for PonsProvider — hits the real PONS API.
 * Requires PONS_API_SECRET env var to be set.
 *
 * Run with:
 *   PONS_API_SECRET=<key> npm test
 */

import { PonsProvider } from '../../lib/translation-providers/pons';

const apiKey = process.env.PONS_API_SECRET;

if (!apiKey) {
  throw new Error('PONS_API_SECRET env var is required to run PONS integration tests');
}

const provider = new PonsProvider(apiKey);

type TranslateResult = Awaited<ReturnType<typeof provider.translate>>;

// Helper: registers an it() that resolves r via a getter so the value is read
// after beforeAll has run, not at describe-registration time.
function check(get: () => TranslateResult, expected: string, lang: string) {
  it(`${lang} contains "${expected}"`, () => {
    const r = get();
    const all = [r.translatedText, ...(r.alternatives ?? [])].join(' ');
    expect(all).toContain(expected);
  });
}

// ──────────────────────────────────────────────────────────────────────────────
// Section 1: English → DE, FR, ES, IT — four representative words
// ──────────────────────────────────────────────────────────────────────────────

const words: Array<{ word: string; de: string; fr: string; es: string; italian: string }> = [
  { word: 'cat',   de: 'Katze',   fr: 'chat',    es: 'gato',  italian: 'gatto'      },
  { word: 'dog',   de: 'Hund',    fr: 'chien',   es: 'perro', italian: 'cane'       },
  { word: 'car',   de: 'Auto',    fr: 'voiture', es: 'coche', italian: 'automobile' },
  { word: 'maize', de: 'Mais',    fr: 'maïs',    es: 'maíz',  italian: 'mais'       },
];

describe('PonsProvider — en → de/fr/es/it', () => {
  for (const { word, de, fr, es, italian } of words) {
    describe(`translate("${word}", en → *)`, () => {
      let rDE: TranslateResult, rFR: TranslateResult, rES: TranslateResult, rIT: TranslateResult;

      beforeAll(async () => {
        [rDE, rFR, rES, rIT] = await Promise.all([
          provider.translate(word, 'en', 'de'),
          provider.translate(word, 'en', 'fr'),
          provider.translate(word, 'en', 'es'),
          provider.translate(word, 'en', 'it'),
        ]);
      }, 20000);

      check(() => rDE, de, 'German');
      check(() => rFR, fr, 'French');
      check(() => rES, es, 'Spanish');
      check(() => rIT, italian, 'Italian');
    });
  }
});

// ──────────────────────────────────────────────────────────────────────────────
// Section 2: All five languages → all others, using "cat" in each language
// ──────────────────────────────────────────────────────────────────────────────

const LANGS: Array<{ code: string; cat: string }> = [
  { code: 'en', cat: 'cat'   },
  { code: 'de', cat: 'Katze' },
  { code: 'fr', cat: 'chat'  },
  { code: 'es', cat: 'gato'  },
  { code: 'it', cat: 'gatto' },
];

describe('PonsProvider — all → all (word: "cat")', () => {
  for (const { code: src, cat: srcWord } of LANGS) {
    const targets = LANGS.filter(l => l.code !== src);

    describe(`translate("${srcWord}", ${src} → *)`, () => {
      const results: Record<string, TranslateResult> = {};

      beforeAll(async () => {
        const translations = await Promise.all(
          targets.map(({ code }) => provider.translate(srcWord, src, code))
        );
        targets.forEach(({ code }, i) => { results[code] = translations[i]; });
      }, 20000);

      for (const { code: tgt, cat: expected } of targets) {
        it(`${tgt} contains "${expected}"`, () => {
          const r = results[tgt];
          const all = [r.translatedText, ...(r.alternatives ?? [])].join(' ');
          expect(all).toContain(expected);
        });
      }
    });
  }
});
