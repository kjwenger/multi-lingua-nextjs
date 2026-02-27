import { NextRequest, NextResponse } from 'next/server';
import { authDatabase } from '@/lib/auth-database';
import { generateAuthCode, validateEmail } from '@/lib/auth-utils';
import { sendLoginCode } from '@/lib/email-service';
import { logger } from '@/lib/logger';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    if (!validateEmail(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Check if user exists
    const user = await authDatabase.getUserByEmail(email);
    
    // Don't reveal whether user exists or not (security best practice)
    const codeExpiryMinutes = parseInt(await authDatabase.getConfig('code_expiry_minutes') || '10');
    
    if (user && user.is_active) {
      // Generate and store login code
      const code = generateAuthCode();
      
      await authDatabase.createAuthCode({
        email,
        code,
        code_type: 'login',
        user_id: user.id,
        expiresInMinutes: codeExpiryMinutes,
      });

      // Send login email
      try {
        await sendLoginCode(email, user.full_name, code);
        logger.info('Login code email sent', { email });
      } catch (emailError) {
        logger.error('Failed to send login email', emailError);
        // In dev mode, this is expected and OK - code is logged to console
        if (process.env.DEV_MODE !== 'true' && process.env.NODE_ENV !== 'development') {
          return NextResponse.json(
            { error: 'Failed to send login code' },
            { status: 500 }
          );
        }
        logger.info('Dev mode: Code logged to console instead', { email });
      }

      logger.info('Login code sent', { email });
    } else {
      logger.info('Login attempt for non-existent or inactive user', { email });
    }

    // Always return success to prevent user enumeration
    return NextResponse.json(
      { 
        success: true, 
        message: 'If an account exists with this email, a login code has been sent',
        codeExpiresIn: codeExpiryMinutes * 60
      },
      { status: 200 }
    );
  } catch (error) {
    logger.error('Login error', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
