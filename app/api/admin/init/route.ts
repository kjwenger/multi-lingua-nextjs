import { NextRequest, NextResponse } from 'next/server';
import { authDatabase } from '@/lib/auth-database';
import { generateAuthCode, validateEmail } from '@/lib/auth-utils';
import { sendRegistrationCode } from '@/lib/email-service';
import { logger } from '@/lib/logger';

export async function GET(request: NextRequest) {
  try {
    // Check if any users exist
    const { users } = await authDatabase.getAllUsers();
    
    return NextResponse.json(
      { 
        needsInit: users.length === 0,
        hasUsers: users.length > 0
      },
      { status: 200 }
    );
  } catch (error) {
    logger.error('Check init status error', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Check if any users exist
    const { users } = await authDatabase.getAllUsers();
    
    if (users.length > 0) {
      return NextResponse.json(
        { error: 'System already initialized' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { email, fullName } = body;

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

    // Generate and store verification code
    const code = generateAuthCode();
    const codeExpiryMinutes = 10;
    
    await authDatabase.createAuthCode({
      email,
      code,
      code_type: 'registration',
      expiresInMinutes: codeExpiryMinutes,
    });

    // Send verification email
    try {
      await sendRegistrationCode(email, fullName, code);
      logger.info('Admin registration code email sent', { email });
    } catch (emailError) {
      logger.error('Failed to send admin registration email', emailError);
      // In dev mode, this is expected and OK - code is logged to console
      if (process.env.DEV_MODE !== 'true' && process.env.NODE_ENV !== 'development') {
        return NextResponse.json(
          { error: 'Failed to send verification email' },
          { status: 500 }
        );
      }
      logger.info('Dev mode: Code logged to console instead', { email });
    }

    logger.info('Admin initialization code sent', { email });

    return NextResponse.json(
      { 
        success: true, 
        message: 'Verification code sent to email',
        codeExpiresIn: codeExpiryMinutes * 60,
        isAdminInit: true
      },
      { status: 200 }
    );
  } catch (error) {
    logger.error('Admin init error', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
