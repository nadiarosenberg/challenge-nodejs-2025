# orders-api

NestJS v10 project using Sequelize with PostgreSQL. Environment variables are managed via ConfigModule.

## Requirements
- Node.js 20+
- Docker 24+ and Docker Compose

## Run locally
```bash
npm install
npm run build
npm run start:dev
```
App will listen on http://localhost:3001/api 

## Run with Docker
```bash
docker compose up -d --build
```
- API available at http://localhost:3001/api
- Database accessible at localhost:5432 using the credentials in `.env`

### Run migrations (from host)
```bash
docker compose exec api npm run migrate
```

## Environment variables (.env example)
```
HTTP_PORT=

#database
POSTGRES_HOST=
POSTGRES_PORT=
POSTGRES_USER=
POSTGRES_PASSWORD=
POSTGRES_DB=

#redis
REDIS_HOST=
REDIS_PORT=
REDIS_EXTERNAL_PORT=

# Cache
CACHE_TTL=30000
REDIS_CONNECT_TIMEOUT=
REDIS_COMMAND_TIMEOUT=

#redis timeouts
REDIS_CONNECT_TIMEOUT=
REDIS_COMMAND_TIMEOUT=

#healthcheck
HEALTHCHECK_INTERVAL=
HEALTHCHECK_TIMEOUT=
HEALTHCHECK_RETRIES=
```
