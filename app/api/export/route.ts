import { NextRequest, NextResponse } from 'next/server';
import { gzipSync } from 'zlib';
import { database } from '@/lib/database';
import { authenticateRequest } from '@/lib/auth-middleware';
import { logger } from '@/lib/logger';

function safeParseProposals(json: string): string[] {
  try {
    const parsed = JSON.parse(json || '[]');
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export async function GET(request: NextRequest) {
  try {
    const user = await authenticateRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const categoryParam = searchParams.get('category') ?? undefined;

    const translations = await database.getAllTranslations(user.userId, categoryParam);
    const categories = await database.getAllCategories();
    const catMap = new Map(categories.map(c => [c.id, c.name]));

    const records = translations.map(t => ({
      english: t.english,
      german: t.german || '',
      french: t.french || '',
      italian: t.italian || '',
      spanish: t.spanish || '',
      proposals: {
        english: safeParseProposals(t.english_proposals),
        german: safeParseProposals(t.german_proposals),
        french: safeParseProposals(t.french_proposals),
        italian: safeParseProposals(t.italian_proposals),
        spanish: safeParseProposals(t.spanish_proposals),
      },
      category: t.category_id !== null ? (catMap.get(t.category_id) ?? null) : null,
    }));

    const doc = {
      format: 'multi-lingua-export',
      version: 1,
      exported_at: new Date().toISOString(),
      records,
    };

    const compressed = gzipSync(Buffer.from(JSON.stringify(doc), 'utf-8'));
    const slug = categoryParam ? `-${categoryParam.replace(/[^a-z0-9]/gi, '_')}` : '';
    const filename = `translations${slug}-${new Date().toISOString().slice(0, 10)}.ml.json.gz`;

    logger.info(`Exporting ${records.length} translations for user ${user.userId}`);

    return new NextResponse(compressed, {
      status: 200,
      headers: {
        'Content-Type': 'application/gzip',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': String(compressed.length),
      },
    });
  } catch (error) {
    logger.error('Error exporting translations:', error);
    return NextResponse.json({ error: 'Failed to export translations' }, { status: 500 });
  }
}
