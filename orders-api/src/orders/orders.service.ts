import { Injectable } from '@nestjs/common';
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
		const body = {...input, status: OrderStatus.INITIATED}
		return await this.orderWithItemsRepository.createOrder(body);
	}

	async findOrder(id: string): Promise<Order> {
		return await this.ordersRepository.findOne({
			where: { id, deletedAt: null },
			include: [{ model: OrderItem }],
		});
	}

	async listOrders() {
		const hashKey = 'orders:hash';
		const cachedIds = await this.cacheService.get<string[]>(`${hashKey}:ids`);
		if (cachedIds && cachedIds.length > 0) {
			const cachedOrders = await this.cacheService.getMany<Order>(
				cachedIds.map(id => `${hashKey}:${id}`)
			);
			if(cachedOrders.length > 0) return cachedOrders
		}

		const safeFilter = {
			status: { [Op.ne]: OrderStatus.DELIVERED },
			deletedAt: null,
		};
		const result = await this.ordersRepository.findAll({
			where: safeFilter,
			order: [['createdAt', 'DESC'], ['id', 'ASC']],
		});

		const orderIds = result.map(order => order.id);		
		await this.cacheService.set(`${hashKey}:ids`, orderIds);
		const cacheEntries = result.map(order => ({
			key: `${hashKey}:${order.id}`,
			value: order,
		}));
		await this.cacheService.setMany(cacheEntries);
		return result;
	}

	async advanceOrder(id: string): Promise<void> {
		try {
			const order = await this.ordersRepository.findOne({
				where: { id, deletedAt: null },
			});
			await this.orderWithItemsRepository.updateOrderStatus(order);
			if (order.status === OrderStatus.SENT) {
				const hashKey = 'orders:hash';
				await this.cacheService.delete(`${hashKey}:${id}`);
			}
			return 
		} catch (error) {
			throw error;
		}
	}
}

 