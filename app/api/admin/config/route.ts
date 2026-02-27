import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth-middleware';
import { authDatabase } from '@/lib/auth-database';
import { getClientIp } from '@/lib/auth-utils';
import { logger } from '@/lib/logger';

export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAdmin(request);
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const configs = await authDatabase.getAllConfig();
    
    const configObj: Record<string, any> = {};
    configs.forEach(c => {
      const key = c.config_key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
      let value: any = c.config_value;
      
      // Convert to appropriate types
      if (value === 'true' || value === 'false') {
        value = value === 'true';
      } else if (!isNaN(Number(value))) {
        value = Number(value);
      }
      
      configObj[key] = value;
    });

    return NextResponse.json(
      { config: configObj },
      { status: 200 }
    );
  } catch (error) {
    logger.error('Get config error', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const authResult = await requireAdmin(request);
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const { user: adminUser } = authResult;
    const body = await request.json();

    const validKeys = [
      'sessionTimeoutMinutes',
      'codeExpiryMinutes',
      'maxCodeAttempts',
      'requireEmailVerification',
      'allowSelfRegistration'
    ];

    const updates: Array<{ key: string; value: string }> = [];

    for (const [camelKey, value] of Object.entries(body)) {
      if (!validKeys.includes(camelKey)) {
        continue;
      }

      // Convert camelCase to snake_case
      const snakeKey = camelKey.replace(/([A-Z])/g, '_$1').toLowerCase();
      
      // Validate values
      if (camelKey.includes('Minutes') || camelKey.includes('Attempts')) {
        const num = Number(value);
        if (isNaN(num) || num < 0) {
          return NextResponse.json(
            { error: `Invalid value for ${camelKey}` },
            { status: 400 }
          );
        }
        updates.push({ key: snakeKey, value: num.toString() });
      } else if (typeof value === 'boolean') {
        updates.push({ key: snakeKey, value: value.toString() });
      } else {
        updates.push({ key: snakeKey, value: String(value) });
      }
    }

    // Update all configs
    for (const { key, value } of updates) {
      await authDatabase.updateConfig(key, value, adminUser.userId);
    }

    // Log activity
    await authDatabase.logActivity({
      user_id: adminUser.userId,
      action: 'update_config',
      details: `Updated system configuration: ${updates.map(u => u.key).join(', ')}`,
      ip_address: getClientIp(request.headers),
    });

    logger.info('Admin updated config', { updatedBy: adminUser.userId, keys: updates.map(u => u.key) });

    return NextResponse.json(
      { success: true, message: 'Configuration updated successfully' },
      { status: 200 }
    );
  } catch (error) {
    logger.error('Update config error', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
