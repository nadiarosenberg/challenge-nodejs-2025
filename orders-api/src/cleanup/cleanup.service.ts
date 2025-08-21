import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { ConfigService } from '@nestjs/config';
import { subDays } from 'date-fns';
import { Op } from 'sequelize';
import { OrdersRepository } from '../orders/repositories/orders.repository';
import { OrderWithItemsRepository } from '../orders/repositories/order-with-items.repository';

@Injectable()
export class CleanupService {
  private readonly logger = new Logger(CleanupService.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly ordersRepository: OrdersRepository,
    private readonly orderWithItemsRepository: OrderWithItemsRepository,
  ) {}

  @Cron('0 3 * * *')
  async cleanupDeletedOrders(): Promise<void> {
    const now = new Date();
    const cutoffDate = subDays(now, this.configService.get<number>('ORDER_HARD_DELETE_DAYS')!);
    this.logger.log('Starting cleanup of deleted orders, limit date:', cutoffDate.toISOString());
    try {
      const ordersToDelete = await this.ordersRepository.findAll({
        where: {
          deletedAt: { [Op.lt]: cutoffDate },
        },
        include: ['items'],
      });
      if (ordersToDelete.length === 0) {
        this.logger.log('No orders found for permanent deletion');
        return;
      }
      this.logger.log(`Found ${ordersToDelete.length} orders to permanently delete`);

      let deletedOrders = 0;
      let deletedItems = 0;
      for (const order of ordersToDelete) {
        try {
          const itemCount = order.items?.length ?? 0;
          await this.orderWithItemsRepository.deleteOrder(order.id);
          deletedOrders++;
          deletedItems += itemCount;
          this.logger.debug(`Deleted order ${order.id} with ${itemCount} items`);
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Unknown error';
          const stack = error instanceof Error ? error.stack : '';
          this.logger.error(`Failed to delete order ${order.id}: ${message}`, stack);
        }
      }
      this.logger.log(
        `Cleanup complete: ${deletedOrders} orders and ${deletedItems} items deleted`,
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Error during cleanup process: ${message}`);
      throw new BadRequestException(message);
    }
  }
}
