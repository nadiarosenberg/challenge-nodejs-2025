import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { CleanupService } from './cleanup.service';
import { OrdersModule } from '../orders/orders.module';

@Module({
  imports: [ScheduleModule.forRoot(), OrdersModule],
  providers: [CleanupService],
  exports: [CleanupService],
})
export class CleanupModule {}
