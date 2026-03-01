# ── Stage 1: production dependencies ─────────────────────────────────────────
# Install only runtime deps so the final image doesn't carry devDependencies.
FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# ── Stage 2: build the JS bundle ─────────────────────────────────────────────
# Full install (includes tsup/tsx/typescript) so we can run the build.
FROM node:20-alpine AS builder
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY index.ts client.ts tools.ts resources.ts tsconfig.json ./
RUN npm run build

# ── Stage 3: minimal runtime image ───────────────────────────────────────────
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
# Default to HTTP transport — callers may override via docker-compose env.
ENV MCP_TRANSPORT=http
ENV MCP_PORT=3457
# Default target; override to point at a remote instance.
ENV MULTI_LINGUA_URL=http://multi-lingua:3456

RUN addgroup --system --gid 1001 nodejs \
 && adduser  --system --uid 1001 mcpserver

COPY --from=deps    --chown=mcpserver:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=mcpserver:nodejs /app/dist         ./dist

USER mcpserver
EXPOSE 3457

# All MCP protocol traffic goes through the Streamable HTTP endpoint /mcp.
# Configuration is driven entirely by environment variables.
CMD ["node", "dist/index.js"]
