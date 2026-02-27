import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth-middleware';
import { authDatabase } from '@/lib/auth-database';
import { validateEmail, getClientIp } from '@/lib/auth-utils';
import { logger } from '@/lib/logger';

export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAdmin(request);
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const perPage = parseInt(searchParams.get('perPage') || '20');
    const search = searchParams.get('search') || undefined;
    const role = searchParams.get('role') || undefined;
    const isActiveParam = searchParams.get('isActive');
    const isActive = isActiveParam ? isActiveParam === 'true' : undefined;

    const result = await authDatabase.getAllUsers({
      search,
      role,
      isActive,
      page,
      perPage,
    });

    return NextResponse.json(
      {
        users: result.users.map(u => ({
          id: u.id,
          email: u.email,
          fullName: u.full_name,
          role: u.role,
          isActive: u.is_active,
          emailVerified: u.email_verified,
          lastLogin: u.last_login,
          createdAt: u.created_at,
          preferredLanguage: u.preferred_language,
        })),
        pagination: {
          page,
          perPage,
          total: result.total,
          totalPages: Math.ceil(result.total / perPage),
        }
      },
      { status: 200 }
    );
  } catch (error) {
    logger.error('Get users error', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const authResult = await requireAdmin(request);
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const { user: adminUser } = authResult;
    const body = await request.json();
    const { email, fullName, role, preferredLanguage } = body;

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

    if (role && !['admin', 'user'].includes(role)) {
      return NextResponse.json(
        { error: 'Invalid role' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await authDatabase.getUserByEmail(email);
    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 400 }
      );
    }

    // Create user (admin-created users are email verified by default)
    const userId = await authDatabase.createUser({
      email,
      full_name: fullName,
      role: role || 'user',
      preferred_language: preferredLanguage || 'en',
      email_verified: true,
      created_by: adminUser.userId,
    });

    const newUser = await authDatabase.getUserById(userId);

    // Log activity
    await authDatabase.logActivity({
      user_id: adminUser.userId,
      action: 'create_user',
      details: `Created user: ${email}`,
      ip_address: getClientIp(request.headers),
    });

    logger.info('Admin created user', { email, userId, createdBy: adminUser.userId });

    return NextResponse.json(
      {
        success: true,
        user: {
          id: newUser!.id,
          email: newUser!.email,
          fullName: newUser!.full_name,
          role: newUser!.role,
          isActive: newUser!.is_active,
          emailVerified: newUser!.email_verified,
        }
      },
      { status: 201 }
    );
  } catch (error) {
    logger.error('Create user error', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
