# Troubleshooting Guide

## Common Issues and Solutions

### 🔴 "Failed to send verification email" Error

**Symptoms:**
- Error message appears during registration or login
- Cannot complete authentication flow

**Solution:**
This has been **FIXED**! The error was appearing in dev mode because the code was treating console logging as a failure.

**How it works now:**
1. In dev mode (`DEV_MODE=true`), codes are logged to the terminal
2. Check your terminal/console for messages like:
   ```
   📧 [DEV MODE] Email not sent, logging to console:
   To: your@email.com
   Subject: Welcome to Multi-Lingua - Verify Your Account
   Content: ...
   123456  <-- This is your code
   ```
3. Enter the code from the terminal
4. Registration/login succeeds

**If you still see this error:**
- Check `.env.local` has `DEV_MODE=true`
- Restart the dev server (`npm run dev`)
- Check for any console errors

---

### 🔴 Can't See Landing Page

**Symptoms:**
- Redirected to login instead of landing page
- Landing page doesn't appear for new visitors

**Solution:**
1. Clear browser cookies for localhost:3456
2. Use incognito/private browsing mode
3. Check `middleware.ts` exists in project root
4. Restart the dev server

**To test:**
```bash
# Open in incognito
http://localhost:3456

# Should see landing page
```

---

### 🔴 "Not authenticated" or Redirect Loop

**Symptoms:**
- Constantly redirected between pages
- Can't access main app after login

**Solution:**
1. Check browser console for errors
2. Clear all cookies for localhost:3456
3. Check that auth token is being set:
   - Open browser DevTools
   - Go to Application → Cookies
   - Look for `auth_token` cookie
4. If missing, try logging in again

**Debug:**
```javascript
// In browser console
document.cookie

// Should include something like:
// "auth_token=...; Path=/; HttpOnly"
```

---

### 🔴 Code Expired or Invalid

**Symptoms:**
- "Invalid or expired verification code" message
- Code doesn't work

**Solution:**
1. Codes expire after 10 minutes (configurable)
2. You have 3 attempts per code
3. If expired or max attempts reached, request a new code
4. Click "Resend Code" or "Use different email"

**In dev mode:**
- New codes are logged to terminal each time
- Each new code invalidates the previous one
- Look for the LATEST code in your terminal

---

### 🔴 Admin Features Not Showing

**Symptoms:**
- Can't see Settings, API Docs, or User Management
- Only Help button visible in toolbar

**Solution:**
This is **EXPECTED** behavior for regular users!

**Check your role:**
1. Login as your user
2. Check which buttons you see:
   - **Regular user**: Only Help button
   - **Admin user**: All buttons

**To become admin:**
1. First user to register is automatically admin
2. Or have an existing admin change your role:
   - Admin logs in
   - Goes to User Management
   - Clicks your role badge
   - Changes to "admin"

---

### 🔴 Can't Delete or Deactivate My Account

**Symptoms:**
- Delete button disabled for your own account
- Can't change your own status

**Solution:**
This is a **SECURITY FEATURE**!

**Protection rules:**
1. Admins cannot delete themselves
2. Admins cannot deactivate themselves
3. Last admin cannot remove their admin role
4. All to prevent locking yourself out

**To delete/modify your account:**
- Have another admin do it
- Or create another admin first, then have them modify yours

---

### 🔴 Session Keeps Expiring

**Symptoms:**
- Logged out frequently
- Have to login often

**Solution:**
1. Default session timeout is 24 hours
2. Use "Remember Me" for 30-day sessions
3. Admin can adjust timeout:
   - Login as admin
   - Settings → Session Configuration
   - Adjust timeout (15 min to 30 days)

**For development:**
Add to `.env.local`:
```bash
SESSION_TIMEOUT_MINUTES=43200  # 30 days
```

---

### 🔴 Email Not Arriving (Production)

**Symptoms:**
- Set `DEV_MODE=false`
- No emails received

**Solution:**
1. Check SMTP configuration in `.env.local`:
   ```bash
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_SECURE=true
   SMTP_USER=your-email@gmail.com
   SMTP_PASSWORD=your-app-password  # Not your regular password!
   ```

2. For Gmail, use an App Password:
   - Go to Google Account → Security
   - Enable 2FA
   - Create App Password
   - Use that password in SMTP_PASSWORD

3. Check spam/junk folders

4. Test SMTP settings:
   - Try sending a test email with nodemailer
   - Check server logs for email errors

5. Common SMTP ports:
   - Gmail: 587 (TLS) or 465 (SSL)
   - Outlook: 587
   - Custom SMTP: Check provider docs

---

### 🔴 Database Errors

**Symptoms:**
- "SQLITE_ERROR: no such table"
- Database-related errors

**Solution:**
1. Delete and recreate database:
   ```bash
   rm -rf app/data/translations.db
   npm run dev  # Database auto-creates
   ```

2. Check data directory exists:
   ```bash
   ls -la app/data/
   ```

3. Check permissions:
   ```bash
   chmod 755 app/data/
   ```

---

### 🔴 TypeScript Errors

**Symptoms:**
- Build fails with TS errors
- IDE shows type errors

**Solution:**
1. Most .next/ errors are Next.js internal, not your code
2. Ignore errors in `.next/types/`
3. Focus on errors in `app/`, `lib/`, `components/`

**Check your code:**
```bash
npx tsc --noEmit --skipLibCheck
```

---

### 🔴 Port Already in Use

**Symptoms:**
- "Port 3456 already in use"
- Can't start dev server

**Solution:**
```bash
# Find process using port 3456
lsof -ti:3456

# Kill the process
kill -9 $(lsof -ti:3456)

# Or use different port
npm run dev -- -p 3457
```

---

## Still Having Issues?

### Check These First:
1. ✅ `.env.local` exists with correct values
2. ✅ `node_modules` installed (`npm install`)
3. ✅ Dev server running (`npm run dev`)
4. ✅ No console errors in browser DevTools
5. ✅ Using supported browser (Chrome, Firefox, Safari, Edge)

### Debug Mode:
Enable verbose logging:
```bash
# Add to .env.local
DEBUG=true
LOG_LEVEL=debug
```

### Get Help:
1. Check the documentation:
   - `USER-MANAGEMENT-SPEC.md` - Specification
   - `IMPLEMENTATION-SUMMARY.md` - Technical details
   - `QUICK-START.md` - Getting started
   - `LANDING-PAGE-UPDATE.md` - Recent changes

2. Check browser console for errors
3. Check terminal for server errors
4. Review the logs in activity log (admin only)

### Reset Everything:
If all else fails, complete reset:
```bash
# Stop server
# Delete all data
rm -rf app/data/
rm -rf .next/
rm -rf node_modules/

# Reinstall
npm install

# Start fresh
npm run dev

# Register as first admin again
```

---

## Prevention Tips

1. **Always use incognito** for testing auth flows
2. **Check terminal** for codes in dev mode
3. **Use "Remember Me"** to avoid frequent logins
4. **Create backup admin** before testing role changes
5. **Keep .env.local** in sync with requirements
6. **Don't commit** sensitive data to git
7. **Test in dev** before deploying to production

---

## Quick Reference

### Dev Mode (Default):
```bash
DEV_MODE=true
# Codes log to terminal
# No actual emails sent
# Perfect for testing
```

### Production Mode:
```bash
DEV_MODE=false
SMTP_HOST=your-smtp-server
SMTP_PORT=587
SMTP_USER=your-email
SMTP_PASSWORD=your-app-password
# Real emails sent
```

### Essential URLs:
- Landing: http://localhost:3456/landing
- Register: http://localhost:3456/register
- Login: http://localhost:3456/login
- Main App: http://localhost:3456/
- User Management: http://localhost:3456/admin/users
- API Docs: http://localhost:3456/api-docs
- Help: http://localhost:3456/help

---

**Remember:** Most "errors" in dev mode are actually working as designed!
Check the terminal for verification codes instead of expecting emails.
