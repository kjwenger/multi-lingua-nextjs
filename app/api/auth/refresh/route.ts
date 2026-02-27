import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, createAuthCookie } from '@/lib/auth-middleware';
import { authDatabase } from '@/lib/auth-database';
import { generateSessionToken, getClientIp, getDeviceInfo } from '@/lib/auth-utils';
import { logger } from '@/lib/logger';

export async function POST(request: NextRequest) {
  try {
    const authResult = await requireAuth(request);
    
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const { user } = authResult;

    // Delete old session
    const authHeader = request.headers.get('authorization');
    const cookieToken = request.cookies.get('auth_token')?.value;
    const oldToken = authHeader?.replace('Bearer ', '') || cookieToken;
    
    if (oldToken) {
      await authDatabase.deleteSession(oldToken);
    }

    // Create new session
    const sessionToken = generateSessionToken();
    const sessionTimeoutMinutes = parseInt(await authDatabase.getConfig('session_timeout_minutes') || '1440');
    const expiresAt = new Date(Date.now() + sessionTimeoutMinutes * 60 * 1000);
    
    await authDatabase.createSession({
      user_id: user.userId,
      token: sessionToken,
      device_info: getDeviceInfo(request.headers),
      ip_address: getClientIp(request.headers),
      expiresInMinutes: sessionTimeoutMinutes,
    });

    // Log activity
    await authDatabase.logActivity({
      user_id: user.userId,
      action: 'token_refresh',
      details: 'Session token refreshed',
      ip_address: getClientIp(request.headers),
    });

    logger.info('Session token refreshed', { userId: user.userId });

    const response = NextResponse.json(
      {
        success: true,
        token: sessionToken,
        expiresAt: expiresAt.toISOString(),
      },
      { status: 200 }
    );

    // Set new auth cookie
    response.headers.set('Set-Cookie', createAuthCookie(sessionToken, sessionTimeoutMinutes * 60));

    return response;
  } catch (error) {
    logger.error('Refresh token error', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
