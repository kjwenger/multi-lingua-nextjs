import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth-middleware';
import { authDatabase } from '@/lib/auth-database';
import { getClientIp } from '@/lib/auth-utils';
import { logger } from '@/lib/logger';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authResult = await requireAdmin(request);
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const { user: adminUser } = authResult;
    const userId = parseInt(params.id);
    const body = await request.json();
    const { fullName, role, isActive, preferredLanguage } = body;

    if (isNaN(userId)) {
      return NextResponse.json(
        { error: 'Invalid user ID' },
        { status: 400 }
      );
    }

    // Get existing user
    const existingUser = await authDatabase.getUserById(userId);
    if (!existingUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Prevent admin from deactivating themselves
    if (userId === adminUser.userId && isActive === false) {
      return NextResponse.json(
        { error: 'Cannot deactivate your own account' },
        { status: 400 }
      );
    }

    // Prevent admin from removing their own admin role if they're the only admin
    if (userId === adminUser.userId && role === 'user') {
      const { users: allAdmins } = await authDatabase.getAllUsers({ role: 'admin' });
      if (allAdmins.length === 1) {
        return NextResponse.json(
          { error: 'Cannot remove admin role from the only admin account' },
          { status: 400 }
        );
      }
    }

    if (role && !['admin', 'user'].includes(role)) {
      return NextResponse.json(
        { error: 'Invalid role' },
        { status: 400 }
      );
    }

    // Update user
    const updateData: any = {};
    if (fullName !== undefined) updateData.full_name = fullName;
    if (role !== undefined) updateData.role = role;
    if (isActive !== undefined) updateData.is_active = isActive ? 1 : 0;
    if (preferredLanguage !== undefined) updateData.preferred_language = preferredLanguage;

    await authDatabase.updateUser(userId, updateData);

    const updatedUser = await authDatabase.getUserById(userId);

    // Log activity
    await authDatabase.logActivity({
      user_id: adminUser.userId,
      action: 'update_user',
      details: `Updated user: ${existingUser.email}`,
      ip_address: getClientIp(request.headers),
    });

    logger.info('Admin updated user', { userId, updatedBy: adminUser.userId });

    return NextResponse.json(
      {
        success: true,
        user: {
          id: updatedUser!.id,
          email: updatedUser!.email,
          fullName: updatedUser!.full_name,
          role: updatedUser!.role,
          isActive: updatedUser!.is_active,
          emailVerified: updatedUser!.email_verified,
        }
      },
      { status: 200 }
    );
  } catch (error) {
    logger.error('Update user error', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authResult = await requireAdmin(request);
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const { user: adminUser } = authResult;
    const userId = parseInt(params.id);

    if (isNaN(userId)) {
      return NextResponse.json(
        { error: 'Invalid user ID' },
        { status: 400 }
      );
    }

    // Prevent admin from deleting themselves
    if (userId === adminUser.userId) {
      return NextResponse.json(
        { error: 'Cannot delete your own account. Another admin must delete you.' },
        { status: 400 }
      );
    }

    const existingUser = await authDatabase.getUserById(userId);
    if (!existingUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Soft delete - just deactivate the user
    await authDatabase.updateUser(userId, { is_active: false });

    // Log activity
    await authDatabase.logActivity({
      user_id: adminUser.userId,
      action: 'delete_user',
      details: `Deleted user: ${existingUser.email}`,
      ip_address: getClientIp(request.headers),
    });

    logger.info('Admin deleted user', { userId, deletedBy: adminUser.userId });

    return NextResponse.json(
      { success: true, message: 'User deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    logger.error('Delete user error', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
