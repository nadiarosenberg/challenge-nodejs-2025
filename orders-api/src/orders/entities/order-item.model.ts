import {
	Table,
	Model,
	Column,
	DataType,
	PrimaryKey,
	Default,
	ForeignKey,
	BelongsTo,
	AllowNull,
	CreatedAt,
	UpdatedAt,
	DeletedAt,
} from 'sequelize-typescript';
import type { Optional } from 'sequelize';
import { Order } from './order.model';

export interface OrderItemAttributes {
	id: string;
	orderId: string;
	description: string;
	quantity: number;
	unitPrice: number;
	createdAt: Date;
	updatedAt: Date;
	deletedAt: Date | null;
}

export type OrderItemCreationAttributes = Optional<
	OrderItemAttributes,
	'id' | 'createdAt' | 'updatedAt' | 'deletedAt'
>;

@Table({
	tableName: 'orderItems',
	paranoid: true,
	timestamps: true,
})
export class OrderItem extends Model<OrderItemAttributes, OrderItemCreationAttributes> {
	@PrimaryKey
	@Default(DataType.UUIDV4)
	@Column({ type: DataType.UUID })
	id!: string;

	@AllowNull(false)
	@ForeignKey(() => Order)
	@Column({ type: DataType.UUID })
	orderId!: string;

	@AllowNull(false)
	@Column({ type: DataType.STRING(200) })
	description!: string;

	@AllowNull(false)
	@Column({ type: DataType.INTEGER })
	quantity!: number;

	@AllowNull(false)
	@Column({ type: DataType.DECIMAL(10, 2) })
	unitPrice!: number;

	@BelongsTo(() => Order, { foreignKey: 'orderId' })
	order?: Order;

	@CreatedAt
	createdAt!: Date;

	@UpdatedAt
	updatedAt!: Date;

	@DeletedAt
	deletedAt!: Date | null;
}


