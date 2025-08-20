import { Injectable } from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import type { Order } from './entities/order.model';
import { OrderWithItemsRepository } from './repositories/order-with-items.repository';

@Injectable()
export class OrdersService {
	constructor(
		private readonly orderWithItemsRepository: OrderWithItemsRepository,
	) {}

	async createOrder(input: CreateOrderDto): Promise<Order> {
		return await this.orderWithItemsRepository.createOrder(input);
	}
}

 