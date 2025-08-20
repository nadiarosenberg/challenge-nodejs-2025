import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { OrderItem } from '../entities/order-item.model';
import { BaseRepository } from '../../database/base/base.repository';

@Injectable()
export class OrderItemsRepository extends BaseRepository<OrderItem> {
	constructor(@InjectModel(OrderItem) model: typeof OrderItem) {
		super(model);
	}
}

