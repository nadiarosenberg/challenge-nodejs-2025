## Multi-stage Dockerfile to run NestJS in dev mode (main = dev)

# Dependencies stage
FROM node:20-alpine AS deps
WORKDIR /app

COPY package*.json ./
RUN npm ci

# Runtime stage
FROM node:20-alpine AS runner
WORKDIR /app

# Copy dependencies and source code
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/package*.json ./
COPY . .

EXPOSE 3001

# Install netcat for health check
RUN apk add --no-cache netcat-openbsd

# Create startup script
RUN echo '#!/bin/sh' > /app/start.sh && \
    echo 'set -e' >> /app/start.sh && \
    echo 'echo "=== Starting Orders API ==="' >> /app/start.sh && \
    echo 'echo "Waiting for database to be ready..."' >> /app/start.sh && \
    echo 'while ! nc -z $POSTGRES_HOST $POSTGRES_PORT; do' >> /app/start.sh && \
    echo '  echo "Database not ready, waiting..."' >> /app/start.sh && \
    echo '  sleep 2' >> /app/start.sh && \
    echo 'done' >> /app/start.sh && \
    echo 'echo "Database is ready!"' >> /app/start.sh && \
    echo 'echo "Running database migrations..."' >> /app/start.sh && \
    echo 'npx ts-node -r dotenv/config ./node_modules/.bin/sequelize db:migrate || { echo "Migration failed!"; exit 1; }' >> /app/start.sh && \
    echo 'echo "Migrations completed successfully!"' >> /app/start.sh && \
    echo 'echo "Starting NestJS application..."' >> /app/start.sh && \
    echo 'npm run start:dev' >> /app/start.sh && \
    chmod +x /app/start.sh

# Run startup script
CMD ["/app/start.sh"]
