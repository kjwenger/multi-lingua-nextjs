import { NextRequest, NextResponse } from 'next/server';
import { gunzipSync } from 'zlib';
import { database } from '@/lib/database';
import { authenticateRequest } from '@/lib/auth-middleware';
import { logger } from '@/lib/logger';

// ── Types ────────────────────────────────────────────────────────────────────

interface ExportProposals {
  english: string[];
  german: string[];
  french: string[];
  italian: string[];
  spanish: string[];
}

interface ExportRecord {
  english: string;
  german: string;
  french: string;
  italian: string;
  spanish: string;
  proposals: ExportProposals;
  category: string | null;
}

interface ExportDoc {
  format: string;
  version: number;
  exported_at: string;
  records: ExportRecord[];
}

type AnalyzeStatus = 'create' | 'skip' | 'auto_update' | 'conflict';

interface AnalyzeResult {
  status: AnalyzeStatus;
  incoming: ExportRecord;
  existing?: {
    id: number;
    english: string;
    german: string;
    french: string;
    italian: string;
    spanish: string;
    proposals: ExportProposals;
    category: string | null;
  };
  conflictType?: { proposalsOnly: boolean };
}

type DecisionType = 'create' | 'auto_update' | 'ignore' | 'replace' | 'add_as_new';

interface ExecuteDecision {
  incoming: ExportRecord;
  existingId?: number;
  decision: DecisionType;
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function safeParseProposals(json: string): string[] {
  try {
    const parsed = JSON.parse(json || '[]');
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function proposalsEqual(a: ExportProposals, b: ExportProposals): boolean {
  const langs: (keyof ExportProposals)[] = ['english', 'german', 'french', 'italian', 'spanish'];
  return langs.every(l => {
    const as = [...(a[l] || [])].sort();
    const bs = [...(b[l] || [])].sort();
    return JSON.stringify(as) === JSON.stringify(bs);
  });
}

// ── POST handler ─────────────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  const user = await authenticateRequest(request);
  if (!user) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const action = searchParams.get('action');

  if (action === 'analyze') {
    return handleAnalyze(request, user.userId);
  }
  if (action === 'execute') {
    return handleExecute(request, user.userId);
  }

  return NextResponse.json({ error: 'Invalid action. Use ?action=analyze or ?action=execute' }, { status: 400 });
}

// ── Analyze ───────────────────────────────────────────────────────────────────

async function handleAnalyze(request: NextRequest, userId: number): Promise<NextResponse> {
  try {
    const formData = await request.formData();
    const file = formData.get('file');
    if (!file || typeof file === 'string') {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    const arrayBuffer = await (file as Blob).arrayBuffer();
    let doc: ExportDoc;
    try {
      const decompressed = gunzipSync(Buffer.from(arrayBuffer));
      doc = JSON.parse(decompressed.toString('utf-8'));
    } catch {
      return NextResponse.json({ error: 'Invalid file: could not decompress or parse' }, { status: 422 });
    }

    if (doc.format !== 'multi-lingua-export' || doc.version !== 1) {
      return NextResponse.json({ error: 'Invalid file format or unsupported version' }, { status: 422 });
    }

    if (!Array.isArray(doc.records)) {
      return NextResponse.json({ error: 'Invalid file: missing records array' }, { status: 422 });
    }

    // Build existing translations map
    const existing = await database.getAllTranslations(userId);
    const existingMap = new Map(
      existing.map(t => [t.english.trim().toLowerCase(), t])
    );

    // Build category id→name map
    const cats = await database.getAllCategories();
    const catIdToName = new Map(cats.map(c => [c.id, c.name]));

    const results: AnalyzeResult[] = [];
    let creates = 0, skips = 0, autoUpdates = 0, conflicts = 0;

    for (const incoming of doc.records) {
      const key = (incoming.english || '').trim().toLowerCase();
      const match = existingMap.get(key);

      if (!match) {
        creates++;
        results.push({ status: 'create', incoming });
        continue;
      }

      // Normalize existing proposals
      const existingProposals: ExportProposals = {
        english: safeParseProposals(match.english_proposals),
        german: safeParseProposals(match.german_proposals),
        french: safeParseProposals(match.french_proposals),
        italian: safeParseProposals(match.italian_proposals),
        spanish: safeParseProposals(match.spanish_proposals),
      };
      const existingCategory = match.category_id !== null ? (catIdToName.get(match.category_id) ?? null) : null;

      const mainLangs: (keyof ExportRecord)[] = ['german', 'french', 'italian', 'spanish'];
      const mainsDiffer = mainLangs.some(l => (incoming[l] || '') !== (match[l as keyof typeof match] || ''));
      const propsDiffer = !proposalsEqual(incoming.proposals || { english: [], german: [], french: [], italian: [], spanish: [] }, existingProposals);
      const catDiffers = (incoming.category ?? null) !== existingCategory;

      const existingNorm = {
        id: match.id,
        english: match.english,
        german: match.german || '',
        french: match.french || '',
        italian: match.italian || '',
        spanish: match.spanish || '',
        proposals: existingProposals,
        category: existingCategory,
      };

      if (!mainsDiffer && !propsDiffer && !catDiffers) {
        skips++;
        results.push({ status: 'skip', incoming, existing: existingNorm });
      } else if (!mainsDiffer && !propsDiffer && catDiffers) {
        autoUpdates++;
        results.push({ status: 'auto_update', incoming, existing: existingNorm });
      } else {
        conflicts++;
        const proposalsOnly = !mainsDiffer && propsDiffer;
        results.push({ status: 'conflict', incoming, existing: existingNorm, conflictType: { proposalsOnly } });
      }
    }

    logger.info(`Import analyze: ${creates} creates, ${skips} skips, ${autoUpdates} auto_updates, ${conflicts} conflicts`);

    return NextResponse.json({
      total: doc.records.length,
      creates,
      skips,
      autoUpdates,
      conflicts,
      results,
    });
  } catch (error) {
    logger.error('Error analyzing import:', error);
    return NextResponse.json({ error: 'Failed to analyze import file' }, { status: 500 });
  }
}

// ── Execute ───────────────────────────────────────────────────────────────────

async function handleExecute(request: NextRequest, userId: number): Promise<NextResponse> {
  try {
    const body = await request.json();
    const decisions: ExecuteDecision[] = body.decisions;

    if (!Array.isArray(decisions)) {
      return NextResponse.json({ error: 'decisions array required' }, { status: 400 });
    }

    // Build category name→id map, lazy-creating missing categories
    const existingCats = await database.getAllCategories();
    const catNameToId = new Map(existingCats.map(c => [c.name, c.id]));

    const ensureCategoryId = async (name: string | null): Promise<number | null> => {
      if (!name) return null;
      if (catNameToId.has(name)) return catNameToId.get(name)!;
      try {
        const id = await database.addCategory(name);
        catNameToId.set(name, id);
        return id;
      } catch (err: any) {
        // UNIQUE constraint — fetch again
        const cats = await database.getAllCategories();
        const found = cats.find(c => c.name === name);
        if (found) {
          catNameToId.set(name, found.id);
          return found.id;
        }
        throw err;
      }
    };

    let created = 0, replaced = 0, addedAsNew = 0, autoUpdated = 0, ignored = 0;
    const errors: string[] = [];

    for (const dec of decisions) {
      try {
        const { incoming, existingId, decision } = dec;

        if (decision === 'ignore') {
          ignored++;
          continue;
        }

        const category_id = await ensureCategoryId(incoming.category ?? null);

        if (decision === 'create' || decision === 'add_as_new') {
          await database.addTranslation({
            english: incoming.english,
            german: incoming.german || '',
            french: incoming.french || '',
            italian: incoming.italian || '',
            spanish: incoming.spanish || '',
            english_proposals: JSON.stringify(incoming.proposals?.english || []),
            german_proposals: JSON.stringify(incoming.proposals?.german || []),
            french_proposals: JSON.stringify(incoming.proposals?.french || []),
            italian_proposals: JSON.stringify(incoming.proposals?.italian || []),
            spanish_proposals: JSON.stringify(incoming.proposals?.spanish || []),
            user_id: userId,
            category_id,
          });
          decision === 'add_as_new' ? addedAsNew++ : created++;
        } else if (decision === 'replace') {
          if (!existingId) { errors.push(`replace missing existingId for "${incoming.english}"`); continue; }
          await database.updateTranslation(existingId, {
            english: incoming.english,
            german: incoming.german || '',
            french: incoming.french || '',
            italian: incoming.italian || '',
            spanish: incoming.spanish || '',
            english_proposals: JSON.stringify(incoming.proposals?.english || []),
            german_proposals: JSON.stringify(incoming.proposals?.german || []),
            french_proposals: JSON.stringify(incoming.proposals?.french || []),
            italian_proposals: JSON.stringify(incoming.proposals?.italian || []),
            spanish_proposals: JSON.stringify(incoming.proposals?.spanish || []),
            category_id,
          });
          replaced++;
        } else if (decision === 'auto_update') {
          if (!existingId) { errors.push(`auto_update missing existingId for "${incoming.english}"`); continue; }
          await database.updateTranslation(existingId, { category_id });
          autoUpdated++;
        }
      } catch (err: any) {
        errors.push(`${dec.decision} "${dec.incoming?.english}": ${err.message}`);
      }
    }

    logger.info(`Import execute: ${created} created, ${replaced} replaced, ${addedAsNew} addedAsNew, ${autoUpdated} autoUpdated, ${ignored} ignored, ${errors.length} errors`);

    return NextResponse.json({ created, replaced, addedAsNew, autoUpdated, ignored, errors });
  } catch (error) {
    logger.error('Error executing import:', error);
    return NextResponse.json({ error: 'Failed to execute import' }, { status: 500 });
  }
}
