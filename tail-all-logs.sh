#!/bin/bash

# Tail logs for both multi-lingua containers permanently
# Shows logs from both multi-lingua and libretranslate services

COMPOSE_DIR="/Volumes/RayCue2TB/com.github/kjwenger/NaturalStupidity/MultiLingua/Copilot.AI/multi-lingua"

echo "Starting permanent log tail for all multi-lingua services..."
echo "Press Ctrl+C to stop"
echo ""

cd "$COMPOSE_DIR"

while true; do
    echo "$(date '+%Y-%m-%d %H:%M:%S') - Connecting to docker-compose logs..."
    
    # Tail logs for all services - this will block until stopped or user interrupts
    docker-compose logs -f --tail=50 2>&1
    
    EXIT_CODE=$?
    
    if [ $EXIT_CODE -eq 130 ]; then
        # User pressed Ctrl+C
        echo ""
        echo "Log tail stopped by user"
        exit 0
    fi
    
    echo "$(date '+%Y-%m-%d %H:%M:%S') - Connection lost (exit code: $EXIT_CODE)"
    echo "Waiting 5 seconds before reconnecting..."
    sleep 5
done
