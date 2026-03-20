/**
 * Integration tests for OxfordProvider — hits the real Oxford Dictionaries API.
 * Requires OXFORD_APP_ID and OXFORD_APP_KEY env vars to be set.
 *
 * Oxford Dictionary is an English dictionary: it returns English definitions,
 * not cross-language translations. Tests verify that a meaningful definition
 * is returned for each word.
 *
 * Run with:
 *   OXFORD_APP_ID=<id> OXFORD_APP_KEY=<key> npm test
 */

import { OxfordProvider } from './oxford';

const appId = process.env.OXFORD_APP_ID;
const appKey = process.env.OXFORD_APP_KEY;

if (!appId) {
  throw new Error('OXFORD_APP_ID env var is required to run Oxford Dictionary integration tests');
}

if (!appKey) {
  throw new Error('OXFORD_APP_KEY env var is required to run Oxford Dictionary integration tests');
}

const provider = new OxfordProvider(appId, appKey);

type TranslateResult = Awaited<ReturnType<typeof provider.translate>>;

// Words with a keyword that must appear somewhere in the definition or alternatives
const words: Array<{ word: string; contains: string }> = [
  { word: 'cat',   contains: 'animal'   },
  { word: 'dog',   contains: 'animal'   },
  { word: 'car',   contains: 'vehicle'  },
  { word: 'maize', contains: 'corn'     },
];

describe('OxfordProvider — en definitions', () => {
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
