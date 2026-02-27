import { NextRequest, NextResponse } from 'next/server';
import { authDatabase } from '@/lib/auth-database';
import { generateSessionToken, getClientIp, getDeviceInfo } from '@/lib/auth-utils';
import { createAuthCookie } from '@/lib/auth-middleware';
import { logger } from '@/lib/logger';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, code, rememberMe } = body;

    if (!email || !code) {
      return NextResponse.json(
        { error: 'Email and code are required' },
        { status: 400 }
      );
    }

    // Verify the code
    const authCode = await authDatabase.getAuthCode(email, code, 'login');
    
    if (!authCode) {
      return NextResponse.json(
        { error: 'Invalid or expired login code' },
        { status: 400 }
      );
    }

    // Check attempts
    if (authCode.attempts >= authCode.max_attempts) {
      return NextResponse.json(
        { error: 'Maximum login attempts exceeded. Please request a new code.' },
        { status: 400 }
      );
    }

    await authDatabase.incrementAuthCodeAttempts(authCode.id);

    // Get user
    const user = await authDatabase.getUserByEmail(email);
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    if (!user.is_active) {
      return NextResponse.json(
        { error: 'Account is disabled' },
        { status: 403 }
      );
    }

    // Mark code as used
    await authDatabase.markAuthCodeAsUsed(authCode.id);

    // Create session
    const sessionToken = generateSessionToken();
    let sessionTimeoutMinutes = parseInt(await authDatabase.getConfig('session_timeout_minutes') || '1440');
    
    // If remember me, extend session to 30 days
    if (rememberMe) {
      sessionTimeoutMinutes = 30 * 24 * 60; // 30 days
    }
    
    const expiresAt = new Date(Date.now() + sessionTimeoutMinutes * 60 * 1000);
    
    await authDatabase.createSession({
      user_id: user.id,
      token: sessionToken,
      device_info: getDeviceInfo(request.headers),
      ip_address: getClientIp(request.headers),
      expiresInMinutes: sessionTimeoutMinutes,
    });

    // Update last login
    await authDatabase.updateLastLogin(user.id);

    // Log activity
    await authDatabase.logActivity({
      user_id: user.id,
      action: 'login',
      details: rememberMe ? 'Login with remember me' : 'Login',
      ip_address: getClientIp(request.headers),
    });

    logger.info('User logged in successfully', { email, userId: user.id });

    const response = NextResponse.json(
      {
        success: true,
        user: {
          id: user.id,
          email: user.email,
          fullName: user.full_name,
          role: user.role,
          preferredLanguage: user.preferred_language,
        },
        token: sessionToken,
        expiresAt: expiresAt.toISOString(),
      },
      { status: 200 }
    );

    // Set auth cookie
    response.headers.set('Set-Cookie', createAuthCookie(sessionToken, sessionTimeoutMinutes * 60));

    return response;
  } catch (error) {
    logger.error('Verify login error', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
