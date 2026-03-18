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

// Words that must produce a non-empty translation in all four target languages
const words: Array<{ word: string; expectedDE: string; expectedFR: string; expectedIT: string; expectedES: string }> = [
  { word: 'cat',   expectedDE: 'Katze', expectedFR: 'chat',  expectedIT: 'gatto', expectedES: 'gato'  },
  { word: 'dog',   expectedDE: 'Hund',  expectedFR: 'chien', expectedIT: 'cane',  expectedES: 'perro' },
  { word: 'car',   expectedDE: 'Auto',  expectedFR: 'voiture', expectedIT: 'automobile', expectedES: 'coche' },
  { word: 'maize', expectedDE: 'Mais',  expectedFR: 'maïs',  expectedIT: 'mais',  expectedES: 'maíz'  },
];

describe('PonsProvider', () => {
  for (const { word, expectedDE, expectedFR, expectedIT, expectedES } of words) {
    describe(`translate("${word}", en → *)`, () => {
      let de: Awaited<ReturnType<typeof provider.translate>>;
      let fr: Awaited<ReturnType<typeof provider.translate>>;
      let italian: Awaited<ReturnType<typeof provider.translate>>;
      let es: Awaited<ReturnType<typeof provider.translate>>;

      beforeAll(async () => {
        [de, fr, italian, es] = await Promise.all([
          provider.translate(word, 'en', 'de'),
          provider.translate(word, 'en', 'fr'),
          provider.translate(word, 'en', 'it'),
          provider.translate(word, 'en', 'es'),
        ]);
      }, 20000);

      it(`German contains "${expectedDE}"`, () => {
        const all = [de.translatedText, ...(de.alternatives ?? [])].join(' ');
        expect(all).toContain(expectedDE);
      });

      it(`French contains "${expectedFR}"`, () => {
        const all = [fr.translatedText, ...(fr.alternatives ?? [])].join(' ');
        expect(all).toContain(expectedFR);
      });

      it(`Italian contains "${expectedIT}"`, () => {
        const all = [italian.translatedText, ...(italian.alternatives ?? [])].join(' ');
        expect(all).toContain(expectedIT);
      });

      it(`Spanish contains "${expectedES}"`, () => {
        const all = [es.translatedText, ...(es.alternatives ?? [])].join(' ');
        expect(all).toContain(expectedES);
      });
    });
  }
});
