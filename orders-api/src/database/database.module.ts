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
        autoLoadModels: true,
        synchronize: false,
        logging: false,
        pool: {
          max: config.get<number>('DB_POOL_MAX')!,
          min: config.get<number>('DB_POOL_MIN')!,
          acquire: config.get<number>('DB_POOL_ACQUIRE')!,
          idle: config.get<number>('DB_POOL_IDLE')!,
        },
      }),
    }),
  ],
})
export class DatabaseModule {}
