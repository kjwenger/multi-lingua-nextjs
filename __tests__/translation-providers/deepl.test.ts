/**
 * Integration tests for DeepLProvider — hits the real DeepL API.
 * Requires DEEPL_API_KEY env var to be set.
 *
 * Run with:
 *   DEEPL_API_KEY=<key> npm test
 */

import { DeepLProvider } from '../../lib/translation-providers/deepl';

const apiKey = process.env.DEEPL_API_KEY;

if (!apiKey) {
  throw new Error('DEEPL_API_KEY env var is required to run DeepL integration tests');
}

const provider = new DeepLProvider(apiKey);

type TranslateResult = Awaited<ReturnType<typeof provider.translate>>;

function check(get: () => TranslateResult, expected: string, lang: string) {
  it(`${lang} contains "${expected}"`, () => {
    const r = get();
    const all = [r.translatedText, ...(r.alternatives ?? [])].join(' ').toLowerCase();
    expect(all).toContain(expected.toLowerCase());
  });
}

// Note: DeepL free tier returns "cat" unchanged for en→es (known quirk),
// so "book" is used instead as the first test word.
const words: Array<{ word: string; de: string; fr: string; es: string; italian: string }> = [
  { word: 'book',  de: 'Buch',    fr: 'livre',   es: 'libro', italian: 'libro' },
  { word: 'dog',   de: 'Hund',    fr: 'chien',   es: 'perro', italian: 'cane'  },
  { word: 'car',   de: 'Auto',    fr: 'voiture', es: 'coche', italian: 'auto'  }, // DeepL returns "auto" for Italian
  { word: 'maize', de: 'Mais',    fr: 'maïs',    es: 'maíz',  italian: 'mais'  },
];

describe('DeepLProvider — en → de/fr/es/it', () => {
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
