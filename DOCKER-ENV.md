# Docker Environment Configuration

## Issue: "Failed to send verification email" in Docker

### Root Cause
When running in Docker Compose, the container doesn't automatically inherit `.env.local` from your host machine. Without `DEV_MODE=true`, the app tries to send real emails and fails because SMTP is not configured.

### Solution
All docker-compose files have been updated to include:
```yaml
environment:
  - DEV_MODE=true
  - JWT_SECRET=${JWT_SECRET:-change-this-secret-in-production-please}
  - JWT_EXPIRY=24h
  - APP_URL=${APP_URL:-http://localhost:3456}
```

## Updated Files

1. ✅ `docker-compose.yml` - Local development with LibreTranslate
2. ✅ `docker-compose-multi-lingua.yml` - Multi-Lingua only (external LibreTranslate)
3. ✅ `portainer-stack.yml` - Portainer deployment

## How to Apply Changes

### Option 1: Rebuild and Restart (Recommended)
```bash
# Stop existing containers
docker-compose down

# Rebuild image with latest code
docker-compose build --no-cache

# Start with new environment
docker-compose up -d

# Check logs to verify DEV_MODE is active
docker-compose logs -f multi-lingua
```

### Option 2: Update Running Container
```bash
# Stop the container
docker-compose stop multi-lingua

# Remove container (keeps data)
docker-compose rm multi-lingua

# Start with new environment
docker-compose up -d multi-lingua

# Verify
docker-compose logs -f multi-lingua
```

## Verify DEV_MODE is Working

### Check Container Environment
```bash
# See all environment variables
docker exec multi-lingua env | grep DEV_MODE

# Should output:
# DEV_MODE=true
```

### Check Logs for Email Messages
```bash
# Follow logs in real-time
docker-compose logs -f multi-lingua

# When you register, you should see:
# 📧 [DEV MODE] Email not sent, logging to console:
# To: your@email.com
# Subject: Welcome to Multi-Lingua - Verify Your Account
# ...
# 123456
```

### Test Registration
1. Open browser to your Docker host (e.g., `http://localhost:3456`)
2. Navigate to `/register`
3. Fill in registration form
4. Click "Create Account"
5. **Check Docker logs** for verification code:
   ```bash
   docker-compose logs multi-lingua | grep "DEV MODE" -A 10
   ```
6. Enter the code from logs
7. Registration should succeed!

## Production Configuration

For production deployment with real email:

### 1. Create Environment File
```bash
# Create .env file in same directory as docker-compose.yml
cat > .env << 'EOF'
# Production Email Configuration
DEV_MODE=false
JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters-long
JWT_EXPIRY=24h
APP_URL=https://your-domain.com

# SMTP Settings
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=noreply@your-domain.com
SMTP_PASSWORD=your-smtp-app-password

# Optional: Session Configuration
SESSION_TIMEOUT_MINUTES=1440
EOF
```

### 2. Update docker-compose.yml
```yaml
services:
  multi-lingua:
    environment:
      - NODE_ENV=production
      - PORT=3456
      - HOSTNAME=0.0.0.0
      - DOCKER_COMPOSE=true
      - LIBRETRANSLATE_URL=${LIBRETRANSLATE_URL}
      # Authentication
      - DEV_MODE=${DEV_MODE}
      - JWT_SECRET=${JWT_SECRET}
      - JWT_EXPIRY=${JWT_EXPIRY:-24h}
      - APP_URL=${APP_URL}
      # Email (only needed if DEV_MODE=false)
      - SMTP_HOST=${SMTP_HOST}
      - SMTP_PORT=${SMTP_PORT}
      - SMTP_SECURE=${SMTP_SECURE}
      - SMTP_USER=${SMTP_USER}
      - SMTP_PASSWORD=${SMTP_PASSWORD}
```

### 3. Deploy
```bash
docker-compose down
docker-compose up -d
```

## Email Provider Options

The app uses standard **nodemailer** with SMTP to send OTP verification codes. Any SMTP-compatible provider works. Here are free options suitable for a personal/small deployment.

### Free SMTP Providers

| Provider | Free Tier | SMTP Host | Port | Notes |
|---|---|---|---|---|
| **Gmail** (App Password) | 500/day | `smtp.gmail.com` | 587 | Easiest setup, requires 2FA + App Password |
| **Outlook/Hotmail** | 300/day | `smtp-mail.outlook.com` | 587 | Microsoft account required |
| **Brevo** (ex-Sendinblue) | 300/day | `smtp-relay.brevo.com` | 587 | Dedicated transactional email service |
| **Mailjet** | 200/day | `in-v3.mailjet.com` | 587 | API key as user, secret key as password |
| **Zoho Mail** (free plan) | 50/day | `smtp.zoho.com` | 587 | Free plan limited to 5 users |

For OTP codes on a personal app, any of these is more than enough.

### Recommended: Gmail App Password

The simplest option. Steps:

1. Use (or create) a Gmail account
2. Enable 2-Factor Authentication on the account
3. Go to [App Passwords](https://myaccount.google.com/apppasswords) and generate one
4. Set the following environment variables (e.g. in Portainer stack or `.env` file):

```env
DEV_MODE=false
JWT_SECRET=<generate-a-long-random-string>
APP_URL=https://your-domain.com

SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-account@gmail.com
SMTP_PASSWORD=xxxx-xxxx-xxxx-xxxx
```

> **Note on SMTP_SECURE:** Port 587 uses STARTTLS (starts plain, upgrades to TLS). Set `SMTP_SECURE=false` for port 587 — nodemailer will still encrypt via STARTTLS automatically. Only use `SMTP_SECURE=true` with port 465 (implicit TLS). Using `SMTP_SECURE=true` with port 587 causes `wrong version number` SSL errors.

The `from` address on sent emails will be `SMTP_USER` (see `lib/email-service.ts` line 51).

### Synology NAS as SMTP Server

Synology DSM offers a built-in **Mail Server** package (or **MailPlus Server** on Plus/XS models). If installed and configured, the NAS becomes its own SMTP relay.

Example env vars for a Synology mail server:

```env
SMTP_HOST=gertrun.synology.me
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=multilingua@gertrun.synology.me
SMTP_PASSWORD=your-mail-account-password
```

**Caveats with self-hosted SMTP:**

- Emails from a residential IP are very likely to land in **spam** or be rejected entirely by major providers (Gmail, Outlook, etc.)
- Proper DNS records are required: **SPF**, **DKIM**, and **DMARC**
- Many ISPs block outbound port 25; port 587 with STARTTLS is usually fine
- For a home NAS app used by a handful of people, it *can* work if recipients whitelist the sender address, but it is fragile
- A better Synology approach: configure the Synology Mail Server to **relay through Gmail** (or another provider), combining local control with Gmail's deliverability

### Portainer Deployment

When deploying via Portainer on your Synology (`portainer-stack.yml`), set the SMTP variables directly in the Portainer stack environment UI:

1. Open Portainer > Stacks > your Multi-Lingua stack
2. Go to **Environment variables**
3. Add the variables listed above (`DEV_MODE=false`, `SMTP_HOST`, etc.)
4. Redeploy the stack

This avoids hardcoding secrets in files committed to the repository.

## Environment Variables Reference

### Required (All Deployments)
| Variable | Description | Default | Example |
|----------|-------------|---------|---------|
| `DEV_MODE` | Enable dev mode (logs codes to console) | `true` | `true` or `false` |
| `JWT_SECRET` | Secret key for JWT tokens | `change-this...` | Long random string |
| `JWT_EXPIRY` | Token expiration time | `24h` | `24h`, `7d`, `30d` |
| `APP_URL` | Application URL | `http://localhost:3456` | `https://multi-lingua.com` |

### Required (Production Only - DEV_MODE=false)
| Variable | Description | Example |
|----------|-------------|---------|
| `SMTP_HOST` | SMTP server hostname | `smtp.gmail.com` |
| `SMTP_PORT` | SMTP port | `587` |
| `SMTP_SECURE` | Use implicit TLS (true for port 465, false for port 587/STARTTLS) | `false` |
| `SMTP_USER` | SMTP username | `noreply@domain.com` |
| `SMTP_PASSWORD` | SMTP password/app password | `your-app-password` |

### Optional
| Variable | Description | Default | Example |
|----------|-------------|---------|---------|
| `SESSION_TIMEOUT_MINUTES` | Session expiration | `1440` (24h) | `43200` (30d) |
| `CODE_EXPIRY_MINUTES` | Verification code lifetime | `10` | `15` |
| `MAX_CODE_ATTEMPTS` | Max code verification attempts | `3` | `5` |

## Docker Compose Files Explained

### docker-compose.yml
**Use for:** Local development with bundled LibreTranslate
```bash
docker-compose up -d
```
- Starts LibreTranslate on port 5432→5000
- Starts Multi-Lingua on port 3456
- Both services in same network
- DEV_MODE=true by default

### docker-compose-multi-lingua.yml
**Use for:** Deployment with external LibreTranslate
```bash
docker-compose -f docker-compose-multi-lingua.yml up -d
```
- Only starts Multi-Lingua
- Uses external LibreTranslate (https://libretranslate.gertrun.synology.me)
- DEV_MODE=true by default

### portainer-stack.yml
**Use for:** Portainer deployment
- Deploy via Portainer UI
- Uses registry image
- DEV_MODE=true by default
- Override with environment variables in Portainer

## Troubleshooting

### Still Getting Email Error?

1. **Check environment is set:**
   ```bash
   docker exec multi-lingua env | grep -E "DEV_MODE|JWT_SECRET"
   ```

2. **Check if container needs rebuild:**
   ```bash
   docker-compose build --no-cache
   docker-compose up -d
   ```

3. **Check logs for DEV MODE message:**
   ```bash
   docker-compose logs multi-lingua | tail -50
   ```

4. **Try registering and check logs in real-time:**
   ```bash
   # Terminal 1: Watch logs
   docker-compose logs -f multi-lingua
   
   # Terminal 2: Test registration
   # Open browser, register, watch Terminal 1 for code
   ```

### Container Not Starting?

```bash
# Check logs
docker-compose logs multi-lingua

# Check if database volume has permission issues
docker exec multi-lingua ls -la /app/data/

# If permission denied, fix permissions
docker exec multi-lingua chmod -R 755 /app/data/
```

### Need to Reset Everything?

```bash
# Stop and remove containers
docker-compose down

# Remove volumes (WARNING: Deletes all data!)
docker volume rm ml-data lt-local

# Recreate volumes
docker volume create ml-data
docker volume create lt-local

# Start fresh
docker-compose up -d
```

## Quick Commands

```bash
# View all logs
docker-compose logs -f

# View Multi-Lingua logs only
docker-compose logs -f multi-lingua

# Check environment
docker exec multi-lingua env

# Restart service
docker-compose restart multi-lingua

# Rebuild and restart
docker-compose up -d --build

# Check if DEV_MODE is active
docker-compose logs multi-lingua | grep "DEV MODE"

# Watch for verification codes
docker-compose logs -f multi-lingua | grep -A 5 "Welcome to Multi-Lingua"
```

## Best Practices

1. **Development:** Always use `DEV_MODE=true`
2. **Production:** Set `DEV_MODE=false` and configure SMTP
3. **Secrets:** Use Docker secrets or environment files, never hardcode
4. **Logs:** Monitor `docker-compose logs` for verification codes in dev mode
5. **Backup:** Regularly backup `ml-data` volume (contains database)
6. **Updates:** Rebuild image after pulling code changes
7. **Testing:** Test in dev mode before switching to production

## Example Workflows

### Development Workflow
```bash
# 1. Start services
docker-compose up -d

# 2. Watch logs in separate terminal
docker-compose logs -f multi-lingua

# 3. Open browser
http://localhost:3456/landing

# 4. Register
# 5. Get code from logs
# 6. Complete registration
```

### Production Workflow
```bash
# 1. Create .env with SMTP settings
vi .env

# 2. Deploy
docker-compose -f docker-compose-multi-lingua.yml up -d

# 3. Check logs
docker-compose -f docker-compose-multi-lingua.yml logs -f

# 4. Test with real email
# Emails should arrive in inbox
```

---

**Remember:** In dev mode, verification codes are in Docker logs, not your email!
Use `docker-compose logs -f multi-lingua` to see them.
