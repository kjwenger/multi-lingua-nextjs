# Quick Start Guide - User Management

## Getting Started in 5 Minutes

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment
The `.env.local` file is already configured for development with:
- `DEV_MODE=true` (codes log to console instead of email)
- `JWT_SECRET` set for development

### 3. Start the Application
```bash
npm run dev
```

The app will be available at `http://localhost:3456`

### 4. Create Your First Admin Account

1. **Navigate to Registration**
   - Open your browser to `http://localhost:3456`
   - You'll be redirected to `/login`
   - Click "Don't have an account? Register"

2. **Fill in Registration Form**
   - Email: `admin@example.com`
   - Full Name: `Admin User`
   - Preferred Language: `English`
   - Click "Create Account"

3. **Get Verification Code**
   - Since `DEV_MODE=true`, check your terminal/console
   - Look for a message like:
     ```
     📧 [DEV MODE] Email not sent, logging to console:
     To: admin@example.com
     Subject: Welcome to Multi-Lingua - Verify Your Account
     Content: ...
     
     123456  <-- This is your code
     ```

4. **Complete Registration**
   - Enter the 6-digit code
   - Click "Verify & Create Account"
   - You're now logged in as the first admin!

### 5. Explore Admin Features

Once logged in as admin, you can:

- **User Management** - Click the users icon in the toolbar
  - Create new users
  - Change roles (admin/user)
  - Toggle active status
  - Delete users

- **Settings** - Click the gear icon
  - Configure translation providers
  - Adjust system settings

- **API Docs** - Click the docs icon
  - View API documentation

- **Add Translations** - Click "Add New Translation"
  - Create and manage translations

### 6. Test Regular User Access

1. **Create a Regular User**
   - Click the users icon → "Add User"
   - Email: `user@example.com`
   - Full Name: `Regular User`
   - Role: `User`
   - Click "Create User"

2. **Logout**
   - Click the logout button (→ icon)

3. **Login as Regular User**
   - Navigate to `/login`
   - Email: `user@example.com`
   - Click "Send Login Code"
   - Check console for code
   - Enter code and login

4. **Verify Limited Access**
   - You should only see:
     - Help button in toolbar
     - Translation table (read-only for now)
   - No access to:
     - Settings
     - API Docs
     - User Management
     - Add Translation button

## Common Operations

### Logout
Click the logout button (→ icon) in the top toolbar.

### Change Session Timeout
1. Login as admin
2. Click Settings icon
3. Adjust "Session Timeout" slider
4. Changes apply to new sessions

### View Activity Logs (Admin)
1. Navigate to `/admin/users`
2. Implementation ready via API: `GET /api/admin/activity-log`

### Manage Users (Admin)
- Navigate to `/admin/users`
- Search users by email or name
- Toggle roles by clicking the role badge
- Toggle status by clicking the status badge
- Delete users with the Delete button

## Security Notes

### Development Mode
- `DEV_MODE=true` logs codes to console
- Useful for testing without email setup
- **DO NOT use in production**

### Production Setup
1. Set `DEV_MODE=false`
2. Configure SMTP settings:
   ```bash
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_SECURE=true
   SMTP_USER=your-email@gmail.com
   SMTP_PASSWORD=your-app-password
   ```
3. Set a strong JWT secret:
   ```bash
   JWT_SECRET=$(openssl rand -base64 32)
   ```

### Session Security
- Sessions use HTTP-only cookies (XSS protection)
- JWT tokens with cryptographic signing
- Configurable expiration (default 24 hours)
- "Remember Me" extends to 30 days
- Automatic token rotation on refresh

## Troubleshooting

### Can't login?
- Check console for verification codes (dev mode)
- Codes expire in 10 minutes
- Maximum 3 attempts per code
- Request a new code if needed

### Forgot to save first admin?
- First user to register becomes admin automatically
- If database exists, use existing admin to create more users
- Or delete `app/data/translations.db` and start fresh

### Email not sending?
- Verify SMTP settings in `.env.local`
- Check SMTP credentials
- Test with `DEV_MODE=true` first
- Check firewall/network settings

### Permission errors?
- Admins can't deactivate themselves
- Admins can't remove their own admin role if they're the last admin
- Regular users have read-only access

## What's Next?

- Add more users
- Configure translation providers
- Import existing translations
- Set up production email
- Deploy to production
- Monitor activity logs

## API Testing

You can test the API with curl:

```bash
# Register
curl -X POST http://localhost:3456/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","fullName":"Test User"}'

# Verify registration (use code from console)
curl -X POST http://localhost:3456/api/auth/verify-registration \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","code":"123456","fullName":"Test User"}'

# Login
curl -X POST http://localhost:3456/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'

# Verify login (use code from console)
curl -X POST http://localhost:3456/api/auth/verify-login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","code":"123456"}'
```

## Support

For detailed information, see:
- `USER-MANAGEMENT-SPEC.md` - Complete specification
- `IMPLEMENTATION-SUMMARY.md` - What was implemented
- `README.md` - General documentation
