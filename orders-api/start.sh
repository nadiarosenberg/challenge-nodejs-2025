#!/bin/sh

echo "🚀 Starting Orders API..."

# Wait for database to be ready
echo "⏳ Waiting for database to be ready..."
until nc -z db 5432; do
  echo "Database is not ready yet. Waiting..."
  sleep 2
done
echo "✅ Database is ready!"

# Wait for Redis to be ready
echo "⏳ Waiting for Redis to be ready..."
until nc -z redis 6379; do
  echo "Redis is not ready yet. Waiting..."
  sleep 2
done
echo "✅ Redis is ready!"

# Run migrations
echo "🔄 Running database migrations..."
npm run migrate
if [ $? -eq 0 ]; then
  echo "✅ Migrations completed successfully!"
else
  echo "❌ Migration failed!"
  exit 1
fi

# Start the application
echo "🚀 Starting the application..."
echo "⏰ Cleanup cron job configured: daily at 3 AM UTC"
npm run start:dev
