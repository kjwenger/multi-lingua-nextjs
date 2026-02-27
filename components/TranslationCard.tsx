'use client';

interface TranslationCardProps {
  translation: {
    id: number;
    english: string;
    german: string;
    french: string;
    italian: string;
    spanish: string;
  };
  onClick: () => void;
  onDelete: () => void;
  onShare?: () => void;
  isShared: boolean;
  canDelete: boolean;
  canShare: boolean;
}

const languageFlags = {
  english: '🇬🇧',
  german: '🇩🇪',
  french: '🇫🇷',
  italian: '🇮🇹',
  spanish: '🇪🇸',
};

export function TranslationCard({
  translation,
  onClick,
  onDelete,
  onShare,
  isShared,
  canDelete,
  canShare,
}: TranslationCardProps) {
  const languages: (keyof typeof languageFlags)[] = ['english', 'german', 'french', 'italian', 'spanish'];
  
  const allTexts = languages
    .map((lang) => {
      const text = translation[lang];
      if (!text?.trim()) return null;
      return `${languageFlags[lang]}\u00A0${text}`;
    })
    .filter(Boolean)
    .join(' ');
  
  return (
    <div
      className="px-2 py-1 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200 flex gap-2 border-b border-gray-200 dark:border-gray-700"
      onClick={onClick}
    >
      <p className="flex-1 min-w-0 text-sm text-gray-900 dark:text-gray-100 break-words leading-relaxed">
        {allTexts || <span className="text-gray-400 dark:text-gray-500 italic">Empty translation</span>}
      </p>

      {(canDelete || (canShare && onShare)) && (
        <div className="flex flex-col flex-shrink-0">
          {canDelete && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (confirm('Delete this translation?')) {
                  onDelete();
                }
              }}
              className="p-1 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 transition-colors"
              title="Delete"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          )}
          {canShare && onShare && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onShare();
              }}
              className={`p-1 transition-colors ${
                isShared
                  ? 'text-green-600 dark:text-green-400'
                  : 'text-gray-500 dark:text-gray-400'
              }`}
              title={isShared ? 'Shared' : 'Private'}
            >
              {isShared ? (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              )}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
