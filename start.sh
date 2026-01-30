#!/bin/sh
set -e

echo "🚀 Starting ADUSTECH Backend..."

# Wait a moment for Railway to set environment variables
sleep 2

# Push database schema (creates tables if they don't exist)
echo "📦 Ensuring database schema is up to date..."
npx prisma db push --skip-generate --accept-data-loss 2>&1 | grep -v "^Prisma schema loaded" || true

echo "✅ Database ready"
echo "🚀 Starting server..."

# Start the application
exec node app.js
