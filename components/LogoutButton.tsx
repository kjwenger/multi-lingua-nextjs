'use client';

import { useAuth } from '@/components/AuthProvider';

export function LogoutButton() {
  const { logout } = useAuth();

  return (
    <button
      onClick={logout}
      className="relative inline-flex items-center justify-center p-2 rounded-lg border transition-colors duration-200
                bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600
                hover:bg-gray-50 dark:hover:bg-gray-700
                text-gray-700 dark:text-gray-300"
      aria-label="Logout"
      title="Logout"
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
          d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
        />
      </svg>
    </button>
  );
}
