import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';

async function bootstrap() {
	const app = await NestFactory.create(AppModule);
	const configService = app.get(ConfigService);
	app.setGlobalPrefix('api');
	app.useGlobalPipes(
		new ValidationPipe({ whitelist: true, transform: true, forbidNonWhitelisted: true }),
	);
	const port = configService.get<number>('HTTP_PORT')!;
	await app.listen(port);
}

bootstrap();