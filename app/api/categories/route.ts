import { NextRequest, NextResponse } from 'next/server';
import { database } from '@/lib/database';
import { authenticateRequest } from '@/lib/auth-middleware';
import { logger } from '@/lib/logger';

export async function GET() {
  try {
    const categories = await database.getAllCategories();
    return NextResponse.json(categories);
  } catch (error) {
    logger.error('Error fetching categories:', error);
    return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await authenticateRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { name } = await request.json();
    if (!name || !name.trim()) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    const id = await database.addCategory(name.trim());
    return NextResponse.json({ id }, { status: 201 });
  } catch (error: any) {
    if (error?.message?.includes('UNIQUE constraint failed')) {
      return NextResponse.json({ error: 'Category already exists' }, { status: 409 });
    }
    logger.error('Error adding category:', error);
    return NextResponse.json({ error: 'Failed to add category' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const user = await authenticateRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    if (user.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const id = parseInt(searchParams.get('id') || '0');

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    const deleted = await database.deleteCategory(id);
    if (!deleted) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error('Error deleting category:', error);
    return NextResponse.json({ error: 'Failed to delete category' }, { status: 500 });
  }
}
