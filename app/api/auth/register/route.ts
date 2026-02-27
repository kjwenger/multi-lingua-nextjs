import { NextRequest, NextResponse } from 'next/server';
import { authDatabase } from '@/lib/auth-database';
import { generateAuthCode, validateEmail } from '@/lib/auth-utils';
import { sendRegistrationCode } from '@/lib/email-service';
import { logger } from '@/lib/logger';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, fullName, preferredLanguage } = body;

    if (!email || !fullName) {
      return NextResponse.json(
        { error: 'Email and full name are required' },
        { status: 400 }
      );
    }

    if (!validateEmail(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Check if email already exists
    const existingUser = await authDatabase.getUserByEmail(email);
    if (existingUser) {
      // Don't reveal that email exists (security best practice)
      return NextResponse.json(
        { 
          success: true, 
          message: 'Verification code sent to email',
          codeExpiresIn: 600
        },
        { status: 200 }
      );
    }

    // Generate and store verification code
    const code = generateAuthCode();
    const codeExpiryMinutes = parseInt(await authDatabase.getConfig('code_expiry_minutes') || '10');
    
    await authDatabase.createAuthCode({
      email,
      code,
      code_type: 'registration',
      expiresInMinutes: codeExpiryMinutes,
    });

    // Send verification email
    try {
      await sendRegistrationCode(email, fullName, code);
      logger.info('Registration code email sent', { email });
    } catch (emailError) {
      logger.error('Failed to send registration email', emailError);
      // In dev mode, this is expected and OK - code is logged to console
      if (process.env.DEV_MODE !== 'true' && process.env.NODE_ENV !== 'development') {
        return NextResponse.json(
          { error: 'Failed to send verification email' },
          { status: 500 }
        );
      }
      logger.info('Dev mode: Code logged to console instead', { email });
    }

    logger.info('Registration code sent', { email });

    return NextResponse.json(
      { 
        success: true, 
        message: 'Verification code sent to email',
        codeExpiresIn: codeExpiryMinutes * 60
      },
      { status: 200 }
    );
  } catch (error) {
    logger.error('Registration error', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
