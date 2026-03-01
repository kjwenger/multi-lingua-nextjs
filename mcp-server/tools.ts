import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import type { MultiLinguaClient, ExportRecord } from './client';

// ── Shared sub-schemas ────────────────────────────────────────────────────────

const proposalsSchema = z.object({
  english: z.array(z.string()).default([]),
  german: z.array(z.string()).default([]),
  french: z.array(z.string()).default([]),
  italian: z.array(z.string()).default([]),
  spanish: z.array(z.string()).default([]),
}).default({});

const exportRecordSchema = z.object({
  english: z.string(),
  german: z.string().default(''),
  french: z.string().default(''),
  italian: z.string().default(''),
  spanish: z.string().default(''),
  proposals: proposalsSchema,
  category: z.string().nullable().default(null),
});

const executeDecisionSchema = z.object({
  incoming: exportRecordSchema,
  existingId: z.number().optional(),
  decision: z.enum(['create', 'auto_update', 'ignore', 'replace', 'add_as_new']),
});

// ── Helper ────────────────────────────────────────────────────────────────────

function text(value: unknown): { content: [{ type: 'text'; text: string }] } {
  return {
    content: [{ type: 'text', text: JSON.stringify(value, null, 2) }],
  };
}

function errorText(err: unknown): { content: [{ type: 'text'; text: string }]; isError: true } {
  const message = err instanceof Error ? err.message : String(err);
  return {
    content: [{ type: 'text', text: `Error: ${message}` }],
    isError: true,
  };
}

// ── Registration ──────────────────────────────────────────────────────────────

export function registerTools(server: McpServer, client: MultiLinguaClient): void {

  // ── list_translations ───────────────────────────────────────────────────────

  server.tool(
    'list_translations',
    'List vocabulary entries from the Multi-Lingua store. Returns all translations with their ' +
    'English, German, French, Italian, and Spanish text, proposal alternatives, category, and ' +
    'numeric IDs. Optionally filter by category name. Use "__uncategorized__" to get entries ' +
    'with no category assigned.',
    { category: z.string().optional().describe('Category name filter. Use "__uncategorized__" for uncategorised entries.') },
    async ({ category }) => {
      try {
        const results = await client.listTranslations(category);
        return text(results);
      } catch (err) {
        return errorText(err);
      }
    },
  );

  // ── get_translation ─────────────────────────────────────────────────────────

  server.tool(
    'get_translation',
    'Look up a specific vocabulary entry by its numeric ID or by its English text ' +
    '(case-insensitive exact match). Provide exactly one of id or english. ' +
    'Returns the full translation object including all language fields, proposals, and category.',
    {
      id: z.number().optional().describe('Numeric translation ID.'),
      english: z.string().optional().describe('English text to look up (case-insensitive exact match).'),
    },
    async ({ id, english }) => {
      try {
        if (id === undefined && !english) {
          return errorText('Provide either id or english.');
        }
        const result = id !== undefined
          ? await client.getTranslationById(id)
          : await client.getTranslationByEnglish(english!);
        if (!result) {
          return errorText(`No translation found for ${id !== undefined ? `id=${id}` : `english="${english}"`}`);
        }
        return text(result);
      } catch (err) {
        return errorText(err);
      }
    },
  );

  // ── create_translation ──────────────────────────────────────────────────────

  server.tool(
    'create_translation',
    'Add a new vocabulary entry to the Multi-Lingua store. Requires English text. ' +
    'Optionally provide pre-known translations for the other four languages. ' +
    'Set auto_translate to true to call the active translation provider and fill in any ' +
    'missing language fields automatically (uses the configured provider in Settings). ' +
    'Optionally assign to a category by name — the category is created automatically if it ' +
    'does not already exist.',
    {
      english: z.string().describe('The English text to store (required).'),
      german: z.string().optional().describe('German translation (optional if auto_translate is true).'),
      french: z.string().optional().describe('French translation.'),
      italian: z.string().optional().describe('Italian translation.'),
      spanish: z.string().optional().describe('Spanish translation.'),
      category: z.string().optional().describe('Category name to assign. Created automatically if absent.'),
      auto_translate: z.boolean().optional().describe('If true, call the translation provider to fill missing fields.'),
    },
    async ({ english, german, french, italian, spanish, category, auto_translate }) => {
      try {
        let de = german || '';
        let fr = french || '';
        let it = italian || '';
        let es = spanish || '';
        let deAlts: string[] = [];
        let frAlts: string[] = [];
        let itAlts: string[] = [];
        let esAlts: string[] = [];

        if (auto_translate) {
          const tr = await client.translateText(english, 'en');
          if (!de && tr.german?.translation) { de = tr.german.translation; deAlts = tr.german.alternatives || []; }
          if (!fr && tr.french?.translation) { fr = tr.french.translation; frAlts = tr.french.alternatives || []; }
          if (!it && tr.italian?.translation) { it = tr.italian.translation; itAlts = tr.italian.alternatives || []; }
          if (!es && tr.spanish?.translation) { es = tr.spanish.translation; esAlts = tr.spanish.alternatives || []; }
        }

        const category_id = category ? await client.resolveCategoryId(category) : null;

        const result = await client.createTranslation({
          english,
          german: de,
          french: fr,
          italian: it,
          spanish: es,
          german_proposals: JSON.stringify(deAlts),
          french_proposals: JSON.stringify(frAlts),
          italian_proposals: JSON.stringify(itAlts),
          spanish_proposals: JSON.stringify(esAlts),
          category_id,
        });
        return text({ ...result, english, german: de, french: fr, italian: it, spanish: es });
      } catch (err) {
        return errorText(err);
      }
    },
  );

  // ── update_translation ──────────────────────────────────────────────────────

  server.tool(
    'update_translation',
    'Update an existing vocabulary entry by its numeric ID. Only the fields you provide ' +
    'will be changed — omitted fields remain unchanged. Pass category: null to remove the ' +
    'category assignment. Pass a category name string to assign or change the category ' +
    '(created automatically if it does not exist).',
    {
      id: z.number().describe('Numeric ID of the translation to update (required).'),
      english: z.string().optional(),
      german: z.string().optional(),
      french: z.string().optional(),
      italian: z.string().optional(),
      spanish: z.string().optional(),
      category: z.string().nullable().optional().describe('Category name, or null to remove the category.'),
    },
    async ({ id, english, german, french, italian, spanish, category }) => {
      try {
        const updates: Record<string, unknown> = {};
        if (english !== undefined) updates.english = english;
        if (german !== undefined) updates.german = german;
        if (french !== undefined) updates.french = french;
        if (italian !== undefined) updates.italian = italian;
        if (spanish !== undefined) updates.spanish = spanish;

        if (category !== undefined) {
          updates.category_id = category === null
            ? null
            : await client.resolveCategoryId(category);
        }

        const result = await client.updateTranslation(id, updates);
        return text(result);
      } catch (err) {
        return errorText(err);
      }
    },
  );

  // ── delete_translation ──────────────────────────────────────────────────────

  server.tool(
    'delete_translation',
    'Delete a vocabulary entry by its numeric ID. This action is permanent and cannot be undone.',
    { id: z.number().describe('Numeric ID of the translation to delete.') },
    async ({ id }) => {
      try {
        const result = await client.deleteTranslation(id);
        return text(result);
      } catch (err) {
        return errorText(err);
      }
    },
  );

  // ── translate_text ──────────────────────────────────────────────────────────

  server.tool(
    'translate_text',
    'Translate text using the active translation provider without storing anything. ' +
    'Returns translations and alternative proposals for all five languages (English, German, ' +
    'French, Italian, Spanish). Useful for previewing a translation or exploring alternatives ' +
    'before deciding to store it. The source language defaults to English.',
    {
      text: z.string().describe('The text to translate (required).'),
      sourceLanguage: z.enum(['en', 'de', 'fr', 'it', 'es']).optional()
        .describe('Source language code. Defaults to "en" (English).'),
    },
    async ({ text: inputText, sourceLanguage }) => {
      try {
        const result = await client.translateText(inputText, sourceLanguage || 'en');
        return text(result);
      } catch (err) {
        return errorText(err);
      }
    },
  );

  // ── list_categories ─────────────────────────────────────────────────────────

  server.tool(
    'list_categories',
    'List all vocabulary categories with their names, numeric IDs, and translation counts. ' +
    'Categories group vocabulary entries by topic, context, or any other organisation scheme.',
    {},
    async () => {
      try {
        const cats = await client.listCategories();
        return text(cats);
      } catch (err) {
        return errorText(err);
      }
    },
  );

  // ── create_category ─────────────────────────────────────────────────────────

  server.tool(
    'create_category',
    'Create a new vocabulary category. The name must be unique across all categories. ' +
    'Returns the new category ID.',
    { name: z.string().describe('Category name (required, must be unique).') },
    async ({ name }) => {
      try {
        const result = await client.createCategory(name);
        return text(result);
      } catch (err) {
        return errorText(err);
      }
    },
  );

  // ── delete_category ─────────────────────────────────────────────────────────

  server.tool(
    'delete_category',
    'Delete a category by its numeric ID. Translations assigned to that category will have ' +
    'their category assignment cleared but will not themselves be deleted.',
    { id: z.number().describe('Numeric ID of the category to delete.') },
    async ({ id }) => {
      try {
        const result = await client.deleteCategory(id);
        return text(result);
      } catch (err) {
        return errorText(err);
      }
    },
  );

  // ── export_translations ─────────────────────────────────────────────────────

  server.tool(
    'export_translations',
    'Export vocabulary entries as a structured JSON payload in the multi-lingua export format ' +
    '(version 1). Returns all records with their language fields, proposal alternatives, and ' +
    'category names. Optionally scope the export to a single category. The export document is ' +
    'returned as parsed JSON — no file download.',
    {
      category: z.string().optional()
        .describe('Limit the export to entries in this category. Omit for a full export.'),
    },
    async ({ category }) => {
      try {
        const doc = await client.exportTranslations(category);
        return text(doc);
      } catch (err) {
        return errorText(err);
      }
    },
  );

  // ── import_analyze ──────────────────────────────────────────────────────────

  server.tool(
    'import_analyze',
    'Dry-run an import: compare an array of vocabulary records against the existing store and ' +
    'return a diff report without making any changes. Each record is classified as: ' +
    '"create" (not in store yet), "skip" (identical), "auto_update" (only category differs — ' +
    'safe to apply without review), or "conflict" (translations or proposals differ — requires ' +
    'a decision). Call import_execute with the decisions array to actually apply the import.',
    {
      records: z.array(exportRecordSchema)
        .describe('Array of translation records in the multi-lingua export format.'),
    },
    async ({ records }) => {
      try {
        const result = await client.importAnalyze(records as ExportRecord[]);
        return text(result);
      } catch (err) {
        return errorText(err);
      }
    },
  );

  // ── import_execute ──────────────────────────────────────────────────────────

  server.tool(
    'import_execute',
    'Apply an import by executing per-record decisions, typically after reviewing the output of ' +
    'import_analyze. Each decision specifies: "create" (insert as new), "auto_update" (update ' +
    'only the category assignment), "replace" (overwrite the existing entry), "add_as_new" ' +
    '(insert as a new entry even if a match exists), or "ignore" (skip this record). ' +
    'Returns counts of each operation performed and any errors encountered.',
    {
      decisions: z.array(executeDecisionSchema)
        .describe('Array of per-record decisions from import_analyze.'),
    },
    async ({ decisions }) => {
      try {
        const result = await client.importExecute(decisions as Parameters<typeof client.importExecute>[0]);
        return text(result);
      } catch (err) {
        return errorText(err);
      }
    },
  );
}
