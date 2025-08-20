import {
	Table,
	Model,
	Column,
	DataType,
	PrimaryKey,
	Default,
	HasMany,
	AllowNull,
	CreatedAt,
	UpdatedAt,
	DeletedAt,
} from 'sequelize-typescript';
import type { Optional } from 'sequelize';
import { OrderItem } from './order-item.model';
import { OrderStatus } from './order.types';

export interface OrderAttributes {
	id: string;
	clientName: string;
	status: OrderStatus;
	sentAt: Date | null;
	deliveredAt: Date | null;
	createdAt: Date;
	updatedAt: Date;
	deletedAt: Date | null;
}

export type OrderCreationAttributes = Optional<
	OrderAttributes,
	'id' | 'status' | 'sentAt' | 'deliveredAt' | 'createdAt' | 'updatedAt' | 'deletedAt'
>;

@Table({
	tableName: 'orders',
	paranoid: true,
	timestamps: true,
})
export class Order extends Model<OrderAttributes, OrderCreationAttributes> {
	@PrimaryKey
	@Default(DataType.UUIDV4)
	@Column({ type: DataType.UUID })
	id!: string;

	@AllowNull(false)
	@Column({ type: DataType.STRING(200) })
	clientName!: string;

	@AllowNull(false)
	@Default(OrderStatus.INITIATED)
	@Column({
		type: DataType.ENUM(...Object.values(OrderStatus)),
	})
	status!: OrderStatus;

	@AllowNull(true)
	@Column({ type: DataType.DATE })
	sentAt!: Date | null;

	@AllowNull(true)
	@Column({ type: DataType.DATE })
	deliveredAt!: Date | null;

	@HasMany(() => OrderItem, {
		foreignKey: 'orderId',
		onDelete: 'CASCADE',
	})
	items?: OrderItem[];

	@CreatedAt
	createdAt!: Date;

	@UpdatedAt
	updatedAt!: Date;

	@DeletedAt
	deletedAt!: Date | null;
}


