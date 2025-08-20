import { Injectable, Inject, Logger } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class CacheService {
	private readonly logger = new Logger(CacheService.name);
	private readonly defaultTtl: number;

	constructor(
		@Inject(CACHE_MANAGER) private readonly cache: Cache,
		private readonly configService: ConfigService,
	) {
		this.defaultTtl = this.configService.get<number>('CACHE_TTL')!
	}

	async get<T>(key: string): Promise<T | null> {
		try {
			const value = await this.cache.get<T>(key);
			this.logger.debug(`Cache GET: ${key}`, value);
			return value ?? null;
		} catch (error) {
			this.logger.error(`Failed to get cache for key "${key}":`, error);
			return null;
		}
	}

	async set<T>(key: string, value: T): Promise<void> {
		try {
			this.logger.debug(`Cache SET: ${key} (ttl: ${this.defaultTtl} s)`);
			await this.cache.set(key, value, this.defaultTtl);
		} catch (error) {
			this.logger.error(`Failed to set cache for key "${key}":`, error);
		}
	}

	async delete(key: string): Promise<void> {
		try {
			this.logger.debug(`Cache DELETE: ${key}`);
			await this.cache.del(key);
		} catch (error) {
			this.logger.error(`Failed to delete cache for key "${key}":`, error);
		}
	}

	async getMany<T>(keys: ReadonlyArray<string>): Promise<T[]> {
		try {
			const results = await Promise.all(keys.map(key => this.get<T>(key)));
			const filteredResults = results.filter((value): value is NonNullable<typeof value> => value !== null) as T[];
			this.logger.debug(`Cache GET MANY`, filteredResults);
			return filteredResults
		} catch (error) {
			this.logger.error(`Failed to get many keys from cache:`, error);
			return [];
		}
	}

	async setMany<T>(items: Array<{ key: string; value: T}>): Promise<void> {
		try {
			this.logger.debug(`Cache SET MANY: ${items.length} keys`);
			await Promise.all(
				items.map(({ key, value}) => this.set(key, value))
			);
		} catch (error) {
			this.logger.error(`Failed to set many keys in cache:`, error);
		}
	}
}
