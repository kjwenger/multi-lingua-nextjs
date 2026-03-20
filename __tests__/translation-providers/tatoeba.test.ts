/**
 * Integration tests for TatoebaProvider — hits the real Tatoeba API.
 * No API key required.
 *
 * Tatoeba returns example sentences rather than word-for-word translations.
 * Tests verify that a non-empty sentence is returned for each word/language pair.
 * Supported languages: en, de, fr, it, es.
 *
 * Run with:
 *   npm test
 */

import { TatoebaProvider } from '../../lib/translation-providers/tatoeba';

const provider = new TatoebaProvider();

type TranslateResult = Awaited<ReturnType<typeof provider.translate>>;

// Tatoeba only supports en, de, fr, it, es (per LANG_MAP in tatoeba.ts)
const TATOEBA_LANGS = ['en', 'de', 'fr', 'it', 'es'] as const;

// The word "cat" in each supported Tatoeba language
const CAT_WORD: Record<string, string> = {
  en: 'cat', de: 'Katze', fr: 'chat', it: 'gatto', es: 'gato',
};

describe('TatoebaProvider — all → all (word: "cat")', () => {
  for (const src of TATOEBA_LANGS) {
    const srcWord = CAT_WORD[src];
    const targets = TATOEBA_LANGS.filter(l => l !== src);

    describe(`translate("${srcWord}", ${src} → *)`, () => {
      const results: Record<string, TranslateResult> = {};

      beforeAll(async () => {
        const translations = await Promise.all(
          targets.map(tgt => provider.translate(srcWord, src, tgt))
        );
        targets.forEach((tgt, i) => { results[tgt] = translations[i]; });
      }, 30000);

      for (const tgt of targets) {
        it(`${tgt} returns a non-empty sentence`, () => {
          const r = results[tgt];
          // Tatoeba may not always find a short enough example sentence, so we check
          // either translatedText or at least one alternative is non-empty.
          const any = r.translatedText || (r.alternatives ?? []).find(a => a.length > 0);
          expect(any).toBeTruthy();
        });
      }
    });
  }
});
