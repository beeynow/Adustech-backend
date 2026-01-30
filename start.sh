#!/bin/bash
set -e

echo "🚀 Starting ADUSTECH Backend..."

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
  echo "❌ ERROR: DATABASE_URL is not set!"
  exit 1
fi

echo "✅ DATABASE_URL is configured"

# Run database migrations (with retry logic)
echo "📦 Running database migrations..."
MAX_RETRIES=3
RETRY_COUNT=0

until npx prisma db push --skip-generate || [ $RETRY_COUNT -eq $MAX_RETRIES ]; do
  RETRY_COUNT=$((RETRY_COUNT+1))
  echo "⏳ Migration attempt $RETRY_COUNT failed, retrying in 5 seconds..."
  sleep 5
done

if [ $RETRY_COUNT -eq $MAX_RETRIES ]; then
  echo "⚠️  Migrations failed after $MAX_RETRIES attempts. Starting server anyway..."
else
  echo "✅ Migrations completed successfully"
fi

# Start the application
echo "🚀 Starting server..."
exec node app.js
