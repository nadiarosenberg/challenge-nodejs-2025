import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { Order } from './entities/order.model';
import { OrderItem } from './entities/order-item.model';
import { OrdersRepository } from './repositories/orders.repository';
import { OrderItemsRepository } from './repositories/order-items.repository';
import { OrderWithItemsRepository } from './repositories/order-with-items.repository';
import { AppCacheModule } from '../cache/cache.module';

@Module({
  imports: [SequelizeModule.forFeature([Order, OrderItem]), AppCacheModule],
  controllers: [OrdersController],
  providers: [OrdersService, OrdersRepository, OrderItemsRepository, OrderWithItemsRepository],
  exports: [OrdersRepository, OrderItemsRepository],
})
export class OrdersModule {}
