import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest, clearAuthCookie } from '@/lib/auth-middleware';
import { authDatabase } from '@/lib/auth-database';
import { logger } from '@/lib/logger';

export async function POST(request: NextRequest) {
  try {
    const user = await authenticateRequest(request);
    
    if (!user) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Get token from cookie or header
    const authHeader = request.headers.get('authorization');
    const cookieToken = request.cookies.get('auth_token')?.value;
    const token = authHeader?.replace('Bearer ', '') || cookieToken;

    if (token) {
      // Delete session
      await authDatabase.deleteSession(token);

      // Log activity
      await authDatabase.logActivity({
        user_id: user.userId,
        action: 'logout',
        details: 'User logged out',
      });

      logger.info('User logged out', { userId: user.userId });
    }

    const response = NextResponse.json(
      { success: true, message: 'Logged out successfully' },
      { status: 200 }
    );

    // Clear auth cookie
    response.headers.set('Set-Cookie', clearAuthCookie());

    return response;
  } catch (error) {
    logger.error('Logout error', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
