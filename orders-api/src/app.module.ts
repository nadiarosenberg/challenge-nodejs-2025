import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './database/database.module';
import { OrdersModule } from './orders/orders.module';
import { AppCacheModule } from './cache/cache.module';
import { CleanupModule } from './cleanup/cleanup.module';
import { validate } from './config/env.validation';
import databaseConfig from './config/database.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate,
      load: [databaseConfig],
    }),
    AppCacheModule,
    DatabaseModule,
    OrdersModule,
    CleanupModule,
  ],
})
export class AppModule {}
