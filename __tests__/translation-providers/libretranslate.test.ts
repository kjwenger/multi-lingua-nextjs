/**
 * Integration tests for LibreTranslateProvider — hits a real LibreTranslate instance.
 * Requires LIBRETRANSLATE_URL env var to be set (e.g. http://localhost:5000).
 * LIBRETRANSLATE_API_KEY is optional.
 *
 * Run with:
 *   LIBRETRANSLATE_URL=http://localhost:5000 npm test
 */

import { LibreTranslateProvider } from '../../lib/translation-providers/libretranslate';

const apiUrl = process.env.LIBRETRANSLATE_URL;
const apiKey = process.env.LIBRETRANSLATE_API_KEY;

if (!apiUrl) {
  throw new Error('LIBRETRANSLATE_URL env var is required to run LibreTranslate integration tests');
}

const provider = new LibreTranslateProvider(apiUrl, apiKey);

type TranslateResult = Awaited<ReturnType<typeof provider.translate>>;

function check(get: () => TranslateResult, expected: string, lang: string) {
  it(`${lang} contains "${expected}"`, () => {
    const r = get();
    const all = [r.translatedText, ...(r.alternatives ?? [])].join(' ');
    expect(all).toContain(expected);
  });
}

const words: Array<{ word: string; de: string; fr: string; es: string; italian: string }> = [
  { word: 'cat',   de: 'Katze',   fr: 'chat',    es: 'gato',  italian: 'gatto'      },
  { word: 'dog',   de: 'Hund',    fr: 'chien',   es: 'perro', italian: 'cane'       },
  { word: 'car',   de: 'Auto',    fr: 'voiture', es: 'coche', italian: 'automobile' },
  { word: 'maize', de: 'Mais',    fr: 'maïs',    es: 'maíz',  italian: 'mais'       },
];

describe('LibreTranslateProvider — en → de/fr/es/it', () => {
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
