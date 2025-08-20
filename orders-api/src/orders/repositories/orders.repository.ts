import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Order } from '../entities/order.model';
import { BaseRepository } from '../../database/base/base.repository';

@Injectable()
export class OrdersRepository extends BaseRepository<Order> {
  constructor(@InjectModel(Order) model: typeof Order) {
    super(model);
  }
}
