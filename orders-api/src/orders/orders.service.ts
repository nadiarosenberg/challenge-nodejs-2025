import { Injectable } from '@nestjs/common';
import { Op } from 'sequelize';
import { CreateOrderDto } from './dto/create-order.dto';
import { ListOrdersQueryDto } from './dto/list-orders.query.dto';
import { Order } from './entities/order.model';
import { OrderItem } from './entities/order-item.model';
import { OrderStatus } from './entities/order.types';
import { OrderWithItemsRepository } from './repositories/order-with-items.repository';
import { OrdersRepository } from './repositories/orders.repository';

@Injectable()
export class OrdersService {
	constructor(
		private readonly orderWithItemsRepository: OrderWithItemsRepository,
		private readonly ordersRepository: OrdersRepository,
	) {}

	async createOrder(input: CreateOrderDto): Promise<Order> {
		const body = {...input, status: OrderStatus.INITIATED}
		return await this.orderWithItemsRepository.createOrder(body);
	}

	async findOrderById(id: string): Promise<Order> {
		return await this.ordersRepository.findOne({
			where: { id, deletedAt: null },
			include: [{ model: OrderItem }],
		});
	}

	async listOrders(query: ListOrdersQueryDto) {
		const safeFilter = {
			status: { [Op.ne]: OrderStatus.DELIVERED },
			deletedAt: null,
		};
		return await this.ordersRepository.paginate(
			Order,
			{
				where: safeFilter,
				page: query.page,
				limit: query.limit,
				order: [['createdAt', 'DESC'], ['id', 'ASC']],
			},
		);
	}

	async advanceOrder(id: string): Promise<void> {
		try {
			const order = await this.ordersRepository.findOne({
				where: { id, deletedAt: null },
			});
			return await this.orderWithItemsRepository.updateOrderStatus(order)
		} catch (error) {
			throw error;
		}
	}
}

 