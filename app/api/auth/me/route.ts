import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth-middleware';
import { authDatabase } from '@/lib/auth-database';
import { logger } from '@/lib/logger';

export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAuth(request);
    
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const { user } = authResult;

    // Get full user details
    const fullUser = await authDatabase.getUserById(user.userId);
    
    if (!fullUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        user: {
          id: fullUser.id,
          email: fullUser.email,
          fullName: fullUser.full_name,
          role: fullUser.role,
          preferredLanguage: fullUser.preferred_language,
          isActive: fullUser.is_active,
          emailVerified: fullUser.email_verified,
          lastLogin: fullUser.last_login,
          createdAt: fullUser.created_at,
        }
      },
      { status: 200 }
    );
  } catch (error) {
    logger.error('Get current user error', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
