# Orders API

A RESTful API for managing orders built with NestJS v10, using Sequelize with PostgreSQL and Redis for caching. Environment variables are managed via ConfigModule with centralized validation.

## Requirements
- Node.js 20+
- Docker 24+ and Docker Compose

## Quick Start

### 1. Create Environment File
Create a `.env` file in the root directory with the following variables (values shown are examples, you can replace them with your own):

```bash
# HTTP Configuration
HTTP_PORT=3001

# PostgreSQL Configuration
POSTGRES_HOST=db
POSTGRES_PORT=5432
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=orders_api

# Redis Configuration
REDIS_HOST=redis
REDIS_PORT=6379
REDIS_EXTERNAL_PORT=6379
CACHE_TTL=30000
CACHE_ORDERS_KEY=orders:hash
REDIS_CONNECT_TIMEOUT=10000
REDIS_COMMAND_TIMEOUT=5000

# Health Check Configuration
HEALTHCHECK_INTERVAL=30s
HEALTHCHECK_TIMEOUT=10s
HEALTHCHECK_RETRIES=3

# Application Configuration
ORDER_HARD_DELETE_DAYS=7

# Database Pool Configuration
DB_POOL_MAX=5
DB_POOL_MIN=0
DB_POOL_ACQUIRE=30000
DB_POOL_IDLE=10000
```

### 2. Run with Docker
```bash
docker compose up -d --build
```
- API available at http://localhost:3001/api/v1
- API Documentation available at http://localhost:3001/api/docs

### API Documentation
Once the application is running, you can access the interactive API documentation at:
- **Swagger UI**: http://localhost:3001/api/docs 

### Run migrations (from host)
Migrations run automatically when the application starts, but you can also run them manually:

```bash
docker compose exec api npm run migrate
```

**Note**: Migrations use `src/config/sequelize.config.js` (JavaScript) with ConfigService integration for consistency. The CLI requires JavaScript format, while the application runtime uses `src/config/database.config.ts` (TypeScript) via ConfigModule.

### Run tests
```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:cov
```

## API Endpoints

### Versioning
All API endpoints are versioned using the `/api/v1/` prefix. This ensures backward compatibility and allows for future API changes without breaking existing integrations.

**Base URL**: `http://localhost:3001/api/v1`

### Orders
- `POST /api/v1/orders` - Create a new order
- `GET /api/v1/orders` - List all non-delivered orders
- `GET /api/v1/orders/:id` - Get order by ID (includes order items)
- `PATCH /api/v1/orders/:id/advance` - Advance order status

## Environment Variables

**IMPORTANT**: All environment variables are **required**. There are no default values in `docker-compose.yml` for security. See the Quick Start section above for the complete `.env` file template.

## Architecture

### Core Components
- **Controllers**: Handle HTTP requests and responses
- **Services**: Business logic and orchestration
- **Repositories**: Data access layer with generic base repository
- **DTOs**: Data transfer objects with validation
- **Entities**: Sequelize models with relationships

### Configuration Management
- **ConfigModule**: Centralized configuration using `@nestjs/config`
- **Environment Validation**: Strict validation of required environment variables
- **Database Config**: 
  - `database.config.ts` - For NestJS runtime (ConfigModule)
  - `sequelize.config.js` - For Sequelize CLI (migrations) with ConfigService integration
- **Modular Config**: Organized configuration files in `src/config/` directory

### Caching Strategy
- **Redis Hash Pattern**: `orders:hash:ids` stores order IDs list
- **Individual Caching**: `orders:hash:${id}` stores individual orders
- **Cache Invalidation**: Automatic invalidation on order status changes
- **TTL Configuration**: Configurable via `CACHE_TTL` environment variable

### Database Design
- **Orders Table**: Main order information with status tracking
- **Order Items Table**: Individual items within orders
- **Soft Delete**: Uses `deletedAt` column for logical deletion
- **Relationships**: One-to-many between orders and order items

### Automated Cleanup
- **Cron Job**: Daily execution at 3 AM UTC (hardcoded schedule)
- **Hard Delete**: Permanently removes orders older than `ORDER_HARD_DELETE_DAYS`
- **Transactional**: Ensures data consistency during cleanup
- **Error Handling**: Graceful error handling with logging

### Project Structure
```
src/
├── cache/           # Redis caching configuration
├── cleanup/         # Automated cleanup service
├── config/          # Configuration files
│   ├── database.config.ts    # Database config for NestJS ConfigModule
│   ├── env.validation.ts     # Environment validation
├── database/        # Database configuration and base repository
├── orders/          # Order management module
│   ├── dto/         # Data transfer objects
│   ├── entities/    # Sequelize models
│   ├── repositories/# Data access layer
│   ├── orders.controller.ts
│   └── orders.service.ts
└── main.ts          # Application entry point
```

### Testing
- **Unit Tests**: Jest-based tests with mocks
- **Coverage**: 100% coverage for core services
- **Test Structure**: Separate test files for controllers and services
- **Mock Strategy**: Comprehensive mocking of dependencies