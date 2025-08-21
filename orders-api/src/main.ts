import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  
  try {
    const app = await NestFactory.create(AppModule);
    const configService = app.get(ConfigService);
    
    app.setGlobalPrefix('api');
    app.useGlobalPipes(
      new ValidationPipe({ 
        whitelist: true, 
        transform: true, 
        forbidNonWhitelisted: true 
      }),
    );

    // Swagger configuration
    const config = new DocumentBuilder()
      .setTitle('Orders API')
      .setDescription('A RESTful API for managing orders')
      .setVersion('1.0')
      .addTag('orders', 'Order management endpoints')
      .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document);

    const port = configService.get<number>('HTTP_PORT')!;
    await app.listen(port);
    
    logger.log(`🚀 Application is running on: http://localhost:${port}`);
    logger.log(`📚 Swagger documentation available at: http://localhost:${port}/api/docs`);
  } catch (error) {
    logger.error('Failed to start application:', error);
    throw error;
  }
}

bootstrap();
