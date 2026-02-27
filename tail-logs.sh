#!/bin/bash

# Tail logs for multi-lingua docker container permanently
# This script will automatically reconnect if the container restarts

CONTAINER_NAME="multi-lingua"
COMPOSE_DIR="/Volumes/RayCue2TB/com.github/kjwenger/NaturalStupidity/MultiLingua/Copilot.AI/multi-lingua"

echo "Starting permanent log tail for $CONTAINER_NAME..."
echo "Press Ctrl+C to stop"
echo ""

while true; do
    echo "$(date '+%Y-%m-%d %H:%M:%S') - Connecting to $CONTAINER_NAME logs..."
    
    # Tail logs - this will block until container stops or user interrupts
    docker logs -f "$CONTAINER_NAME" 2>&1
    
    # If we get here, the logs command exited
    EXIT_CODE=$?
    
    if [ $EXIT_CODE -eq 130 ]; then
        # User pressed Ctrl+C
        echo ""
        echo "Log tail stopped by user"
        exit 0
    fi
    
    # Container might have stopped or restarted
    echo "$(date '+%Y-%m-%d %H:%M:%S') - Connection lost (exit code: $EXIT_CODE)"
    echo "Waiting 5 seconds before reconnecting..."
    sleep 5
done
