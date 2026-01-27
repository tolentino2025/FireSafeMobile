#!/bin/bash

cleanup() {
    echo "Shutting down..."
    kill $BACKEND_PID 2>/dev/null
    exit 0
}

trap cleanup SIGINT SIGTERM

echo "Starting FireSafe ITM Backend on port 3001..."
cd /home/runner/workspace
node server/index.js &
BACKEND_PID=$!
echo "Backend started with PID: $BACKEND_PID"

sleep 3

echo "Checking backend health..."
curl -s http://localhost:3001/api/health && echo " - Backend OK" || echo " - Backend check failed"

echo ""
echo "Starting Expo..."
EXPO_PACKAGER_PROXY_URL=https://$REPLIT_DEV_DOMAIN REACT_NATIVE_PACKAGER_HOSTNAME=$REPLIT_DEV_DOMAIN npx expo start

cleanup
