import { APP_VERSION } from './version';

export const openApiSpec = {
  openapi: '3.0.0',
  info: {
    title: 'Multi-Lingua Translation API',
    version: APP_VERSION,
    description: 'API for multi-language translation with support for multiple providers (LibreTranslate, MyMemory, DeepL, Google, Azure, PONS, Free Dictionary)',
  },
  servers: [
    {
      url: '/',
      description: 'Current server',
    },
  ],
  paths: {
    '/api/translate': {
      post: {
        tags: ['Translation'],
        summary: 'Translate text to multiple languages',
        description: 'Translates text from a source language to all other supported languages (English, German, French, Italian, Spanish)',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  text: {
                    type: 'string',
                    description: 'The text to translate',
                    example: 'Hello world',
                  },
                  sourceLanguage: {
                    type: 'string',
                    enum: ['en', 'de', 'fr', 'it', 'es'],
                    description: 'Source language code (defaults to "en" if not specified)',
                    example: 'en',
                  },
                },
                required: ['text'],
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'Successful translation',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    german: {
                      $ref: '#/components/schemas/TranslationResult',
                    },
                    french: {
                      $ref: '#/components/schemas/TranslationResult',
                    },
                    italian: {
                      $ref: '#/components/schemas/TranslationResult',
                    },
                    spanish: {
                      $ref: '#/components/schemas/TranslationResult',
                    },
                    english: {
                      $ref: '#/components/schemas/TranslationResult',
                    },
                  },
                },
              },
            },
          },
          '400': {
            description: 'Bad request - text is required',
          },
          '500': {
            description: 'Translation failed',
          },
        },
      },
    },
    '/api/translations': {
      get: {
        tags: ['Translations Database'],
        summary: 'Get all saved translations',
        description: 'Retrieves all translation entries from the database',
        responses: {
          '200': {
            description: 'List of translations',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: {
                    $ref: '#/components/schemas/Translation',
                  },
                },
              },
            },
          },
          '500': {
            description: 'Failed to fetch translations',
          },
        },
      },
      post: {
        tags: ['Translations Database'],
        summary: 'Add a new translation entry',
        description: 'Saves a new translation entry to the database',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/TranslationInput',
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'Translation added successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    id: { type: 'integer' },
                    success: { type: 'boolean' },
                  },
                },
              },
            },
          },
          '500': {
            description: 'Failed to add translation',
          },
        },
      },
      put: {
        tags: ['Translations Database'],
        summary: 'Update an existing translation',
        description: 'Updates a translation entry in the database',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                allOf: [
                  {
                    type: 'object',
                    properties: {
                      id: {
                        type: 'integer',
                        description: 'Translation ID to update',
                      },
                    },
                    required: ['id'],
                  },
                  {
                    $ref: '#/components/schemas/TranslationInput',
                  },
                ],
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'Translation updated successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean' },
                  },
                },
              },
            },
          },
          '500': {
            description: 'Failed to update translation',
          },
        },
      },
      delete: {
        tags: ['Translations Database'],
        summary: 'Delete a translation',
        description: 'Removes a translation entry from the database',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'query',
            required: true,
            schema: {
              type: 'integer',
            },
            description: 'Translation ID to delete',
          },
        ],
        responses: {
          '200': {
            description: 'Translation deleted successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean' },
                  },
                },
              },
            },
          },
          '400': {
            description: 'ID is required',
          },
          '401': { description: 'Not authenticated' },
          '500': {
            description: 'Failed to delete translation',
          },
        },
      },
      patch: {
        tags: ['Translations Database'],
        summary: 'Toggle share status of a translation',
        description: 'Admin-only endpoint to share (set user_id to null) or unshare (set user_id to admin) a translation',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  id: { type: 'integer', description: 'Translation ID' },
                  share: { type: 'boolean', description: 'true to share (public), false to unshare (private)' },
                },
                required: ['id', 'share'],
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'Share status updated',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean' },
                    user_id: { type: 'integer', nullable: true, description: 'null if shared, user ID if private' },
                  },
                },
              },
            },
          },
          '400': { description: 'ID is required' },
          '401': { description: 'Not authenticated' },
          '403': { description: 'Admin access required' },
          '404': { description: 'Translation not found' },
          '500': { description: 'Failed to toggle share status' },
        },
      },
    },
    '/api/providers': {
      get: {
        tags: ['Providers'],
        summary: 'Get all provider configurations',
        description: 'Retrieves configuration for all translation providers',
        responses: {
          '200': {
            description: 'Provider configurations',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    providers: {
                      type: 'array',
                      items: {
                        $ref: '#/components/schemas/ProviderConfig',
                      },
                    },
                  },
                },
              },
            },
          },
          '500': {
            description: 'Failed to fetch providers',
          },
        },
      },
      post: {
        tags: ['Providers'],
        summary: 'Save provider configuration',
        description: 'Creates or updates a provider configuration',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ProviderConfigInput',
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'Provider configuration saved',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean' },
                  },
                },
              },
            },
          },
          '400': {
            description: 'Provider type is required',
          },
          '500': {
            description: 'Failed to save provider config',
          },
        },
      },
    },
    '/api/auth/register': {
      post: {
        tags: ['Authentication'],
        summary: 'Register a new user',
        description: 'Initiates user registration by sending a verification code to the email',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  email: { type: 'string', format: 'email', example: 'user@example.com' },
                  fullName: { type: 'string', example: 'John Doe' },
                  preferredLanguage: { type: 'string', enum: ['en', 'de', 'fr', 'it', 'es'], example: 'en' },
                },
                required: ['email', 'fullName'],
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'Verification code sent',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean' },
                    message: { type: 'string' },
                    codeExpiresIn: { type: 'integer', description: 'Code expiry in seconds' },
                  },
                },
              },
            },
          },
          '400': { description: 'Invalid request' },
          '500': { description: 'Internal server error' },
        },
      },
    },
    '/api/auth/verify-registration': {
      post: {
        tags: ['Authentication'],
        summary: 'Verify registration code',
        description: 'Completes user registration by verifying the code and creating the user account',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  email: { type: 'string', format: 'email' },
                  code: { type: 'string', example: '123456' },
                  fullName: { type: 'string' },
                  preferredLanguage: { type: 'string', enum: ['en', 'de', 'fr', 'it', 'es'] },
                },
                required: ['email', 'code'],
              },
            },
          },
        },
        responses: {
          '201': {
            description: 'User registered successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean' },
                    user: { $ref: '#/components/schemas/UserInfo' },
                    token: { type: 'string' },
                  },
                },
              },
            },
          },
          '400': { description: 'Invalid or expired code' },
          '500': { description: 'Internal server error' },
        },
      },
    },
    '/api/auth/login': {
      post: {
        tags: ['Authentication'],
        summary: 'Request login code',
        description: 'Sends a login verification code to the user email',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  email: { type: 'string', format: 'email' },
                },
                required: ['email'],
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'Login code sent (if user exists)',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean' },
                    message: { type: 'string' },
                    codeExpiresIn: { type: 'integer' },
                  },
                },
              },
            },
          },
          '400': { description: 'Invalid email' },
          '500': { description: 'Internal server error' },
        },
      },
    },
    '/api/auth/verify-login': {
      post: {
        tags: ['Authentication'],
        summary: 'Verify login code',
        description: 'Verifies the login code and creates a session',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  email: { type: 'string', format: 'email' },
                  code: { type: 'string' },
                  rememberMe: { type: 'boolean', description: 'Extend session to 30 days' },
                },
                required: ['email', 'code'],
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'Login successful',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean' },
                    user: { $ref: '#/components/schemas/UserInfo' },
                    token: { type: 'string' },
                    expiresAt: { type: 'string', format: 'date-time' },
                  },
                },
              },
            },
          },
          '400': { description: 'Invalid or expired code' },
          '403': { description: 'Account disabled' },
          '404': { description: 'User not found' },
          '500': { description: 'Internal server error' },
        },
      },
    },
    '/api/auth/logout': {
      post: {
        tags: ['Authentication'],
        summary: 'Logout user',
        description: 'Invalidates the current session',
        security: [{ bearerAuth: [] }],
        responses: {
          '200': {
            description: 'Logout successful',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean' },
                    message: { type: 'string' },
                  },
                },
              },
            },
          },
          '401': { description: 'Not authenticated' },
          '500': { description: 'Internal server error' },
        },
      },
    },
    '/api/auth/refresh': {
      post: {
        tags: ['Authentication'],
        summary: 'Refresh session token',
        description: 'Generates a new session token and invalidates the old one',
        security: [{ bearerAuth: [] }],
        responses: {
          '200': {
            description: 'Token refreshed',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean' },
                    token: { type: 'string' },
                    expiresAt: { type: 'string', format: 'date-time' },
                  },
                },
              },
            },
          },
          '401': { description: 'Not authenticated' },
          '500': { description: 'Internal server error' },
        },
      },
    },
    '/api/auth/me': {
      get: {
        tags: ['Authentication'],
        summary: 'Get current user',
        description: 'Returns the authenticated user information',
        security: [{ bearerAuth: [] }],
        responses: {
          '200': {
            description: 'User information',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    user: { $ref: '#/components/schemas/User' },
                  },
                },
              },
            },
          },
          '401': { description: 'Not authenticated' },
          '404': { description: 'User not found' },
          '500': { description: 'Internal server error' },
        },
      },
    },
    '/api/admin/init': {
      get: {
        tags: ['Admin'],
        summary: 'Check initialization status',
        description: 'Checks if the system needs initialization (no users exist)',
        responses: {
          '200': {
            description: 'Initialization status',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    needsInit: { type: 'boolean' },
                    hasUsers: { type: 'boolean' },
                  },
                },
              },
            },
          },
          '500': { description: 'Internal server error' },
        },
      },
      post: {
        tags: ['Admin'],
        summary: 'Initialize first admin user',
        description: 'Creates the first admin user (only works if no users exist)',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  email: { type: 'string', format: 'email' },
                  fullName: { type: 'string' },
                },
                required: ['email', 'fullName'],
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'Verification code sent',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean' },
                    message: { type: 'string' },
                    codeExpiresIn: { type: 'integer' },
                    isAdminInit: { type: 'boolean' },
                  },
                },
              },
            },
          },
          '400': { description: 'System already initialized or invalid request' },
          '500': { description: 'Internal server error' },
        },
      },
    },
    '/api/admin/users': {
      get: {
        tags: ['Admin'],
        summary: 'List all users',
        description: 'Retrieves a paginated list of users with optional filters',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
          { name: 'perPage', in: 'query', schema: { type: 'integer', default: 20 } },
          { name: 'search', in: 'query', schema: { type: 'string' }, description: 'Search by email or name' },
          { name: 'role', in: 'query', schema: { type: 'string', enum: ['admin', 'user'] } },
          { name: 'isActive', in: 'query', schema: { type: 'boolean' } },
        ],
        responses: {
          '200': {
            description: 'List of users',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    users: { type: 'array', items: { $ref: '#/components/schemas/User' } },
                    pagination: { $ref: '#/components/schemas/Pagination' },
                  },
                },
              },
            },
          },
          '401': { description: 'Not authenticated' },
          '403': { description: 'Not authorized (admin only)' },
          '500': { description: 'Internal server error' },
        },
      },
      post: {
        tags: ['Admin'],
        summary: 'Create a new user',
        description: 'Admin creates a new user (email verified by default)',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  email: { type: 'string', format: 'email' },
                  fullName: { type: 'string' },
                  role: { type: 'string', enum: ['admin', 'user'], default: 'user' },
                  preferredLanguage: { type: 'string', enum: ['en', 'de', 'fr', 'it', 'es'] },
                },
                required: ['email', 'fullName'],
              },
            },
          },
        },
        responses: {
          '201': {
            description: 'User created',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean' },
                    user: { $ref: '#/components/schemas/User' },
                  },
                },
              },
            },
          },
          '400': { description: 'Invalid request or user already exists' },
          '401': { description: 'Not authenticated' },
          '403': { description: 'Not authorized (admin only)' },
          '500': { description: 'Internal server error' },
        },
      },
    },
    '/api/admin/users/{id}': {
      put: {
        tags: ['Admin'],
        summary: 'Update user',
        description: 'Updates user information',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'integer' } },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  fullName: { type: 'string' },
                  role: { type: 'string', enum: ['admin', 'user'] },
                  isActive: { type: 'boolean' },
                  preferredLanguage: { type: 'string', enum: ['en', 'de', 'fr', 'it', 'es'] },
                },
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'User updated',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean' },
                    user: { $ref: '#/components/schemas/User' },
                  },
                },
              },
            },
          },
          '400': { description: 'Invalid request' },
          '401': { description: 'Not authenticated' },
          '403': { description: 'Not authorized (admin only)' },
          '404': { description: 'User not found' },
          '500': { description: 'Internal server error' },
        },
      },
      delete: {
        tags: ['Admin'],
        summary: 'Delete user',
        description: 'Soft deletes a user (deactivates)',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'integer' } },
        ],
        responses: {
          '200': {
            description: 'User deleted',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean' },
                    message: { type: 'string' },
                  },
                },
              },
            },
          },
          '400': { description: 'Cannot delete own account' },
          '401': { description: 'Not authenticated' },
          '403': { description: 'Not authorized (admin only)' },
          '404': { description: 'User not found' },
          '500': { description: 'Internal server error' },
        },
      },
    },
    '/api/admin/config': {
      get: {
        tags: ['Admin'],
        summary: 'Get system configuration',
        description: 'Retrieves all system configuration settings',
        security: [{ bearerAuth: [] }],
        responses: {
          '200': {
            description: 'System configuration',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    config: { $ref: '#/components/schemas/SystemConfig' },
                  },
                },
              },
            },
          },
          '401': { description: 'Not authenticated' },
          '403': { description: 'Not authorized (admin only)' },
          '500': { description: 'Internal server error' },
        },
      },
      put: {
        tags: ['Admin'],
        summary: 'Update system configuration',
        description: 'Updates system configuration settings',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/SystemConfig',
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'Configuration updated',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean' },
                    message: { type: 'string' },
                  },
                },
              },
            },
          },
          '400': { description: 'Invalid configuration values' },
          '401': { description: 'Not authenticated' },
          '403': { description: 'Not authorized (admin only)' },
          '500': { description: 'Internal server error' },
        },
      },
    },
    '/api/admin/activity-log': {
      get: {
        tags: ['Admin'],
        summary: 'Get activity log',
        description: 'Retrieves system activity logs with optional filters',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'userId', in: 'query', schema: { type: 'integer' } },
          { name: 'action', in: 'query', schema: { type: 'string' } },
          { name: 'startDate', in: 'query', schema: { type: 'string', format: 'date-time' } },
          { name: 'endDate', in: 'query', schema: { type: 'string', format: 'date-time' } },
          { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
          { name: 'perPage', in: 'query', schema: { type: 'integer', default: 50 } },
        ],
        responses: {
          '200': {
            description: 'Activity logs',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    logs: { type: 'array', items: { $ref: '#/components/schemas/ActivityLog' } },
                    pagination: { $ref: '#/components/schemas/Pagination' },
                  },
                },
              },
            },
          },
          '401': { description: 'Not authenticated' },
          '403': { description: 'Not authorized (admin only)' },
          '500': { description: 'Internal server error' },
        },
      },
    },

  },
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Session token from login/registration',
      },
    },
    schemas: {
      UserInfo: {
        type: 'object',
        properties: {
          id: { type: 'integer' },
          email: { type: 'string', format: 'email' },
          fullName: { type: 'string' },
          role: { type: 'string', enum: ['admin', 'user'] },
          preferredLanguage: { type: 'string', enum: ['en', 'de', 'fr', 'it', 'es'] },
        },
      },
      User: {
        type: 'object',
        properties: {
          id: { type: 'integer' },
          email: { type: 'string', format: 'email' },
          fullName: { type: 'string' },
          role: { type: 'string', enum: ['admin', 'user'] },
          preferredLanguage: { type: 'string', enum: ['en', 'de', 'fr', 'it', 'es'] },
          isActive: { type: 'boolean' },
          emailVerified: { type: 'boolean' },
          lastLogin: { type: 'string', format: 'date-time', nullable: true },
          createdAt: { type: 'string', format: 'date-time' },
        },
      },
      SystemConfig: {
        type: 'object',
        properties: {
          sessionTimeoutMinutes: { type: 'integer', description: 'Session timeout in minutes' },
          codeExpiryMinutes: { type: 'integer', description: 'Auth code expiry in minutes' },
          maxCodeAttempts: { type: 'integer', description: 'Max verification attempts' },
          requireEmailVerification: { type: 'boolean', description: 'Require email verification' },
          allowSelfRegistration: { type: 'boolean', description: 'Allow user self-registration' },
        },
      },
      ActivityLog: {
        type: 'object',
        properties: {
          id: { type: 'integer' },
          user_id: { type: 'integer' },
          action: { type: 'string' },
          details: { type: 'string', nullable: true },
          ip_address: { type: 'string', nullable: true },
          created_at: { type: 'string', format: 'date-time' },
        },
      },
      Pagination: {
        type: 'object',
        properties: {
          page: { type: 'integer' },
          perPage: { type: 'integer' },
          total: { type: 'integer' },
          totalPages: { type: 'integer' },
        },
      },
      TranslationResult: {
        type: 'object',
        properties: {
          translation: {
            type: 'string',
            description: 'The translated text',
          },
          alternatives: {
            type: 'array',
            items: { type: 'string' },
            description: 'Alternative translations sorted by confidence',
          },
        },
      },
      Translation: {
        type: 'object',
        properties: {
          id: { type: 'integer' },
          user_id: { type: 'integer', nullable: true, description: 'Owner user ID (null if shared)' },
          english: { type: 'string' },
          german: { type: 'string' },
          french: { type: 'string' },
          italian: { type: 'string' },
          spanish: { type: 'string' },
          english_proposals: { type: 'string', description: 'JSON array of alternatives' },
          german_proposals: { type: 'string', description: 'JSON array of alternatives' },
          french_proposals: { type: 'string', description: 'JSON array of alternatives' },
          italian_proposals: { type: 'string', description: 'JSON array of alternatives' },
          spanish_proposals: { type: 'string', description: 'JSON array of alternatives' },
          created_at: { type: 'string', format: 'date-time' },
          updated_at: { type: 'string', format: 'date-time' },
        },
      },
      TranslationInput: {
        type: 'object',
        properties: {
          english: { type: 'string', example: 'Hello' },
          german: { type: 'string', example: 'Hallo' },
          french: { type: 'string', example: 'Bonjour' },
          italian: { type: 'string', example: 'Ciao' },
          spanish: { type: 'string', example: 'Hola' },
          english_proposals: { type: 'string' },
          german_proposals: { type: 'string' },
          french_proposals: { type: 'string' },
          italian_proposals: { type: 'string' },
          spanish_proposals: { type: 'string' },
        },
        required: ['english'],
      },
      ProviderConfig: {
        type: 'object',
        properties: {
          type: {
            type: 'string',
            enum: ['libretranslate', 'mymemory', 'deepl', 'google', 'azure', 'pons', 'tatoeba'],
          },
          enabled: {
            type: 'integer',
            enum: [0, 1],
            description: '1 if provider is active, 0 otherwise',
          },
          api_key: { type: 'string', nullable: true },
          api_url: { type: 'string', nullable: true },
          region: { type: 'string', nullable: true },
          email: { type: 'string', nullable: true, description: 'Email for MyMemory quota increase' },
        },
      },
      ProviderConfigInput: {
        type: 'object',
        properties: {
          type: {
            type: 'string',
            enum: ['libretranslate', 'mymemory', 'deepl', 'google', 'azure', 'pons', 'tatoeba'],
            description: 'Provider type',
          },
          enabled: {
            type: 'boolean',
            description: 'Whether this provider is enabled',
          },
          apiKey: { type: 'string', description: 'API key for the provider' },
          apiUrl: { type: 'string', description: 'API URL (for LibreTranslate)' },
          region: { type: 'string', description: 'Region (for Azure)' },
          email: { type: 'string', description: 'Email (for MyMemory)' },
        },
        required: ['type'],
      },
    },
  },
  tags: [
    {
      name: 'Translation',
      description: 'Real-time translation endpoints',
    },
    {
      name: 'Translations Database',
      description: 'CRUD operations for saved translations',
    },
    {
      name: 'Providers',
      description: 'Translation provider configuration',
    },
    {
      name: 'Authentication',
      description: 'User authentication and session management',
    },
    {
      name: 'Admin',
      description: 'Administrative endpoints for user and system management',
    },
  ],
};
