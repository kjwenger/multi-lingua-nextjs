import { McpServer, ResourceTemplate } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { MultiLinguaClient } from './client';

export function registerResources(server: McpServer, client: MultiLinguaClient): void {

  // ── All translations ────────────────────────────────────────────────────────
  // The base URI lists all translations visible to the authenticated user.

  server.resource(
    'all-translations',
    'multi-lingua://translations',
    {
      description: 'All vocabulary translations stored in this Multi-Lingua instance, ' +
        'ordered alphabetically by English text.',
      mimeType: 'application/json',
    },
    async (uri) => {
      const translations = await client.listTranslations();
      return {
        contents: [{
          uri: uri.href,
          mimeType: 'application/json',
          text: JSON.stringify(translations, null, 2),
        }],
      };
    },
  );

  // ── Translations by category ────────────────────────────────────────────────
  // URI template: multi-lingua://translations/{category}
  // Use the special slug __uncategorized__ for entries with no category.

  server.resource(
    'translations-by-category',
    new ResourceTemplate('multi-lingua://translations/{category}', { list: undefined }),
    {
      description: 'Vocabulary translations filtered by category name. ' +
        'Use the special value __uncategorized__ for entries with no category assigned.',
      mimeType: 'application/json',
    },
    async (uri, { category }) => {
      const cat = Array.isArray(category) ? category[0] : (category as string | undefined);
      const translations = await client.listTranslations(cat);
      return {
        contents: [{
          uri: uri.href,
          mimeType: 'application/json',
          text: JSON.stringify(translations, null, 2),
        }],
      };
    },
  );

  // ── Categories ──────────────────────────────────────────────────────────────

  server.resource(
    'categories',
    'multi-lingua://categories',
    {
      description: 'All vocabulary categories with their names, IDs, and translation counts.',
      mimeType: 'application/json',
    },
    async (uri) => {
      const categories = await client.listCategories();
      return {
        contents: [{
          uri: uri.href,
          mimeType: 'application/json',
          text: JSON.stringify(categories, null, 2),
        }],
      };
    },
  );
}
