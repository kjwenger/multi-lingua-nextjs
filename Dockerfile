# Multi-stage build for Next.js application
# VERSION is passed from docker-compose.yml or command line
# Default is read from package.json by the build scripts
ARG VERSION=0.0.0
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Install dependencies based on the preferred package manager
COPY package.json package-lock.json* ./
RUN npm ci

# Rebuild the source code only when needed
FROM base AS builder
ARG VERSION
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Next.js collects completely anonymous telemetry data about general usage.
# Learn more here: https://nextjs.org/telemetry
# Uncomment the following line in case you want to disable telemetry during the build.
ENV NEXT_TELEMETRY_DISABLED 1
ENV NEXT_PUBLIC_APP_VERSION=${VERSION}

RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
# Uncomment the following line in case you want to disable telemetry during runtime.
ENV NEXT_TELEMETRY_DISABLED 1

# Environment variables for LibreTranslate connection
ENV LIBRETRANSLATE_URL=http://libretranslate:5000
ENV PORT=3000
ENV HOSTNAME=0.0.0.0
ARG VERSION
ENV APP_VERSION=${VERSION}

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Set the correct permission for prerender cache
RUN mkdir .next
RUN chown nextjs:nodejs .next

# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

# Create directory for SQLite database
RUN mkdir -p /app/data && chown nextjs:nodejs /app/data

USER root

EXPOSE 3000

# Install su-exec for Alpine
RUN apk add --no-cache su-exec

# Ensure /app/data is writable by nextjs user at runtime and start as nextjs
CMD chown -R nextjs:nodejs /app/data && chmod 777 /app/data && su-exec nextjs node server.js
