export interface TranslationProvider {
  name: string;
  translate(text: string, source: string, target: string): Promise<{ translatedText: string; alternatives?: string[] }>;
  isConfigured(): Promise<boolean>;
  testConnection(): Promise<boolean>;
}

export interface ProviderConfig {
  type: 'libretranslate' | 'google' | 'deepl' | 'azure' | 'aws' | 'mymemory' | 'pons' | 'merriam-webster' | 'free-dictionary' | 'oxford' | 'tatoeba';
  enabled: boolean;
  apiKey?: string;
  apiUrl?: string;
  region?: string;
  email?: string;
  appId?: string;
}
