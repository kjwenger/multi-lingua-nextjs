#!/bin/bash
# Cross-build (linux/arm64) multi-lingua and multi-lingua-mcp for the Raspberry Pi 4
# "JoNAS", push them to its local registry, and optionally redeploy over SSH.
#
# Usage:
#   ./docker.JoNAS.sh            # build + push
#   ./docker.JoNAS.sh --deploy   # build + push + bump VERSION in JoNAS .env + recreate containers
#
# Prerequisites on this machine: docker-buildx, QEMU arm64 binfmt
#   (docker run --privileged --rm tonistiigi/binfmt --install arm64), SSH access to JoNAS.
# Version is read from package.json.

set -euo pipefail

VERSION=$(node -p "require('./package.json').version")
HOST="${JONAS_HOST:-JoNAS.local}"
REGISTRY="${JONAS_REGISTRY:-${HOST}:5000}"   # pushed over plain HTTP
PLATFORM="${JONAS_PLATFORM:-linux/arm64}"
BUILDER="multiplatform"
BASE_PATH="/multi-lingua"                    # must match docker-compose.JoNAS.yaml build args
REMOTE_DIR="/com.github/kjwenger/multi-lingua-nextjs"
COMPOSE="docker compose -f docker-compose.yml -f docker-compose.JoNAS.yaml"

# Create the builder if missing (allows pushing to the HTTP registry)
if ! docker buildx inspect "${BUILDER}" >/dev/null 2>&1; then
    CONF="${HOME}/.config/buildkit/buildkitd.toml"
    mkdir -p "$(dirname "${CONF}")"
    cat > "${CONF}" <<EOF
[registry."${REGISTRY}"]
  http = true
  insecure = true
EOF
    docker buildx create --name "${BUILDER}" --driver docker-container \
        --driver-opt network=host --buildkitd-config "${CONF}" \
        --platform linux/amd64,linux/arm64 --use
fi

echo "Building multi-lingua ${VERSION} for ${PLATFORM}..."
docker buildx build --builder "${BUILDER}" --platform "${PLATFORM}" \
    --build-arg VERSION="${VERSION}" \
    --build-arg NEXT_BASE_PATH="${BASE_PATH}" \
    --build-arg NEXT_PUBLIC_BASE_PATH="${BASE_PATH}" \
    -t "${REGISTRY}/multi-lingua:${VERSION}" -t "${REGISTRY}/multi-lingua:latest" \
    --push .

echo "Building multi-lingua-mcp ${VERSION} for ${PLATFORM}..."
docker buildx build --builder "${BUILDER}" --platform "${PLATFORM}" \
    -t "${REGISTRY}/multi-lingua-mcp:${VERSION}" -t "${REGISTRY}/multi-lingua-mcp:latest" \
    --push -f mcp-server/Dockerfile mcp-server/

echo "Pushed ${REGISTRY}/multi-lingua{,-mcp}:${VERSION} and :latest"

if [ "${1:-}" = "--deploy" ]; then
    echo "Deploying ${VERSION} on ${HOST}..."
    ssh "${HOST}" "cd ${REMOTE_DIR} \
        && sed -i 's/^VERSION=.*/VERSION=${VERSION}/' .env \
        && ${COMPOSE} pull multi-lingua multi-lingua-mcp \
        && ${COMPOSE} up -d --no-deps multi-lingua multi-lingua-mcp"
    echo "Deployed. Containers:"
    ssh "${HOST}" "docker ps --format '{{.Names}}\t{{.Image}}\t{{.Status}}' | grep multi-lingua"
fi
