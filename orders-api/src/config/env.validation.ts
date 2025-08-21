import { plainToClass } from 'class-transformer';
import { IsString, IsNumber, validateSync } from 'class-validator';
import { BadRequestException } from '@nestjs/common';

class EnvironmentVariables {
  @IsNumber()
  HTTP_PORT!: number;

  @IsString()
  POSTGRES_HOST!: string;

  @IsNumber()
  POSTGRES_PORT!: number;

  @IsString()
  POSTGRES_USER!: string;

  @IsString()
  POSTGRES_PASSWORD!: string;

  @IsString()
  POSTGRES_DB!: string;

  @IsString()
  REDIS_HOST!: string;

  @IsNumber()
  REDIS_PORT!: number;

  @IsNumber()
  CACHE_TTL!: number;

  @IsNumber()
  REDIS_CONNECT_TIMEOUT!: number;

  @IsNumber()
  REDIS_COMMAND_TIMEOUT!: number;

  @IsNumber()
  REDIS_EXTERNAL_PORT!: number;

  @IsString()
  HEALTHCHECK_INTERVAL!: string;

  @IsString()
  HEALTHCHECK_TIMEOUT!: string;

  @IsNumber()
  HEALTHCHECK_RETRIES!: number;

  @IsNumber()
  ORDER_HARD_DELETE_DAYS!: number;

  @IsString()
  CACHE_ORDERS_KEY!: string;

  @IsNumber()
  DB_POOL_MAX!: number;

  @IsNumber()
  DB_POOL_MIN!: number;

  @IsNumber()
  DB_POOL_ACQUIRE!: number;

  @IsNumber()
  DB_POOL_IDLE!: number;
}

export function validate(config: Record<string, unknown>) {
  const validatedConfig = plainToClass(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });
  const errors = validateSync(validatedConfig, { skipMissingProperties: false })
  if (errors.length > 0) throw new BadRequestException(errors.toString());
  return validatedConfig;
}
