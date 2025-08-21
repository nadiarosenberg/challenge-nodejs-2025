## Multi-stage Dockerfile to run NestJS in dev mode (main = dev)

# Dependencies stage
FROM node:20-alpine AS deps
WORKDIR /app

# Install git for npm dependencies
RUN apk add --no-cache git

COPY package*.json ./
RUN npm ci --legacy-peer-deps

# Runtime stage
FROM node:20-alpine AS runner
WORKDIR /app

# Copy dependencies and source code
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/package*.json ./
COPY . .

EXPOSE ${HTTP_PORT:-3001}

# Install netcat for health check and git for npm
RUN apk add --no-cache netcat-openbsd git

# Create .env file with default values if it doesn't exist
RUN echo "HTTP_PORT=3001" > .env && \
    echo "POSTGRES_HOST=db" >> .env && \
    echo "POSTGRES_PORT=5432" >> .env && \
    echo "POSTGRES_USER=postgres" >> .env && \
    echo "POSTGRES_PASSWORD=password" >> .env && \
    echo "POSTGRES_DB=orders_db" >> .env && \
    echo "REDIS_HOST=redis" >> .env && \
    echo "REDIS_PORT=6379" >> .env && \
    echo "REDIS_EXTERNAL_PORT=6379" >> .env && \
    echo "CACHE_TTL=3600" >> .env && \
    echo "REDIS_CONNECT_TIMEOUT=10000" >> .env && \
    echo "REDIS_COMMAND_TIMEOUT=5000" >> .env && \
    echo "HEALTHCHECK_INTERVAL=30s" >> .env && \
    echo "HEALTHCHECK_TIMEOUT=10s" >> .env && \
    echo "HEALTHCHECK_RETRIES=3" >> .env && \
    echo "ORDER_HARD_DELETE_DAYS=30" >> .env

# Make start script executable
RUN chmod +x start.sh

# Default command (can be overridden by docker-compose)
CMD ["npm", "run", "start:dev"]
