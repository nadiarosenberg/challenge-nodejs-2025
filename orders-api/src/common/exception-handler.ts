import { 
  InternalServerErrorException, 
  BadRequestException,
  HttpException
} from '@nestjs/common';

export function determineException(
  error: unknown, 
  context: string, 
  defaultMessage: string = 'An unexpected error occurred'
): HttpException {
  if (error instanceof HttpException) {
    return error;
  }
  if (isSequelizeError(error)) {
    return handleSequelizeException(error, context);
  }
  if (isValidationError(error)) {
    return new BadRequestException('Validation failed');
  }
  return new InternalServerErrorException(defaultMessage);
}

function handleSequelizeException(error: any, context: string): HttpException {
  const errorName = error.name || '';

  switch (errorName) {
    case 'SequelizeValidationError':
    case 'SequelizeUniqueConstraintError':
      return new BadRequestException('Data validation failed');
    case 'SequelizeForeignKeyConstraintError':
      return new BadRequestException('Referenced resource not found');
    case 'SequelizeConnectionError':
    case 'SequelizeConnectionRefusedError':
      return new InternalServerErrorException('Database connection failed');
    case 'SequelizeTimeoutError':
      return new InternalServerErrorException('Database operation timed out');
    default:
      return new InternalServerErrorException('Database operation failed');
  }
}

function isSequelizeError(error: any): boolean {
  return error && (
    error.name?.startsWith('Sequelize') ||
    error.constructor?.name?.startsWith('Sequelize')
  );
}

function isValidationError(error: any): boolean {
  return error && (
    error.name === 'ValidationError' ||
    error.constructor?.name === 'ValidationError' ||
    Array.isArray(error.errors)
  );
}
