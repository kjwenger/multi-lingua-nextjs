'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ThemeToggle } from '@/components/ThemeToggle';
import { SettingsButton } from '@/components/SettingsButton';
import { ApiDocsButton } from '@/components/ApiDocsButton';
import { HelpButton } from '@/components/HelpButton';
import { UserManagementButton } from '@/components/UserManagementButton';
import { LogoutButton } from '@/components/LogoutButton';
import { useAuth } from '@/components/AuthProvider';

interface Category {
  id: number;
  name: string;
  created_at: string;
  translation_count: number;
}

export default function CategoriesPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [addError, setAddError] = useState<string | null>(null);

  // Redirect to landing if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/landing');
    }
  }, [authLoading, user, router]);

  // Detect mobile viewport
  useEffect(() => {
    const mql = window.matchMedia('(max-width: 767px)');
    const handleChange = (e: MediaQueryListEvent | MediaQueryList) => {
      setIsMobile(e.matches);
    };
    handleChange(mql);
    mql.addEventListener('change', handleChange);
    return () => mql.removeEventListener('change', handleChange);
  }, []);

  useEffect(() => {
    if (user) {
      fetchCategories();
    }
  }, [user]);

  const fetchCategories = async () => {
    try {
      setError(null);
      const res = await fetch('/api/categories', { credentials: 'include' });
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      setCategories(await res.json());
    } catch (err) {
      setError('Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) return;
    setAddError(null);
    try {
      const res = await fetch('/api/categories', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newCategoryName.trim() }),
      });
      if (res.status === 409) {
        setAddError('Category already exists');
        return;
      }
      if (!res.ok) {
        setAddError('Failed to add category');
        return;
      }
      setNewCategoryName('');
      setIsAdding(false);
      fetchCategories();
    } catch {
      setAddError('Failed to add category');
    }
  };

  const handleDeleteCategory = async (id: number) => {
    if (!confirm('Delete this category? Translations in this category will become uncategorized.')) return;
    try {
      const res = await fetch(`/api/categories?id=${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (res.ok) {
        setCategories(prev => prev.filter(c => c.id !== id));
      }
    } catch {
      // ignore
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleAddCategory();
    if (e.key === 'Escape') { setIsAdding(false); setNewCategoryName(''); setAddError(null); }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center transition-colors duration-200">
        <div className="text-center">
          <div className="text-xl text-gray-900 dark:text-gray-100 mb-4">Loading...</div>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      <div className="w-full max-w-none mx-auto">
        <div className="bg-white dark:bg-gray-800 shadow-xl transition-colors duration-200">
          {/* Toolbar */}
          <div className="px-2 py-2 border-b border-gray-200 dark:border-gray-700">
            {isMobile ? (
              <div className="space-y-2">
                <div className="flex items-center flex-wrap gap-1">
                  <HelpButton />
                  {user?.role === 'admin' && <ApiDocsButton />}
                  {user?.role === 'admin' && <SettingsButton />}
                  {user?.role === 'admin' && <UserManagementButton />}
                  {user?.role === 'admin' && <ThemeToggle />}
                  {user && <LogoutButton />}
                  {user && (
                    <button
                      onClick={() => { setIsAdding(true); setAddError(null); }}
                      className="relative inline-flex items-center justify-center p-2 rounded-lg border transition-colors duration-200
                                bg-blue-600 dark:bg-blue-500 border-blue-600 dark:border-blue-500
                                hover:bg-blue-700 dark:hover:bg-blue-600
                                text-white"
                      aria-label="Add new category"
                      title="Add new category"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <HelpButton />
                {user?.role === 'admin' && <ApiDocsButton />}
                {user?.role === 'admin' && <SettingsButton />}
                {user?.role === 'admin' && <UserManagementButton />}
                {user?.role === 'admin' && <ThemeToggle />}
                {user && <LogoutButton />}
                {user && (
                  <button
                    onClick={() => { setIsAdding(true); setAddError(null); }}
                    className="relative inline-flex items-center justify-center p-2 rounded-lg border transition-colors duration-200
                              bg-blue-600 dark:bg-blue-500 border-blue-600 dark:border-blue-500
                              hover:bg-blue-700 dark:hover:bg-blue-600
                              text-white"
                    aria-label="Add new category"
                    title="Add new category"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Inline add form */}
          {isAdding && (
            <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Category name"
                  autoFocus
                  className="flex-1 px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                />
                <button
                  onClick={handleAddCategory}
                  className="px-3 py-1.5 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
                >
                  Add
                </button>
                <button
                  onClick={() => { setIsAdding(false); setNewCategoryName(''); setAddError(null); }}
                  className="px-3 py-1.5 text-sm bg-gray-200 hover:bg-gray-300 dark:bg-gray-600 dark:hover:bg-gray-500 text-gray-700 dark:text-gray-200 rounded transition-colors"
                >
                  Cancel
                </button>
              </div>
              {addError && (
                <p className="mt-1 text-xs text-red-600 dark:text-red-400">{addError}</p>
              )}
            </div>
          )}

          {/* Error state */}
          {error && (
            <div className="px-4 py-3 text-red-600 dark:text-red-400 text-sm">{error}</div>
          )}

          {/* Categories list */}
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {/* Static Uncategorized row */}
            <div className="flex items-center px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200">
              <Link
                href="/translations?category=__uncategorized__"
                className="flex-1 text-sm text-gray-900 dark:text-gray-100 hover:text-blue-600 dark:hover:text-blue-400"
              >
                Uncategorized
              </Link>
            </div>

            {/* DB categories */}
            {categories.map((category) => (
              <div key={category.id} className="flex items-center px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200">
                <Link
                  href={`/translations?category=${encodeURIComponent(category.name)}`}
                  className="flex-1 text-sm text-gray-900 dark:text-gray-100 hover:text-blue-600 dark:hover:text-blue-400"
                >
                  {category.name}
                </Link>
                {user?.role === 'admin' && (
                  <button
                    onClick={() => handleDeleteCategory(category.id)}
                    disabled={category.translation_count > 0}
                    className="p-1 transition-colors disabled:opacity-40 disabled:cursor-not-allowed text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 disabled:hover:text-red-600 dark:disabled:hover:text-red-400"
                    title={category.translation_count > 0 ? `Cannot delete: ${category.translation_count} translation${category.translation_count === 1 ? '' : 's'} assigned` : 'Delete category'}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                )}
              </div>
            ))}

            {categories.length === 0 && (
              <div className="px-4 py-8 text-center text-gray-500 dark:text-gray-400 text-sm">
                No categories yet. Add your first one!
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
