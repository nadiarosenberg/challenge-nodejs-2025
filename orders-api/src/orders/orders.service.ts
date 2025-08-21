import { Injectable } from '@nestjs/common';
import { determineException } from '../common/exception-handler';
import { Op } from 'sequelize';
import { CreateOrderDto } from './dto/create-order.dto';
import { Order } from './entities/order.model';
import { OrderItem } from './entities/order-item.model';
import { OrderStatus } from './entities/order.types';
import { OrderWithItemsRepository } from './repositories/order-with-items.repository';
import { OrdersRepository } from './repositories/orders.repository';
import { CacheService } from '../cache/cache.service';

@Injectable()
export class OrdersService {
  constructor(
    private readonly orderWithItemsRepository: OrderWithItemsRepository,
    private readonly ordersRepository: OrdersRepository,
    private readonly cacheService: CacheService,
  ) {}

  async createOrder(input: CreateOrderDto): Promise<Order> {
    try{
      const body = { ...input, status: OrderStatus.INITIATED };
      return await this.orderWithItemsRepository.createOrder(body);
    }catch(error){
      throw determineException(error, 'OrdersService.createOrder', 'Failed to create order');
    }
  }

  async findOrder(id: string): Promise<Order> {
    try {
      const order = await this.ordersRepository.findOne({
        where: { id, deletedAt: null },
        include: [{ model: OrderItem }],
      });
      return order;
    } catch (error) {
      throw determineException(error, 'OrdersService.findOrder', 'Failed to find order');
    }
  }

  async listOrders() {
    try{
      const hashKey = process.env.CACHE_ORDERS_KEY!;
      const cachedIds = await this.cacheService.get<string[]>(`${hashKey}:ids`);
      if (cachedIds && cachedIds.length > 0) {
        const cachedOrders = await this.cacheService.getMany<Order>(
          cachedIds.map((id) => `${hashKey}:${id}`),
        );
        if (cachedOrders.length > 0) return cachedOrders;
      }
  
      const safeFilter = {
        status: { [Op.ne]: OrderStatus.DELIVERED },
        deletedAt: null,
      };
      const result = await this.ordersRepository.findAll({
        where: safeFilter,
        order: [
          ['createdAt', 'DESC'],
          ['id', 'ASC'],
        ],
      });
  
      const orderIds = result.map((order) => order.id);
      await this.cacheService.set(`${hashKey}:ids`, orderIds);
      const cacheEntries = result.map((order) => ({
        key: `${hashKey}:${order.id}`,
        value: order,
      }));
      await this.cacheService.setMany(cacheEntries);
      return result;
    }catch(error){
      throw determineException(error, 'OrdersService.listOrders', 'Failed to find orders');
    }
  }

  async advanceOrder(id: string): Promise<void> {
    try {
      const order = await this.ordersRepository.findOne({
        where: { id, deletedAt: null },
      });
      await this.orderWithItemsRepository.updateOrderStatus(order);
      if (order.status === OrderStatus.SENT) {
        const hashKey = process.env.CACHE_ORDERS_KEY!;
        await this.cacheService.delete(`${hashKey}:${id}`);
      }
    } catch (error) {
      throw determineException(error, 'OrdersService.advanceOrder', 'Failed to advance order');
    }
  }
}
