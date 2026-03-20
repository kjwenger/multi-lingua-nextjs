/**
 * Integration tests for FreeDictionaryProvider — hits the real Free Dictionary API.
 * No API key required.
 *
 * Free Dictionary is an English dictionary: it returns English definitions,
 * not cross-language translations. Tests verify that a meaningful definition
 * is returned for each word.
 *
 * Run with:
 *   npm test
 */

import { FreeDictionaryProvider } from '../../lib/translation-providers/free-dictionary';

const provider = new FreeDictionaryProvider();

type TranslateResult = Awaited<ReturnType<typeof provider.translate>>;

// Words with a keyword that must appear somewhere in the definition or alternatives
const words: Array<{ word: string; contains: string }> = [
  { word: 'cat',   contains: 'animal'   },
  { word: 'dog',   contains: 'mammal'   },
  { word: 'car',   contains: 'vehicle'  },
  { word: 'maize', contains: 'corn'     },
];

describe('FreeDictionaryProvider — en definitions', () => {
  for (const { word, contains } of words) {
    describe(`translate("${word}", en → en)`, () => {
      let result: TranslateResult;

      beforeAll(async () => {
        result = await provider.translate(word, 'en', 'en');
      }, 20000);

      it('returns a non-empty definition', () => {
        expect(result.translatedText.length).toBeGreaterThan(0);
      });

      it(`definition contains "${contains}"`, () => {
        const all = [result.translatedText, ...(result.alternatives ?? [])].join(' ');
        expect(all.toLowerCase()).toContain(contains);
      });
    });
  }
});
