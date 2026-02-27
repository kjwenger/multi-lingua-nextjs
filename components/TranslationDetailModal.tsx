'use client';

import { useEffect } from 'react';

interface Translation {
  id: number;
  user_id: number | null;
  english: string;
  german: string;
  french: string;
  italian: string;
  spanish: string;
  english_proposals: string;
  german_proposals: string;
  french_proposals: string;
  italian_proposals: string;
  spanish_proposals: string;
}

interface TranslationDetailModalProps {
  translation: Translation;
  onClose: () => void;
  onChange: (field: string, value: string) => void;
  onTranslate: (language: 'english' | 'german' | 'french' | 'italian' | 'spanish') => void;
  onTTS: (language: 'english' | 'german' | 'french' | 'italian' | 'spanish', text: string) => void;
  translating: boolean;
  ttsPlaying: { [key: string]: boolean };
  getProposals: (proposalsJson: string) => string[];
}

const languageConfig = {
  english: { flag: '🇬🇧', label: 'English' },
  german: { flag: '🇩🇪', label: 'German' },
  french: { flag: '🇫🇷', label: 'French' },
  italian: { flag: '🇮🇹', label: 'Italian' },
  spanish: { flag: '🇪🇸', label: 'Spanish' },
};

export function TranslationDetailModal({
  translation,
  onClose,
  onChange,
  onTranslate,
  onTTS,
  translating,
  ttsPlaying,
  getProposals,
}: TranslationDetailModalProps) {
  const languages: (keyof typeof languageConfig)[] = ['english', 'german', 'french', 'italian', 'spanish'];

  // Handle Android/browser back button
  useEffect(() => {
    history.pushState({ detail: true }, '');
    const handlePopState = () => onClose();
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [onClose]);

  return (
    <div className="fixed top-0 left-0 right-0 bottom-0 z-50 bg-white dark:bg-gray-800 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-center p-3 border-b border-gray-200 dark:border-gray-700 gap-3">
        <button
          onClick={() => { history.back(); }}
          className="p-1 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">Edit Translation</h2>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden">
        {languages.map((lang) => {
          const config = languageConfig[lang];
          const proposals = getProposals(translation[`${lang}_proposals` as keyof Translation] as string);

          return (
            <div key={lang} className="px-2 py-1 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-start gap-1">
                <span className="pt-1 text-base flex-shrink-0">{config.flag}</span>
                <textarea
                  value={translation[lang]}
                  onChange={(e) => onChange(lang, e.target.value)}
                  className="w-0 grow p-1 text-sm border border-gray-300 dark:border-gray-600 rounded focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-400 dark:focus:border-blue-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 resize-y"
                  rows={2}
                  cols={1}
                  placeholder={`${config.label}`}
                />
                <div className="flex flex-col gap-0.5 flex-shrink-0">
                  <button
                    onClick={() => onTranslate(lang)}
                    disabled={!translation[lang]?.trim() || translating}
                    className="p-1 text-gray-600 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 disabled:text-gray-300 disabled:cursor-not-allowed transition-colors duration-200"
                    title={`Translate from ${config.label}`}
                  >
                    {translating ? (
                      <div className="animate-spin w-4 h-4 border-2 border-current border-t-transparent rounded-full"></div>
                    ) : (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                      </svg>
                    )}
                  </button>
                  <button
                    onClick={() => onTTS(lang, translation[lang])}
                    disabled={!translation[lang]?.trim() || ttsPlaying[`${translation.id}-${lang}`]}
                    className="p-1 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 disabled:text-gray-300 disabled:cursor-not-allowed transition-colors duration-200"
                    title={`Play ${config.label} audio`}
                  >
                    {ttsPlaying[`${translation.id}-${lang}`] ? (
                      <div className="animate-spin w-4 h-4 border-2 border-current border-t-transparent rounded-full"></div>
                    ) : (
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.617.776l-4.146-3.117H2a1 1 0 01-1-1V7.24a1 1 0 011-1h2.237l4.146-3.116a1 1 0 011.617.776zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.415 0A5.983 5.983 0 0115 10a5.983 5.983 0 01-1.757 4.243 1 1 0 01-1.415-1.415A3.984 3.984 0 0013 10a3.984 3.984 0 00-1.172-2.828 1 1 0 010-1.415z" clipRule="evenodd"/>
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {/* Proposals */}
              {proposals.length > 0 && (
                <div className="text-xs text-gray-600 dark:text-gray-400 ml-6 mt-1">
                  <strong>Suggestions:</strong>
                  <ul className="list-disc list-inside mt-0.5 space-y-0.5">
                    {proposals.slice(0, 5).map((proposal, idx) => (
                      <li
                        key={idx}
                        className="cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                        onClick={() => onChange(lang, proposal)}
                      >
                        {proposal}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          );
        })}
      </div>

    </div>
  );
}
