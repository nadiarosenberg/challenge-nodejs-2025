import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectConnection } from '@nestjs/sequelize';
import { Sequelize, Transaction } from 'sequelize';
import { CreateOrderDto } from '../dto/create-order.dto';
import { OrdersRepository } from './orders.repository';
import { OrderItemsRepository } from './order-items.repository';
import { OrderStatus } from '../entities/order.types';
import type { Order } from '../entities/order.model';
import { OrderItem } from '../entities/order-item.model';

@Injectable()
export class OrderWithItemsRepository {
  constructor(
    @InjectConnection() private readonly sequelize: Sequelize,
    private readonly ordersRepository: OrdersRepository,
    private readonly orderItemsRepository: OrderItemsRepository,
  ) {}

  async createOrder(input: CreateOrderDto): Promise<Order> {
    let tx: Transaction | undefined;
    try {
      tx = await this.sequelize.transaction();
      const order = await this.ordersRepository.createOne(
        {
          clientName: input.clientName,
          status: OrderStatus.INITIATED,
        } as any,
        tx,
      );
      const items = input.items.map((i) => ({ ...i, orderId: order.id}));
      await this.orderItemsRepository.createMany(
        items,
        tx,
      );
      const fullOrder = await this.ordersRepository.findOne(
        { where: { id: order.id }, include: [{ model: OrderItem }] },
        tx,
      );
      await tx.commit();
      return fullOrder;
    } catch (error) {
      if (tx) await tx.rollback();
      throw new InternalServerErrorException('Failed to create order');
    }
  }
}


