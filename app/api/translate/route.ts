import { NextRequest, NextResponse } from 'next/server';
import { getTranslationService } from '@/lib/translation-providers';
import { apiLogger } from '@/lib/logger';

export async function POST(request: NextRequest) {
  const requestTime = new Date().toISOString();
  try {
    const { text, sourceLanguage } = await request.json();
    const srcLang = sourceLanguage || 'en';

    apiLogger.info('========== REQUEST ==========');
    apiLogger.info(`Time: ${requestTime}`);
    apiLogger.info(`Text: "${text}"`);
    apiLogger.info(`Source language: ${srcLang}`);

    if (!text) {
      apiLogger.warn('Text is required');
      return NextResponse.json({ error: 'Text is required' }, { status: 400 });
    }

    const translationService = await getTranslationService();
    const activeProvider = translationService.getActiveProviderName();
    apiLogger.info(`Active provider: ${activeProvider}`);

    // If sourceLanguage is provided, translate from that language to all others
    if (sourceLanguage) {
      const translations = await translationService.translateFromLanguage(text, sourceLanguage);

      const response: any = { provider: activeProvider };
      apiLogger.info('========== RESPONSE ==========');
      if (translations.english) {
        response.english = {
          translation: translations.english.translatedText,
          alternatives: translations.english.alternatives || []
        };
        apiLogger.info(`english: "${translations.english.translatedText}" (${translations.english.alternatives?.length || 0} alternatives)`);
      }
      if (translations.german) {
        response.german = {
          translation: translations.german.translatedText,
          alternatives: translations.german.alternatives || []
        };
        apiLogger.info(`german: "${translations.german.translatedText}" (${translations.german.alternatives?.length || 0} alternatives)`);
      }
      if (translations.french) {
        response.french = {
          translation: translations.french.translatedText,
          alternatives: translations.french.alternatives || []
        };
        apiLogger.info(`french: "${translations.french.translatedText}" (${translations.french.alternatives?.length || 0} alternatives)`);
      }
      if (translations.italian) {
        response.italian = {
          translation: translations.italian.translatedText,
          alternatives: translations.italian.alternatives || []
        };
        apiLogger.info(`italian: "${translations.italian.translatedText}" (${translations.italian.alternatives?.length || 0} alternatives)`);
      }
      if (translations.spanish) {
        response.spanish = {
          translation: translations.spanish.translatedText,
          alternatives: translations.spanish.alternatives || []
        };
        apiLogger.info(`spanish: "${translations.spanish.translatedText}" (${translations.spanish.alternatives?.length || 0} alternatives)`);
      }
      apiLogger.info(`Provider: ${activeProvider}`);
      apiLogger.info('============================');

      return NextResponse.json(response);
    }

    // Default: translate from English to all other languages
    const translations = await translationService.translateFromLanguage(text, 'en');

    const response = {
      provider: activeProvider,
      german: {
        translation: translations.german?.translatedText || '',
        alternatives: translations.german?.alternatives || []
      },
      french: {
        translation: translations.french?.translatedText || '',
        alternatives: translations.french?.alternatives || []
      },
      italian: {
        translation: translations.italian?.translatedText || '',
        alternatives: translations.italian?.alternatives || []
      },
      spanish: {
        translation: translations.spanish?.translatedText || '',
        alternatives: translations.spanish?.alternatives || []
      }
    };

    apiLogger.info('========== RESPONSE ==========');
    apiLogger.info(`german: "${response.german.translation}" (${response.german.alternatives.length} alternatives)`);
    apiLogger.info(`french: "${response.french.translation}" (${response.french.alternatives.length} alternatives)`);
    apiLogger.info(`italian: "${response.italian.translation}" (${response.italian.alternatives.length} alternatives)`);
    apiLogger.info(`spanish: "${response.spanish.translation}" (${response.spanish.alternatives.length} alternatives)`);
    apiLogger.info(`Provider: ${activeProvider}`);
    apiLogger.info('============================');

    return NextResponse.json(response);
  } catch (error) {
    apiLogger.error('Translation failed', error);
    const translationService = await getTranslationService();
    const activeProvider = translationService.getActiveProviderName();
    return NextResponse.json({ 
      error: 'Translation failed',
      provider: activeProvider 
    }, { status: 500 });
  }
}
