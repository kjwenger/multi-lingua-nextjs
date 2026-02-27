'use client';

import Link from 'next/link';
import { ThemeToggle } from './ThemeToggle';
import { useState, useEffect } from 'react';
import { APP_VERSION } from '../lib/version';

const PROVIDER_TYPES = [
  { type: 'libretranslate', name: 'LibreTranslate', needsUrl: true, needsApiKey: false, freeInfo: 'Self-hosted or public' },
  { type: 'mymemory', name: 'MyMemory', needsUrl: false, needsApiKey: false, needsEmail: true, freeInfo: '10K words/day (30K with email)' },
  { type: 'deepl', name: 'DeepL', needsUrl: false, needsApiKey: true, freeInfo: '500K chars/month free' },
  { type: 'google', name: 'Google Translate', needsUrl: false, needsApiKey: true, freeInfo: '500K chars/month free' },
  { type: 'azure', name: 'Azure Translator', needsUrl: false, needsApiKey: true, needsRegion: true, freeInfo: '2M chars/month free' },
  { type: 'pons', name: 'PONS Dictionary', needsUrl: false, needsApiKey: true, freeInfo: '1000 queries/month free' },
  // { type: 'merriam-webster', name: 'Merriam-Webster', needsUrl: false, needsApiKey: true, freeInfo: '1000 queries/day free (English only)' },
  // { type: 'free-dictionary', name: 'Free Dictionary', needsUrl: false, needsApiKey: false, freeInfo: 'Completely free (English only)' },
  // { type: 'oxford', name: 'Oxford Dictionary', needsUrl: false, needsApiKey: true, needsAppId: true, freeInfo: '1000 queries/month free' }
  { type: 'tatoeba', name: 'Tatoeba', needsUrl: false, needsApiKey: false, freeInfo: 'Completely free — community sentence examples (CC-licensed)' },
];

const LIBRETRANSLATE_PRESETS = [
  { label: 'Environment Default', value: 'ENV_DEFAULT' },
  { label: 'Localhost:5432', value: 'http://localhost:5432' },
  { label: 'LibreTranslate.com', value: 'https://libretranslate.com' },
  { label: 'Gertrun Synology', value: 'https://libretranslate.gertrun.synology.me/' },
  { label: 'Custom URL', value: 'CUSTOM' }
];

export function SettingsContent() {
  const [providers, setProviders] = useState<any[]>([]);
  const [expandedProvider, setExpandedProvider] = useState<string | null>('libretranslate');
  const [isSaving, setIsSaving] = useState(false);
  const [libreTranslatePreset, setLibreTranslatePreset] = useState('ENV_DEFAULT');
  const [libreTranslateCustomUrl, setLibreTranslateCustomUrl] = useState('');
  const [selectedProvider, setSelectedProvider] = useState<string>('libretranslate');
  const [editingConfig, setEditingConfig] = useState<Record<string, any>>({});

  useEffect(() => {
    fetchProviders();
  }, []);

  const fetchProviders = async () => {
    try {
      const response = await fetch('/api/providers');
      const data = await response.json();
      setProviders(data.providers || []);
      
      // Find the selected provider (the one that's enabled)
      const enabledProvider = data.providers?.find((p: any) => p.enabled === 1 || p.enabled === true);
      if (enabledProvider) {
        setSelectedProvider(enabledProvider.type);
        console.log(`Selected provider from DB: ${enabledProvider.type}`);
      }
      
      // Set LibreTranslate preset based on URL
      const libreConfig = data.providers?.find((p: any) => p.type === 'libretranslate');
      if (libreConfig?.api_url) {
        const preset = LIBRETRANSLATE_PRESETS.find(p => p.value === libreConfig.api_url);
        if (preset) {
          setLibreTranslatePreset(preset.value);
        } else {
          setLibreTranslatePreset('CUSTOM');
          setLibreTranslateCustomUrl(libreConfig.api_url);
        }
      }
    } catch (error) {
      console.error('Error fetching providers:', error);
    }
  };

  const saveProvider = async (type: string, config: any) => {
    setIsSaving(true);
    try {
      // Map frontend config keys to backend API keys
      const payload = {
        type,
        enabled: config.enabled,
        apiKey: config.api_key,
        apiUrl: config.api_url,
        region: config.region,
        email: config.email,
        appId: config.app_id
      };
      
      await fetch('/api/providers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      await fetchProviders();
      // Clear editing state for this provider after successful save and fetch
      setEditingConfig(prev => {
        const updated = { ...prev };
        delete updated[type];
        return updated;
      });
    } catch (error) {
      console.error('Error saving provider:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const toggleProvider = async (type: string) => {
    console.log(`[CLIENT] Toggling to provider: ${type}`);
    setIsSaving(true);
    try {
      // Update local state immediately for UI responsiveness
      setSelectedProvider(type);
      
      // Disable all providers first
      const disablePromises = PROVIDER_TYPES.map(async (pt) => {
        if (pt.type !== type) {
          const provider = providers.find(p => p.type === pt.type) || {};
          console.log(`[CLIENT] Disabling provider: ${pt.type}`);
          await saveProvider(pt.type, { ...provider, enabled: false });
        }
      });
      await Promise.all(disablePromises);
      
      // Enable the selected provider
      const provider = providers.find(p => p.type === type) || {};
      
      // For LibreTranslate, ensure we have the URL
      if (type === 'libretranslate' && !provider.api_url) {
        provider.api_url = libreTranslatePreset !== 'CUSTOM' ? libreTranslatePreset : libreTranslateCustomUrl;
      }
      
      console.log(`[CLIENT] Enabling provider: ${type}`, provider);
      await saveProvider(type, { ...provider, enabled: true });
      
      // Refresh providers from database to sync UI
      console.log(`[CLIENT] Refreshing providers from DB`);
      await fetchProviders();
      
      console.log(`[CLIENT] Provider ${type} is now active`);
    } catch (error) {
      console.error('[CLIENT] Error toggling provider:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const getProviderConfig = (type: string) => {
    return providers.find(p => p.type === type) || {};
  };

  const handleLibreTranslatePresetChange = (value: string) => {
    setLibreTranslatePreset(value);
    if (value !== 'CUSTOM') {
      const config = getProviderConfig('libretranslate');
      saveProvider('libretranslate', { 
        ...config, 
        api_url: value,
        enabled: true
      });
    }
  };

  const handleLibreTranslateCustomSave = () => {
    if (libreTranslateCustomUrl.trim()) {
      const config = getProviderConfig('libretranslate');
      saveProvider('libretranslate', { 
        ...config, 
        api_url: libreTranslateCustomUrl.trim(),
        enabled: true
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 transition-colors duration-200">
      <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white dark:bg-gray-800 shadow-xl rounded-lg transition-colors duration-200">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-4">
              <Link
                href="/"
                className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors duration-200"
                title="Back to main page"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </Link>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Settings</h1>
            </div>
          </div>

          <div className="px-6 py-8">
            <div className="space-y-6">
              <div className="border-b border-gray-200 dark:border-gray-700 pb-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">Appearance</h2>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-700 dark:text-gray-300 font-medium">Theme</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Switch between light and dark mode</p>
                  </div>
                  <ThemeToggle />
                </div>
              </div>

              <div className="border-b border-gray-200 dark:border-gray-700 pb-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">Translation Providers</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                  Configure multiple translation services. The system will try them in order until one succeeds.
                </p>
                <div className="space-y-3">
                  {PROVIDER_TYPES.map((providerType) => {
                    const config = getProviderConfig(providerType.type);
                    const isExpanded = expandedProvider === providerType.type;
                    const isEnabled = config.enabled === 1 || config.enabled === true;
                    
                    return (
                      <div key={providerType.type} className="border border-gray-300 dark:border-gray-600 rounded-lg">
                        <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 cursor-pointer" onClick={() => {
                          console.log('[CLICK] Clicked on provider:', providerType.type, 'isEnabled:', isEnabled, 'isSaving:', isSaving);
                          if (!isSaving) {
                            toggleProvider(providerType.type);
                          }
                        }}>
                          <div className="flex items-center space-x-3 flex-1">
                            <input
                              type="radio"
                              name="translation-provider"
                              checked={isEnabled}
                              onChange={() => {}}
                              className="w-4 h-4 pointer-events-none"
                              disabled={isSaving}
                            />
                            <div className="flex-1">
                              <div className="font-medium text-gray-900 dark:text-gray-100">
                                {providerType.name}
                              </div>
                              <div className="text-xs text-gray-500 dark:text-gray-400">
                                {providerType.freeInfo}
                              </div>
                            </div>
                          </div>
                          <button
                            onClick={() => setExpandedProvider(isExpanded ? null : providerType.type)}
                            className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
                          >
                            <svg className={`w-5 h-5 transition-transform ${isExpanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          </button>
                        </div>
                        {isExpanded && (
                          <div className="p-3 space-y-3 bg-white dark:bg-gray-800">
                            {providerType.type === 'libretranslate' && providerType.needsUrl && (
                              <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                  API URL
                                </label>
                                <select
                                  value={libreTranslatePreset}
                                  onChange={(e) => handleLibreTranslatePresetChange(e.target.value)}
                                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                                  disabled={isSaving}
                                >
                                  {LIBRETRANSLATE_PRESETS.map((preset) => (
                                    <option key={preset.value} value={preset.value}>
                                      {preset.label}
                                    </option>
                                  ))}
                                </select>
                                {libreTranslatePreset === 'CUSTOM' && (
                                  <div className="mt-3 flex gap-2">
                                    <input
                                      type="text"
                                      value={libreTranslateCustomUrl}
                                      onChange={(e) => setLibreTranslateCustomUrl(e.target.value)}
                                      placeholder="Enter custom URL (e.g., https://api.example.com)"
                                      className="flex-1 p-2 border border-gray-300 dark:border-gray-600 rounded focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                                      disabled={isSaving}
                                    />
                                    <button
                                      onClick={handleLibreTranslateCustomSave}
                                      disabled={!libreTranslateCustomUrl.trim() || isSaving}
                                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white font-medium rounded transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                      {isSaving ? 'Saving...' : 'Save'}
                                    </button>
                                  </div>
                                )}
                                {config.api_url && libreTranslatePreset !== 'CUSTOM' && (
                                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                                    Current: {config.api_url}
                                  </p>
                                )}
                              </div>
                            )}
                            {providerType.type !== 'libretranslate' && providerType.needsUrl && (
                              <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                  API URL
                                </label>
                                <div className="flex gap-2">
                                  <input
                                    type="text"
                                    value={editingConfig[providerType.type]?.api_url ?? config.api_url ?? ''}
                                    onChange={(e) => {
                                      setEditingConfig({
                                        ...editingConfig,
                                        [providerType.type]: {
                                          ...config,
                                          api_url: e.target.value
                                        }
                                      });
                                    }}
                                    placeholder="http://localhost:5432"
                                    className="flex-1 p-2 border border-gray-300 dark:border-gray-600 rounded focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                                    disabled={isSaving}
                                  />
                                  <button
                                    onClick={() => {
                                      const newConfig = { 
                                        ...config, 
                                        api_url: editingConfig[providerType.type]?.api_url || config.api_url,
                                        enabled: isEnabled 
                                      };
                                      saveProvider(providerType.type, newConfig);
                                    }}
                                    disabled={isSaving || !editingConfig[providerType.type]?.api_url}
                                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white font-medium rounded transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                  >
                                    {isSaving ? 'Saving...' : 'Save'}
                                  </button>
                                </div>
                              </div>
                            )}
                            {providerType.needsApiKey && (
                              <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                  API Key
                                  {config.api_key && !editingConfig[providerType.type]?.api_key && (
                                    <span className="ml-2 text-xs text-green-600 dark:text-green-400">✓ Saved</span>
                                  )}
                                </label>
                                <div className="flex gap-2">
                                  <input
                                    type="password"
                                    value={editingConfig[providerType.type]?.api_key ?? (config.api_key ? '••••••••••••••••' : '')}
                                    onChange={(e) => {
                                      setEditingConfig({
                                        ...editingConfig,
                                        [providerType.type]: {
                                          ...config,
                                          api_key: e.target.value
                                        }
                                      });
                                    }}
                                    onFocus={(e) => {
                                      // Clear the placeholder dots when focused if not editing
                                      if (!editingConfig[providerType.type]?.api_key && config.api_key) {
                                        setEditingConfig({
                                          ...editingConfig,
                                          [providerType.type]: {
                                            ...config,
                                            api_key: ''
                                          }
                                        });
                                      }
                                    }}
                                    placeholder={config.api_key ? "Enter new API key to replace" : "Enter your API key"}
                                    className="flex-1 p-2 border border-gray-300 dark:border-gray-600 rounded focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                                    disabled={isSaving}
                                  />
                                  <button
                                    onClick={() => {
                                      const newConfig = { 
                                        ...config, 
                                        api_key: editingConfig[providerType.type]?.api_key || config.api_key,
                                        enabled: isEnabled 
                                      };
                                      saveProvider(providerType.type, newConfig);
                                    }}
                                    disabled={isSaving || !editingConfig[providerType.type]?.api_key}
                                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white font-medium rounded transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                  >
                                    {isSaving ? 'Saving...' : 'Save'}
                                  </button>
                                </div>
                                {config.api_key && !editingConfig[providerType.type]?.api_key && (
                                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                    API key is configured. Enter a new value to update.
                                  </p>
                                )}
                              </div>
                            )}
                            {providerType.needsRegion && (
                              <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                  Region (optional)
                                </label>
                                <div className="flex gap-2">
                                  <input
                                    type="text"
                                    value={editingConfig[providerType.type]?.region ?? config.region ?? ''}
                                    onChange={(e) => {
                                      setEditingConfig({
                                        ...editingConfig,
                                        [providerType.type]: {
                                          ...config,
                                          region: e.target.value
                                        }
                                      });
                                    }}
                                    placeholder="global"
                                    className="flex-1 p-2 border border-gray-300 dark:border-gray-600 rounded focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                                    disabled={isSaving}
                                  />
                                  <button
                                    onClick={() => {
                                      const newConfig = { 
                                        ...config, 
                                        region: editingConfig[providerType.type]?.region ?? config.region,
                                        enabled: isEnabled 
                                      };
                                      saveProvider(providerType.type, newConfig);
                                      const updatedEditing = { ...editingConfig };
                                      delete updatedEditing[providerType.type];
                                      setEditingConfig(updatedEditing);
                                    }}
                                    disabled={isSaving}
                                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white font-medium rounded transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                  >
                                    {isSaving ? 'Saving...' : 'Save'}
                                  </button>
                                </div>
                              </div>
                            )}
                            {(providerType as any).needsAppId && (
                              <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                  App ID
                                  {config.app_id && !editingConfig[providerType.type]?.app_id && (
                                    <span className="ml-2 text-xs text-green-600 dark:text-green-400">✓ Saved</span>
                                  )}
                                </label>
                                <div className="flex gap-2">
                                  <input
                                    type="text"
                                    value={editingConfig[providerType.type]?.app_id ?? config.app_id ?? ''}
                                    onChange={(e) => {
                                      setEditingConfig({
                                        ...editingConfig,
                                        [providerType.type]: {
                                          ...config,
                                          app_id: e.target.value
                                        }
                                      });
                                    }}
                                    placeholder="Enter your App ID"
                                    className="flex-1 p-2 border border-gray-300 dark:border-gray-600 rounded focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                                    disabled={isSaving}
                                  />
                                  <button
                                    onClick={() => {
                                      const newConfig = { 
                                        ...config, 
                                        app_id: editingConfig[providerType.type]?.app_id || config.app_id,
                                        enabled: isEnabled 
                                      };
                                      saveProvider(providerType.type, newConfig);
                                    }}
                                    disabled={isSaving || !editingConfig[providerType.type]?.app_id}
                                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white font-medium rounded transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                  >
                                    {isSaving ? 'Saving...' : 'Save'}
                                  </button>
                                </div>
                              </div>
                            )}
                            {(providerType as any).needsEmail && (
                              <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                  Email (optional, increases quota to 30K words/day)
                                </label>
                                <div className="flex gap-2">
                                  <input
                                    type="email"
                                    value={editingConfig[providerType.type]?.email ?? config.email ?? ''}
                                    onChange={(e) => {
                                      setEditingConfig({
                                        ...editingConfig,
                                        [providerType.type]: {
                                          ...config,
                                          email: e.target.value
                                        }
                                      });
                                    }}
                                    placeholder="your@email.com"
                                    className="flex-1 p-2 border border-gray-300 dark:border-gray-600 rounded focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                                    disabled={isSaving}
                                  />
                                  <button
                                    onClick={() => {
                                      const newConfig = { 
                                        ...config, 
                                        email: editingConfig[providerType.type]?.email ?? config.email,
                                        enabled: isEnabled 
                                      };
                                      saveProvider(providerType.type, newConfig);
                                      const updatedEditing = { ...editingConfig };
                                      delete updatedEditing[providerType.type];
                                      setEditingConfig(updatedEditing);
                                    }}
                                    disabled={isSaving}
                                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white font-medium rounded transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                  >
                                    {isSaving ? 'Saving...' : 'Save'}
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="border-b border-gray-200 dark:border-gray-700 pb-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">About</h2>
                <div className="space-y-2">
                  <p className="text-gray-700 dark:text-gray-300">
                    <span className="font-medium">Application:</span> Multi-Lingua Translation
                  </p>
                  <p className="text-gray-700 dark:text-gray-300">
                    <span className="font-medium">Version:</span> {APP_VERSION}
                  </p>
                  <p className="text-gray-700 dark:text-gray-300">
                    <span className="font-medium">Description:</span> A translation app with multi-provider support
                  </p>
                </div>
              </div>


            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
