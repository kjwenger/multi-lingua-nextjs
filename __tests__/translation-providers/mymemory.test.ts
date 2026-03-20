/**
 * Integration tests for MyMemoryProvider — hits the real MyMemory API.
 * No API key required; MYMEMORY_EMAIL is optional (increases daily quota).
 *
 * Run with:
 *   npm test
 *   MYMEMORY_EMAIL=you@example.com npm test   # optional, raises quota
 */

import { MyMemoryProvider } from '../../lib/translation-providers/mymemory';

const provider = new MyMemoryProvider(process.env.MYMEMORY_EMAIL);

type TranslateResult = Awaited<ReturnType<typeof provider.translate>>;

function check(get: () => TranslateResult, expected: string, lang: string) {
  it(`${lang} contains "${expected}"`, () => {
    const r = get();
    const all = [r.translatedText, ...(r.alternatives ?? [])].join(' ');
    expect(all).toContain(expected);
  });
}

const words: Array<{ word: string; de: string; fr: string; es: string; italian: string }> = [
  { word: 'cat',   de: 'Katze',   fr: 'chat',     es: 'gato',     italian: 'gatto'      },
  { word: 'dog',   de: 'Hund',    fr: 'chien',    es: 'perro',    italian: 'cane'       },
  { word: 'car',   de: 'Auto',    fr: 'voiture',  es: 'vehículo', italian: 'macchina'   }, // MyMemory crowd translations
  { word: 'maize', de: 'Mais',    fr: 'maïs',     es: 'maíz',     italian: 'granturco'  }, // MyMemory uses granturco for Italian
];

describe('MyMemoryProvider — en → de/fr/es/it', () => {
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
