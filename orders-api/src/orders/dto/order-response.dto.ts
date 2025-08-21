import { ApiProperty } from '@nestjs/swagger';
import { OrderStatus } from '../entities/order.types';

export class OrderItemResponseDto {
  @ApiProperty({
    description: 'Unique identifier for the order item',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id!: string;

  @ApiProperty({
    description: 'Order ID this item belongs to',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  orderId!: string;

  @ApiProperty({
    description: 'Product description',
    example: 'iPhone 15 Pro Max',
  })
  description!: string;

  @ApiProperty({
    description: 'Quantity of the product',
    example: 2,
    minimum: 1,
  })
  quantity!: number;

  @ApiProperty({
    description: 'Unit price of the product',
    example: 999.99,
    minimum: 0,
  })
  unitPrice!: number;

  @ApiProperty({
    description: 'Creation timestamp',
    example: '2024-01-15T10:30:00.000Z',
  })
  createdAt!: Date;

  @ApiProperty({
    description: 'Last update timestamp',
    example: '2024-01-15T10:30:00.000Z',
  })
  updatedAt!: Date;

  @ApiProperty({
    description: 'Soft delete timestamp (null if not deleted)',
    example: null,
    nullable: true,
  })
  deletedAt!: Date | null;
}

export class OrderResponseDto {
  @ApiProperty({
    description: 'Unique identifier for the order',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id!: string;

  @ApiProperty({
    description: 'Name of the client who placed the order',
    example: 'John Doe',
  })
  clientName!: string;

  @ApiProperty({
    description: 'Current status of the order',
    enum: OrderStatus,
    example: OrderStatus.INITIATED,
  })
  status!: OrderStatus;

  @ApiProperty({
    description: 'Timestamp when the order was sent (null if not sent)',
    example: null,
    nullable: true,
  })
  sentAt!: Date | null;

  @ApiProperty({
    description: 'Timestamp when the order was delivered (null if not delivered)',
    example: null,
    nullable: true,
  })
  deliveredAt!: Date | null;

  @ApiProperty({
    description: 'Creation timestamp',
    example: '2024-01-15T10:30:00.000Z',
  })
  createdAt!: Date;

  @ApiProperty({
    description: 'Last update timestamp',
    example: '2024-01-15T10:30:00.000Z',
  })
  updatedAt!: Date;

  @ApiProperty({
    description: 'Soft delete timestamp (null if not deleted)',
    example: null,
    nullable: true,
  })
  deletedAt!: Date | null;

  @ApiProperty({
    description: 'Order items (only included when requested)',
    type: [OrderItemResponseDto],
    required: false,
  })
  items?: OrderItemResponseDto[];
}

export class OrderListResponseDto {
  @ApiProperty({
    description: 'Array of orders',
    type: [OrderResponseDto],
  })
  results!: OrderResponseDto[];

  @ApiProperty({
    description: 'Current page number',
    example: 1,
  })
  page!: number;

  @ApiProperty({
    description: 'Number of items per page',
    example: 20,
  })
  limit!: number;

  @ApiProperty({
    description: 'Total number of pages',
    example: 5,
  })
  totalPages!: number;

  @ApiProperty({
    description: 'Total number of orders',
    example: 100,
  })
  total!: number;
}
