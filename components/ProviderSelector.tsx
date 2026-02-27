'use client';

import { useState, useEffect } from 'react';

const PROVIDERS = [
  { id: 'libretranslate', name: 'LibreTranslate' },
  { id: 'mymemory', name: 'MyMemory' },
  { id: 'google', name: 'Google' },
  { id: 'deepl', name: 'DeepL' },
  { id: 'azure', name: 'Azure' },
  { id: 'pons', name: 'PONS' },
  // { id: 'merriam-webster', name: 'Merriam-Webster' },
  // { id: 'free-dictionary', name: 'Free Dictionary' },
  // { id: 'oxford', name: 'Oxford' },
  { id: 'tatoeba', name: 'Tatoeba' },
];

const ProviderIcon = ({ id }: { id: string }) => {
  switch (id) {
    case 'deepl':
      // Exact DeepL logo (geometric hexagon with constellation dots)
      return (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
          <path fillRule="evenodd" clipRule="evenodd" d="M12.7633 0.175767L20.9807 5.00185C21.4051 5.24858 21.6329 5.68167 21.6329 6.17577V15.6975C21.6329 16.191 21.4051 16.6247 20.9807 16.8714L15.7633 19.8714C15.5843 19.9989 15.5025 20.2961 15.5025 20.5236V24.0453C12.0392 22.0344 8.57249 20.0297 5.10572 18.0249C4.44086 17.6404 3.776 17.2559 3.11116 16.8714C2.6868 16.6247 2.45898 16.1916 2.45898 15.6975V6.17577C2.45898 5.69577 2.6868 5.24858 3.11116 5.00185L11.3285 0.175767C11.7529 -0.0709589 12.339 -0.0709589 12.7633 0.175767ZM11.1414 7.80829C11.1786 7.68722 11.1985 7.55865 11.1985 7.42542C11.1985 6.70505 10.6146 6.12107 9.89419 6.12107C9.17382 6.12107 8.58984 6.70505 8.58984 7.42542C8.58984 8.14579 9.17382 8.72976 9.89419 8.72976C10.2461 8.72976 10.5654 8.59044 10.8 8.36394L14.3858 10.5643C14.3487 10.6854 14.3288 10.8139 14.3288 10.9471C14.3288 11.6675 14.9127 12.2514 15.6331 12.2514C16.3535 12.2514 16.9375 11.6675 16.9375 10.9471C16.9375 10.2267 16.3535 9.64275 15.6331 9.64275C15.2812 9.64275 14.9618 9.78211 14.7272 10.0087L11.1414 7.80829ZM9.894 15.7732C10.6144 15.7732 11.1983 15.1892 11.1983 14.4689C11.1983 14.3357 11.1784 14.2071 11.1413 14.0861L14.464 12.0471L13.8406 11.6645L10.7999 13.5304C10.5652 13.3039 10.2459 13.1645 9.894 13.1645C9.17362 13.1645 8.58965 13.7485 8.58965 14.4689C8.58965 15.1892 9.17362 15.7732 9.894 15.7732Z" />
        </svg>
      );
    case 'mymemory':
      // Exact MyMemory logo (circle with curly braces)
      return (
        <svg className="w-5 h-5" viewBox="0 0 60 60" fill="currentColor">
          <path d="M30 4.234C35.096 4.234 40.078 5.745 44.315 8.577C48.552 11.408 51.854 15.432 53.804 20.14C55.755 24.848 56.265 30.029 55.271 35.027C54.277 40.025 51.823 44.616 48.219 48.219C44.616 51.823 40.025 54.276 35.027 55.271C30.029 56.265 24.848 55.755 20.14 53.804C15.432 51.854 11.408 48.552 8.577 44.315C5.745 40.078 4.234 35.096 4.234 30C4.242 23.169 6.959 16.62 11.79 11.79C16.62 6.959 23.169 4.242 30 4.234ZM30 0C24.067 0 18.266 1.759 13.333 5.056C8.399 8.352 4.554 13.038 2.284 18.52C0.013 24.001-0.581 30.033 0.576 35.853C1.734 41.672 4.591 47.018 8.787 51.213C12.982 55.409 18.328 58.266 24.147 59.424C29.967 60.581 35.999 59.987 41.481 57.716C46.962 55.446 51.648 51.601 54.944 46.667C58.241 41.734 60 35.933 60 30C60 22.044 56.839 14.413 51.213 8.787C45.587 3.161 37.957 0 30 0Z" />
          <path d="M25.221 42.947V39.916H23.768C21.968 39.916 21.337 38.842 21.337 37.168V34.547C21.337 32.305 20.421 30.6 18.337 29.905C20.421 29.179 21.337 27.505 21.337 25.232V22.642C21.337 20.968 21.968 19.895 23.768 19.895H25.221V16.863H22.568C19.442 16.863 17.295 18.726 17.295 22.105V25.99C17.295 27.347 16.853 28.39 15.116 28.39H13.6V31.421H15.116C16.853 31.421 17.295 32.463 17.295 33.821V37.705C17.295 41.084 19.442 42.947 22.568 42.947H25.221Z" />
          <path d="M45.91 31.421V28.39H44.426C42.689 28.39 42.216 27.379 42.216 25.99V22.105C42.216 18.726 40.1 16.863 36.973 16.863H34.289V19.895H35.742C37.573 19.895 38.173 20.968 38.173 22.642V25.263C38.173 27.505 39.121 29.211 41.173 29.905C39.121 30.632 38.173 32.305 38.173 34.579V37.168C38.173 38.842 37.573 39.916 35.742 39.916H34.289V42.947H36.973C40.1 42.947 42.216 41.084 42.216 37.705V33.821C42.216 32.463 42.689 31.421 44.426 31.421H45.91Z" />
        </svg>
      );
    case 'google':
      // Google "G" icon
      return (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12.545 10.239v3.821h5.445c-.712 2.315-2.647 3.972-5.445 3.972a6.033 6.033 0 110-12.064c1.498 0 2.866.549 3.921 1.453l2.814-2.814A9.969 9.969 0 0012.545 2C7.021 2 2.543 6.477 2.543 12s4.478 10 10.002 10c8.396 0 10.249-7.85 9.426-11.748l-9.426-.013z" />
        </svg>
      );
    case 'libretranslate':
      // Globe icon (LibreTranslate = open-source translation, logo is 众L)
      return (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" />
        </svg>
      );
    case 'azure':
      // Cloud icon (Azure cloud service)
      return (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
          <path d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96z" />
        </svg>
      );
    case 'pons':
      // Book with bookmark (PONS dictionary)
      return (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
          <path d="M18 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM6 4h5v8l-2.5-1.5L6 12V4z" />
        </svg>
      );
    case 'free-dictionary':
      // Open book icon
      return (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
          <path d="M21 5c-1.11-.35-2.33-.5-3.5-.5-1.95 0-4.05.4-5.5 1.5-1.45-1.1-3.55-1.5-5.5-1.5S2.45 4.9 1 6v14.65c0 .25.25.5.5.5.1 0 .15-.05.25-.05C3.1 20.45 5.05 20 6.5 20c1.95 0 4.05.4 5.5 1.5 1.35-.85 3.8-1.5 5.5-1.5 1.65 0 3.35.3 4.75 1.05.1.05.15.05.25.05.25 0 .5-.25.5-.5V6c-.6-.45-1.25-.75-2-1zm0 13.5c-1.1-.35-2.3-.5-3.5-.5-1.7 0-4.15.65-5.5 1.5V8c1.35-.85 3.8-1.5 5.5-1.5 1.2 0 2.4.15 3.5.5v11.5z" />
        </svg>
      );
    case 'tatoeba':
      // Tatoeba logo: network of connected circles (constellation graph)
      return (
        <svg className="w-5 h-5" viewBox="0 0 72 72" fill="currentColor" stroke="currentColor" strokeWidth="0.8" strokeOpacity="0.5">
          <line x1="33" y1="39" x2="22" y2="21.6" />
          <line x1="22" y1="21.6" x2="19.4" y2="7" />
          <line x1="22" y1="21.6" x2="35.7" y2="7" />
          <line x1="33" y1="39" x2="47" y2="20.3" />
          <line x1="33" y1="39" x2="60.4" y2="33.4" />
          <line x1="60.4" y1="33.4" x2="65.4" y2="18.2" />
          <line x1="33" y1="39" x2="59.7" y2="56.5" />
          <line x1="33" y1="39" x2="41.8" y2="54.6" />
          <line x1="33" y1="39" x2="32.7" y2="63.2" />
          <line x1="33" y1="39" x2="12.3" y2="41.5" />
          <line x1="12.3" y1="41.5" x2="18.7" y2="59.5" />
          <line x1="12.3" y1="41.5" x2="6.8" y2="55.2" />
          <circle cx="33" cy="39" r="8.2" stroke="none" />
          <circle cx="22" cy="21.6" r="7.5" stroke="none" />
          <circle cx="12.3" cy="41.5" r="6.7" stroke="none" />
          <circle cx="6.8" cy="55.2" r="4.2" stroke="none" />
          <circle cx="18.7" cy="59.5" r="5.4" stroke="none" />
          <circle cx="32.7" cy="63.2" r="5.8" stroke="none" />
          <circle cx="41.8" cy="54.6" r="4" stroke="none" />
          <circle cx="19.4" cy="7" r="4.7" stroke="none" />
          <circle cx="35.7" cy="7" r="4.8" stroke="none" />
          <circle cx="60.4" cy="33.4" r="6.8" stroke="none" />
          <circle cx="65.4" cy="18.2" r="4.5" stroke="none" />
          <circle cx="59.7" cy="56.5" r="10" stroke="none" />
          <circle cx="47" cy="20.3" r="9.7" stroke="none" />
        </svg>
      );
    default:
      return null;
  }
};

export function ProviderSelector() {
  const [activeProvider, setActiveProvider] = useState<string>('');
  const [allProviders, setAllProviders] = useState<any[]>([]);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    fetchProviders();
  }, []);

  const fetchProviders = async () => {
    try {
      const response = await fetch('/api/providers');
      const data = await response.json();
      setAllProviders(data.providers || []);
      
      // Find the enabled provider
      const enabledProvider = data.providers?.find((p: any) => p.enabled === 1 || p.enabled === true);
      if (enabledProvider) {
        setActiveProvider(enabledProvider.type);
      }
    } catch (error) {
      console.error('Error fetching providers:', error);
    }
  };

  const handleProviderChange = async (providerId: string) => {
    if (isUpdating || providerId === activeProvider) return;
    
    console.log(`[ProviderSelector] Toggling to provider: ${providerId}`);
    setIsUpdating(true);
    setActiveProvider(providerId);
    
    try {
      // Disable all providers first (SEQUENTIALLY like SettingsContent)
      for (const p of PROVIDERS) {
        if (p.id !== providerId) {
          const provider = allProviders.find(ap => ap.type === p.id) || {};
          console.log(`[ProviderSelector] Disabling provider: ${p.id}`);
          await saveProvider(p.id, { ...provider, enabled: false });
        }
      }
      
      // Enable the selected provider
      const provider = allProviders.find(p => p.type === providerId) || {};
      console.log(`[ProviderSelector] Enabling provider: ${providerId}`, provider);
      await saveProvider(providerId, { ...provider, enabled: true });
      
      // Refresh providers from database to sync UI
      console.log(`[ProviderSelector] Refreshing providers from DB`);
      await fetchProviders();
      
      console.log(`[ProviderSelector] Provider ${providerId} is now active`);
    } catch (error) {
      console.error('[ProviderSelector] Error updating provider:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const saveProvider = async (type: string, config: any) => {
    // Map frontend config keys to backend API keys (same as SettingsContent)
    const payload = {
      type,
      enabled: config.enabled,
      apiKey: config.api_key,
      apiUrl: config.api_url,
      region: config.region,
      email: config.email,
      appId: config.app_id
    };
    
    const response = await fetch('/api/providers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    
    if (!response.ok) {
      throw new Error(`Failed to save provider: ${response.statusText}`);
    }
  };

  return (
    <div className="flex items-center gap-1 flex-wrap">
      {PROVIDERS.map((provider) => {
        const isActive = activeProvider === provider.id;
        
        return (
          <button
            key={provider.id}
            onClick={() => handleProviderChange(provider.id)}
            title={provider.name}
            className={`
              relative inline-flex items-center justify-center p-2 rounded-lg border font-bold text-xs
              transition-all duration-200
              ${isActive
                ? 'bg-blue-600 text-white dark:bg-blue-500 border-blue-600 dark:border-blue-500 shadow-md'
                : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
              }
            `}
          >
            <span className="w-5 h-5 inline-flex items-center justify-center"><ProviderIcon id={provider.id} /></span>
            {isActive && (
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-800"></span>
            )}
          </button>
        );
      })}
    </div>
  );
}
