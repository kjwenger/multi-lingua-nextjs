#!/bin/bash
# Test PWA on Android Emulator

echo "🤖 Testing Multi-Lingua PWA on Android Emulator"
echo ""

# Get host IP
HOST_IP=$(hostname -I | awk '{print $1}')
echo "📡 Host IP: $HOST_IP"
echo ""

# Check if dev server is running
if ! curl -s http://localhost:3456 > /dev/null 2>&1; then
  echo "⚠️  Dev server not running. Starting it..."
  cd /media/kjwenger/D/com.github/kjwenger/NaturalStupidity/MultiLingua/Copilot.AI/multi-lingua
  npm run dev > /tmp/multi-lingua-dev.log 2>&1 &
  echo "Waiting for server to start..."
  sleep 5
fi

echo "✅ Dev server is running"
echo ""
echo "📱 To access PWA on Android Emulator:"
echo ""
echo "   1. Open Chrome browser on the emulator"
echo ""
echo "   2. Navigate to one of these URLs:"
echo "      • http://$HOST_IP:3456"
echo "      • http://10.0.2.2:3456  (special emulator alias)"
echo ""
echo "   3. The app should load - you'll see the landing page"
echo ""
echo "   4. To install as PWA:"
echo "      • Tap the 3-dot menu in Chrome"
echo "      • Select 'Add to Home screen'"
echo "      • Confirm the installation"
echo ""
echo "   5. The PWA icon will appear on your home screen!"
echo ""
echo "🔍 Troubleshooting:"
echo "   • If 10.0.2.2 doesn't work, try: $HOST_IP"
echo "   • Make sure firewall allows port 3456"
echo "   • Check server logs: tail -f /tmp/multi-lingua-dev.log"
echo ""
echo "📋 Test checklist:"
echo "   □ App loads in browser"
echo "   □ Login/Register works"
echo "   □ Mobile layout (card view) appears"
echo "   □ Can install as PWA"
echo "   □ PWA icon appears on home screen"
echo "   □ PWA launches standalone (no browser UI)"
echo "   □ Offline mode works after first load"
echo ""
