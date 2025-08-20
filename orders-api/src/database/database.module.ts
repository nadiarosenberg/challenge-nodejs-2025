import { Global, Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Global()
@Module({
	imports: [
		SequelizeModule.forRootAsync({
			imports: [ConfigModule],
			inject: [ConfigService],
			useFactory: (config: ConfigService) => ({
				dialect: 'postgres',
				host: config.get<string>('POSTGRES_HOST'),
				port: Number(config.get<number>('POSTGRES_PORT')),
				username: config.get<string>('POSTGRES_USER'),
				password: config.get<string>('POSTGRES_PASSWORD'),
				database: config.get<string>('POSTGRES_DB'),
				autoLoadModels: false,
				synchronize: false,
				logging: false,
			}),
		}),
	],
})
export class DatabaseModule {} 