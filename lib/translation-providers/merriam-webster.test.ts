/**
 * Integration tests for MerriamWebsterProvider — hits the real Merriam-Webster API.
 * Requires MERRIAM_WEBSTER_API_KEY env var to be set.
 *
 * Merriam-Webster is an English dictionary: it returns English definitions,
 * not cross-language translations. Tests verify that a meaningful definition
 * is returned for each word.
 *
 * Run with:
 *   MERRIAM_WEBSTER_API_KEY=<key> npm test
 */

import { MerriamWebsterProvider } from './merriam-webster';

const apiKey = process.env.MERRIAM_WEBSTER_API_KEY;

if (!apiKey) {
  throw new Error('MERRIAM_WEBSTER_API_KEY env var is required to run Merriam-Webster integration tests');
}

const provider = new MerriamWebsterProvider(apiKey);

type TranslateResult = Awaited<ReturnType<typeof provider.translate>>;

// Words with a keyword that must appear somewhere in the definition or alternatives
const words: Array<{ word: string; contains: string }> = [
  { word: 'cat',   contains: 'animal'   },
  { word: 'dog',   contains: 'animal'   },
  { word: 'car',   contains: 'vehicle'  },
  { word: 'maize', contains: 'corn'     },
];

describe('MerriamWebsterProvider — en definitions', () => {
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
