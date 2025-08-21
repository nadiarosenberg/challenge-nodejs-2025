import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { CleanupService } from './cleanup.service';
import { OrdersRepository } from '../orders/repositories/orders.repository';
import { OrderItemsRepository } from '../orders/repositories/order-items.repository';
import { OrderWithItemsRepository } from '../orders/repositories/order-with-items.repository';

@Module({
  imports: [ScheduleModule.forRoot()],
  providers: [CleanupService, OrdersRepository, OrderItemsRepository, OrderWithItemsRepository],
  exports: [CleanupService],
})
export class CleanupModule {}
