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

EXPOSE ${HTTP_PORT:-3001}

# Install netcat for health check
RUN apk add --no-cache netcat-openbsd

# Default command (can be overridden by docker-compose)
CMD ["npm", "run", "start:dev"]
