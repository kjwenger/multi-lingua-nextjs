#!/bin/bash
# Build and push multi-lingua Docker image
# Version is automatically read from package.json

set -e

# Read version from package.json
VERSION=$(node -p "require('./package.json').version")
REGISTRY="registry.gertrun.synology.me"
IMAGE_NAME="multi-lingua"

echo "Building ${IMAGE_NAME} version ${VERSION}..."

# Check if already logged in to Docker Hub, if not, login using .env.local
if ! docker info 2>/dev/null | grep -q "Username"; then
    echo "Not logged in to Docker Hub, attempting login..."
    if [ -f .env.local ]; then
        source .env.local
        if [ -n "${DOCKER_USERNAME}" ] && [ -n "${DOCKER_PASSWORD}" ]; then
            echo "${DOCKER_PASSWORD}" | docker login -u "${DOCKER_USERNAME}" --password-stdin
        else
            echo "ERROR: DOCKER_USERNAME and DOCKER_PASSWORD not set in .env.local"
            echo "Please run 'docker login' manually or add credentials to .env.local"
            exit 1
        fi
    else
        echo "ERROR: Not logged in and .env.local not found"
        echo "Please run 'docker login' manually or create .env.local with DOCKER_USERNAME and DOCKER_PASSWORD"
        exit 1
    fi
else
    echo "Already logged in to Docker Hub"
fi

docker compose down

VERSION=${VERSION} docker compose build multi-lingua
if [ $? -ne 0 ]; then
    echo "ERROR: Build failed!"
    exit 1
fi

docker tag ${REGISTRY}/${IMAGE_NAME}:${VERSION} ${REGISTRY}/${IMAGE_NAME}:latest
docker push ${REGISTRY}/${IMAGE_NAME}:${VERSION}
docker push ${REGISTRY}/${IMAGE_NAME}:latest

echo "Successfully pushed ${REGISTRY}/${IMAGE_NAME}:${VERSION} and :latest"

docker compose up -d