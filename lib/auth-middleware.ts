import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, JWTPayload } from './auth-utils';
import { authDatabase } from './auth-database';

export interface AuthenticatedRequest extends NextRequest {
  user?: JWTPayload;
}

export async function authenticateRequest(request: NextRequest): Promise<JWTPayload | null> {
  const authHeader = request.headers.get('authorization');
  const cookieToken = request.cookies.get('auth_token')?.value;

  const token = authHeader?.replace('Bearer ', '') || cookieToken;

  if (!token) {
    return null;
  }

  // First try JWT verification (for API tokens)
  const jwtPayload = verifyToken(token);
  if (jwtPayload) {
    return jwtPayload;
  }

  // Fall back to session token lookup (for cookie-based auth)
  const session = await authDatabase.getSessionByToken(token);
  if (!session) {
    return null;
  }

  // Get user details to build payload
  const user = await authDatabase.getUserById(session.user_id);
  if (!user || !user.is_active) {
    return null;
  }

  // Update last activity
  await authDatabase.updateSessionActivity(token);

  return {
    userId: user.id,
    email: user.email,
    role: user.role,
  };
}

export async function requireAuth(request: NextRequest): Promise<{ user: JWTPayload } | NextResponse> {
  const user = await authenticateRequest(request);
  
  if (!user) {
    return NextResponse.json(
      { error: 'Unauthorized', message: 'Authentication required' },
      { status: 401 }
    );
  }

  return { user };
}

export async function requireAdmin(request: NextRequest): Promise<{ user: JWTPayload } | NextResponse> {
  const authResult = await requireAuth(request);
  
  if (authResult instanceof NextResponse) {
    return authResult;
  }

  if (authResult.user.role !== 'admin') {
    return NextResponse.json(
      { error: 'Forbidden', message: 'Admin access required' },
      { status: 403 }
    );
  }

  return authResult;
}

export function createAuthCookie(token: string, maxAge: number = 86400): string {
  const cookieOptions = [
    `auth_token=${token}`,
    'Path=/',
    'HttpOnly',
    'SameSite=Strict',
    `Max-Age=${maxAge}`,
  ];

  if (process.env.NODE_ENV === 'production') {
    cookieOptions.push('Secure');
  }

  return cookieOptions.join('; ');
}

export function clearAuthCookie(): string {
  return 'auth_token=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0';
}
