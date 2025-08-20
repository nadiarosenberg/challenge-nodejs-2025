import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './database/database.module';
import { OrdersModule } from './orders/orders.module';
import { AppCacheModule } from './cache/cache.module';
import { validate } from './config/env.validation';

@Module({
	imports: [
		ConfigModule.forRoot({ 
			isGlobal: true,
			validate,
		}), 
		AppCacheModule,
		DatabaseModule, 
		OrdersModule
	],
})
export class AppModule {} 