import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap(): Promise<void> {
	const app = await NestFactory.create(AppModule);
	const configService = app.get(ConfigService);
	app.setGlobalPrefix('api');
	app.useGlobalPipes(
		new ValidationPipe({ whitelist: true, transform: true, forbidNonWhitelisted: true }),
	);
	const port = configService.get<number>('HTTP_PORT') || 3001;
	await app.listen(port);
}

bootstrap();