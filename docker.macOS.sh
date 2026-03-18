#!/usr/bin/env bash
# Build and push multi-platform Docker images (linux/amd64 + linux/arm64)
# using Colima + docker-buildx, then restart the local docker compose.
#
# Prerequisites (one-time setup — skip if the builder already exists):
#   colima stop && colima start --memory 6
#   DOCKER_HOST=unix:///Users/kjwenger/.colima/docker.sock \
#     docker-buildx create --name multiplatform --driver docker-container \
#       --platform linux/amd64,linux/arm64 --use
#
# Usage:
#   bash docker.macOS.sh            # uses version from package.json

set -euo pipefail

# ── Configuration ─────────────────────────────────────────────────────────────

REGISTRY="registry.gertrun.synology.me"
APP_IMAGE="multi-lingua"
MCP_IMAGE="multi-lingua-mcp"
COLIMA_SOCKET="unix:///Users/kjwenger/.colima/docker.sock"
BUILDER="multiplatform"
PLATFORMS="linux/amd64,linux/arm64"

VERSION=$(node -p "require('./package.json').version")

echo "==> multi-lingua release ${VERSION}"

# ── Builder health check ──────────────────────────────────────────────────────

echo ""
echo "==> Checking builder '${BUILDER}'..."

if ! colima status 2>/dev/null | grep -q "running"; then
  echo "    Colima is not running — starting with 6 GiB RAM..."
  colima start --memory 6
fi

if ! DOCKER_HOST="${COLIMA_SOCKET}" docker-buildx ls 2>/dev/null | grep -q "^${BUILDER}"; then
  echo "    Builder '${BUILDER}' not found — creating it..."
  DOCKER_HOST="${COLIMA_SOCKET}" docker-buildx create \
    --name "${BUILDER}" \
    --driver docker-container \
    --platform "${PLATFORMS}" \
    --use || true  # ignore "existing instance" errors; bootstrap below will handle it
fi

echo "    Bootstrapping builder '${BUILDER}'..."
DOCKER_HOST="${COLIMA_SOCKET}" docker-buildx inspect --bootstrap "${BUILDER}"

echo "    OK — builder '${BUILDER}' is running."

# ── Build + push: main app (Next.js app + REST API) ──────────────────────────

echo ""
echo "==> Building ${REGISTRY}/${APP_IMAGE}:${VERSION} for ${PLATFORMS}..."
DOCKER_HOST="${COLIMA_SOCKET}" docker-buildx build \
  --builder "${BUILDER}" \
  --platform "${PLATFORMS}" \
  -t "${REGISTRY}/${APP_IMAGE}:${VERSION}" \
  -t "${REGISTRY}/${APP_IMAGE}:latest" \
  --push \
  .
echo "    Pushed ${REGISTRY}/${APP_IMAGE}:${VERSION} and :latest"

# ── Build + push: MCP server ──────────────────────────────────────────────────

echo ""
echo "==> Building ${REGISTRY}/${MCP_IMAGE}:${VERSION} for ${PLATFORMS}..."
DOCKER_HOST="${COLIMA_SOCKET}" docker-buildx build \
  --builder "${BUILDER}" \
  --platform "${PLATFORMS}" \
  -t "${REGISTRY}/${MCP_IMAGE}:${VERSION}" \
  -t "${REGISTRY}/${MCP_IMAGE}:latest" \
  --push \
  -f mcp-server/Dockerfile \
  mcp-server/
echo "    Pushed ${REGISTRY}/${MCP_IMAGE}:${VERSION} and :latest"

# ── Restart local docker compose ─────────────────────────────────────────────

echo ""
echo "==> Pulling updated images for local docker compose..."
unset DOCKER_HOST
VERSION="${VERSION}" docker-compose pull

echo "==> Restarting containers..."
VERSION="${VERSION}" docker-compose up -d

echo ""
echo "==> Running containers:"
VERSION="${VERSION}" docker-compose ps

echo ""
echo "==> Done. ${APP_IMAGE}:${VERSION} and ${MCP_IMAGE}:${VERSION} are live."
