# User Management Specification

## Overview

This document specifies the user management and authentication system for Multi-Lingua. The system implements role-based access control with email-based authentication using one-time codes (passwordless login).

## User Roles

### 1. Admin Users
- Full access to all application features
- Can access the User Management page
- Can view and use all toolbar icons (Settings, API Docs, Help, Theme Toggle)
- Can manage other users (create, edit, delete, change roles)
- Can view user activity logs
- Can configure system-wide settings

### 2. Regular Users
- Access to core translation functionality
- **Limited toolbar access**: Only Help icon visible
- Cannot access Settings, API Docs, or User Management
- Cannot modify system configuration
- Can only manage their own profile

## Authentication Flow

### Email-Based Passwordless Authentication

**No traditional passwords** - authentication uses one-time codes sent via email.

### Registration Process

1. User navigates to registration page (`/register`)
2. User provides:
   - Email address (required, unique)
   - Full name (required)
   - Preferred language (optional)
3. System validates email format and uniqueness
4. System sends verification code to email (6-digit numeric code)
5. User enters verification code
6. Upon successful verification:
   - User account is created with `user` role by default
   - User is automatically logged in
   - Session token is generated

### Login Process

1. User navigates to login page (`/login`)
2. User enters email address
3. System validates email exists in database
4. System generates and sends one-time login code (6-digit numeric code)
5. User enters the code
6. Upon successful code verification:
   - Session token is generated
   - User is redirected to main application
7. Invalid code handling:
   - Maximum 3 attempts per code
   - Code expires after 10 minutes
   - After 3 failed attempts, user must request new code

### Session Management

- **Session Token**: JWT-based authentication tokens
- **Configurable Session Duration**: Admin-configurable timeout
  - Default: 24 hours
  - Configurable range: 15 minutes to 30 days
  - Setting stored in database configuration table
- **Session Storage**: HTTP-only secure cookies
- **Session Refresh**: Optional "Remember Me" extends session to 30 days
- **Auto-logout**: Sessions automatically expire after configured duration
- **Activity Tracking**: Last activity timestamp updated on each request
- **Concurrent Sessions**: Users can have multiple active sessions (different devices)

## Database Schema

### Users Table

```sql
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'user' CHECK(role IN ('admin', 'user')),
  preferred_language TEXT DEFAULT 'en',
  is_active BOOLEAN DEFAULT 1,
  email_verified BOOLEAN DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  last_login DATETIME,
  created_by INTEGER,
  FOREIGN KEY (created_by) REFERENCES users(id)
);
```

### Authentication Codes Table

```sql
CREATE TABLE auth_codes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER,
  email TEXT NOT NULL,
  code TEXT NOT NULL,
  code_type TEXT NOT NULL CHECK(code_type IN ('registration', 'login')),
  attempts INTEGER DEFAULT 0,
  max_attempts INTEGER DEFAULT 3,
  expires_at DATETIME NOT NULL,
  used BOOLEAN DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);
```

### Sessions Table

```sql
CREATE TABLE sessions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  token TEXT UNIQUE NOT NULL,
  device_info TEXT,
  ip_address TEXT,
  expires_at DATETIME NOT NULL,
  last_activity DATETIME DEFAULT CURRENT_TIMESTAMP,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);
```

### System Configuration Table

```sql
CREATE TABLE system_config (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  config_key TEXT UNIQUE NOT NULL,
  config_value TEXT NOT NULL,
  description TEXT,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_by INTEGER,
  FOREIGN KEY (updated_by) REFERENCES users(id)
);

-- Default configuration entries
INSERT INTO system_config (config_key, config_value, description) VALUES
  ('session_timeout_minutes', '1440', 'Session timeout in minutes (default: 24 hours)'),
  ('code_expiry_minutes', '10', 'Authentication code expiry in minutes'),
  ('max_code_attempts', '3', 'Maximum attempts for authentication code'),
  ('require_email_verification', 'true', 'Require email verification for new accounts');
```

### User Activity Log Table (Optional)

```sql
CREATE TABLE user_activity_log (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  action TEXT NOT NULL,
  details TEXT,
  ip_address TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);
```

## API Endpoints

### Authentication APIs

#### POST /api/auth/register
Request user registration and send verification code.

**Request Body:**
```json
{
  "email": "user@example.com",
  "fullName": "John Doe",
  "preferredLanguage": "en"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Verification code sent to email",
  "codeExpiresIn": 600
}
```

#### POST /api/auth/verify-registration
Verify registration code and create account.

**Request Body:**
```json
{
  "email": "user@example.com",
  "code": "123456"
}
```

**Response:**
```json
{
  "success": true,
  "user": {
    "id": 1,
    "email": "user@example.com",
    "fullName": "John Doe",
    "role": "user"
  },
  "token": "jwt-token-here"
}
```

#### POST /api/auth/login
Request login code.

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login code sent to email",
  "codeExpiresIn": 600
}
```

#### POST /api/auth/verify-login
Verify login code and create session.

**Request Body:**
```json
{
  "email": "user@example.com",
  "code": "123456",
  "rememberMe": false
}
```

**Response:**
```json
{
  "success": true,
  "user": {
    "id": 1,
    "email": "user@example.com",
    "fullName": "John Doe",
    "role": "user"
  },
  "token": "jwt-token-here",
  "expiresAt": "2026-02-06T15:42:36.991Z"
}
```

#### POST /api/auth/logout
Invalidate current session.

**Response:**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

#### GET /api/auth/me
Get current user information.

**Response:**
```json
{
  "user": {
    "id": 1,
    "email": "user@example.com",
    "fullName": "John Doe",
    "role": "user",
    "preferredLanguage": "en"
  }
}
```

#### POST /api/auth/refresh
Refresh session token.

**Response:**
```json
{
  "success": true,
  "token": "new-jwt-token-here",
  "expiresAt": "2026-02-06T15:42:36.991Z"
}
```

### User Management APIs (Admin Only)

#### GET /api/admin/users
List all users with pagination.

**Query Parameters:**
- `page` (default: 1)
- `perPage` (default: 20)
- `search` (optional: search by email or name)
- `role` (optional: filter by role)
- `isActive` (optional: filter by active status)

**Response:**
```json
{
  "users": [
    {
      "id": 1,
      "email": "user@example.com",
      "fullName": "John Doe",
      "role": "user",
      "isActive": true,
      "emailVerified": true,
      "lastLogin": "2026-02-05T14:30:00.000Z",
      "createdAt": "2026-01-01T10:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "perPage": 20,
    "total": 1,
    "totalPages": 1
  }
}
```

#### POST /api/admin/users
Create a new user (admin bypass, no email verification needed).

**Request Body:**
```json
{
  "email": "newuser@example.com",
  "fullName": "Jane Smith",
  "role": "user",
  "preferredLanguage": "fr"
}
```

#### PUT /api/admin/users/:id
Update user information.

**Request Body:**
```json
{
  "fullName": "Jane Smith Updated",
  "role": "admin",
  "isActive": true
}
```

#### DELETE /api/admin/users/:id
Delete a user (soft delete - sets isActive to false).

#### GET /api/admin/activity-log
View user activity logs.

**Query Parameters:**
- `userId` (optional)
- `action` (optional)
- `startDate` (optional)
- `endDate` (optional)
- `page` (default: 1)
- `perPage` (default: 50)

#### GET /api/admin/config
Get system configuration.

**Response:**
```json
{
  "config": {
    "sessionTimeoutMinutes": 1440,
    "codeExpiryMinutes": 10,
    "maxCodeAttempts": 3,
    "requireEmailVerification": true
  }
}
```

#### PUT /api/admin/config
Update system configuration.

**Request Body:**
```json
{
  "sessionTimeoutMinutes": 720
}
```

## UI Components

### Login Page (`/login`)
- Email input field
- "Send Login Code" button
- Code input field (shown after code is sent)
- "Verify Code" button
- "Remember Me" checkbox
- Link to registration page
- Countdown timer showing code expiration
- Resend code option (available after 60 seconds)

### Registration Page (`/register`)
- Email input field
- Full name input field
- Preferred language dropdown
- "Create Account" button
- Code verification input (shown after registration submitted)
- Link to login page

### User Management Page (`/admin/users`) - Admin Only
- User list table with columns:
  - Email
  - Full Name
  - Role
  - Status (Active/Inactive)
  - Last Login
  - Actions (Edit, Delete, Toggle Status)
- Search/filter controls
- Pagination
- "Add New User" button
- Role change dropdown
- User activity view link

### Toolbar Modifications

#### For Admin Users
All icons visible:
- Settings
- API Docs
- Help
- Theme Toggle
- User Management (new icon)

#### For Regular Users
Only Help icon visible:
- Help (only)
- All other toolbar icons hidden

### Profile Page (`/profile`)
- View/edit own profile information
- Session management (view active sessions, logout from other devices)
- Activity history (own actions only)

## Email Templates

### Registration Verification Email
```
Subject: Welcome to Multi-Lingua - Verify Your Account

Hello [Full Name],

Welcome to Multi-Lingua! Your verification code is:

[123456]

This code will expire in 10 minutes.

If you didn't request this code, please ignore this email.

Best regards,
Multi-Lingua Team
```

### Login Code Email
```
Subject: Multi-Lingua Login Code

Hello [Full Name],

Your login code is:

[123456]

This code will expire in 10 minutes.

If you didn't request this code, please secure your account immediately.

Best regards,
Multi-Lingua Team
```

## Security Considerations

1. **Code Generation**
   - Cryptographically secure random 6-digit codes
   - Codes expire after 10 minutes
   - Maximum 3 attempts per code
   - Rate limiting: max 5 code requests per hour per email

2. **Session Security**
   - JWT tokens with secure signing
   - HTTP-only cookies to prevent XSS
   - Secure flag for HTTPS connections
   - CSRF protection for state-changing operations
   - Token rotation on sensitive operations

3. **Email Security**
   - Email validation using standard regex
   - Prevent user enumeration (same response for valid/invalid emails)
   - Rate limiting on email sending

4. **Database Security**
   - Parameterized queries to prevent SQL injection
   - Index on email field for performance
   - Soft delete for user accounts (maintain referential integrity)

5. **API Security**
   - Middleware for authentication verification
   - Role-based authorization checks
   - Request validation and sanitization
   - Rate limiting per endpoint

## Environment Variables

```bash
# Email Configuration (using SMTP)
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_SECURE=true
SMTP_USER=noreply@multi-lingua.com
SMTP_PASSWORD=secure-password

# JWT Configuration
JWT_SECRET=your-secret-key-here
JWT_EXPIRY=24h

# Application URL (for email links)
APP_URL=http://localhost:3456

# Session Configuration (can override database config)
SESSION_TIMEOUT_MINUTES=1440

# Development Mode (logs codes to console instead of sending email)
DEV_MODE=true
```

## Initial Setup

### First Admin Account
On initial deployment with empty database:
1. System creates default admin account
2. Admin email sent to configured `INITIAL_ADMIN_EMAIL`
3. Admin uses email-based login to access system
4. Admin should immediately verify the account and configure settings

**Environment Variable:**
```bash
INITIAL_ADMIN_EMAIL=admin@multi-lingua.com
```

### Migration from Current System
1. Current system has no authentication
2. On first deployment of user management:
   - Prompt to create admin account on first access
   - Lock down application until admin is created
   - Admin creates additional users as needed

## Configuration Options

### Admin-Configurable Settings

All accessible from Settings page (admin only):

1. **Session Timeout**
   - Slider: 15 minutes to 30 days
   - Default: 24 hours

2. **Code Expiry Time**
   - Dropdown: 5, 10, 15, 30 minutes
   - Default: 10 minutes

3. **Maximum Code Attempts**
   - Dropdown: 3, 5, 10
   - Default: 3

4. **Email Verification Required**
   - Toggle: Yes/No
   - Default: Yes

5. **Allow Self-Registration**
   - Toggle: Yes/No
   - Default: Yes

## Testing Considerations

### Unit Tests
- Code generation and validation
- Session token creation and verification
- Email format validation
- Role-based access checks

### Integration Tests
- Complete registration flow
- Complete login flow
- Session expiration
- Code expiration and attempts
- Admin user management operations

### E2E Tests
- User registration journey
- User login journey
- Admin user management workflow
- Access control verification (regular user cannot access admin pages)

## Future Enhancements

Potential features for future iterations:
1. OAuth integration (Google, GitHub, Microsoft)
2. Two-factor authentication (TOTP)
3. Password-based login as alternative
4. User groups and advanced permissions
5. API key authentication for programmatic access
6. Email notification preferences
7. User profile avatars
8. Account recovery mechanisms
9. Login history and device management
10. IP-based restrictions for admin accounts
