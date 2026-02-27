import { NextRequest, NextResponse } from 'next/server';
import { database } from '@/lib/database';
import { authenticateRequest } from '@/lib/auth-middleware';
import { logger } from '@/lib/logger';

export async function GET(request: NextRequest) {
  try {
    // Get authenticated user (optional - unauthenticated users see only shared)
    const user = await authenticateRequest(request);
    const userId = user?.userId;

    const translations = await database.getAllTranslations(userId);
    return NextResponse.json(translations);
  } catch (error) {
    logger.error('Error fetching translations:', error);
    return NextResponse.json({ error: 'Failed to fetch translations' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    // Require authentication for creating translations
    const user = await authenticateRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const data = await request.json();
    // Attach user_id to the translation
    const id = await database.addTranslation({ ...data, user_id: user.userId });
    return NextResponse.json({ id, success: true });
  } catch (error) {
    logger.error('Error adding translation:', error);
    return NextResponse.json({ error: 'Failed to add translation' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    // Require authentication for updating translations
    const user = await authenticateRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { id, ...data } = await request.json();

    // Check if user owns this translation or if it's shared
    const translation = await database.getTranslationById(id);
    if (!translation) {
      return NextResponse.json({ error: 'Translation not found' }, { status: 404 });
    }

    // Users can edit their own translations and shared translations
    if (translation.user_id !== null && translation.user_id !== user.userId) {
      return NextResponse.json({ error: 'Not authorized to edit this translation' }, { status: 403 });
    }

    const updated = await database.updateTranslation(id, data, user.userId);
    if (!updated) {
      return NextResponse.json({ error: 'Failed to update translation' }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error('Error updating translation:', error);
    return NextResponse.json({ error: 'Failed to update translation' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    // Admin-only endpoint for toggling share status
    const user = await authenticateRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    if (user.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const { id, share } = await request.json();

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    const translation = await database.getTranslationById(id);
    if (!translation) {
      return NextResponse.json({ error: 'Translation not found' }, { status: 404 });
    }

    // Set user_id to null (share) or admin's user_id (unshare)
    const newUserId = share ? null : user.userId;
    const updated = await database.updateTranslation(id, { user_id: newUserId });

    if (!updated) {
      return NextResponse.json({ error: 'Failed to update translation' }, { status: 400 });
    }

    logger.info(`Admin ${user.userId} ${share ? 'shared' : 'unshared'} translation ${id}`);
    return NextResponse.json({ success: true, user_id: newUserId });
  } catch (error) {
    logger.error('Error toggling share status:', error);
    return NextResponse.json({ error: 'Failed to toggle share status' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // Require authentication for deleting translations
    const user = await authenticateRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = parseInt(searchParams.get('id') || '0');

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    // Check if user owns this translation
    const translation = await database.getTranslationById(id);
    if (!translation) {
      return NextResponse.json({ error: 'Translation not found' }, { status: 404 });
    }

    // Users can only delete their own translations, not shared ones
    if (translation.user_id === null) {
      // Admins can delete shared translations
      if (user.role !== 'admin') {
        return NextResponse.json({ error: 'Only admins can delete shared translations' }, { status: 403 });
      }
    } else if (translation.user_id !== user.userId) {
      return NextResponse.json({ error: 'Not authorized to delete this translation' }, { status: 403 });
    }

    const deleted = await database.deleteTranslation(id, translation.user_id === null ? undefined : user.userId);
    if (!deleted) {
      return NextResponse.json({ error: 'Failed to delete translation' }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error('Error deleting translation:', error);
    return NextResponse.json({ error: 'Failed to delete translation' }, { status: 500 });
  }
}
