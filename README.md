# Multi-Lingua Translation App

A modern Next.js application that provides real-time translation services using LibreTranslate. The app features a table-based interface where users can input English text and receive translations in French, Italian, and Spanish with multiple translation proposals.

## Table of Contents

- [Features](#features)
  - [Core Features](#core-features)
  - [User Management & Authentication](#user-management--authentication)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
  - [Option 1: Docker (Recommended)](#option-1-docker-recommended)
    - [Quick Start with Published Images](#quick-start-with-published-images)
    - [Local Development Setup](#local-development-setup)
  - [Option 2: Local Development](#option-2-local-development)
- [Usage](#usage)
  - [For All Users](#for-all-users)
  - [For Admin Users](#for-admin-users)
  - [User Roles](#user-roles)
- [API Endpoints](#api-endpoints)
  - [Authentication APIs](#authentication-apis)
  - [Translation APIs](#translation-apis)
  - [Admin APIs (Admin Only)](#admin-apis-admin-only)
- [Database Schema](#database-schema)
  - [Translations Table](#translations-table)
  - [User Management Tables](#user-management-tables)
- [Technologies Used](#technologies-used)
- [Configuration](#configuration)
  - [Environment Variables](#environment-variables)
  - [LibreTranslate Connection](#libretranslate-connection)
- [Development](#development)
- [Docker](#docker)
  - [Building the Docker Image](#building-the-docker-image)
  - [Using Docker Compose (Recommended)](#using-docker-compose-recommended)
  - [Persistence & Volume Configuration](#persistence--volume-configuration)
  - [Port Configuration](#port-configuration)
- [Troubleshooting](#troubleshooting)
- [License](#license)

## Features

### Core Features
- **Real-time Translation**: Automatic translation using LibreTranslate API
- **Multiple Language Support**: Translates to French, Italian, and Spanish
- **Translation Proposals**: Up to 5 translation alternatives for each language
- **Editable Results**: All translation fields are editable
- **Persistent Storage**: SQLite database for storing translations
- **Sortable Table**: Sort translations by English column
- **Modern UI**: Clean, responsive design with Tailwind CSS

### User Management & Authentication
- **Email-Based Authentication**: Passwordless login with one-time codes
- **Role-Based Access Control**: Admin and User roles
- **User Registration**: Self-service account creation with email verification
- **Session Management**: Configurable session timeouts with "Remember Me" option
- **Admin Dashboard**: User management interface for admins
- **Activity Logging**: Track user actions and system events
- **Secure Sessions**: JWT-based tokens with HTTP-only cookies

## Prerequisites

- Node.js 18+ installed
- LibreTranslate running locally on port 5000
  - You can run LibreTranslate using Docker: `docker run -ti --rm -p 5000:5000 libretranslate/libretranslate`

## Installation

### Option 1: Docker (Recommended)

#### Quick Start with Published Images
The fastest way to get Multi-Lingua running using pre-built Docker images:

```bash
# Download release configuration
curl -O https://raw.githubusercontent.com/kjwenger/NaturalStupidity/main/MultiLingua/Copilot.AI/docker-compose.release.yml

# Create and pre-populate LibreTranslate models volume
docker volume create lt-local
docker run -d --name temp-libretranslate -p 5000:5000 -v lt-local:/home/libretranslate/.local libretranslate/libretranslate:latest
# Wait for language models to download (check: docker logs -f temp-libretranslate)
docker stop temp-libretranslate && docker rm temp-libretranslate

# Start services
docker-compose -f docker-compose.release.yml up -d

# The app will be available at http://localhost:3456
# LibreTranslate admin will be available at http://localhost:5432
```

#### Local Development Setup
For development or if you want to build locally:

```bash
# Clone the repository and navigate to the project
cd multi-lingua

# Create external volumes for persistence
docker volume create lt-local
docker volume create ml-data

# Start services (includes rebuild)
docker-compose up -d --build

# The app will be available at http://localhost:3456
# LibreTranslate will be available at http://localhost:5432

# 🔥 IMPORTANT: Watch logs for verification codes (dev mode)
docker-compose logs -f multi-lingua

# When you register, look for codes in the logs:
# 📧 [DEV MODE] Email not sent, logging to console:
# 123456  <-- Your verification code
```

**Note for Docker Users:**
- Verification codes appear in Docker logs (dev mode is enabled by default)
- Use `docker-compose logs -f multi-lingua` to see codes during registration/login
- See `DOCKER-ENV.md` for production email configuration

# Start both services using Docker Compose (builds locally)
docker-compose up -d
```

To stop the services:
```bash
docker-compose down
```

To rebuild the app after changes:
```bash
docker-compose up --build
```

### Option 2: Local Development

1. Navigate to the project directory:
   ```bash
   cd multi-lingua
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start LibreTranslate (required for translation functionality):
   ```bash
   # Basic LibreTranslate without persistence
   docker run -ti --rm -p 5000:5000 libretranslate/libretranslate
   
   # LibreTranslate with persistent dictionaries and models
   docker run -ti --rm -p 5000:5000 \
     -v lt-local:/home/libretranslate/.local \
     -v lt-db:/app/db \
     libretranslate/libretranslate
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

5. Open your browser and visit `http://localhost:3456`

6. **First-Time Setup**: On first access, you'll be prompted to create an admin account
   - Click "Register" or navigate to `/register`
   - Enter your email and full name
   - Check your email (or console in dev mode) for the verification code
   - Complete registration - you'll be logged in as the first admin user

## Usage

### For All Users

1. **Login**: Navigate to `/login` and enter your email to receive a login code
2. **Translation**: View and manage translations in the main interface

### For Admin Users

1. **Add New Translation**: Click the "Add New Translation" button to create a new row
2. **Enter English Text**: Type any English word or phrase in the first column
3. **Automatic Translation**: The app will automatically translate to French, Italian, and Spanish
4. **View Suggestions**: Click on any suggestion to use it as the translation
5. **Edit Translations**: Manually edit any translation field
6. **Sort**: Click on the English column header to sort alphabetically
7. **Delete**: Use the delete button to remove unwanted translations
8. **User Management**: Access `/admin/users` to manage users, roles, and permissions
9. **Settings**: Configure translation providers and system settings
10. **Activity Logs**: View user activity and system events

### User Roles

- **Admin Users**:
  - Full access to all features
  - Can manage translations
  - Can access Settings, API Docs, and User Management
  - Can create, edit, and delete users
  - Can configure system settings

- **Regular Users**:
  - View translations only
  - Limited toolbar (Help button only)
  - Cannot modify system configuration

## API Endpoints

### Authentication APIs

- `POST /api/auth/register` - Request registration with verification code
- `POST /api/auth/verify-registration` - Verify code and create account
- `POST /api/auth/login` - Request login code
- `POST /api/auth/verify-login` - Verify code and create session
- `POST /api/auth/logout` - Invalidate current session
- `GET /api/auth/me` - Get current user information
- `POST /api/auth/refresh` - Refresh session token

### Translation APIs

- `GET /api/translations` - Fetch all translations
- `POST /api/translations` - Add new translation
- `PUT /api/translations` - Update existing translation
- `DELETE /api/translations?id={id}` - Delete translation
- `POST /api/translate` - Translate text to all languages

### Admin APIs (Admin Only)

- `GET /api/admin/users` - List all users with pagination and filters
- `POST /api/admin/users` - Create a new user
- `PUT /api/admin/users/:id` - Update user information
- `DELETE /api/admin/users/:id` - Delete user (soft delete)
- `GET /api/admin/activity-log` - View user activity logs
- `GET /api/admin/config` - Get system configuration
- `PUT /api/admin/config` - Update system configuration
- `GET /api/admin/init` - Check initialization status
- `POST /api/admin/init` - Initialize first admin account

## Database Schema

The app uses SQLite with the following schemas:

### Translations Table

```sql
CREATE TABLE translations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  english TEXT NOT NULL,
  german TEXT,
  french TEXT,
  italian TEXT,
  spanish TEXT,
  english_proposals TEXT,
  german_proposals TEXT,
  french_proposals TEXT,
  italian_proposals TEXT,
  spanish_proposals TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### User Management Tables

```sql
-- Users
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
  created_by INTEGER
);

-- Sessions
CREATE TABLE sessions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  token TEXT UNIQUE NOT NULL,
  device_info TEXT,
  ip_address TEXT,
  expires_at DATETIME NOT NULL,
  last_activity DATETIME DEFAULT CURRENT_TIMESTAMP,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Authentication Codes
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
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- System Configuration
CREATE TABLE system_config (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  config_key TEXT UNIQUE NOT NULL,
  config_value TEXT NOT NULL,
  description TEXT,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_by INTEGER
);

-- Activity Logs
CREATE TABLE user_activity_log (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  action TEXT NOT NULL,
  details TEXT,
  ip_address TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

## Technologies Used

- **Next.js 15**: React framework with App Router
- **TypeScript**: Type-safe JavaScript
- **Tailwind CSS**: Utility-first CSS framework
- **SQLite3**: Lightweight database
- **JWT**: JSON Web Tokens for authentication
- **Nodemailer**: Email sending for verification codes
- **LibreTranslate**: Open-source translation API

## Configuration

The app is configured to connect to LibreTranslate. You can customize the connection using environment variables:

### Environment Variables

#### Core Configuration
- `DEV_MODE`: Set to `true` for development (logs codes to console instead of sending email)
- `NODE_ENV`: Set to `production` for production builds
- `PORT`: Port for the Next.js app (default: 3456)

#### Authentication
- `JWT_SECRET`: Secret key for signing JWT tokens (required, use a long random string)
- `JWT_EXPIRY`: Token expiration time (default: 24h)
- `APP_URL`: Application URL for email links (default: http://localhost:3456)

#### Email (SMTP)
- `SMTP_HOST`: SMTP server hostname
- `SMTP_PORT`: SMTP server port (default: 587)
- `SMTP_SECURE`: Use TLS (true/false)
- `SMTP_USER`: SMTP username
- `SMTP_PASSWORD`: SMTP password

#### Translation
- `LIBRETRANSLATE_URL`: Custom LibreTranslate server URL (default: auto-detected based on environment)

### LibreTranslate Connection

The app automatically detects the LibreTranslate URL based on the environment:

1. **Docker Compose**: Uses `http://libretranslate:5000` (service name)
2. **Standalone Docker**: Uses `http://host.docker.internal:5000` (connects to host)
3. **Local Development**: Uses `http://localhost:5000`
4. **Custom**: Set `LIBRETRANSLATE_URL` environment variable

To change the LibreTranslate URL manually:

```bash
# For Docker
docker run -p 3456:3456 -e LIBRETRANSLATE_URL=http://your-server:5000 multi-lingua

# For local development
export LIBRETRANSLATE_URL=http://your-server:5000
npm run dev
```

## Development

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linting
npm run lint
```

## Docker

### Building the Docker Image

```bash
# Build the Docker image
docker build -t multi-lingua .

# Run with LibreTranslate on host machine (localhost:5000)
docker run -p 3456:3456 multi-lingua

# Run with custom LibreTranslate URL
docker run -p 3456:3456 -e LIBRETRANSLATE_URL=http://your-libretranslate-server:5000 multi-lingua

# Run with LibreTranslate also in Docker (basic)
docker run -d --name libretranslate -p 5000:5000 libretranslate/libretranslate
docker run -p 3456:3456 --link libretranslate:libretranslate -e LIBRETRANSLATE_URL=http://libretranslate:5000 multi-lingua

# Run with LibreTranslate in Docker (with persistent storage)
docker run -d --name libretranslate -p 5000:5000 \
  -v lt-local:/home/libretranslate/.local \
  -v lt-db:/app/db \
  libretranslate/libretranslate
docker run -p 3456:3456 --link libretranslate:libretranslate -e LIBRETRANSLATE_URL=http://libretranslate:5000 multi-lingua
```

### Using Docker Compose (Recommended)

#### Option 1: Published Images (No Build Required)
```bash
# Download the release docker-compose file
curl -O https://raw.githubusercontent.com/kjwenger/NaturalStupidity/main/MultiLingua/Copilot.AI/docker-compose.release.yml

# Create and pre-populate LibreTranslate volume (recommended)
docker volume create lt-local
docker run -d --name temp-libretranslate -p 5000:5000 -v lt-local:/home/libretranslate/.local libretranslate/libretranslate:latest
# Wait for models to download, then: docker stop temp-libretranslate && docker rm temp-libretranslate

# Start services using published images
docker-compose -f docker-compose.release.yml up -d
```

#### Option 2: Local Development Build
```bash
# Start both Multi-Lingua and LibreTranslate with local build
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services (preserves volumes)
docker-compose down

# Rebuild and restart
docker-compose up --build -d

# Clean up everything including volumes
docker-compose down -v
```

### Persistence & Volume Configuration

The Docker Compose setup includes persistent storage for:
- **LibreTranslate models and dictionaries**: Uses external `lt-local` volume (must exist)
- **Multi-Lingua database**: Stored in `./data` directory on host

**Important**: The Docker Compose configuration expects an existing `lt-local` volume with pre-downloaded LibreTranslate language models. If you don't have this volume, either:

1. **Create and populate the volume first**:
   ```bash
   # Run LibreTranslate standalone to download models
   docker run -d --name temp-libretranslate -p 5000:5000 \
     -v lt-local:/home/libretranslate/.local \
     libretranslate/libretranslate
   
   # Wait for models to download, then stop
   docker stop temp-libretranslate && docker rm temp-libretranslate
   ```

2. **Or modify docker-compose.yml** to create a new volume instead of using external.

### Port Configuration

- **Multi-Lingua App**: http://localhost:3456
- **LibreTranslate API** (external access): http://localhost:5432
- **Internal network**: Multi-Lingua connects to LibreTranslate via `http://libretranslate:5000`

## Troubleshooting

1. **LibreTranslate 400 Errors**: Usually indicates missing language models
   - Ensure the `lt-local` volume exists and contains downloaded models
   - Check LibreTranslate logs: `docker-compose logs libretranslate`

2. **Volume Issues**: If getting "external volume not found" error
   - Run LibreTranslate standalone first to create the `lt-local` volume
   - Or change `external: true` to `driver: local` in docker-compose.yml

3. **Network Connectivity**: 
   - Multi-Lingua app logs should show: "Using LibreTranslate URL: http://libretranslate:5000"
   - Test with: `curl -X POST http://localhost:3456/api/translate -H "Content-Type: application/json" -d '{"text": "hello"}'`

4. **Database Issues**: The SQLite database file will be created automatically in `./data/`

5. **Translation Errors**: Check the browser console for API error messages

## License

This project is open source and available under the MIT License.
