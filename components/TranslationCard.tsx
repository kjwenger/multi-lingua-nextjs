'use client';

import { useState } from 'react';

interface Category {
  id: number;
  name: string;
}

interface TranslationCardProps {
  translation: {
    id: number;
    english: string;
    german: string;
    french: string;
    italian: string;
    spanish: string;
    category_id: number | null;
  };
  onClick: () => void;
  onDelete: () => void;
  onShare?: () => void;
  isShared: boolean;
  canDelete: boolean;
  canShare: boolean;
  onCategoryChange?: (categoryId: number | null) => void;
  categories?: Category[];
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
  onCategoryChange,
  categories = [],
}: TranslationCardProps) {
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);

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

      {(canDelete || (canShare && onShare) || onCategoryChange) && (
        <div className="flex flex-col flex-shrink-0">
          {onCategoryChange && (
            <div className="relative">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowCategoryDropdown(prev => !prev);
                }}
                className="p-1 text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                title="Set category"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A2 2 0 013 12V7a4 4 0 014-4z" />
                </svg>
              </button>
              {showCategoryDropdown && (
                <div
                  className="absolute right-0 top-full mt-1 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded shadow-lg z-50"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    className="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2"
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowCategoryDropdown(false);
                      onCategoryChange(null);
                    }}
                  >
                    {translation.category_id === null && (
                      <svg className="w-3 h-3 text-blue-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                    {translation.category_id !== null && <span className="w-3 flex-shrink-0" />}
                    Uncategorized
                  </button>
                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      className="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2"
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowCategoryDropdown(false);
                        onCategoryChange(cat.id);
                      }}
                    >
                      {translation.category_id === cat.id && (
                        <svg className="w-3 h-3 text-blue-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                      {translation.category_id !== cat.id && <span className="w-3 flex-shrink-0" />}
                      {cat.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
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
