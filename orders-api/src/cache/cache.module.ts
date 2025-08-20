import { Module, Logger } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { ConfigModule, ConfigService } from '@nestjs/config';
import * as redisStore from 'cache-manager-redis-store';
import { CacheService } from './cache.service';

@Module({
	imports: [
		ConfigModule,
		CacheModule.registerAsync({
			isGlobal: true,
			imports: [ConfigModule],
			inject: [ConfigService],
			useFactory: async (config: ConfigService) => {
				const logger = new Logger('CacheModule');
				
				const redisHost = config.get<string>('REDIS_HOST');
				const redisPort = config.get<number>('REDIS_PORT');
				const cacheTtl = config.get<number>('CACHE_TTL');
				const redisConnectTimeout = config.get<number>('REDIS_CONNECT_TIMEOUT');
				const redisCommandTimeout = config.get<number>('REDIS_COMMAND_TIMEOUT');
				
				logger.log(`Redis configuration: ${redisHost}:${redisPort}, TTL: ${cacheTtl}ms`);
				
				return {
					store: redisStore,
					host: redisHost,
					port: redisPort,
					ttl: cacheTtl, 
					connectTimeout: redisConnectTimeout,
					commandTimeout: redisCommandTimeout,
				};
			},
		}),
	],
	providers: [CacheService],
	exports: [CacheModule, CacheService],
})
export class AppCacheModule {}
