import { NextRequest, NextResponse } from 'next/server';
import { authDatabase } from '@/lib/auth-database';
import { generateToken, generateSessionToken, getClientIp, getDeviceInfo } from '@/lib/auth-utils';
import { createAuthCookie } from '@/lib/auth-middleware';
import { sendWelcomeEmail } from '@/lib/email-service';
import { logger } from '@/lib/logger';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, code, fullName, preferredLanguage } = body;

    if (!email || !code) {
      return NextResponse.json(
        { error: 'Email and code are required' },
        { status: 400 }
      );
    }

    // Verify the code
    const authCode = await authDatabase.getAuthCode(email, code, 'registration');
    
    if (!authCode) {
      return NextResponse.json(
        { error: 'Invalid or expired verification code' },
        { status: 400 }
      );
    }

    // Check attempts
    if (authCode.attempts >= authCode.max_attempts) {
      return NextResponse.json(
        { error: 'Maximum verification attempts exceeded. Please request a new code.' },
        { status: 400 }
      );
    }

    await authDatabase.incrementAuthCodeAttempts(authCode.id);

    // Check if user already exists (shouldn't happen, but safety check)
    const existingUser = await authDatabase.getUserByEmail(email);
    if (existingUser) {
      return NextResponse.json(
        { error: 'User already exists' },
        { status: 400 }
      );
    }

    // Check if this is the first user (admin initialization)
    const { users } = await authDatabase.getAllUsers();
    const isFirstUser = users.length === 0;

    // Create user
    const userId = await authDatabase.createUser({
      email,
      full_name: fullName,
      preferred_language: preferredLanguage || 'en',
      email_verified: true,
      role: isFirstUser ? 'admin' : 'user', // First user is admin
    });

    // Mark code as used
    await authDatabase.markAuthCodeAsUsed(authCode.id);

    // Get the created user
    const user = await authDatabase.getUserById(userId);
    if (!user) {
      throw new Error('Failed to retrieve created user');
    }

    // Create session
    const sessionToken = generateSessionToken();
    const sessionTimeoutMinutes = parseInt(await authDatabase.getConfig('session_timeout_minutes') || '1440');
    
    await authDatabase.createSession({
      user_id: userId,
      token: sessionToken,
      device_info: getDeviceInfo(request.headers),
      ip_address: getClientIp(request.headers),
      expiresInMinutes: sessionTimeoutMinutes,
    });

    // Update last login
    await authDatabase.updateLastLogin(userId);

    // Log activity
    await authDatabase.logActivity({
      user_id: userId,
      action: 'registration',
      details: 'User registered successfully',
      ip_address: getClientIp(request.headers),
    });

    // Send welcome email
    try {
      await sendWelcomeEmail(email, fullName);
    } catch (emailError) {
      logger.error('Failed to send welcome email', emailError);
      // Don't fail the registration if welcome email fails
    }

    logger.info('User registered successfully', { email, userId });

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
      },
      { status: 201 }
    );

    // Set auth cookie
    response.headers.set('Set-Cookie', createAuthCookie(sessionToken, sessionTimeoutMinutes * 60));

    return response;
  } catch (error) {
    logger.error('Verify registration error', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
