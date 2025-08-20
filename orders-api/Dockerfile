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

EXPOSE 3000

# Run Nest in watch mode (development)
CMD ["npm", "run", "start:dev"]
