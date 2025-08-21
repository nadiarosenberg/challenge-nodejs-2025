import { QueryInterface, DataTypes } from 'sequelize';

export = {
	up: async (queryInterface: QueryInterface) => {
		await queryInterface.sequelize.transaction(async (transaction) => {
			await queryInterface.createTable(
				'orderItems',
				{
					id: { type: DataTypes.UUID, primaryKey: true, allowNull: false, defaultValue: DataTypes.UUIDV4 },
					orderId: { type: DataTypes.UUID, allowNull: false },
					description: { type: DataTypes.STRING(200), allowNull: false },
					quantity: { type: DataTypes.INTEGER, allowNull: false },
					unitPrice: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
					deletedAt: { type: DataTypes.DATE, allowNull: true },
					createdAt: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
					updatedAt: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
				},
				{ transaction },
			);

			await queryInterface.addConstraint('orderItems', {
				fields: ['orderId'],
				type: 'foreign key',
				name: 'orderItems_orderId_fkey',
				references: { table: 'orders', field: 'id' },
				onDelete: 'CASCADE',
				onUpdate: 'CASCADE',
				transaction,
			});

			await queryInterface.addIndex('orderItems', ['orderId'], { transaction });
			await queryInterface.addIndex('orderItems', ['deletedAt'], { transaction });
		});
	},

	down: async (queryInterface: QueryInterface) => {
		await queryInterface.sequelize.transaction(async (transaction) => {
			await queryInterface.dropTable('orderItems', { transaction });
		});
	},
};


