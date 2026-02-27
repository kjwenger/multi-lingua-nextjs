'use client';

import Link from 'next/link';

export function ApiDocsButton() {
  return (
    <Link
      href="/api-docs"
      className="relative inline-flex items-center justify-center p-2 rounded-lg border transition-colors duration-200
                bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600
                hover:bg-gray-50 dark:hover:bg-gray-700
                text-gray-700 dark:text-gray-300"
      aria-label="API Documentation"
      title="API Documentation"
    >
      <svg
        className="w-5 h-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
        />
      </svg>
    </Link>
  );
}
