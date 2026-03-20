#!/bin/bash
# Test PWA with Docker Compose

set -e

echo "🚀 Building and starting Multi-Lingua PWA with Docker Compose..."
echo ""

# Build and start services
docker-compose -f docker-compose-test.yml up --build -d

echo ""
echo "✅ Services started!"
echo ""
echo "📦 Containers:"
docker-compose -f docker-compose-test.yml ps
echo ""
echo "🌐 Access points:"
echo "   - Multi-Lingua PWA: http://localhost:3456"
echo "   - LibreTranslate:   http://localhost:5432"
echo ""
echo "📱 To test PWA installation:"
echo "   1. Open http://localhost:3456 in Chrome/Edge"
echo "   2. Look for the install icon in the address bar"
echo "   3. Click to install the PWA"
echo ""
echo "📋 View logs:"
echo "   docker-compose -f docker-compose-test.yml logs -f"
echo ""
echo "🛑 Stop services:"
echo "   docker-compose -f docker-compose-test.yml down"
