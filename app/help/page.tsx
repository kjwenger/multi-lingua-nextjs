'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function HelpPage() {
  const [activeSection, setActiveSection] = useState('getting-started');

  const sections = [
    { id: 'getting-started', title: 'Getting Started' },
    { id: 'features', title: 'Features' },
    { id: 'setup-libretranslate', title: 'LibreTranslate Setup' },
    { id: 'setup-mymemory', title: 'MyMemory Setup' },
    { id: 'setup-google', title: 'Google Translate Setup' },
    { id: 'setup-deepl', title: 'DeepL Setup' },
    { id: 'setup-azure', title: 'Azure Translator Setup' },
    { id: 'setup-pons', title: 'PONS Dictionary Setup' },
    // { id: 'setup-merriam-webster', title: 'Merriam-Webster Setup' },
    // { id: 'setup-free-dictionary', title: 'Free Dictionary Setup' },
    // { id: 'setup-oxford', title: 'Oxford Dictionary Setup' },
    { id: 'setup-tatoeba', title: 'Tatoeba Setup' },
    { id: 'usage', title: 'Using the App' },
    { id: 'api', title: 'API Reference' },
    { id: 'troubleshooting', title: 'Troubleshooting' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="flex">
        {/* Sidebar Navigation */}
        <aside className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 min-h-screen sticky top-0">
          <div className="p-6">
            <Link href="/" className="text-2xl font-bold text-purple-600 dark:text-purple-400">
              MultiLingua
            </Link>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">Help & Documentation</p>
          </div>
          <nav className="px-4 pb-6">
            {sections.map((section) => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`w-full text-left px-4 py-2 rounded-lg mb-1 transition-colors ${
                  activeSection === section.id
                    ? 'bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                {section.title}
              </button>
            ))}
          </nav>
          <div className="px-4 pb-6 border-t border-gray-200 dark:border-gray-700 pt-6">
            <Link href="/" className="text-sm text-purple-600 dark:text-purple-400 hover:underline">
              ← Back to App
            </Link>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-8 max-w-4xl">
          {activeSection === 'getting-started' && <GettingStarted />}
          {activeSection === 'features' && <Features />}
          {activeSection === 'setup-libretranslate' && <LibreTranslateSetup />}
          {activeSection === 'setup-mymemory' && <MyMemorySetup />}
          {activeSection === 'setup-google' && <GoogleSetup />}
          {activeSection === 'setup-deepl' && <DeepLSetup />}
          {activeSection === 'setup-azure' && <AzureSetup />}
          {activeSection === 'setup-pons' && <PonsSetup />}
          {/* {activeSection === 'setup-merriam-webster' && <MerriamWebsterSetup />} */}
          {/* {activeSection === 'setup-free-dictionary' && <FreeDictionarySetup />} */}
          {/* {activeSection === 'setup-oxford' && <OxfordSetup />} */}
          {activeSection === 'setup-tatoeba' && <TatoebaSetup />}
          {activeSection === 'usage' && <Usage />}
          {activeSection === 'api' && <ApiReference />}
          {activeSection === 'troubleshooting' && <Troubleshooting />}
        </main>
      </div>
    </div>
  );
}

function GettingStarted() {
  return (
    <div className="prose dark:prose-invert max-w-none text-gray-800 dark:text-gray-200">
      <h1 className="text-3xl font-bold mb-4">Getting Started with MultiLingua</h1>
      <p className="text-lg text-gray-600 dark:text-gray-400 mb-6">
        Welcome to MultiLingua - your comprehensive multi-provider translation management system.
      </p>
      
      <h2 className="text-2xl font-semibold mt-8 mb-4">What is MultiLingua?</h2>
      <p className="mb-4">
        MultiLingua is a powerful, self-hosted translation management application that allows you to translate 
        text between English, German, French, Italian, and Spanish using multiple translation providers. 
        It combines the best of free and commercial translation services with a user-friendly interface.
      </p>

      <h3 className="text-xl font-semibold mt-6 mb-3">Key Features</h3>
      <ul className="list-disc pl-6 space-y-2 mb-6">
        <li><strong>Multi-Provider Support:</strong> 5 major translation providers with automatic fallback</li>
        <li><strong>Alternative Translations:</strong> Up to 10 translation suggestions per text</li>
        <li><strong>Text-to-Speech:</strong> Browser-based pronunciation for all languages</li>
        <li><strong>Persistent Storage:</strong> SQLite database for translation history</li>
        <li><strong>RESTful API:</strong> Full API access with OpenAPI/Swagger documentation</li>
        <li><strong>Docker-Ready:</strong> Complete containerized deployment with docker-compose</li>
        <li><strong>Self-Hosted:</strong> Complete privacy and control over your translation data</li>
      </ul>

      <h2 className="text-2xl font-semibold mt-8 mb-4">Quick Start</h2>
      <ol className="list-decimal pl-6 space-y-3 mb-6">
        <li>
          <strong>Start the Application</strong>
          <pre className="bg-gray-100 dark:bg-gray-800 p-3 rounded mt-2"><code>docker compose up -d</code></pre>
        </li>
        <li>
          <strong>Access the Web Interface</strong>
          <p className="mt-2">Open your browser to <code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">http://localhost:3456</code></p>
        </li>
        <li>
          <strong>Configure Providers</strong>
          <p className="mt-2">Click the settings icon (⚙️) to configure translation providers</p>
        </li>
        <li>
          <strong>Start Translating</strong>
          <p className="mt-2">Enter text in any language column and click the translate button (🔄)</p>
        </li>
      </ol>

      <h2 className="text-2xl font-semibold mt-8 mb-4">System Requirements</h2>
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
        <h3 className="text-lg font-semibold mt-0 mb-2">For Docker Deployment (Recommended)</h3>
        <ul className="list-disc pl-6 space-y-1 mb-0">
          <li>Docker Engine 20.10 or later</li>
          <li>Docker Compose v2.0 or later</li>
          <li>2GB RAM minimum (4GB recommended)</li>
          <li>Modern web browser (Chrome, Firefox, Safari, Edge)</li>
        </ul>
      </div>

      <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 mb-6">
        <h3 className="text-lg font-semibold mt-0 mb-2">For Local Development</h3>
        <ul className="list-disc pl-6 space-y-1 mb-0">
          <li>Node.js 18.0 or later</li>
          <li>npm 9.0 or later</li>
          <li>4GB RAM minimum</li>
        </ul>
      </div>

      <h2 className="text-2xl font-semibold mt-8 mb-4">Architecture Overview</h2>
      <p className="mb-4">
        MultiLingua consists of three main components:
      </p>
      <ul className="list-disc pl-6 space-y-2 mb-6">
        <li><strong>Next.js Web Application:</strong> React-based frontend with server-side API routes</li>
        <li><strong>LibreTranslate Service:</strong> Self-hosted open-source translation engine</li>
        <li><strong>SQLite Database:</strong> Lightweight database for storing translations</li>
      </ul>

      <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 mt-6">
        <h3 className="text-green-800 dark:text-green-200 mt-0 mb-2">💡 Pro Tip</h3>
        <p className="mb-0">
          Start with the default LibreTranslate provider (free, self-hosted) and add commercial providers 
          (Google, DeepL, Azure) as needed for improved translation quality or specific language pairs.
        </p>
      </div>
    </div>
  );
}

function Features() {
  return (
    <div className="prose dark:prose-invert max-w-none text-gray-800 dark:text-gray-200">
      <h1 className="text-3xl font-bold mb-6">Features</h1>

      <h2 className="text-2xl font-semibold mt-8 mb-4">Multi-Provider Translation Support</h2>
      <p className="mb-4">
        Choose from 5 professional translation providers with automatic failover. MultiLingua intelligently 
        routes requests to available providers based on your configuration priority.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
          <h3 className="text-lg font-semibold mb-2">🌍 LibreTranslate</h3>
          <p className="text-sm mb-2">Free, open-source, self-hosted translation engine</p>
          <ul className="text-sm list-disc pl-5 space-y-1">
            <li>Completely free</li>
            <li>Privacy-focused (self-hosted)</li>
            <li>No API limits</li>
            <li>Included in Docker setup</li>
          </ul>
        </div>

        <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
          <h3 className="text-lg font-semibold mb-2">💾 MyMemory</h3>
          <p className="text-sm mb-2">World&apos;s largest translation memory</p>
          <ul className="text-sm list-disc pl-5 space-y-1">
            <li>10,000 words/day free</li>
            <li>30,000 words/day with email</li>
            <li>No API key required</li>
            <li>Good for common phrases</li>
          </ul>
        </div>

        <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
          <h3 className="text-lg font-semibold mb-2">🔵 DeepL</h3>
          <p className="text-sm mb-2">Premium quality neural translations</p>
          <ul className="text-sm list-disc pl-5 space-y-1">
            <li>500,000 chars/month free</li>
            <li>Best quality for EU languages</li>
            <li>Natural-sounding output</li>
            <li>Pro plans available</li>
          </ul>
        </div>

        <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
          <h3 className="text-lg font-semibold mb-2">🔴 Google Translate</h3>
          <p className="text-sm mb-2">Industry-leading translation service</p>
          <ul className="text-sm list-disc pl-5 space-y-1">
            <li>$10/month free credit</li>
            <li>Excellent language coverage</li>
            <li>Fast and reliable</li>
            <li>Pay-as-you-go pricing</li>
          </ul>
        </div>

        <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
          <h3 className="text-lg font-semibold mb-2">🔷 Azure Translator</h3>
          <p className="text-sm mb-2">Microsoft&apos;s enterprise translation service</p>
          <ul className="text-sm list-disc pl-5 space-y-1">
            <li>2 million chars/month free</li>
            <li>Enterprise-grade reliability</li>
            <li>Global availability</li>
            <li>Flexible pricing tiers</li>
          </ul>
        </div>

        <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
          <h3 className="text-lg font-semibold mb-2">📖 PONS Dictionary</h3>
          <p className="text-sm mb-2">Professional dictionary lookups</p>
          <ul className="text-sm list-disc pl-5 space-y-1">
            <li>1,000 queries/month free</li>
            <li>Rich alternatives &amp; synonyms</li>
            <li>Best for single words</li>
            <li>European languages focus</li>
          </ul>
        </div>
      </div>

      <h2 className="text-2xl font-semibold mt-8 mb-4">Translation Management</h2>
      <ul className="list-disc pl-6 space-y-2 mb-6">
        <li><strong>Bidirectional Translation:</strong> Translate from any language to all others</li>
        <li><strong>Alternative Suggestions:</strong> View up to 10 alternative translations per text</li>
        <li><strong>Click-to-Use Alternatives:</strong> Replace current translation with one click</li>
        <li><strong>Manual Override:</strong> Edit any translation manually</li>
        <li><strong>Persistent Storage:</strong> All translations saved to SQLite database</li>
        <li><strong>Alphabetical Sorting:</strong> Sort translations by English column</li>
        <li><strong>Bulk Operations:</strong> Add and delete multiple translation entries</li>
      </ul>

      <h2 className="text-2xl font-semibold mt-8 mb-4">Text-to-Speech</h2>
      <p className="mb-4">
        Listen to any translation with browser-based text-to-speech using native voices for each language.
        Perfect for learning pronunciation or verifying translations sound natural.
      </p>
      <ul className="list-disc pl-6 space-y-2 mb-6">
        <li>Native pronunciation for each language</li>
        <li>One-click playback from any cell</li>
        <li>Powered by browser&apos;s Web Speech API</li>
        <li>No additional setup required</li>
      </ul>

      <h2 className="text-2xl font-semibold mt-8 mb-4">Developer Features</h2>
      <ul className="list-disc pl-6 space-y-2 mb-6">
        <li><strong>RESTful API:</strong> Full CRUD operations via HTTP endpoints</li>
        <li><strong>OpenAPI/Swagger:</strong> Interactive API documentation at <code>/api-docs</code></li>
        <li><strong>Structured Logging:</strong> Color-coded logs in browser and server</li>
        <li><strong>Docker Compose:</strong> One-command deployment</li>
        <li><strong>Environment Configuration:</strong> Flexible .env configuration</li>
        <li><strong>TypeScript:</strong> Full type safety throughout codebase</li>
      </ul>

      <h2 className="text-2xl font-semibold mt-8 mb-4">User Interface</h2>
      <ul className="list-disc pl-6 space-y-2 mb-6">
        <li><strong>Dark Mode:</strong> Automatic dark mode based on system preferences</li>
        <li><strong>Responsive Design:</strong> Works on desktop, tablet, and mobile</li>
        <li><strong>Real-time Updates:</strong> Instant UI updates without page refresh</li>
        <li><strong>Keyboard Shortcuts:</strong> Tab, Enter, Esc navigation</li>
        <li><strong>Visual Feedback:</strong> Loading states and animations</li>
        <li><strong>Provider Display:</strong> See which provider handled each translation</li>
      </ul>

      <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4 mt-6">
        <h3 className="text-purple-800 dark:text-purple-200 mt-0 mb-2">🚀 Coming Soon</h3>
        <ul className="list-disc pl-6 space-y-1 mb-0">
          <li>Export translations to JSON/CSV</li>
          <li>Import existing translation files</li>
          <li>Translation history and versioning</li>
          <li>Custom terminology/glossaries</li>
          <li>Batch translation upload</li>
        </ul>
      </div>
    </div>
  );
}

function LibreTranslateSetup() {
  return (
    <div className="prose dark:prose-invert max-w-none text-gray-800 dark:text-gray-200">
      <h1 className="text-3xl font-bold mb-6">LibreTranslate Setup</h1>
      
      <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 mb-6">
        <h3 className="text-green-800 dark:text-green-200 mt-0 mb-2">✅ Already Configured!</h3>
        <p className="mb-0">
          LibreTranslate is included and pre-configured in the Docker Compose setup. It starts automatically 
          when you run <code>docker compose up -d</code>.
        </p>
      </div>

      <h2 className="text-2xl font-semibold mt-8 mb-4">What is LibreTranslate?</h2>
      <p className="mb-4">
        LibreTranslate is a free and open-source machine translation API that you can self-host. It provides 
        translation capabilities without requiring API keys, internet connectivity (after model download), or 
        paying per-character fees.
      </p>

      <h2 className="text-2xl font-semibold mt-8 mb-4">Default Configuration</h2>
      <p className="mb-4">
        The MultiLingua Docker Compose setup includes LibreTranslate with the following configuration:
      </p>
      <ul className="list-disc pl-6 space-y-2 mb-6">
        <li><strong>Service Port:</strong> 5432 (mapped to container port 5000)</li>
        <li><strong>From App Container:</strong> <code>http://libretranslate:5000</code></li>
        <li><strong>From Host Machine:</strong> <code>http://localhost:5432</code></li>
        <li><strong>Data Persistence:</strong> Docker volume <code>lt-local</code></li>
        <li><strong>No API Key Required:</strong> Self-hosted instance</li>
      </ul>

      <h2 className="text-2xl font-semibold mt-8 mb-4">First Startup</h2>
      <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-6">
        <h3 className="text-yellow-800 dark:text-yellow-200 mt-0 mb-2">⏱️ Initial Setup Time</h3>
        <p className="mb-2">
          On first startup, LibreTranslate downloads translation models for all language pairs. This can take:
        </p>
        <ul className="list-disc pl-6 space-y-1 mb-0">
          <li><strong>5-10 minutes</strong> on fast internet connections</li>
          <li><strong>Up to 30 minutes</strong> on slower connections</li>
          <li><strong>~2-3 GB</strong> total download size</li>
        </ul>
      </div>

      <p className="mb-4">Monitor the download progress:</p>
      <pre className="bg-gray-100 dark:bg-gray-800 p-3 rounded mb-6"><code>docker compose logs -f libretranslate</code></pre>

      <h2 className="text-2xl font-semibold mt-8 mb-4">Using an External LibreTranslate Instance</h2>
      <p className="mb-4">
        If you want to use a different LibreTranslate instance (e.g., the official public API or another 
        self-hosted instance):
      </p>
      <ol className="list-decimal pl-6 space-y-3 mb-6">
        <li>Open MultiLingua and click the Settings icon (⚙️)</li>
        <li>Find the LibreTranslate section</li>
        <li>Enter the API URL:
          <ul className="list-disc pl-6 mt-2 space-y-1">
            <li>Official API: <code>https://libretranslate.com</code></li>
            <li>Custom instance: <code>https://your-instance.com</code></li>
          </ul>
        </li>
        <li>If the instance requires an API key, enter it</li>
        <li>Click &quot;Save Settings&quot;</li>
      </ol>

      <h2 className="text-2xl font-semibold mt-8 mb-4">Advantages of Self-Hosting</h2>
      <ul className="list-disc pl-6 space-y-2 mb-6">
        <li><strong>Privacy:</strong> All translations happen locally - no data sent to third parties</li>
        <li><strong>No Costs:</strong> Unlimited translations without per-character fees</li>
        <li><strong>No Rate Limits:</strong> Translate as much as you want</li>
        <li><strong>Offline Capable:</strong> Works without internet (after initial model download)</li>
        <li><strong>Full Control:</strong> Configure and customize as needed</li>
      </ul>

      <h2 className="text-2xl font-semibold mt-8 mb-4">Limitations</h2>
      <ul className="list-disc pl-6 space-y-2 mb-6">
        <li><strong>Translation Quality:</strong> Good but not as high as DeepL or Google for some language pairs</li>
        <li><strong>Speed:</strong> Slower than cloud services, especially on first request (model loading)</li>
        <li><strong>Resource Usage:</strong> Requires ~2GB disk space and significant RAM during operation</li>
        <li><strong>Updates:</strong> Manual updates required for improved models</li>
      </ul>

      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mt-6">
        <h3 className="text-blue-800 dark:text-blue-200 mt-0 mb-2">❓ Having Issues?</h3>
        <p className="mb-0">
          See the <Link href="/help" className="text-blue-600 dark:text-blue-400 hover:underline">Troubleshooting section</Link> for LibreTranslate-specific solutions.
        </p>
      </div>
    </div>
  );
}

function MyMemorySetup() {
  return (
    <div className="prose dark:prose-invert max-w-none text-gray-800 dark:text-gray-200">
      <h1 className="text-3xl font-bold mb-6">MyMemory Setup</h1>

      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
        <h3 className="text-blue-800 dark:text-blue-200 mt-0 mb-2">🆓 Completely Free</h3>
        <p className="mb-0">
          MyMemory is a free translation service powered by the world&apos;s largest translation memory. 
          No registration, no credit card, no API key required.
        </p>
      </div>

      <h2 className="text-2xl font-semibold mt-8 mb-4">What is MyMemory?</h2>
      <p className="mb-4">
        MyMemory is the world&apos;s largest collaborative translation memory, containing over 10 billion 
        translated segments. It combines human translations with machine translation to provide high-quality 
        results for common phrases and sentences.
      </p>

      <h2 className="text-2xl font-semibold mt-8 mb-4">Quick Setup (No Email)</h2>
      <ol className="list-decimal pl-6 space-y-3 mb-6">
        <li>Open MultiLingua and click the Settings icon (⚙️)</li>
        <li>Find the MyMemory section</li>
        <li>Toggle the switch to enable MyMemory</li>
        <li>Click &quot;Save Settings&quot;</li>
      </ol>
      <p className="mb-4">
        <strong>Daily Limit:</strong> 10,000 words per day
      </p>

      <h2 className="text-2xl font-semibold mt-8 mb-4">Increased Quota Setup (With Email)</h2>
      <p className="mb-4">
        To triple your daily quota from 10,000 to 30,000 words, simply add your email address:
      </p>
      <ol className="list-decimal pl-6 space-y-3 mb-6">
        <li>Open MultiLingua Settings (⚙️)</li>
        <li>Find the MyMemory section</li>
        <li>Enter your email address in the &quot;Email&quot; field</li>
        <li>Toggle the switch to enable MyMemory</li>
        <li>Click &quot;Save Settings&quot;</li>
      </ol>

      <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 mb-6">
        <h3 className="text-green-800 dark:text-green-200 mt-0 mb-2">📧 Why Email?</h3>
        <p className="mb-0">
          MyMemory uses your email only to identify your requests and provide the higher quota. 
          No verification required, no spam, no marketing emails.
        </p>
      </div>

      <h2 className="text-2xl font-semibold mt-8 mb-4">Alternative: Environment Variable</h2>
      <p className="mb-4">You can also configure the email via environment variable:</p>
      <ol className="list-decimal pl-6 space-y-3 mb-6">
        <li>Edit the <code>.env.local</code> file in your MultiLingua directory</li>
        <li>Add or update the line:
          <pre className="bg-gray-100 dark:bg-gray-800 p-3 rounded mt-2 mb-2"><code>MYMEMORY_EMAIL=your-email@example.com</code></pre>
        </li>
        <li>Restart the application:
          <pre className="bg-gray-100 dark:bg-gray-800 p-3 rounded mt-2 mb-2"><code>docker compose restart multi-lingua</code></pre>
        </li>
      </ol>

      <h2 className="text-2xl font-semibold mt-8 mb-4">Pricing & Limits</h2>
      <table className="min-w-full border-collapse border border-gray-300 dark:border-gray-700 mb-6">
        <thead className="bg-gray-100 dark:bg-gray-800">
          <tr>
            <th className="border border-gray-300 dark:border-gray-700 p-2">Tier</th>
            <th className="border border-gray-300 dark:border-gray-700 p-2">Daily Limit</th>
            <th className="border border-gray-300 dark:border-gray-700 p-2">Cost</th>
            <th className="border border-gray-300 dark:border-gray-700 p-2">Requirements</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="border border-gray-300 dark:border-gray-700 p-2">Anonymous</td>
            <td className="border border-gray-300 dark:border-gray-700 p-2">10,000 words</td>
            <td className="border border-gray-300 dark:border-gray-700 p-2">Free</td>
            <td className="border border-gray-300 dark:border-gray-700 p-2">None</td>
          </tr>
          <tr>
            <td className="border border-gray-300 dark:border-gray-700 p-2">With Email</td>
            <td className="border border-gray-300 dark:border-gray-700 p-2">30,000 words</td>
            <td className="border border-gray-300 dark:border-gray-700 p-2">Free</td>
            <td className="border border-gray-300 dark:border-gray-700 p-2">Email address</td>
          </tr>
        </tbody>
      </table>

      <h2 className="text-2xl font-semibold mt-8 mb-4">Advantages</h2>
      <ul className="list-disc pl-6 space-y-2 mb-6">
        <li><strong>Completely Free:</strong> No credit card or payment required</li>
        <li><strong>No API Key:</strong> Simplest setup of all providers</li>
        <li><strong>Good for Common Phrases:</strong> Leverages human translation memory</li>
        <li><strong>Generous Quota:</strong> 30,000 words/day is sufficient for most personal use</li>
        <li><strong>No Registration:</strong> Just provide an email for higher quota</li>
      </ul>

      <h2 className="text-2xl font-semibold mt-8 mb-4">Limitations</h2>
      <ul className="list-disc pl-6 space-y-2 mb-6">
        <li><strong>Variable Quality:</strong> Quality depends on available translation memory matches</li>
        <li><strong>Daily Limits:</strong> Resets every 24 hours</li>
        <li><strong>No Control:</strong> Cannot self-host or customize</li>
        <li><strong>Rate Limiting:</strong> May throttle requests during high usage</li>
      </ul>

      <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4 mt-6">
        <h3 className="text-purple-800 dark:text-purple-200 mt-0 mb-2">💡 Best Use Cases</h3>
        <ul className="list-disc pl-6 space-y-1 mb-0">
          <li>Personal projects with moderate translation needs</li>
          <li>Backup provider when LibreTranslate is slow</li>
          <li>Testing and development</li>
          <li>Common phrases and sentences (better matches in translation memory)</li>
        </ul>
      </div>
    </div>
  );
}

function GoogleSetup() {
  return (
    <div className="prose dark:prose-invert max-w-none text-gray-800 dark:text-gray-200">
      <h1 className="text-3xl font-bold mb-6">Google Translate API Setup</h1>

      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
        <h3 className="text-blue-800 dark:text-blue-200 mt-0 mb-2">📚 Official Documentation</h3>
        <p className="mb-2">This guide is based on:</p>
        <ul className="list-disc pl-6 space-y-1 mb-0">
          <li>
            <a 
              href="https://translatepress.com/docs/automatic-translation/generate-google-api-key/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-600 dark:text-blue-400 hover:underline"
            >
              TranslatePress: Generate Google API Key Guide
            </a>
          </li>
          <li>
            <a 
              href="https://console.cloud.google.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-600 dark:text-blue-400 hover:underline"
            >
              Google Cloud Console
            </a>
          </li>
        </ul>
      </div>

      <h2 className="text-2xl font-semibold mt-8 mb-4">Overview</h2>
      <p className="mb-4">
        Google Translate API offers high-quality, fast translations powered by Google&apos;s neural machine 
        translation technology. It supports over 100 languages and provides excellent accuracy for most 
        language pairs.
      </p>

      <h2 className="text-2xl font-semibold mt-8 mb-4">Step 1: Create a Google Cloud Project</h2>
      <ol className="list-decimal pl-6 space-y-3 mb-6">
        <li>
          Go to the{' '}
          <a 
            href="https://console.cloud.google.com" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-blue-600 dark:text-blue-400 hover:underline"
          >
            Google Cloud Console
          </a>
        </li>
        <li>Sign in with your Google account</li>
        <li>Click on the project dropdown at the top of the page</li>
        <li>Click <strong>&quot;New Project&quot;</strong></li>
        <li>Enter a project name (e.g., &quot;MultiLingua Translations&quot;)</li>
        <li>Click <strong>&quot;Create&quot;</strong></li>
        <li>Wait for the project to be created (usually takes a few seconds)</li>
      </ol>

      <h2 className="text-2xl font-semibold mt-8 mb-4">Step 2: Enable the Cloud Translation API</h2>
      <ol className="list-decimal pl-6 space-y-3 mb-6">
        <li>Make sure your new project is selected in the project dropdown</li>
        <li>In the left sidebar, go to <strong>&quot;APIs & Services&quot;</strong> → <strong>&quot;Library&quot;</strong></li>
        <li>In the search box, type <strong>&quot;Cloud Translation API&quot;</strong></li>
        <li>Click on <strong>&quot;Cloud Translation API&quot;</strong> from the results</li>
        <li>Click the <strong>&quot;Enable&quot;</strong> button</li>
        <li>Wait for the API to be enabled</li>
      </ol>

      <h2 className="text-2xl font-semibold mt-8 mb-4">Step 3: Create API Credentials</h2>
      <ol className="list-decimal pl-6 space-y-3 mb-6">
        <li>Go to <strong>&quot;APIs & Services&quot;</strong> → <strong>&quot;Credentials&quot;</strong></li>
        <li>Click <strong>&quot;Create Credentials&quot;</strong> at the top</li>
        <li>Select <strong>&quot;API key&quot;</strong> from the dropdown</li>
        <li>Your API key will be created and displayed in a popup</li>
        <li><strong>Copy the API key</strong> immediately and store it securely</li>
      </ol>

      <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-6">
        <h3 className="text-yellow-800 dark:text-yellow-200 mt-0 mb-2">⚠️ Important: Restrict Your API Key</h3>
        <p className="mb-2">
          <strong>Never use an unrestricted API key in production!</strong> Always restrict your key to prevent 
          unauthorized use and unexpected charges.
        </p>
      </div>

      <h2 className="text-2xl font-semibold mt-8 mb-4">Step 4: Restrict the API Key (Recommended)</h2>
      <ol className="list-decimal pl-6 space-y-3 mb-6">
        <li>In the API key popup, click <strong>&quot;Edit API key&quot;</strong> (or find your key in the Credentials list)</li>
        <li>Under <strong>&quot;API restrictions&quot;</strong>, select <strong>&quot;Restrict key&quot;</strong></li>
        <li>From the dropdown, select <strong>&quot;Cloud Translation API&quot;</strong></li>
        <li>Optionally, under <strong>&quot;Application restrictions&quot;</strong>:
          <ul className="list-disc pl-6 mt-2 space-y-1">
            <li><strong>IP addresses:</strong> Restrict to your server&apos;s IP</li>
            <li><strong>HTTP referrers:</strong> Restrict to your domain</li>
          </ul>
        </li>
        <li>Click <strong>&quot;Save&quot;</strong></li>
      </ol>

      <h2 className="text-2xl font-semibold mt-8 mb-4">Step 5: Enable Billing</h2>
      <p className="mb-4">
        Google Cloud Translation API requires billing to be enabled, but don&apos;t worry - there&apos;s a generous free tier!
      </p>
      <ol className="list-decimal pl-6 space-y-3 mb-6">
        <li>Go to <strong>&quot;Billing&quot;</strong> in the left sidebar</li>
        <li>Click <strong>&quot;Link a billing account&quot;</strong></li>
        <li>Either select an existing billing account or create a new one</li>
        <li>Enter your payment information (required even for free tier)</li>
        <li>Click <strong>&quot;Set account&quot;</strong></li>
      </ol>

      <h2 className="text-2xl font-semibold mt-8 mb-4">Step 6: Configure MultiLingua</h2>
      <ol className="list-decimal pl-6 space-y-3 mb-6">
        <li>Open MultiLingua in your browser</li>
        <li>Click the Settings icon (⚙️) in the top-right corner</li>
        <li>Scroll to the <strong>&quot;Google Translate&quot;</strong> section</li>
        <li>Paste your API key in the <strong>&quot;API Key&quot;</strong> field</li>
        <li>Toggle the switch to <strong>enable</strong> Google Translate</li>
        <li>Click <strong>&quot;Save Settings&quot;</strong></li>
      </ol>

      <h2 className="text-2xl font-semibold mt-8 mb-4">Pricing (as of 2024)</h2>
      <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 mb-6">
        <h3 className="text-lg font-semibold mt-0 mb-3">Free Tier</h3>
        <ul className="list-disc pl-6 space-y-2 mb-4">
          <li><strong>$300 credit</strong> for new Google Cloud accounts (90-day trial)</li>
          <li><strong>$10/month</strong> free credit for Cloud Translation API (≈500,000 characters)</li>
          <li>No charges until you exceed free tier limits</li>
        </ul>

        <h3 className="text-lg font-semibold mt-4 mb-3">Paid Tier (Pay-as-you-go)</h3>
        <ul className="list-disc pl-6 space-y-2 mb-0">
          <li><strong>Standard Edition:</strong> $20 per million characters</li>
          <li><strong>Advanced Edition:</strong> $30 per million characters (with custom models)</li>
          <li>Billed monthly based on usage</li>
        </ul>
      </div>

      <h2 className="text-2xl font-semibold mt-8 mb-4">Monitoring Usage</h2>
      <p className="mb-4">To monitor your API usage and costs:</p>
      <ol className="list-decimal pl-6 space-y-2 mb-6">
        <li>Go to <strong>&quot;APIs & Services&quot;</strong> → <strong>&quot;Dashboard&quot;</strong></li>
        <li>Click on <strong>&quot;Cloud Translation API&quot;</strong></li>
        <li>View your usage metrics and quotas</li>
        <li>Set up billing alerts in <strong>&quot;Billing&quot;</strong> → <strong>&quot;Budgets & alerts&quot;</strong></li>
      </ol>

      <h2 className="text-2xl font-semibold mt-8 mb-4">Advantages</h2>
      <ul className="list-disc pl-6 space-y-2 mb-6">
        <li><strong>High Quality:</strong> Powered by Google&apos;s neural machine translation</li>
        <li><strong>Fast:</strong> Low latency, global infrastructure</li>
        <li><strong>Reliable:</strong> 99.95% uptime SLA for paid tier</li>
        <li><strong>Generous Free Tier:</strong> $10/month free credit</li>
        <li><strong>Wide Language Support:</strong> 100+ languages</li>
      </ul>

      <h2 className="text-2xl font-semibold mt-8 mb-4">Limitations</h2>
      <ul className="list-disc pl-6 space-y-2 mb-6">
        <li><strong>Billing Required:</strong> Must have payment method on file</li>
        <li><strong>Costs:</strong> Can become expensive for high-volume usage</li>
        <li><strong>Data Privacy:</strong> Translations processed by Google servers</li>
        <li><strong>Rate Limits:</strong> Default quota limits apply (can request increases)</li>
      </ul>

      <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 mt-6">
        <h3 className="text-green-800 dark:text-green-200 mt-0 mb-2">💡 Pro Tips</h3>
        <ul className="list-disc pl-6 space-y-1 mb-0">
          <li>Set up billing alerts to avoid unexpected charges</li>
          <li>Always restrict your API key to prevent unauthorized use</li>
          <li>Use the free tier for development and testing</li>
          <li>Consider using a separate project for production vs. development</li>
          <li>Monitor your usage regularly in the Google Cloud Console</li>
        </ul>
      </div>
    </div>
  );
}

function DeepLSetup() {
  return (
    <div className="prose dark:prose-invert max-w-none text-gray-800 dark:text-gray-200">
      <h1 className="text-3xl font-bold mb-6">DeepL API Setup</h1>

      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
        <h3 className="text-blue-800 dark:text-blue-200 mt-0 mb-2">📚 Official Documentation</h3>
        <p className="mb-2">This guide is based on:</p>
        <ul className="list-disc pl-6 space-y-1 mb-0">
          <li>
            <a 
              href="https://support.deepl.com/hc/en-us/articles/360020695820-API-key-for-DeepL-API" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-600 dark:text-blue-400 hover:underline"
            >
              DeepL Support: API Key Guide
            </a>
          </li>
          <li>
            <a 
              href="https://www.deepl.com/pro-api" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-600 dark:text-blue-400 hover:underline"
            >
              DeepL API Official Page
            </a>
          </li>
        </ul>
      </div>

      <h2 className="text-2xl font-semibold mt-8 mb-4">Overview</h2>
      <p className="mb-4">
        DeepL is renowned for producing the most natural-sounding translations, especially for European languages. 
        Many translators and language professionals prefer DeepL for its nuanced understanding of context and 
        idiomatic expressions.
      </p>

      <h2 className="text-2xl font-semibold mt-8 mb-4">Step 1: Choose Your Plan</h2>
      <p className="mb-4">DeepL offers two API tiers:</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
          <h3 className="text-lg font-semibold mb-2">🆓 DeepL API Free</h3>
          <ul className="text-sm list-disc pl-5 space-y-1 mb-3">
            <li>500,000 characters/month</li>
            <li>Completely free forever</li>
            <li>No credit card required</li>
            <li>Perfect for personal projects</li>
          </ul>
          <a 
            href="https://www.deepl.com/pro-api?cta=header-pro-api/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-blue-600 dark:text-blue-400 hover:underline text-sm"
          >
            Sign up for Free →
          </a>
        </div>

        <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
          <h3 className="text-lg font-semibold mb-2">💼 DeepL API Pro</h3>
          <ul className="text-sm list-disc pl-5 space-y-1 mb-3">
            <li>Pay-as-you-go or subscription</li>
            <li>€20/million characters</li>
            <li>Volume discounts available</li>
            <li>Priority support</li>
          </ul>
          <a 
            href="https://www.deepl.com/pro-api" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-blue-600 dark:text-blue-400 hover:underline text-sm"
          >
            View Pro Plans →
          </a>
        </div>
      </div>

      <h2 className="text-2xl font-semibold mt-8 mb-4">Step 2: Create a DeepL Account</h2>
      <ol className="list-decimal pl-6 space-y-3 mb-6">
        <li>
          Go to the{' '}
          <a 
            href="https://www.deepl.com/pro-api" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-blue-600 dark:text-blue-400 hover:underline"
          >
            DeepL API page
          </a>
        </li>
        <li>Click <strong>&quot;Sign up for free&quot;</strong> or choose a Pro plan</li>
        <li>Enter your email address and create a password</li>
        <li>Verify your email address by clicking the link sent to your inbox</li>
        <li>Complete your profile information</li>
        <li>For the Free API, no payment method is required</li>
        <li>For Pro API, you&apos;ll need to add payment information</li>
      </ol>

      <h2 className="text-2xl font-semibold mt-8 mb-4">Step 3: Get Your API Key</h2>
      <ol className="list-decimal pl-6 space-y-3 mb-6">
        <li>
          Log in to your{' '}
          <a 
            href="https://www.deepl.com/account" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-blue-600 dark:text-blue-400 hover:underline"
          >
            DeepL Account
          </a>
        </li>
        <li>Click on your name in the top-right corner</li>
        <li>Go to <strong>&quot;Account&quot;</strong></li>
        <li>Scroll down to the <strong>&quot;Authentication Key for DeepL API&quot;</strong> section</li>
        <li>Your API key will be displayed (or click <strong>&quot;Create new key&quot;</strong> if needed)</li>
        <li><strong>Copy the authentication key</strong> - you&apos;ll need it for MultiLingua</li>
      </ol>

      <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-6">
        <h3 className="text-yellow-800 dark:text-yellow-200 mt-0 mb-2">⚠️ Important: API Type Matters!</h3>
        <p className="mb-2">
          DeepL Free and Pro API keys use <strong>different endpoints</strong>:
        </p>
        <ul className="list-disc pl-6 space-y-1 mb-0">
          <li><strong>Free API:</strong> api-free.deepl.com</li>
          <li><strong>Pro API:</strong> api.deepl.com</li>
        </ul>
        <p className="mt-2 mb-0">
          Using the wrong endpoint will result in authentication errors!
        </p>
      </div>

      <h2 className="text-2xl font-semibold mt-8 mb-4">Step 4: Configure MultiLingua</h2>
      <ol className="list-decimal pl-6 space-y-3 mb-6">
        <li>Open MultiLingua in your browser</li>
        <li>Click the Settings icon (⚙️) in the top-right corner</li>
        <li>Scroll to the <strong>&quot;DeepL&quot;</strong> section</li>
        <li>Paste your API key in the <strong>&quot;API Key&quot;</strong> field</li>
        <li><strong>Important:</strong> Select the correct API type:
          <ul className="list-disc pl-6 mt-2 space-y-1">
            <li>If you signed up for <strong>DeepL API Free</strong>, MultiLingua will use api-free.deepl.com</li>
            <li>If you have <strong>DeepL API Pro</strong>, MultiLingua will use api.deepl.com</li>
          </ul>
        </li>
        <li>Toggle the switch to <strong>enable</strong> DeepL</li>
        <li>Click <strong>&quot;Save Settings&quot;</strong></li>
      </ol>

      <h2 className="text-2xl font-semibold mt-8 mb-4">Pricing Details</h2>
      <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 mb-6">
        <h3 className="text-lg font-semibold mt-0 mb-3">DeepL API Free</h3>
        <ul className="list-disc pl-6 space-y-2 mb-4">
          <li><strong>500,000 characters/month</strong> completely free</li>
          <li>No credit card required</li>
          <li>No expiration date</li>
          <li>Same translation quality as Pro</li>
          <li>Perfect for individual developers and small projects</li>
        </ul>

        <h3 className="text-lg font-semibold mt-4 mb-3">DeepL API Pro (Pay-as-you-go)</h3>
        <ul className="list-disc pl-6 space-y-2 mb-4">
          <li><strong>Starter:</strong> €4.99/month + €20 per million characters</li>
          <li><strong>Advanced:</strong> €29.99/month + €15 per million characters</li>
          <li><strong>Ultimate:</strong> €89.99/month + €10 per million characters</li>
          <li>Volume discounts for higher usage</li>
        </ul>

        <h3 className="text-lg font-semibold mt-4 mb-3">Character Counting</h3>
        <ul className="list-disc pl-6 space-y-1 mb-0">
          <li>Only source text is counted (not translations)</li>
          <li>Whitespace and special characters count</li>
          <li>HTML tags are counted</li>
        </ul>
      </div>

      <h2 className="text-2xl font-semibold mt-8 mb-4">Monitoring Usage</h2>
      <ol className="list-decimal pl-6 space-y-2 mb-6">
        <li>Log in to your <a href="https://www.deepl.com/account" target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline">DeepL Account</a></li>
        <li>Go to <strong>&quot;Account&quot;</strong> → <strong>&quot;Usage&quot;</strong></li>
        <li>View your current usage and remaining quota</li>
        <li>Monitor historical usage patterns</li>
        <li>Set up email notifications for usage thresholds</li>
      </ol>

      <h2 className="text-2xl font-semibold mt-8 mb-4">Supported Languages</h2>
      <p className="mb-4">
        DeepL supports all languages used in MultiLingua with exceptional quality:
      </p>
      <ul className="list-disc pl-6 space-y-1 mb-6">
        <li><strong>English</strong> - British and American variants</li>
        <li><strong>German</strong> - Excellent quality (DeepL is German-based)</li>
        <li><strong>French</strong> - Very high quality</li>
        <li><strong>Italian</strong> - Very high quality</li>
        <li><strong>Spanish</strong> - Very high quality</li>
      </ul>

      <h2 className="text-2xl font-semibold mt-8 mb-4">Advantages</h2>
      <ul className="list-disc pl-6 space-y-2 mb-6">
        <li><strong>Best Quality:</strong> Widely regarded as producing the most natural translations</li>
        <li><strong>Context-Aware:</strong> Excellent at understanding nuance and idioms</li>
        <li><strong>Generous Free Tier:</strong> 500,000 characters/month is very generous</li>
        <li><strong>No Credit Card for Free:</strong> Easy to get started</li>
        <li><strong>European Languages:</strong> Exceptional quality for EU language pairs</li>
        <li><strong>Fast:</strong> Low latency with global infrastructure</li>
      </ul>

      <h2 className="text-2xl font-semibold mt-8 mb-4">Limitations</h2>
      <ul className="list-disc pl-6 space-y-2 mb-6">
        <li><strong>Language Coverage:</strong> Fewer languages than Google (but high quality for supported ones)</li>
        <li><strong>Free Tier Limit:</strong> 500K chars/month may not be enough for heavy users</li>
        <li><strong>Pro Costs:</strong> Can be expensive for very high volumes</li>
        <li><strong>API Type Confusion:</strong> Must use correct endpoint for Free vs Pro</li>
      </ul>

      <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4 mt-6">
        <h3 className="text-purple-800 dark:text-purple-200 mt-0 mb-2">✨ Why Choose DeepL?</h3>
        <p className="mb-2">
          DeepL is the best choice if you prioritize <strong>translation quality over cost</strong>. 
          It&apos;s particularly excellent for:
        </p>
        <ul className="list-disc pl-6 space-y-1 mb-0">
          <li>Professional translations that will be read by humans</li>
          <li>European language pairs (especially German, French, Spanish, Italian)</li>
          <li>Content where natural language and context matter</li>
          <li>Marketing materials, customer-facing content, documentation</li>
          <li>Projects where the free tier limit (500K chars/month) is sufficient</li>
        </ul>
      </div>

      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mt-6">
        <h3 className="text-blue-800 dark:text-blue-200 mt-0 mb-2">❓ Having Issues?</h3>
        <p className="mb-0">
          See the <Link href="/help" className="text-blue-600 dark:text-blue-400 hover:underline">Troubleshooting section</Link> for DeepL-specific solutions.
        </p>
      </div>
    </div>
  );
}

function AzureSetup() {
  return (
    <div className="prose dark:prose-invert max-w-none text-gray-800 dark:text-gray-200">
      <h1 className="text-3xl font-bold mb-6">Azure Translator Setup</h1>

      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
        <h3 className="text-blue-800 dark:text-blue-200 mt-0 mb-2">📚 Official Documentation</h3>
        <p className="mb-2">This guide is based on:</p>
        <ul className="list-disc pl-6 space-y-1 mb-0">
          <li>
            <a 
              href="https://medium.com/data-science/how-to-integrate-the-microsoft-translator-api-in-your-code-89bad979028e" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-600 dark:text-blue-400 hover:underline"
            >
              Medium: Microsoft Translator API Integration Guide
            </a>
          </li>
          <li>
            <a 
              href="https://azure.microsoft.com/en-us/services/cognitive-services/translator/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-600 dark:text-blue-400 hover:underline"
            >
              Azure Translator Official Page
            </a>
          </li>
          <li>
            <a 
              href="https://portal.azure.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-600 dark:text-blue-400 hover:underline"
            >
              Azure Portal
            </a>
          </li>
        </ul>
      </div>

      <h2 className="text-2xl font-semibold mt-8 mb-4">Overview</h2>
      <p className="mb-4">
        Azure Translator is Microsoft&apos;s cloud-based neural machine translation service, offering enterprise-grade 
        reliability, security, and scalability. It&apos;s particularly well-suited for business applications requiring 
        high availability and compliance.
      </p>

      <h2 className="text-2xl font-semibold mt-8 mb-4">Step 1: Create an Azure Account</h2>
      <ol className="list-decimal pl-6 space-y-3 mb-6">
        <li>
          Go to{' '}
          <a 
            href="https://azure.microsoft.com/free/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-blue-600 dark:text-blue-400 hover:underline"
          >
            Azure Free Account
          </a>
        </li>
        <li>Click <strong>&quot;Start free&quot;</strong></li>
        <li>Sign in with your Microsoft account (or create one)</li>
        <li>Provide your phone number for verification</li>
        <li>Enter your credit card details (required even for free tier - won&apos;t be charged unless you upgrade)</li>
        <li>Complete identity verification</li>
        <li>Click <strong>&quot;Sign up&quot;</strong></li>
      </ol>

      <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 mb-6">
        <h3 className="text-green-800 dark:text-green-200 mt-0 mb-2">🎁 Free Tier Benefits</h3>
        <ul className="list-disc pl-6 space-y-1 mb-0">
          <li><strong>$200 credit</strong> valid for 30 days</li>
          <li><strong>12 months</strong> of popular free services</li>
          <li><strong>2 million characters/month</strong> free for Translator (always free)</li>
          <li>No automatic charges - you must explicitly upgrade</li>
        </ul>
      </div>

      <h2 className="text-2xl font-semibold mt-8 mb-4">Step 2: Create a Translator Resource</h2>
      <ol className="list-decimal pl-6 space-y-3 mb-6">
        <li>
          Log in to the{' '}
          <a 
            href="https://portal.azure.com" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-blue-600 dark:text-blue-400 hover:underline"
          >
            Azure Portal
          </a>
        </li>
        <li>Click <strong>&quot;Create a resource&quot;</strong> (+ icon in the top-left)</li>
        <li>Search for <strong>&quot;Translator&quot;</strong> in the marketplace</li>
        <li>Select <strong>&quot;Translator&quot;</strong> from the results</li>
        <li>Click <strong>&quot;Create&quot;</strong></li>
        <li>Fill in the resource details:
          <ul className="list-disc pl-6 mt-2 space-y-2">
            <li><strong>Subscription:</strong> Select your Azure subscription</li>
            <li><strong>Resource group:</strong> Create new (e.g., &quot;multilingu-resources&quot;) or select existing</li>
            <li><strong>Region:</strong> Choose a region close to you (e.g., East US, West Europe)</li>
            <li><strong>Name:</strong> Enter a unique name (e.g., &quot;multilingua-translator&quot;)</li>
            <li><strong>Pricing tier:</strong> Select <strong>&quot;Free F0&quot;</strong> (2M chars/month) or <strong>&quot;Standard S1&quot;</strong> (pay-as-you-go)</li>
          </ul>
        </li>
        <li>Click <strong>&quot;Review + create&quot;</strong></li>
        <li>Review your settings and click <strong>&quot;Create&quot;</strong></li>
        <li>Wait for deployment to complete (usually 1-2 minutes)</li>
      </ol>

      <h2 className="text-2xl font-semibold mt-8 mb-4">Step 3: Get Your API Key and Region</h2>
      <ol className="list-decimal pl-6 space-y-3 mb-6">
        <li>Once deployment is complete, click <strong>&quot;Go to resource&quot;</strong></li>
        <li>In the left sidebar, click <strong>&quot;Keys and Endpoint&quot;</strong> under Resource Management</li>
        <li>You&apos;ll see two items you need:
          <ul className="list-disc pl-6 mt-2 space-y-2">
            <li><strong>KEY 1</strong> or <strong>KEY 2</strong> - Copy either one (both work the same)</li>
            <li><strong>Location/Region</strong> - Note this value (e.g., &quot;eastus&quot;, &quot;westeurope&quot;)</li>
          </ul>
        </li>
        <li>Store both the key and region securely - you&apos;ll need both for MultiLingua</li>
      </ol>

      <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-6">
        <h3 className="text-yellow-800 dark:text-yellow-200 mt-0 mb-2">⚠️ Important: Region Required!</h3>
        <p className="mb-0">
          Unlike other APIs, Azure Translator requires <strong>both an API key AND a region</strong>. 
          Make sure to note the region where you created your resource - you&apos;ll need it in MultiLingua settings.
        </p>
      </div>

      <h2 className="text-2xl font-semibold mt-8 mb-4">Step 4: Configure MultiLingua</h2>
      <ol className="list-decimal pl-6 space-y-3 mb-6">
        <li>Open MultiLingua in your browser</li>
        <li>Click the Settings icon (⚙️) in the top-right corner</li>
        <li>Scroll to the <strong>&quot;Azure Translator&quot;</strong> section</li>
        <li>Paste your API key in the <strong>&quot;API Key&quot;</strong> field</li>
        <li>Enter your region in the <strong>&quot;Region&quot;</strong> field (e.g., &quot;eastus&quot;, &quot;westeurope&quot;)</li>
        <li>Toggle the switch to <strong>enable</strong> Azure Translator</li>
        <li>Click <strong>&quot;Save Settings&quot;</strong></li>
      </ol>

      <h2 className="text-2xl font-semibold mt-8 mb-4">Common Azure Regions</h2>
      <p className="mb-4">Choose a region close to your users for better performance:</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div>
          <h3 className="text-lg font-semibold mb-2">Americas</h3>
          <ul className="list-disc pl-6 space-y-1 text-sm">
            <li><code>eastus</code> - East US (Virginia)</li>
            <li><code>eastus2</code> - East US 2 (Virginia)</li>
            <li><code>westus</code> - West US (California)</li>
            <li><code>westus2</code> - West US 2 (Washington)</li>
            <li><code>centralus</code> - Central US (Iowa)</li>
          </ul>
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-2">Europe</h3>
          <ul className="list-disc pl-6 space-y-1 text-sm">
            <li><code>westeurope</code> - West Europe (Netherlands)</li>
            <li><code>northeurope</code> - North Europe (Ireland)</li>
            <li><code>uksouth</code> - UK South (London)</li>
            <li><code>francecentral</code> - France Central (Paris)</li>
            <li><code>germanywestcentral</code> - Germany West Central</li>
          </ul>
        </div>
      </div>

      <h2 className="text-2xl font-semibold mt-8 mb-4">Pricing (as of 2024)</h2>
      <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 mb-6">
        <h3 className="text-lg font-semibold mt-0 mb-3">Free Tier (F0)</h3>
        <ul className="list-disc pl-6 space-y-2 mb-4">
          <li><strong>2 million characters/month</strong> - Always free</li>
          <li>Text Translation included</li>
          <li>No credit card charged</li>
          <li>Perfect for personal projects and testing</li>
        </ul>

        <h3 className="text-lg font-semibold mt-4 mb-3">Standard Tier (S1)</h3>
        <ul className="list-disc pl-6 space-y-2 mb-4">
          <li><strong>$10 per million characters</strong> for Text Translation</li>
          <li>Pay only for what you use</li>
          <li>No monthly commitment</li>
          <li>Volume discounts available for higher tiers</li>
        </ul>

        <h3 className="text-lg font-semibold mt-4 mb-3">Character Counting</h3>
        <ul className="list-disc pl-6 space-y-1 mb-0">
          <li>Spaces, punctuation, and special characters count</li>
          <li>Only source text is counted (not translation output)</li>
          <li>Minimum charge: 1 character</li>
        </ul>
      </div>

      <h2 className="text-2xl font-semibold mt-8 mb-4">Monitoring Usage</h2>
      <ol className="list-decimal pl-6 space-y-2 mb-6">
        <li>Log in to the <a href="https://portal.azure.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline">Azure Portal</a></li>
        <li>Navigate to your Translator resource</li>
        <li>Click <strong>&quot;Metrics&quot;</strong> in the left sidebar</li>
        <li>View real-time usage charts</li>
        <li>Set up alerts in <strong>&quot;Alerts&quot;</strong> to monitor spending</li>
        <li>Check detailed billing in <strong>&quot;Cost Management + Billing&quot;</strong></li>
      </ol>

      <h2 className="text-2xl font-semibold mt-8 mb-4">Advantages</h2>
      <ul className="list-disc pl-6 space-y-2 mb-6">
        <li><strong>Generous Free Tier:</strong> 2 million chars/month is very generous</li>
        <li><strong>Enterprise-Grade:</strong> 99.9% uptime SLA</li>
        <li><strong>Global Infrastructure:</strong> Available in 60+ regions worldwide</li>
        <li><strong>Compliance:</strong> SOC, ISO, HIPAA, and other certifications</li>
        <li><strong>Microsoft Ecosystem:</strong> Integrates well with other Azure services</li>
        <li><strong>Customization:</strong> Support for custom translation models (higher tiers)</li>
      </ul>

      <h2 className="text-2xl font-semibold mt-8 mb-4">Limitations</h2>
      <ul className="list-disc pl-6 space-y-2 mb-6">
        <li><strong>Credit Card Required:</strong> Even for free tier</li>
        <li><strong>Region Dependency:</strong> Must configure correct region with API key</li>
        <li><strong>Azure Portal Complexity:</strong> Steeper learning curve than simpler APIs</li>
        <li><strong>Paid Tier Costs:</strong> $10/million can add up for high volume</li>
      </ul>

      <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4 mt-6">
        <h3 className="text-purple-800 dark:text-purple-200 mt-0 mb-2">🏢 Best Use Cases</h3>
        <p className="mb-2">Azure Translator is ideal for:</p>
        <ul className="list-disc pl-6 space-y-1 mb-0">
          <li>Business applications requiring enterprise SLAs</li>
          <li>Projects already using Azure infrastructure</li>
          <li>Applications needing compliance certifications</li>
          <li>Global applications with users in multiple regions</li>
          <li>High-availability requirements (99.9% uptime)</li>
          <li>Projects benefiting from the generous 2M chars/month free tier</li>
        </ul>
      </div>

      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mt-6">
        <h3 className="text-blue-800 dark:text-blue-200 mt-0 mb-2">❓ Having Issues?</h3>
        <p className="mb-0">
          See the <Link href="/help" className="text-blue-600 dark:text-blue-400 hover:underline">Troubleshooting section</Link> for Azure Translator-specific solutions.
        </p>
      </div>
    </div>
  );
}

function PonsSetup() {
  return (
    <div className="prose dark:prose-invert max-w-none text-gray-800 dark:text-gray-200">
      <h1 className="text-3xl font-bold mb-6">PONS Dictionary Setup</h1>

      <div className="flex flex-wrap gap-4 mb-6">
        <a
          href="https://en.pons.com/p/online-dictionary/developers/api"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center px-4 py-2 bg-green-600 dark:bg-green-700 text-white rounded-lg hover:bg-green-700 dark:hover:bg-green-800 transition-colors"
        >
          <span className="mr-2">📖</span>
          PONS API Documentation
        </a>
      </div>

      <p className="text-lg text-gray-600 dark:text-gray-400 mb-6">
        PONS is a professional online dictionary service specializing in European languages.
        Unlike machine translation services, PONS provides dictionary lookups with rich alternatives,
        making it ideal for learning vocabulary or finding precise word translations.
      </p>

      <h2 className="text-2xl font-semibold mt-8 mb-4">What is PONS?</h2>
      <p className="mb-4">
        PONS (formerly known as PONS Dictionaries) is one of Europe&apos;s leading dictionary publishers,
        offering high-quality bilingual dictionaries. Their API provides access to professional dictionary
        entries with multiple translations, usage examples, and grammatical information.
      </p>

      <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-6">
        <h3 className="text-yellow-800 dark:text-yellow-200 mt-0 mb-2">⚠️ Important Note</h3>
        <p className="mb-0">
          PONS is a <strong>dictionary service</strong>, not a machine translation service. It works best
          for single words and short phrases. For full sentence translation, consider using DeepL,
          Google Translate, or Azure Translator instead.
        </p>
      </div>

      <h2 className="text-2xl font-semibold mt-8 mb-4">Free Tier Details</h2>
      <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 mb-6">
        <h3 className="text-lg font-semibold mb-2">📖 PONS API Free</h3>
        <ul className="list-disc pl-6 space-y-1 mb-0">
          <li><strong>1,000 requests per month</strong> at no cost</li>
          <li>Access to all supported language pairs</li>
          <li>Rich dictionary entries with alternatives</li>
          <li>No credit card required</li>
        </ul>
      </div>

      <h2 className="text-2xl font-semibold mt-8 mb-4">Supported Language Pairs</h2>
      <p className="mb-4">
        PONS supports dictionary lookups between the following language pairs:
      </p>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-6">
        <div className="bg-gray-100 dark:bg-gray-800 rounded p-2 text-sm">🇬🇧 English ↔ 🇩🇪 German</div>
        <div className="bg-gray-100 dark:bg-gray-800 rounded p-2 text-sm">🇬🇧 English ↔ 🇫🇷 French</div>
        <div className="bg-gray-100 dark:bg-gray-800 rounded p-2 text-sm">🇬🇧 English ↔ 🇪🇸 Spanish</div>
        <div className="bg-gray-100 dark:bg-gray-800 rounded p-2 text-sm">🇬🇧 English ↔ 🇮🇹 Italian</div>
        <div className="bg-gray-100 dark:bg-gray-800 rounded p-2 text-sm">🇩🇪 German ↔ 🇫🇷 French</div>
        <div className="bg-gray-100 dark:bg-gray-800 rounded p-2 text-sm">🇩🇪 German ↔ 🇪🇸 Spanish</div>
        <div className="bg-gray-100 dark:bg-gray-800 rounded p-2 text-sm">🇩🇪 German ↔ 🇮🇹 Italian</div>
        <div className="bg-gray-100 dark:bg-gray-800 rounded p-2 text-sm">🇫🇷 French ↔ 🇪🇸 Spanish</div>
        <div className="bg-gray-100 dark:bg-gray-800 rounded p-2 text-sm">And more...</div>
      </div>

      <h2 className="text-2xl font-semibold mt-8 mb-4">Step 1: Register for PONS API</h2>
      <ol className="list-decimal pl-6 space-y-3 mb-6">
        <li>
          Visit the{' '}
          <a href="https://en.pons.com/p/online-dictionary/developers/api" target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline">
            PONS API page
          </a>
        </li>
        <li>Click on <strong>&quot;Request API Access&quot;</strong> or the registration link</li>
        <li>Fill out the registration form with your details</li>
        <li>Describe your intended use case (e.g., &quot;Personal translation app&quot;)</li>
        <li>Submit and wait for approval (usually within 1-2 business days)</li>
      </ol>

      <h2 className="text-2xl font-semibold mt-8 mb-4">Step 2: Get Your API Key</h2>
      <ol className="list-decimal pl-6 space-y-3 mb-6">
        <li>Once approved, you&apos;ll receive an email with your API credentials</li>
        <li>The email contains your <strong>API Secret</strong> (used as the API key)</li>
        <li>Keep this key secure - it provides access to your PONS quota</li>
      </ol>

      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
        <h3 className="text-blue-800 dark:text-blue-200 mt-0 mb-2">💡 Tip</h3>
        <p className="mb-0">
          Save your API key in a secure password manager. You&apos;ll need it to configure MultiLingua.
        </p>
      </div>

      <h2 className="text-2xl font-semibold mt-8 mb-4">Step 3: Configure in MultiLingua</h2>
      <ol className="list-decimal pl-6 space-y-3 mb-6">
        <li>Open MultiLingua and go to <strong>Settings</strong></li>
        <li>Scroll to the <strong>&quot;PONS Dictionary&quot;</strong> section</li>
        <li>Enter your PONS API Secret in the <strong>API Key</strong> field</li>
        <li>Click <strong>Save</strong></li>
        <li>Click the radio button to <strong>enable</strong> PONS Dictionary</li>
      </ol>

      <h2 className="text-2xl font-semibold mt-8 mb-4">How PONS Differs from Other Providers</h2>
      <div className="overflow-x-auto mb-6">
        <table className="min-w-full border border-gray-200 dark:border-gray-700">
          <thead className="bg-gray-100 dark:bg-gray-800">
            <tr>
              <th className="px-4 py-2 text-left border-b border-gray-200 dark:border-gray-700">Feature</th>
              <th className="px-4 py-2 text-left border-b border-gray-200 dark:border-gray-700">PONS</th>
              <th className="px-4 py-2 text-left border-b border-gray-200 dark:border-gray-700">Other Providers</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="px-4 py-2 border-b border-gray-200 dark:border-gray-700">Type</td>
              <td className="px-4 py-2 border-b border-gray-200 dark:border-gray-700">Dictionary lookup</td>
              <td className="px-4 py-2 border-b border-gray-200 dark:border-gray-700">Machine translation</td>
            </tr>
            <tr>
              <td className="px-4 py-2 border-b border-gray-200 dark:border-gray-700">Best for</td>
              <td className="px-4 py-2 border-b border-gray-200 dark:border-gray-700">Single words, vocabulary</td>
              <td className="px-4 py-2 border-b border-gray-200 dark:border-gray-700">Sentences, paragraphs</td>
            </tr>
            <tr>
              <td className="px-4 py-2 border-b border-gray-200 dark:border-gray-700">Alternatives</td>
              <td className="px-4 py-2 border-b border-gray-200 dark:border-gray-700">Many (dictionary entries)</td>
              <td className="px-4 py-2 border-b border-gray-200 dark:border-gray-700">Few or none</td>
            </tr>
            <tr>
              <td className="px-4 py-2 border-b border-gray-200 dark:border-gray-700">Context</td>
              <td className="px-4 py-2 border-b border-gray-200 dark:border-gray-700">Word meanings in isolation</td>
              <td className="px-4 py-2 border-b border-gray-200 dark:border-gray-700">Context-aware translation</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h2 className="text-2xl font-semibold mt-8 mb-4">Advantages of PONS</h2>
      <ul className="list-disc pl-6 space-y-2 mb-6">
        <li><strong>Rich Alternatives:</strong> Get multiple translations with different nuances</li>
        <li><strong>Professional Quality:</strong> Curated by lexicographers, not machine-generated</li>
        <li><strong>Vocabulary Learning:</strong> Perfect for building vocabulary knowledge</li>
        <li><strong>Free Tier:</strong> 1,000 queries/month is generous for personal use</li>
        <li><strong>European Focus:</strong> Excellent for German, French, Spanish, Italian</li>
      </ul>

      <h2 className="text-2xl font-semibold mt-8 mb-4">Limitations</h2>
      <ul className="list-disc pl-6 space-y-2 mb-6">
        <li><strong>Single Words:</strong> Not suitable for full sentence translation</li>
        <li><strong>Limited Languages:</strong> Fewer language pairs than Google or DeepL</li>
        <li><strong>No Context:</strong> Doesn&apos;t understand sentence context</li>
        <li><strong>Manual Approval:</strong> API access requires approval (not instant)</li>
      </ul>

      <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4 mb-6">
        <h3 className="text-purple-800 dark:text-purple-200 mt-0 mb-2">✨ Best Use Case</h3>
        <p className="mb-0">
          Use PONS when you need to translate individual words and want to see multiple possible
          translations with different meanings. For sentences and paragraphs, switch to DeepL or
          Google Translate for better results.
        </p>
      </div>

      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <h3 className="text-blue-800 dark:text-blue-200 mt-0 mb-2">❓ Having Issues?</h3>
        <p className="mb-0">
          See the <Link href="/help" className="text-blue-600 dark:text-blue-400 hover:underline">Troubleshooting section</Link> for PONS-specific solutions.
        </p>
      </div>
    </div>
  );
}

function MerriamWebsterSetup() {
  return (
    <div className="prose dark:prose-invert max-w-none text-gray-800 dark:text-gray-200">
      <h1 className="text-3xl font-bold mb-6">Merriam-Webster Dictionary Setup</h1>

      <div className="flex flex-wrap gap-4 mb-6">
        <a
          href="https://dictionaryapi.com/"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center px-4 py-2 bg-red-600 dark:bg-red-700 text-white rounded-lg hover:bg-red-700 dark:hover:bg-red-800 transition-colors"
        >
          <span className="mr-2">📕</span>
          Merriam-Webster API Portal
        </a>
        <a
          href="https://dictionaryapi.com/products/api-collegiate-dictionary"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center px-4 py-2 bg-gray-600 dark:bg-gray-700 text-white rounded-lg hover:bg-gray-700 dark:hover:bg-gray-800 transition-colors"
        >
          <span className="mr-2">📖</span>
          Collegiate Dictionary API Docs
        </a>
      </div>

      <p className="text-lg text-gray-600 dark:text-gray-400 mb-6">
        Merriam-Webster is America&apos;s most trusted dictionary, providing authoritative English
        definitions since 1828. Their API offers access to the Collegiate Dictionary with detailed
        definitions, pronunciations, and usage examples.
      </p>

      <h2 className="text-2xl font-semibold mt-8 mb-4">What is Merriam-Webster API?</h2>
      <p className="mb-4">
        The Merriam-Webster Dictionary API provides programmatic access to the same content found in
        their renowned Collegiate Dictionary. It&apos;s ideal for looking up English word definitions,
        including multiple meanings, parts of speech, and usage examples.
      </p>

      <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-6">
        <h3 className="text-yellow-800 dark:text-yellow-200 mt-0 mb-2">⚠️ English Only</h3>
        <p className="mb-0">
          Merriam-Webster is an <strong>English dictionary</strong> only. It provides definitions in English
          for English words. For translation between languages, use other providers like DeepL, Google,
          or PONS.
        </p>
      </div>

      <h2 className="text-2xl font-semibold mt-8 mb-4">Free Tier Details</h2>
      <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 mb-6">
        <h3 className="text-lg font-semibold mb-2">📕 Merriam-Webster Free API</h3>
        <ul className="list-disc pl-6 space-y-1 mb-0">
          <li><strong>1,000 queries per day</strong> at no cost</li>
          <li>Access to the Collegiate Dictionary</li>
          <li>Includes definitions, pronunciations, and examples</li>
          <li>No credit card required</li>
          <li>For non-commercial use</li>
        </ul>
      </div>

      <h2 className="text-2xl font-semibold mt-8 mb-4">Step 1: Create a Developer Account</h2>
      <ol className="list-decimal pl-6 space-y-3 mb-6">
        <li>
          Visit the{' '}
          <a href="https://dictionaryapi.com/" target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline">
            Merriam-Webster Developer Center
          </a>
        </li>
        <li>Click <strong>&quot;Register&quot;</strong> or <strong>&quot;Get Started&quot;</strong></li>
        <li>Fill out the registration form with your email and create a password</li>
        <li>Verify your email address by clicking the link in the confirmation email</li>
        <li>Log in to your new developer account</li>
      </ol>

      <h2 className="text-2xl font-semibold mt-8 mb-4">Step 2: Request API Keys</h2>
      <ol className="list-decimal pl-6 space-y-3 mb-6">
        <li>After logging in, navigate to <strong>&quot;My Keys&quot;</strong> or <strong>&quot;Request API Key&quot;</strong></li>
        <li>Select <strong>&quot;Collegiate Dictionary&quot;</strong> from the available products</li>
        <li>Fill out the brief form describing your intended use (e.g., &quot;Personal vocabulary app&quot;)</li>
        <li>Submit the request - keys are usually granted instantly for the free tier</li>
        <li>Copy your <strong>API Key</strong> from the dashboard</li>
      </ol>

      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
        <h3 className="text-blue-800 dark:text-blue-200 mt-0 mb-2">💡 Multiple Keys Available</h3>
        <p className="mb-0">
          Merriam-Webster offers separate API keys for different dictionary products (Collegiate,
          Thesaurus, Medical, etc.). For MultiLingua, you need the <strong>Collegiate Dictionary</strong> key.
        </p>
      </div>

      <h2 className="text-2xl font-semibold mt-8 mb-4">Step 3: Configure in MultiLingua</h2>
      <ol className="list-decimal pl-6 space-y-3 mb-6">
        <li>Open MultiLingua and go to <strong>Settings</strong></li>
        <li>Scroll to the <strong>&quot;Merriam-Webster&quot;</strong> section</li>
        <li>Click the expand arrow to show configuration options</li>
        <li>Enter your Collegiate Dictionary API Key in the <strong>API Key</strong> field</li>
        <li>Click <strong>Save</strong></li>
        <li>Click the radio button to <strong>enable</strong> Merriam-Webster</li>
      </ol>

      <h2 className="text-2xl font-semibold mt-8 mb-4">What You Get</h2>
      <p className="mb-4">When you look up a word with Merriam-Webster, you&apos;ll receive:</p>
      <ul className="list-disc pl-6 space-y-2 mb-6">
        <li><strong>Definitions:</strong> Multiple meanings organized by part of speech</li>
        <li><strong>Short Definitions:</strong> Concise explanations displayed in MultiLingua</li>
        <li><strong>Alternatives:</strong> Additional meanings shown as alternative translations</li>
      </ul>

      <h2 className="text-2xl font-semibold mt-8 mb-4">Advantages</h2>
      <ul className="list-disc pl-6 space-y-2 mb-6">
        <li><strong>Authoritative:</strong> America&apos;s most trusted dictionary since 1828</li>
        <li><strong>Comprehensive:</strong> Detailed definitions with multiple meanings</li>
        <li><strong>Generous Free Tier:</strong> 1,000 queries per day is excellent for personal use</li>
        <li><strong>Instant Access:</strong> No approval wait time, keys granted immediately</li>
        <li><strong>Pronunciation:</strong> Includes phonetic spellings</li>
      </ul>

      <h2 className="text-2xl font-semibold mt-8 mb-4">Limitations</h2>
      <ul className="list-disc pl-6 space-y-2 mb-6">
        <li><strong>English Only:</strong> No translations to other languages</li>
        <li><strong>Single Words:</strong> Best for individual word lookups, not sentences</li>
        <li><strong>American English:</strong> Primarily focuses on American English spellings and usage</li>
        <li><strong>Non-Commercial Only:</strong> Free tier requires non-commercial use</li>
      </ul>

      <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4 mb-6">
        <h3 className="text-purple-800 dark:text-purple-200 mt-0 mb-2">✨ Best Use Case</h3>
        <p className="mb-0">
          Use Merriam-Webster when you need authoritative English definitions and want to understand
          the full meaning of English words. For translations between languages, switch to DeepL,
          Google, or PONS.
        </p>
      </div>

      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <h3 className="text-blue-800 dark:text-blue-200 mt-0 mb-2">❓ Having Issues?</h3>
        <p className="mb-0">
          See the <Link href="/help" className="text-blue-600 dark:text-blue-400 hover:underline">Troubleshooting section</Link> for dictionary-specific solutions.
        </p>
      </div>
    </div>
  );
}

function FreeDictionarySetup() {
  return (
    <div className="prose dark:prose-invert max-w-none text-gray-800 dark:text-gray-200">
      <h1 className="text-3xl font-bold mb-6">Free Dictionary API Setup</h1>

      <div className="flex flex-wrap gap-4 mb-6">
        <a
          href="https://dictionaryapi.dev/"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center px-4 py-2 bg-green-600 dark:bg-green-700 text-white rounded-lg hover:bg-green-700 dark:hover:bg-green-800 transition-colors"
        >
          <span className="mr-2">📗</span>
          Free Dictionary API Website
        </a>
        <a
          href="https://github.com/meetDeveloper/freeDictionaryAPI"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center px-4 py-2 bg-gray-800 dark:bg-gray-700 text-white rounded-lg hover:bg-gray-900 dark:hover:bg-gray-600 transition-colors"
        >
          <span className="mr-2">⭐</span>
          GitHub Repository
        </a>
      </div>

      <p className="text-lg text-gray-600 dark:text-gray-400 mb-6">
        The Free Dictionary API is a completely free, open-source dictionary service that requires
        no API key, no registration, and has no usage limits. It&apos;s the easiest way to get started
        with dictionary lookups in MultiLingua.
      </p>

      <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 mb-6">
        <h3 className="text-green-800 dark:text-green-200 mt-0 mb-2">🎉 No Setup Required!</h3>
        <p className="mb-0">
          Free Dictionary API requires <strong>no API key</strong> and <strong>no registration</strong>.
          Simply enable it in Settings and start using it immediately!
        </p>
      </div>

      <h2 className="text-2xl font-semibold mt-8 mb-4">What is Free Dictionary API?</h2>
      <p className="mb-4">
        The Free Dictionary API is an open-source project that provides free access to English word
        definitions, pronunciations, examples, and synonyms. It aggregates data from multiple sources
        including Wiktionary and other open dictionaries.
      </p>

      <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-6">
        <h3 className="text-yellow-800 dark:text-yellow-200 mt-0 mb-2">⚠️ English Only</h3>
        <p className="mb-0">
          Free Dictionary API only supports <strong>English definitions</strong>. For translations between
          languages, use other providers like DeepL, Google, or PONS.
        </p>
      </div>

      <h2 className="text-2xl font-semibold mt-8 mb-4">Features</h2>
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
        <h3 className="text-lg font-semibold mb-2">📗 Free Dictionary API</h3>
        <ul className="list-disc pl-6 space-y-1 mb-0">
          <li><strong>Completely free</strong> - no costs ever</li>
          <li><strong>No API key required</strong> - just enable and use</li>
          <li><strong>No registration</strong> - no account needed</li>
          <li><strong>No rate limits</strong> - use as much as you need</li>
          <li><strong>Open source</strong> - community maintained</li>
        </ul>
      </div>

      <h2 className="text-2xl font-semibold mt-8 mb-4">How to Enable</h2>
      <ol className="list-decimal pl-6 space-y-3 mb-6">
        <li>Open MultiLingua and go to <strong>Settings</strong></li>
        <li>Scroll to the <strong>&quot;Free Dictionary&quot;</strong> section</li>
        <li>Click the radio button to <strong>enable</strong> Free Dictionary</li>
        <li>That&apos;s it! No API key needed - start translating immediately</li>
      </ol>

      <h2 className="text-2xl font-semibold mt-8 mb-4">What You Get</h2>
      <p className="mb-4">When you look up a word with Free Dictionary, you&apos;ll receive:</p>
      <ul className="list-disc pl-6 space-y-2 mb-6">
        <li><strong>Definitions:</strong> Multiple meanings with part of speech (noun, verb, etc.)</li>
        <li><strong>Examples:</strong> Usage examples for many words</li>
        <li><strong>Alternatives:</strong> Additional definitions shown as alternatives in MultiLingua</li>
        <li><strong>Phonetics:</strong> Pronunciation information when available</li>
      </ul>

      <h2 className="text-2xl font-semibold mt-8 mb-4">Advantages</h2>
      <ul className="list-disc pl-6 space-y-2 mb-6">
        <li><strong>Zero Cost:</strong> Completely free forever</li>
        <li><strong>No Registration:</strong> No account or API key needed</li>
        <li><strong>No Limits:</strong> No daily or monthly quotas</li>
        <li><strong>Instant Setup:</strong> Enable and start using immediately</li>
        <li><strong>Open Source:</strong> Transparent, community-driven project</li>
        <li><strong>Privacy:</strong> No tracking, no data collection</li>
      </ul>

      <h2 className="text-2xl font-semibold mt-8 mb-4">Limitations</h2>
      <ul className="list-disc pl-6 space-y-2 mb-6">
        <li><strong>English Only:</strong> No translations to other languages</li>
        <li><strong>Single Words:</strong> Best for individual word lookups</li>
        <li><strong>Coverage:</strong> May not have obscure or technical terms</li>
        <li><strong>No Official Support:</strong> Community-maintained project</li>
      </ul>

      <h2 className="text-2xl font-semibold mt-8 mb-4">Comparison with Other Dictionary Providers</h2>
      <div className="overflow-x-auto mb-6">
        <table className="min-w-full border border-gray-200 dark:border-gray-700">
          <thead className="bg-gray-100 dark:bg-gray-800">
            <tr>
              <th className="px-4 py-2 text-left border-b border-gray-200 dark:border-gray-700">Feature</th>
              <th className="px-4 py-2 text-left border-b border-gray-200 dark:border-gray-700">Free Dictionary</th>
              <th className="px-4 py-2 text-left border-b border-gray-200 dark:border-gray-700">Merriam-Webster</th>
              <th className="px-4 py-2 text-left border-b border-gray-200 dark:border-gray-700">Oxford</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="px-4 py-2 border-b border-gray-200 dark:border-gray-700">Cost</td>
              <td className="px-4 py-2 border-b border-gray-200 dark:border-gray-700">Free</td>
              <td className="px-4 py-2 border-b border-gray-200 dark:border-gray-700">Free tier</td>
              <td className="px-4 py-2 border-b border-gray-200 dark:border-gray-700">Free tier</td>
            </tr>
            <tr>
              <td className="px-4 py-2 border-b border-gray-200 dark:border-gray-700">API Key</td>
              <td className="px-4 py-2 border-b border-gray-200 dark:border-gray-700">Not required</td>
              <td className="px-4 py-2 border-b border-gray-200 dark:border-gray-700">Required</td>
              <td className="px-4 py-2 border-b border-gray-200 dark:border-gray-700">Required</td>
            </tr>
            <tr>
              <td className="px-4 py-2 border-b border-gray-200 dark:border-gray-700">Daily Limit</td>
              <td className="px-4 py-2 border-b border-gray-200 dark:border-gray-700">Unlimited</td>
              <td className="px-4 py-2 border-b border-gray-200 dark:border-gray-700">1,000/day</td>
              <td className="px-4 py-2 border-b border-gray-200 dark:border-gray-700">1,000/month</td>
            </tr>
            <tr>
              <td className="px-4 py-2 border-b border-gray-200 dark:border-gray-700">Authority</td>
              <td className="px-4 py-2 border-b border-gray-200 dark:border-gray-700">Community</td>
              <td className="px-4 py-2 border-b border-gray-200 dark:border-gray-700">Professional</td>
              <td className="px-4 py-2 border-b border-gray-200 dark:border-gray-700">Professional</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4 mb-6">
        <h3 className="text-purple-800 dark:text-purple-200 mt-0 mb-2">✨ Best Use Case</h3>
        <p className="mb-0">
          Free Dictionary is perfect for casual English word lookups when you don&apos;t want to deal
          with API keys or usage limits. For authoritative definitions, consider Merriam-Webster.
          For translations, use DeepL or Google.
        </p>
      </div>

      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <h3 className="text-blue-800 dark:text-blue-200 mt-0 mb-2">❓ Having Issues?</h3>
        <p className="mb-0">
          Free Dictionary is an external service. If lookups fail, the service may be temporarily
          unavailable. Try again later or switch to another provider.
        </p>
      </div>
    </div>
  );
}

function TatoebaSetup() {
  return (
    <div className="prose dark:prose-invert max-w-none text-gray-800 dark:text-gray-200">
      <h1 className="text-3xl font-bold mb-6">Tatoeba Setup</h1>

      <div className="flex flex-wrap gap-4 mb-6">
        <a
          href="https://tatoeba.org/"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center px-4 py-2 bg-green-600 dark:bg-green-700 text-white rounded-lg hover:bg-green-700 dark:hover:bg-green-800 transition-colors"
        >
          <span className="mr-2">🌐</span>
          Tatoeba Website
        </a>
        <a
          href="https://api.tatoeba.org/openapi-unstable.json"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center px-4 py-2 bg-gray-800 dark:bg-gray-700 text-white rounded-lg hover:bg-gray-900 dark:hover:bg-gray-600 transition-colors"
        >
          <span className="mr-2">📖</span>
          API Specification
        </a>
      </div>

      <p className="text-lg text-gray-600 dark:text-gray-400 mb-6">
        Tatoeba is a free, community-curated database of sentences and their translations
        across 400+ languages. Unlike machine-translation providers, Tatoeba returns
        <strong> human-written example sentences</strong> showing real-world usage.
        All data is CC-licensed.
      </p>

      <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 mb-6">
        <h3 className="text-green-800 dark:text-green-200 mt-0 mb-2">🎉 No Setup Required!</h3>
        <p className="mb-0">
          Tatoeba requires <strong>no API key</strong> and <strong>no registration</strong>.
          Simply enable it in Settings and start using it immediately!
        </p>
      </div>

      <h2 className="text-2xl font-semibold mt-8 mb-4">How It Works</h2>
      <p className="mb-4">When you translate a word or phrase with Tatoeba:</p>
      <ul className="list-disc pl-6 space-y-2 mb-6">
        <li><strong>Primary translation:</strong> The shortest sentence containing your text is found, and its translations are used</li>
        <li><strong>Example sentences:</strong> Longer sentences with the word in context appear as alternatives in all language columns</li>
        <li><strong>Correlated proposals:</strong> Proposal [N] across all columns comes from the same Tatoeba sentence, so they match</li>
      </ul>

      <h2 className="text-2xl font-semibold mt-8 mb-4">Supported Languages</h2>
      <p className="mb-4">Currently supports the five core MultiLingua languages:</p>
      <ul className="list-disc pl-6 space-y-1 mb-6">
        <li>🇬🇧 English (en)</li>
        <li>🇩🇪 German (de)</li>
        <li>🇫🇷 French (fr)</li>
        <li>🇮🇹 Italian (it)</li>
        <li>🇪🇸 Spanish (es)</li>
      </ul>
      <p className="mb-4 text-gray-600 dark:text-gray-400">
        Tatoeba&apos;s database covers 400+ languages. Additional languages can be added as MultiLingua
        expands its language set in v0.5.0.
      </p>

      <h2 className="text-2xl font-semibold mt-8 mb-4">Advantages</h2>
      <ul className="list-disc pl-6 space-y-2 mb-6">
        <li><strong>Zero Cost:</strong> Completely free, no API key needed</li>
        <li><strong>Human-Written:</strong> Real sentences written by native speakers, not machine-generated</li>
        <li><strong>Context:</strong> See words used in real sentences, ideal for language learning</li>
        <li><strong>CC-Licensed:</strong> Open data you can use freely</li>
        <li><strong>Audio Available:</strong> Many sentences have community-recorded pronunciations (future feature)</li>
      </ul>

      <h2 className="text-2xl font-semibold mt-8 mb-4">Limitations</h2>
      <ul className="list-disc pl-6 space-y-2 mb-6">
        <li><strong>Coverage:</strong> Not every word has sentences in all languages</li>
        <li><strong>Not Machine Translation:</strong> Cannot translate arbitrary text &mdash; only finds existing sentence matches</li>
        <li><strong>Short Texts:</strong> Works best with single words or short phrases</li>
        <li><strong>Correlated Results:</strong> Requires translations in all target languages, which may limit the number of results</li>
      </ul>

      <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4">
        <h3 className="text-purple-800 dark:text-purple-200 mt-0 mb-2">✨ Best Use Case</h3>
        <p className="mb-0">
          Tatoeba is ideal for language learners who want to see how a word is used in real
          sentences across multiple languages. Combine it with a machine-translation provider
          for the best of both worlds.
        </p>
      </div>
    </div>
  );
}

function OxfordSetup() {
  return (
    <div className="prose dark:prose-invert max-w-none text-gray-800 dark:text-gray-200">
      <h1 className="text-3xl font-bold mb-6">Oxford Dictionary API Setup</h1>

      <div className="flex flex-wrap gap-4 mb-6">
        <a
          href="https://developer.oxforddictionaries.com/"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center px-4 py-2 bg-blue-800 dark:bg-blue-700 text-white rounded-lg hover:bg-blue-900 dark:hover:bg-blue-800 transition-colors"
        >
          <span className="mr-2">📘</span>
          Oxford API Developer Portal
        </a>
        <a
          href="https://developer.oxforddictionaries.com/documentation"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center px-4 py-2 bg-gray-600 dark:bg-gray-700 text-white rounded-lg hover:bg-gray-700 dark:hover:bg-gray-800 transition-colors"
        >
          <span className="mr-2">📖</span>
          API Documentation
        </a>
      </div>

      <p className="text-lg text-gray-600 dark:text-gray-400 mb-6">
        The Oxford Dictionaries API provides access to one of the world&apos;s most trusted language
        resources. Published by Oxford University Press, it offers comprehensive English definitions
        with unmatched authority and depth.
      </p>

      <h2 className="text-2xl font-semibold mt-8 mb-4">What is Oxford Dictionaries API?</h2>
      <p className="mb-4">
        The Oxford Dictionaries API provides programmatic access to Oxford&apos;s extensive language
        data, including definitions, pronunciations, etymology, and usage examples. It&apos;s considered
        one of the most authoritative sources for English language content.
      </p>

      <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-6">
        <h3 className="text-yellow-800 dark:text-yellow-200 mt-0 mb-2">⚠️ English Only (in MultiLingua)</h3>
        <p className="mb-0">
          While Oxford API supports multiple languages, MultiLingua currently uses it for
          <strong> English definitions only</strong>. For translations between languages, use DeepL,
          Google, or PONS.
        </p>
      </div>

      <h2 className="text-2xl font-semibold mt-8 mb-4">Free Tier Details</h2>
      <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 mb-6">
        <h3 className="text-lg font-semibold mb-2">📘 Oxford API Free (Prototype)</h3>
        <ul className="list-disc pl-6 space-y-1 mb-0">
          <li><strong>1,000 requests per month</strong> at no cost</li>
          <li>Access to the core dictionary data</li>
          <li>Includes definitions and examples</li>
          <li>No credit card required</li>
          <li>For non-commercial prototyping</li>
        </ul>
      </div>

      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
        <h3 className="text-blue-800 dark:text-blue-200 mt-0 mb-2">💡 Two Credentials Required</h3>
        <p className="mb-0">
          Unlike most APIs, Oxford requires <strong>both an App ID and an App Key</strong>. You&apos;ll
          need to configure both in MultiLingua Settings.
        </p>
      </div>

      <h2 className="text-2xl font-semibold mt-8 mb-4">Step 1: Create a Developer Account</h2>
      <ol className="list-decimal pl-6 space-y-3 mb-6">
        <li>
          Visit the{' '}
          <a href="https://developer.oxforddictionaries.com/" target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline">
            Oxford Dictionaries Developer Portal
          </a>
        </li>
        <li>Click <strong>&quot;Get your API key&quot;</strong> or <strong>&quot;Sign up&quot;</strong></li>
        <li>Create an account with your email address</li>
        <li>Verify your email address</li>
        <li>Log in to your developer account</li>
      </ol>

      <h2 className="text-2xl font-semibold mt-8 mb-4">Step 2: Create an Application</h2>
      <ol className="list-decimal pl-6 space-y-3 mb-6">
        <li>In the developer dashboard, go to <strong>&quot;API Credentials&quot;</strong> or <strong>&quot;My Apps&quot;</strong></li>
        <li>Click <strong>&quot;Create new app&quot;</strong> or <strong>&quot;Add Application&quot;</strong></li>
        <li>Enter an application name (e.g., &quot;MultiLingua&quot;)</li>
        <li>Select the <strong>free &quot;Prototype&quot;</strong> tier</li>
        <li>Accept the terms and conditions</li>
        <li>Click <strong>&quot;Create&quot;</strong></li>
      </ol>

      <h2 className="text-2xl font-semibold mt-8 mb-4">Step 3: Get Your Credentials</h2>
      <ol className="list-decimal pl-6 space-y-3 mb-6">
        <li>After creating the app, you&apos;ll see your credentials</li>
        <li>Copy the <strong>Application ID</strong> (also called App ID)</li>
        <li>Copy the <strong>Application Key</strong> (also called App Key or API Key)</li>
        <li>Store both securely - you&apos;ll need them for MultiLingua</li>
      </ol>

      <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4 mb-6">
        <h3 className="text-lg font-semibold mb-2">Example Credentials</h3>
        <p className="mb-2 font-mono text-sm">
          <strong>App ID:</strong> a1b2c3d4
        </p>
        <p className="mb-0 font-mono text-sm">
          <strong>App Key:</strong> abc123def456ghi789jkl012mno345pqr678
        </p>
      </div>

      <h2 className="text-2xl font-semibold mt-8 mb-4">Step 4: Configure in MultiLingua</h2>
      <ol className="list-decimal pl-6 space-y-3 mb-6">
        <li>Open MultiLingua and go to <strong>Settings</strong></li>
        <li>Scroll to the <strong>&quot;Oxford Dictionary&quot;</strong> section</li>
        <li>Click the expand arrow to show configuration options</li>
        <li>Enter your <strong>App ID</strong> in the App ID field</li>
        <li>Enter your <strong>App Key</strong> in the API Key field</li>
        <li>Click <strong>Save</strong> for each field</li>
        <li>Click the radio button to <strong>enable</strong> Oxford Dictionary</li>
      </ol>

      <h2 className="text-2xl font-semibold mt-8 mb-4">What You Get</h2>
      <p className="mb-4">When you look up a word with Oxford Dictionary, you&apos;ll receive:</p>
      <ul className="list-disc pl-6 space-y-2 mb-6">
        <li><strong>Definitions:</strong> Comprehensive meanings from Oxford&apos;s lexicographers</li>
        <li><strong>Multiple Senses:</strong> Different meanings organized by usage</li>
        <li><strong>Examples:</strong> Real-world usage examples</li>
        <li><strong>Alternatives:</strong> Additional definitions shown in MultiLingua</li>
      </ul>

      <h2 className="text-2xl font-semibold mt-8 mb-4">Advantages</h2>
      <ul className="list-disc pl-6 space-y-2 mb-6">
        <li><strong>World-Class Authority:</strong> Oxford University Press is the gold standard</li>
        <li><strong>Comprehensive:</strong> Detailed definitions with nuanced meanings</li>
        <li><strong>Quality Examples:</strong> Real usage examples from literature and media</li>
        <li><strong>Etymology:</strong> Word origins and history (in full API)</li>
        <li><strong>British & American:</strong> Covers both variants of English</li>
      </ul>

      <h2 className="text-2xl font-semibold mt-8 mb-4">Limitations</h2>
      <ul className="list-disc pl-6 space-y-2 mb-6">
        <li><strong>Low Free Quota:</strong> Only 1,000 requests per month (lowest of all providers)</li>
        <li><strong>English Only:</strong> MultiLingua uses it for English definitions only</li>
        <li><strong>Two Credentials:</strong> Requires both App ID and App Key</li>
        <li><strong>Rate Limited:</strong> May need to upgrade for heavy use</li>
      </ul>

      <h2 className="text-2xl font-semibold mt-8 mb-4">Pricing Tiers</h2>
      <div className="overflow-x-auto mb-6">
        <table className="min-w-full border border-gray-200 dark:border-gray-700">
          <thead className="bg-gray-100 dark:bg-gray-800">
            <tr>
              <th className="px-4 py-2 text-left border-b border-gray-200 dark:border-gray-700">Tier</th>
              <th className="px-4 py-2 text-left border-b border-gray-200 dark:border-gray-700">Requests</th>
              <th className="px-4 py-2 text-left border-b border-gray-200 dark:border-gray-700">Cost</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="px-4 py-2 border-b border-gray-200 dark:border-gray-700">Prototype</td>
              <td className="px-4 py-2 border-b border-gray-200 dark:border-gray-700">1,000/month</td>
              <td className="px-4 py-2 border-b border-gray-200 dark:border-gray-700">Free</td>
            </tr>
            <tr>
              <td className="px-4 py-2 border-b border-gray-200 dark:border-gray-700">Developer</td>
              <td className="px-4 py-2 border-b border-gray-200 dark:border-gray-700">10,000/month</td>
              <td className="px-4 py-2 border-b border-gray-200 dark:border-gray-700">Paid</td>
            </tr>
            <tr>
              <td className="px-4 py-2 border-b border-gray-200 dark:border-gray-700">Enterprise</td>
              <td className="px-4 py-2 border-b border-gray-200 dark:border-gray-700">Custom</td>
              <td className="px-4 py-2 border-b border-gray-200 dark:border-gray-700">Contact sales</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4 mb-6">
        <h3 className="text-purple-800 dark:text-purple-200 mt-0 mb-2">✨ Best Use Case</h3>
        <p className="mb-0">
          Use Oxford Dictionary when you need the most authoritative English definitions available.
          Due to the low monthly quota, save it for important lookups. For casual use, consider
          Free Dictionary or Merriam-Webster instead.
        </p>
      </div>

      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <h3 className="text-blue-800 dark:text-blue-200 mt-0 mb-2">❓ Having Issues?</h3>
        <p className="mb-0">
          Common issues: Make sure you&apos;ve entered <strong>both</strong> the App ID and App Key.
          Check that your monthly quota hasn&apos;t been exceeded. See the{' '}
          <Link href="/help" className="text-blue-600 dark:text-blue-400 hover:underline">Troubleshooting section</Link> for more help.
        </p>
      </div>
    </div>
  );
}

function Usage() {
  return (
    <div className="prose dark:prose-invert max-w-none text-gray-800 dark:text-gray-200">
      <h1 className="text-3xl font-bold mb-6">Using MultiLingua</h1>

      <p className="text-lg text-gray-600 dark:text-gray-400 mb-6">
        Learn how to make the most of MultiLingua&apos;s translation features, from basic workflows
        to advanced tips and keyboard shortcuts.
      </p>

      <h2 className="text-2xl font-semibold mt-8 mb-4">Basic Translation Workflow</h2>

      <h3 className="text-xl font-semibold mt-6 mb-3">1. Add a New Translation Entry</h3>
      <ol className="list-decimal pl-6 space-y-2 mb-6">
        <li>Click the <strong>&quot;Add New Translation&quot;</strong> button at the top of the page</li>
        <li>A new empty row will be added to the translation table</li>
        <li>The first input field will be automatically focused</li>
        <li>Start typing in any language column</li>
      </ol>

      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
        <h4 className="text-blue-800 dark:text-blue-200 mt-0 mb-2">💡 Quick Tip</h4>
        <p className="mb-0">
          You can add text in any language column - you don&apos;t have to start with English!
        </p>
      </div>

      <h3 className="text-xl font-semibold mt-6 mb-3">2. Translate Text</h3>
      <ol className="list-decimal pl-6 space-y-3 mb-6">
        <li>Enter or paste your text in any language column</li>
        <li>Click the <strong>🔄 (translate)</strong> button in that column&apos;s header or in the cell</li>
        <li>MultiLingua will automatically translate to all other languages</li>
        <li>The active translation provider will be shown (LibreTranslate, DeepL, Google, Azure, or MyMemory)</li>
        <li>Translation alternatives (up to 10) will appear below the main translation</li>
      </ol>

      <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4 mb-6">
        <h4 className="text-lg font-semibold mb-2">Translation Process:</h4>
        <ol className="list-decimal pl-6 space-y-1 text-sm mb-0">
          <li>Text is sent to the active provider (based on priority)</li>
          <li>Provider returns primary translation + alternatives</li>
          <li>All translations are automatically saved to the database</li>
          <li>UI updates instantly with results</li>
        </ol>
      </div>

      <h3 className="text-xl font-semibold mt-6 mb-3">3. View Alternative Translations</h3>
      <p className="mb-4">
        Alternative translations help you find the most appropriate translation for your context:
      </p>
      <ul className="list-disc pl-6 space-y-2 mb-6">
        <li><strong>Location:</strong> Alternatives appear below the main translation in gray text</li>
        <li><strong>Quantity:</strong> Up to 10 alternatives per translation</li>
        <li><strong>Click to Use:</strong> Click any alternative to replace the current translation</li>
        <li><strong>Context Matters:</strong> Different alternatives may be better for formal vs. casual contexts</li>
      </ul>

      <h3 className="text-xl font-semibold mt-6 mb-3">4. Listen to Pronunciation (Text-to-Speech)</h3>
      <ol className="list-decimal pl-6 space-y-2 mb-6">
        <li>Hover over any translation cell</li>
        <li>Click the <strong>🔊 (speaker)</strong> icon that appears</li>
        <li>Your browser will speak the text using native pronunciation</li>
        <li>Works for all languages: English, German, French, Italian, Spanish</li>
      </ol>

      <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 mb-6">
        <h4 className="text-green-800 dark:text-green-200 mt-0 mb-2">🎧 TTS Features</h4>
        <ul className="list-disc pl-6 space-y-1 mb-0">
          <li>Uses your browser&apos;s built-in text-to-speech engine</li>
          <li>Automatic language detection for proper pronunciation</li>
          <li>No additional setup or API keys required</li>
          <li>Great for learning proper pronunciation</li>
        </ul>
      </div>

      <h3 className="text-xl font-semibold mt-6 mb-3">5. Edit Translations Manually</h3>
      <ul className="list-disc pl-6 space-y-2 mb-6">
        <li><strong>Click any cell</strong> to edit its content directly</li>
        <li><strong>Type or paste</strong> your custom translation</li>
        <li><strong>Click outside</strong> the cell or press <kbd>Enter</kbd> to save</li>
        <li><strong>Press <kbd>Esc</kbd></strong> to cancel editing</li>
        <li><strong>Auto-save:</strong> Changes are saved immediately to the database</li>
      </ul>

      <h3 className="text-xl font-semibold mt-6 mb-3">6. Delete Translation Entries</h3>
      <ol className="list-decimal pl-6 space-y-2 mb-6">
        <li>Find the entry you want to delete</li>
        <li>Click the <strong>🗑️ (trash)</strong> icon in the Actions column</li>
        <li>The entry will be deleted immediately</li>
        <li><strong>⚠️ Warning:</strong> This action cannot be undone!</li>
      </ol>

      <h2 className="text-2xl font-semibold mt-8 mb-4">Managing Translation Providers</h2>

      <h3 className="text-xl font-semibold mt-6 mb-3">Accessing Settings</h3>
      <ol className="list-decimal pl-6 space-y-2 mb-6">
        <li>Click the <strong>⚙️ (gear)</strong> icon in the top-right corner</li>
        <li>The Settings page will open in the same window</li>
        <li>Scroll to find different provider sections</li>
        <li>Click &quot;← Back&quot; to return to the main app</li>
      </ol>

      <h3 className="text-xl font-semibold mt-6 mb-3">Configuring Providers</h3>
      <p className="mb-4">Each provider has its own configuration section:</p>
      <ol className="list-decimal pl-6 space-y-3 mb-6">
        <li><strong>Toggle Switch:</strong> Enable or disable the provider</li>
        <li><strong>API Credentials:</strong> Enter API keys, URLs, or other required settings</li>
        <li><strong>Test Connection:</strong> Some providers show status indicators</li>
        <li><strong>Save Settings:</strong> Click the button to apply changes</li>
      </ol>

      <h3 className="text-xl font-semibold mt-6 mb-3">Provider Priority</h3>
      <p className="mb-4">
        MultiLingua automatically selects the first available provider in this order:
      </p>
      <ol className="list-decimal pl-6 space-y-2 mb-6">
        <li><strong>LibreTranslate</strong> - If enabled and configured (self-hosted, free)</li>
        <li><strong>MyMemory</strong> - If enabled (free tier, no API key)</li>
        <li><strong>DeepL</strong> - If enabled and API key provided (best quality)</li>
        <li><strong>Google Translate</strong> - If enabled and API key provided</li>
        <li><strong>Azure Translator</strong> - If enabled and API key + region provided</li>
      </ol>

      <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4 mb-6">
        <h4 className="text-purple-800 dark:text-purple-200 mt-0 mb-2">🎯 Best Practice</h4>
        <p className="mb-2">Enable multiple providers for automatic failover:</p>
        <ul className="list-disc pl-6 space-y-1 mb-0">
          <li>If one provider is slow or down, MultiLingua switches to the next</li>
          <li>Different providers excel at different language pairs</li>
          <li>Compare translations from multiple sources for better accuracy</li>
        </ul>
      </div>

      <h2 className="text-2xl font-semibold mt-8 mb-4">Sorting and Organization</h2>

      <h3 className="text-xl font-semibold mt-6 mb-3">Alphabetical Sorting</h3>
      <ul className="list-disc pl-6 space-y-2 mb-6">
        <li>Click the <strong>&quot;English ⇅&quot;</strong> header to sort by English column</li>
        <li>Click again to reverse the sort order (A-Z → Z-A)</li>
        <li>Sorting helps you find specific translations quickly</li>
        <li>Sort order is maintained until you change it</li>
      </ul>

      <h2 className="text-2xl font-semibold mt-8 mb-4">Keyboard Shortcuts</h2>

      <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4 mb-6">
        <table className="min-w-full">
          <thead>
            <tr className="border-b border-gray-300 dark:border-gray-600">
              <th className="text-left py-2 pr-4">Shortcut</th>
              <th className="text-left py-2">Action</th>
            </tr>
          </thead>
          <tbody className="text-sm">
            <tr className="border-b border-gray-200 dark:border-gray-700">
              <td className="py-2 pr-4"><kbd className="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded">Tab</kbd></td>
              <td className="py-2">Move to next input field</td>
            </tr>
            <tr className="border-b border-gray-200 dark:border-gray-700">
              <td className="py-2 pr-4"><kbd className="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded">Shift</kbd> + <kbd className="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded">Tab</kbd></td>
              <td className="py-2">Move to previous input field</td>
            </tr>
            <tr className="border-b border-gray-200 dark:border-gray-700">
              <td className="py-2 pr-4"><kbd className="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded">Enter</kbd></td>
              <td className="py-2">Save current cell and move down</td>
            </tr>
            <tr className="border-b border-gray-200 dark:border-gray-700">
              <td className="py-2 pr-4"><kbd className="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded">Esc</kbd></td>
              <td className="py-2">Cancel editing without saving</td>
            </tr>
            <tr>
              <td className="py-2 pr-4"><kbd className="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded">Ctrl</kbd> + <kbd className="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded">V</kbd></td>
              <td className="py-2">Paste text into focused field</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h2 className="text-2xl font-semibold mt-8 mb-4">Advanced Features</h2>

      <h3 className="text-xl font-semibold mt-6 mb-3">Viewing API Documentation</h3>
      <ul className="list-disc pl-6 space-y-2 mb-6">
        <li>Click the <strong>&lt;/&gt; (code)</strong> icon in the top-right corner</li>
        <li>Opens interactive Swagger/OpenAPI documentation</li>
        <li>Test API endpoints directly from your browser</li>
        <li>See request/response examples</li>
        <li>Perfect for integrating MultiLingua into other applications</li>
      </ul>

      <h3 className="text-xl font-semibold mt-6 mb-3">Dark Mode</h3>
      <ul className="list-disc pl-6 space-y-2 mb-6">
        <li>Click the <strong>🌙/☀️ (theme)</strong> icon to toggle dark mode</li>
        <li>Dark mode is easier on the eyes in low-light conditions</li>
        <li>Preference is saved automatically</li>
        <li>Follows your system&apos;s dark mode setting by default</li>
      </ul>

      <h3 className="text-xl font-semibold mt-6 mb-3">Understanding the Provider Badge</h3>
      <p className="mb-4">
        Each translation shows which provider was used:
      </p>
      <ul className="list-disc pl-6 space-y-2 mb-6">
        <li><strong>LibreTranslate:</strong> Self-hosted, free, privacy-focused</li>
        <li><strong>MyMemory:</strong> Free tier, good for common phrases</li>
        <li><strong>DeepL:</strong> Best quality, especially for European languages</li>
        <li><strong>Google:</strong> Fast, reliable, wide language support</li>
        <li><strong>Azure:</strong> Enterprise-grade, high availability</li>
      </ul>

      <h2 className="text-2xl font-semibold mt-8 mb-4">Tips & Tricks</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
          <h4 className="text-lg font-semibold mb-2">💡 For Best Results</h4>
          <ul className="text-sm list-disc pl-5 space-y-1">
            <li>Use complete sentences for better context</li>
            <li>Review alternative translations for nuances</li>
            <li>DeepL typically produces the most natural results</li>
            <li>Enable multiple providers for comparison</li>
          </ul>
        </div>

        <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
          <h4 className="text-lg font-semibold mb-2">⚡ Speed Tips</h4>
          <ul className="text-sm list-disc pl-5 space-y-1">
            <li>Use keyboard shortcuts for faster navigation</li>
            <li>LibreTranslate is slower on first request</li>
            <li>Cloud providers (DeepL, Google) are faster</li>
            <li>Batch similar translations together</li>
          </ul>
        </div>

        <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
          <h4 className="text-lg font-semibold mb-2">🔒 Privacy</h4>
          <ul className="text-sm list-disc pl-5 space-y-1">
            <li>LibreTranslate keeps data on your server</li>
            <li>Cloud providers send data to their servers</li>
            <li>All translations stored in local SQLite database</li>
            <li>No analytics or tracking in MultiLingua</li>
          </ul>
        </div>

        <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
          <h4 className="text-lg font-semibold mb-2">💰 Cost Optimization</h4>
          <ul className="text-sm list-disc pl-5 space-y-1">
            <li>Use free providers (LibreTranslate, MyMemory) first</li>
            <li>Monitor API usage in provider dashboards</li>
            <li>DeepL Free: 500K chars/month</li>
            <li>Azure Free: 2M chars/month</li>
          </ul>
        </div>
      </div>

      <h2 className="text-2xl font-semibold mt-8 mb-4">Common Workflows</h2>

      <h3 className="text-xl font-semibold mt-6 mb-3">Building a Translation Database</h3>
      <ol className="list-decimal pl-6 space-y-2 mb-6">
        <li>Add frequently used phrases one by one</li>
        <li>Review and select best translations from alternatives</li>
        <li>Edit translations manually for brand-specific terms</li>
        <li>Export data via API for use in other applications</li>
      </ol>

      <h3 className="text-xl font-semibold mt-6 mb-3">Learning Languages</h3>
      <ol className="list-decimal pl-6 space-y-2 mb-6">
        <li>Enter phrases you want to learn in your native language</li>
        <li>Translate to target language(s)</li>
        <li>Use text-to-speech to hear proper pronunciation</li>
        <li>Review alternative translations to understand nuances</li>
        <li>Build a personal phrase book over time</li>
      </ol>

      <h3 className="text-xl font-semibold mt-6 mb-3">Content Localization</h3>
      <ol className="list-decimal pl-6 space-y-2 mb-6">
        <li>Add all UI strings, messages, and content</li>
        <li>Translate using high-quality providers (DeepL recommended)</li>
        <li>Review translations for cultural appropriateness</li>
        <li>Export via API and integrate into your application</li>
        <li>Update translations as content changes</li>
      </ol>

      <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mt-8">
        <h3 className="text-yellow-800 dark:text-yellow-200 mt-0 mb-2">📚 Need More Help?</h3>
        <ul className="list-disc pl-6 space-y-1 mb-0">
          <li>Check the <Link href="/help" className="text-yellow-700 dark:text-yellow-300 hover:underline">other help sections</Link> for provider setup</li>
          <li>Visit <Link href="/api-docs" className="text-yellow-700 dark:text-yellow-300 hover:underline">API Documentation</Link> for programmatic access</li>
          <li>See <Link href="/help" onClick={() => setActiveSection('troubleshooting')} className="text-yellow-700 dark:text-yellow-300 hover:underline">Troubleshooting</Link> for common issues</li>
        </ul>
      </div>
    </div>
  );
}

function ApiReference() {
  return (
    <div className="prose dark:prose-invert max-w-none text-gray-800 dark:text-gray-200">
      <h1 className="text-3xl font-bold mb-6">API Reference</h1>

      <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4 mb-6">
        <h3 className="text-purple-800 dark:text-purple-200 mt-0 mb-2">📖 Interactive API Documentation</h3>
        <p className="mb-3">
          MultiLingua provides complete, interactive API documentation using OpenAPI/Swagger.
        </p>
        <Link 
          href="/api-docs"
          className="inline-flex items-center px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
          </svg>
          Open API Documentation
        </Link>
      </div>

      <h2 className="text-2xl font-semibold mt-8 mb-4">What You&apos;ll Find in the API Docs</h2>
      <ul className="list-disc pl-6 space-y-2 mb-6">
        <li><strong>Complete Endpoint Reference:</strong> All available API endpoints with detailed descriptions</li>
        <li><strong>Request/Response Examples:</strong> See exactly what to send and what you&apos;ll receive</li>
        <li><strong>Try It Out:</strong> Test API calls directly from your browser</li>
        <li><strong>Schema Definitions:</strong> Detailed object models and data types</li>
        <li><strong>Authentication Details:</strong> How to authenticate (if required in future versions)</li>
      </ul>

      <h2 className="text-2xl font-semibold mt-8 mb-4">Quick Overview</h2>
      <p className="mb-4">
        MultiLingua provides a RESTful API for programmatic access to all translation features.
      </p>

      <h3 className="text-xl font-semibold mt-6 mb-3">Base URL</h3>
      <pre className="bg-gray-100 dark:bg-gray-800 p-3 rounded mb-6"><code>http://localhost:3456/api</code></pre>

      <h3 className="text-xl font-semibold mt-6 mb-3">Main Endpoints</h3>
      <div className="space-y-4 mb-6">
        <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 text-xs font-mono rounded">POST</span>
            <code className="text-sm">/api/translate</code>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-0">
            Translate text from one language to multiple target languages
          </p>
        </div>

        <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs font-mono rounded">GET</span>
            <code className="text-sm">/api/translations</code>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-0">
            Retrieve all saved translation entries
          </p>
        </div>

        <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 text-xs font-mono rounded">POST</span>
            <code className="text-sm">/api/translations</code>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-0">
            Create a new translation entry
          </p>
        </div>

        <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2 py-1 bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 text-xs font-mono rounded">PUT</span>
            <code className="text-sm">/api/translations</code>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-0">
            Update an existing translation entry
          </p>
        </div>

        <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2 py-1 bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 text-xs font-mono rounded">DELETE</span>
            <code className="text-sm">/api/translations?id=&#123;id&#125;</code>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-0">
            Delete a translation entry by ID
          </p>
        </div>

        <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs font-mono rounded">GET</span>
            <code className="text-sm">/api/providers</code>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-0">
            Get list of configured translation providers and active provider
          </p>
        </div>
      </div>

      <h2 className="text-2xl font-semibold mt-8 mb-4">Example: Translate Text</h2>
      <p className="mb-4">Here&apos;s a quick example of how to use the translation API:</p>
      
      <h3 className="text-lg font-semibold mt-4 mb-2">Request</h3>
      <pre className="bg-gray-100 dark:bg-gray-800 p-3 rounded mb-4"><code>{`POST /api/translate
Content-Type: application/json

{
  "text": "Hello world",
  "sourceLanguage": "en"
}`}</code></pre>

      <h3 className="text-lg font-semibold mt-4 mb-2">Response</h3>
      <pre className="bg-gray-100 dark:bg-gray-800 p-3 rounded mb-6"><code>{`{
  "provider": "LibreTranslate",
  "german": {
    "translation": "Hallo Welt",
    "alternatives": ["Hallo zusammen", "Grüß Gott"]
  },
  "french": {
    "translation": "Bonjour le monde",
    "alternatives": ["Salut le monde"]
  },
  "italian": {
    "translation": "Ciao mondo",
    "alternatives": ["Buongiorno mondo"]
  },
  "spanish": {
    "translation": "Hola mundo",
    "alternatives": ["Hola a todos"]
  }
}`}</code></pre>

      <h2 className="text-2xl font-semibold mt-8 mb-4">Response Features</h2>
      <ul className="list-disc pl-6 space-y-2 mb-6">
        <li><strong>provider:</strong> Shows which translation service was used (LibreTranslate, DeepL, Google, etc.)</li>
        <li><strong>translation:</strong> The primary translation result</li>
        <li><strong>alternatives:</strong> Array of up to 10 alternative translations</li>
        <li><strong>Multiple languages:</strong> Get translations for all supported languages in one request</li>
      </ul>

      <h2 className="text-2xl font-semibold mt-8 mb-4">Authentication</h2>
      <p className="mb-4">
        Currently, the MultiLingua API does not require authentication. This may change in future versions 
        to add API key support for better security and rate limiting.
      </p>

      <h2 className="text-2xl font-semibold mt-8 mb-4">Error Handling</h2>
      <p className="mb-4">All endpoints return appropriate HTTP status codes:</p>
      <ul className="list-disc pl-6 space-y-1 mb-6">
        <li><code>200</code> - Success</li>
        <li><code>400</code> - Bad Request (invalid parameters)</li>
        <li><code>404</code> - Not Found</li>
        <li><code>500</code> - Internal Server Error</li>
      </ul>

      <p className="mb-4">Error responses include a JSON object with an error message:</p>
      <pre className="bg-gray-100 dark:bg-gray-800 p-3 rounded mb-6"><code>{`{
  "error": "Text is required"
}`}</code></pre>

      <h2 className="text-2xl font-semibold mt-8 mb-4">CORS Support</h2>
      <p className="mb-4">
        The API supports Cross-Origin Resource Sharing (CORS), allowing you to make requests from 
        web applications hosted on different domains.
      </p>

      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mt-8">
        <h3 className="text-blue-800 dark:text-blue-200 mt-0 mb-2">📚 Full Documentation</h3>
        <p className="mb-3">
          For complete, interactive API documentation with the ability to test endpoints directly:
        </p>
        <Link 
          href="/api-docs"
          className="inline-flex items-center text-blue-600 dark:text-blue-400 hover:underline"
        >
          Visit the API Documentation Page →
        </Link>
      </div>
    </div>
  );
}

function Troubleshooting() {
  return (
    <div className="prose dark:prose-invert max-w-none text-gray-800 dark:text-gray-200">
      <h1 className="text-3xl font-bold mb-6">Troubleshooting</h1>

      <p className="text-lg text-gray-600 dark:text-gray-400 mb-6">
        Common issues and solutions for MultiLingua and all translation providers.
      </p>

      <h2 className="text-2xl font-semibold mt-8 mb-4">General Issues</h2>

      <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4 mb-4">
        <h3 className="text-lg font-semibold mt-0 mb-2">No Translations Appearing</h3>
        <p className="mb-2"><strong>Symptom:</strong> Translation fields remain empty after clicking translate</p>
        <p className="mb-2"><strong>Solutions:</strong></p>
        <ul className="list-disc pl-6 space-y-1 mb-0">
          <li>Check browser console for errors (press F12)</li>
          <li>Verify at least one provider is enabled in Settings (⚙️)</li>
          <li>Check server logs: <code>docker compose logs multi-lingua</code></li>
          <li>Try a different provider to isolate the issue</li>
          <li>Ensure you have internet connectivity (for cloud providers)</li>
          <li>Restart the application: <code>docker compose restart multi-lingua</code></li>
        </ul>
      </div>

      <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4 mb-4">
        <h3 className="text-lg font-semibold mt-0 mb-2">Database Errors</h3>
        <p className="mb-2"><strong>Symptom:</strong> &quot;Database locked&quot; or &quot;SQLITE_ERROR&quot;</p>
        <p className="mb-2"><strong>Solutions:</strong></p>
        <ul className="list-disc pl-6 space-y-1 mb-0">
          <li>Restart the application: <code>docker compose restart multi-lingua</code></li>
          <li>Check database volume exists: <code>docker volume ls | grep ml-data</code></li>
          <li>Ensure proper file permissions on database file</li>
          <li>If issue persists, backup data and recreate volume</li>
        </ul>
      </div>

      <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4 mb-4">
        <h3 className="text-lg font-semibold mt-0 mb-2">Slow Performance</h3>
        <p className="mb-2"><strong>Symptom:</strong> Translations take a long time to complete</p>
        <p className="mb-2"><strong>Solutions:</strong></p>
        <ul className="list-disc pl-6 space-y-1 mb-0">
          <li>LibreTranslate can be slow on first request (model loading)</li>
          <li>Consider using cloud providers (DeepL, Google, Azure) for better speed</li>
          <li>Check your internet connection speed</li>
          <li>Increase Docker container resources if running locally</li>
          <li>Monitor LibreTranslate logs: <code>docker compose logs -f libretranslate</code></li>
        </ul>
      </div>

      <h2 className="text-2xl font-semibold mt-8 mb-4">LibreTranslate Issues</h2>

      <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4 mb-4">
        <h3 className="text-lg font-semibold mt-0 mb-2">LibreTranslate Not Working</h3>
        <p className="mb-2"><strong>Symptom:</strong> Translations fail or timeout</p>
        <p className="mb-2"><strong>Solutions:</strong></p>
        <ul className="list-disc pl-6 space-y-1 mb-0">
          <li>Check if LibreTranslate container is running: <code>docker compose ps</code></li>
          <li>Wait for initial model download (can take 5-10 minutes on first start)</li>
          <li>Check LibreTranslate logs: <code>docker compose logs libretranslate</code></li>
          <li>Verify URL in settings: <code>http://libretranslate:5000</code> (from container) or <code>http://localhost:5432</code> (from host)</li>
          <li>Restart LibreTranslate: <code>docker compose restart libretranslate</code></li>
        </ul>
      </div>

      <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4 mb-4">
        <h3 className="text-lg font-semibold mt-0 mb-2">LibreTranslate Container Not Starting</h3>
        <p className="mb-2"><strong>Solutions:</strong></p>
        <pre className="bg-gray-100 dark:bg-gray-900 p-2 rounded text-sm mb-2"><code>docker compose ps
docker compose logs libretranslate</code></pre>
        <p className="mb-2">If needed, reset and rebuild:</p>
        <pre className="bg-gray-100 dark:bg-gray-900 p-2 rounded text-sm mb-0"><code>docker compose down
docker volume rm lt-local
docker compose up -d</code></pre>
      </div>

      <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4 mb-4">
        <h3 className="text-lg font-semibold mt-0 mb-2">LibreTranslate Timeout</h3>
        <p className="mb-2"><strong>Problem:</strong> Translations timeout or take too long</p>
        <p className="mb-2"><strong>Solutions:</strong></p>
        <ul className="list-disc pl-6 space-y-1 mb-0">
          <li>Wait for initial model download to complete</li>
          <li>Check download progress: <code>docker compose logs -f libretranslate | grep -i "download"</code></li>
          <li>First translation after startup may take longer (model loading)</li>
          <li>Subsequent translations should be faster</li>
        </ul>
      </div>

      <h2 className="text-2xl font-semibold mt-8 mb-4">Google Translate Issues</h2>

      <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4 mb-4">
        <h3 className="text-lg font-semibold mt-0 mb-2">Google API Key Not Valid</h3>
        <p className="mb-2"><strong>Symptom:</strong> &quot;API key not valid&quot; or &quot;403 Forbidden&quot;</p>
        <p className="mb-2"><strong>Solutions:</strong></p>
        <ul className="list-disc pl-6 space-y-1 mb-0">
          <li>Verify API key is correct in Settings (no extra spaces)</li>
          <li>Check that Cloud Translation API is enabled in Google Cloud Console</li>
          <li>Ensure API key restrictions allow Translation API</li>
          <li>Verify billing is enabled on your Google Cloud account</li>
          <li>Check quota limits in Google Cloud Console</li>
          <li>Wait a few minutes after creating new API key for it to activate</li>
        </ul>
      </div>

      <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4 mb-4">
        <h3 className="text-lg font-semibold mt-0 mb-2">Google Quota Exceeded</h3>
        <p className="mb-2"><strong>Problem:</strong> &quot;Quota exceeded&quot; or &quot;429 Too Many Requests&quot;</p>
        <p className="mb-2"><strong>Solutions:</strong></p>
        <ul className="list-disc pl-6 space-y-1 mb-0">
          <li>Check usage in Google Cloud Console → APIs & Services → Dashboard</li>
          <li>Monitor your free tier usage ($10/month ≈ 500K characters)</li>
          <li>Request quota increase in Google Cloud Console if needed</li>
          <li>Switch to alternative provider temporarily</li>
          <li>Consider upgrading to paid tier for higher limits</li>
        </ul>
      </div>

      <h2 className="text-2xl font-semibold mt-8 mb-4">DeepL Issues</h2>

      <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4 mb-4">
        <h3 className="text-lg font-semibold mt-0 mb-2">DeepL Authentication Error 403</h3>
        <p className="mb-2"><strong>Problem:</strong> &quot;Authorization failed&quot; or &quot;Invalid authentication key&quot;</p>
        <p className="mb-2"><strong>Solutions:</strong></p>
        <ul className="list-disc pl-6 space-y-1 mb-0">
          <li>Verify you&apos;re using the correct API key from your DeepL account</li>
          <li><strong>Critical:</strong> Check if you&apos;re using Free or Pro API - they have different endpoints:
            <ul className="list-disc pl-6 mt-1">
              <li>Free API: api-free.deepl.com</li>
              <li>Pro API: api.deepl.com</li>
            </ul>
          </li>
          <li>Remove any extra spaces when copying/pasting the key</li>
          <li>Ensure API key hasn&apos;t expired (check DeepL account)</li>
        </ul>
      </div>

      <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4 mb-4">
        <h3 className="text-lg font-semibold mt-0 mb-2">DeepL Quota Exceeded Error 456</h3>
        <p className="mb-2"><strong>Problem:</strong> &quot;Quota exceeded&quot;</p>
        <p className="mb-2"><strong>Solutions:</strong></p>
        <ul className="list-disc pl-6 space-y-1 mb-0">
          <li>Check your usage in DeepL Account dashboard → Usage</li>
          <li>Free tier: 500,000 characters/month - wait until next month for reset</li>
          <li>Monitor usage to avoid unexpected quota hits</li>
          <li>Upgrade to Pro for higher limits if needed</li>
          <li>Consider using an alternative provider temporarily</li>
        </ul>
      </div>

      <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4 mb-4">
        <h3 className="text-lg font-semibold mt-0 mb-2">Wrong DeepL Endpoint</h3>
        <p className="mb-2"><strong>Problem:</strong> API works but you&apos;re charged/not getting free tier</p>
        <p className="mb-2"><strong>Solutions:</strong></p>
        <ul className="list-disc pl-6 space-y-1 mb-0">
          <li>Verify which API type you signed up for (Free vs Pro)</li>
          <li>Free API keys MUST use api-free.deepl.com endpoint</li>
          <li>Pro API keys MUST use api.deepl.com endpoint</li>
          <li>Using wrong endpoint will cause authentication errors</li>
          <li>MultiLingua automatically selects endpoint based on your settings</li>
        </ul>
      </div>

      <h2 className="text-2xl font-semibold mt-8 mb-4">Azure Translator Issues</h2>

      <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4 mb-4">
        <h3 className="text-lg font-semibold mt-0 mb-2">Azure Authentication Error 401</h3>
        <p className="mb-2"><strong>Problem:</strong> &quot;Access denied&quot; or &quot;Invalid credentials&quot;</p>
        <p className="mb-2"><strong>Solutions:</strong></p>
        <ul className="list-disc pl-6 space-y-1 mb-0">
          <li>Verify your API key is correct (no extra spaces)</li>
          <li>Ensure the Translator resource is active in Azure Portal</li>
          <li>Check that you&apos;ve selected the correct subscription</li>
          <li>Verify the API key hasn&apos;t been regenerated or revoked</li>
          <li>Try using the alternate key (KEY 2) from Azure Portal</li>
        </ul>
      </div>

      <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4 mb-4">
        <h3 className="text-lg font-semibold mt-0 mb-2">Azure Invalid Region Error</h3>
        <p className="mb-2"><strong>Problem:</strong> &quot;Invalid region&quot; or &quot;Resource not found&quot;</p>
        <p className="mb-2"><strong>Solutions:</strong></p>
        <ul className="list-disc pl-6 space-y-1 mb-0">
          <li><strong>Critical:</strong> Region must match where you created the Translator resource</li>
          <li>Check region in Azure Portal → Your Resource → Keys and Endpoint</li>
          <li>Use lowercase region code (e.g., &quot;eastus&quot; not &quot;East US&quot;)</li>
          <li>Common regions: eastus, westus, westeurope, northeurope</li>
          <li>Both API key AND region are required for Azure</li>
        </ul>
      </div>

      <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4 mb-4">
        <h3 className="text-lg font-semibold mt-0 mb-2">Azure Quota Exceeded</h3>
        <p className="mb-2"><strong>Problem:</strong> &quot;Quota exceeded&quot; on free tier</p>
        <p className="mb-2"><strong>Solutions:</strong></p>
        <ul className="list-disc pl-6 space-y-1 mb-0">
          <li>Check usage in Azure Portal → Your Resource → Metrics</li>
          <li>Free tier (F0): 2 million characters/month</li>
          <li>Wait until next month for quota reset</li>
          <li>Upgrade to Standard (S1) tier for pay-as-you-go</li>
          <li>Use an alternative provider temporarily</li>
        </ul>
      </div>

      <h2 className="text-2xl font-semibold mt-8 mb-4">PONS Dictionary Issues</h2>

      <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4 mb-4">
        <h3 className="text-lg font-semibold mt-0 mb-2">PONS Authentication Error 403</h3>
        <p className="mb-2"><strong>Problem:</strong> &quot;Authentication failed&quot; error</p>
        <p className="mb-2"><strong>Solutions:</strong></p>
        <ul className="list-disc pl-6 space-y-1 mb-0">
          <li>Verify you entered the correct API Secret (not username)</li>
          <li>Check that your API access has been approved by PONS</li>
          <li>Ensure you copied the full API key without extra spaces</li>
          <li>Try re-entering the API key in Settings</li>
        </ul>
      </div>

      <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4 mb-4">
        <h3 className="text-lg font-semibold mt-0 mb-2">PONS No Results Found</h3>
        <p className="mb-2"><strong>Problem:</strong> Translation returns empty</p>
        <p className="mb-2"><strong>Solutions:</strong></p>
        <ul className="list-disc pl-6 space-y-1 mb-0">
          <li>PONS is a dictionary - try single words instead of sentences</li>
          <li>Check if the language pair is supported (e.g., EN-DE, DE-FR)</li>
          <li>Try the base form of the word (infinitive, singular)</li>
          <li>Some uncommon words may not be in the dictionary</li>
          <li>Use another provider (DeepL, Google) for sentences</li>
        </ul>
      </div>

      <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4 mb-4">
        <h3 className="text-lg font-semibold mt-0 mb-2">PONS Language Pair Not Supported</h3>
        <p className="mb-2"><strong>Problem:</strong> &quot;PONS does not support X -&gt; Y translation&quot;</p>
        <p className="mb-2"><strong>Solutions:</strong></p>
        <ul className="list-disc pl-6 space-y-1 mb-0">
          <li>PONS supports specific language pairs only</li>
          <li>Supported: EN↔DE, EN↔FR, EN↔ES, EN↔IT, DE↔FR, DE↔ES, DE↔IT</li>
          <li>For unsupported pairs, use DeepL, Google, or Azure</li>
          <li>Consider translating via an intermediate language (e.g., IT→EN→FR)</li>
        </ul>
      </div>

      <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4 mb-4">
        <h3 className="text-lg font-semibold mt-0 mb-2">PONS Daily Limit Reached Error 503</h3>
        <p className="mb-2"><strong>Problem:</strong> &quot;Daily limit reached&quot; error</p>
        <p className="mb-2"><strong>Solutions:</strong></p>
        <ul className="list-disc pl-6 space-y-1 mb-0">
          <li>Free tier: 1,000 requests per month</li>
          <li>Wait until the quota resets (monthly)</li>
          <li>Contact PONS to upgrade your plan if needed</li>
          <li>Switch to another provider (MyMemory, DeepL) temporarily</li>
        </ul>
      </div>

      <h2 className="text-2xl font-semibold mt-8 mb-4">Docker Issues</h2>

      <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4 mb-4">
        <h3 className="text-lg font-semibold mt-0 mb-2">Containers Won&apos;t Start</h3>
        <p className="mb-2"><strong>Diagnostic commands:</strong></p>
        <pre className="bg-gray-100 dark:bg-gray-900 p-2 rounded text-sm mb-2"><code>{`# Check container status
docker compose ps

# View logs
docker compose logs

# View specific service logs
docker compose logs multi-lingua
docker compose logs libretranslate

# Restart services
docker compose restart

# Full rebuild
docker compose down
docker compose up -d --build`}</code></pre>
      </div>

      <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4 mb-4">
        <h3 className="text-lg font-semibold mt-0 mb-2">Port Conflicts</h3>
        <p className="mb-2"><strong>Problem:</strong> Ports 3456 or 5432 already in use</p>
        <p className="mb-2"><strong>Solutions:</strong></p>
        <ol className="list-decimal pl-6 space-y-1 mb-0">
          <li>Check what&apos;s using the port: <code>sudo lsof -i :3456</code></li>
          <li>Edit <code>docker-compose.yml</code></li>
          <li>Change port mappings (e.g., <code>3457:3456</code> for MultiLingua)</li>
          <li>Restart: <code>docker compose up -d</code></li>
          <li>Update browser URL to use new port</li>
        </ol>
      </div>

      <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4 mb-4">
        <h3 className="text-lg font-semibold mt-0 mb-2">Volume Permission Issues</h3>
        <p className="mb-2"><strong>Problem:</strong> Database or LibreTranslate data not persisting</p>
        <p className="mb-2"><strong>Solutions:</strong></p>
        <pre className="bg-gray-100 dark:bg-gray-900 p-2 rounded text-sm mb-0"><code>{`# Check volumes
docker volume ls

# Inspect volume
docker volume inspect ml-data
docker volume inspect lt-local

# Recreate volumes if needed
docker compose down
docker volume rm ml-data lt-local
docker volume create ml-data
docker volume create lt-local
docker compose up -d`}</code></pre>
      </div>

      <h2 className="text-2xl font-semibold mt-8 mb-4">Browser Issues</h2>

      <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4 mb-4">
        <h3 className="text-lg font-semibold mt-0 mb-2">Text-to-Speech Not Working</h3>
        <p className="mb-2"><strong>Symptom:</strong> Speaker icon doesn&apos;t produce sound</p>
        <p className="mb-2"><strong>Solutions:</strong></p>
        <ul className="list-disc pl-6 space-y-1 mb-0">
          <li>Ensure browser sound is not muted</li>
          <li>Check system volume settings</li>
          <li>Try a different browser (Chrome, Firefox, Edge all support TTS)</li>
          <li>Some browsers require user interaction before playing audio</li>
          <li>Check browser console for errors (F12)</li>
        </ul>
      </div>

      <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4 mb-4">
        <h3 className="text-lg font-semibold mt-0 mb-2">UI Not Loading or Broken</h3>
        <p className="mb-2"><strong>Solutions:</strong></p>
        <ul className="list-disc pl-6 space-y-1 mb-0">
          <li>Hard refresh: <kbd>Ctrl</kbd> + <kbd>Shift</kbd> + <kbd>R</kbd> (or <kbd>Cmd</kbd> + <kbd>Shift</kbd> + <kbd>R</kbd> on Mac)</li>
          <li>Clear browser cache and cookies</li>
          <li>Try incognito/private browsing mode</li>
          <li>Check browser console for JavaScript errors (F12)</li>
          <li>Ensure you&apos;re using a modern browser version</li>
        </ul>
      </div>

      <h2 className="text-2xl font-semibold mt-8 mb-4">Debug Mode</h2>

      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
        <h3 className="text-blue-800 dark:text-blue-200 mt-0 mb-2">🔍 Enable Detailed Logging</h3>
        <p className="mb-2">For troubleshooting complex issues, enable debug logging:</p>
        <ol className="list-decimal pl-6 space-y-2 mb-0">
          <li>Create or edit <code>.env.local</code> file in the MultiLingua directory</li>
          <li>Add these lines:
            <pre className="bg-gray-100 dark:bg-gray-800 p-2 rounded text-sm mt-2 mb-2"><code>{`LOG_LEVEL=debug
NEXT_PUBLIC_LOG_LEVEL=debug`}</code></pre>
          </li>
          <li>Restart the application: <code>docker compose restart multi-lingua</code></li>
          <li>Check browser console (F12) for detailed client-side logs</li>
          <li>Check server logs: <code>docker compose logs -f multi-lingua</code></li>
          <li>Look for color-coded log messages with detailed information</li>
        </ol>
      </div>

      <h2 className="text-2xl font-semibold mt-8 mb-4">Getting More Help</h2>

      <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4">
        <h3 className="text-purple-800 dark:text-purple-200 mt-0 mb-2">📞 Additional Resources</h3>
        <ul className="list-disc pl-6 space-y-2 mb-0">
          <li>Review the <Link href="/api-docs" className="text-purple-700 dark:text-purple-300 hover:underline">API documentation</Link> for technical details</li>
          <li>Check container logs for detailed error messages</li>
          <li>Visit the GitHub repository for known issues and updates</li>
          <li>Open an issue on GitHub with:
            <ul className="list-disc pl-6 mt-1">
              <li>Error messages from logs</li>
              <li>Steps to reproduce the problem</li>
              <li>Your environment (Docker version, OS, browser)</li>
              <li>Provider being used when error occurred</li>
            </ul>
          </li>
        </ul>
      </div>

      <h2 className="text-2xl font-semibold mt-8 mb-4">Quick Diagnostic Checklist</h2>

      <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4">
        <p className="mb-2"><strong>Before opening an issue, check:</strong></p>
        <ul className="list-disc pl-6 space-y-1 mb-0">
          <li>☐ All containers running: <code>docker compose ps</code></li>
          <li>☐ No errors in logs: <code>docker compose logs</code></li>
          <li>☐ At least one provider enabled in Settings</li>
          <li>☐ Internet connection working (for cloud providers)</li>
          <li>☐ Browser console clear of errors (F12)</li>
          <li>☐ API keys valid and not expired</li>
          <li>☐ Quota limits not exceeded</li>
          <li>☐ Correct region configured (for Azure)</li>
          <li>☐ Correct endpoint for DeepL Free vs Pro</li>
        </ul>
      </div>
    </div>
  );
}
