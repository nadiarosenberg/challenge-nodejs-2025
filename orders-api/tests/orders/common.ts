import { CreateOrderDto } from "src/orders/dto/create-order.dto";
import { OrderStatus } from "src/orders/entities/order.types";

export const validId = '123e4567-e89b-12d3-a456-426614174000';

export const mockOrder = {
    id: validId,
    clientName: 'John Doe',
    status: OrderStatus.INITIATED,
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
    sentAt: null,
    deliveredAt: null
  }

export const mockCompleteOrder = {
    ...mockOrder,
    items: [
      {
        id: '123e4567-e89b-12d3-a456-426614174001',
        orderId: validId,
        description: 'Product 1',
        quantity: 2,
        unitPrice: 10.99
      },
    ],
  } as any;


export const mockCreateOrderDto: CreateOrderDto = {
    clientName: 'John Doe',
    items: [
        {
        description: 'Product 1',
        quantity: 2,
        unitPrice: 10.99,
        },
    ],
};