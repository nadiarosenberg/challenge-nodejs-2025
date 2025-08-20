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
POSTGRES_HOST=db
POSTGRES_PORT=5432
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=orders_api
```
