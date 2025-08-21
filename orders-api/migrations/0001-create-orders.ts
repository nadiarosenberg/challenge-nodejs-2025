import { QueryInterface, DataTypes } from 'sequelize';

export = {
	up: async (queryInterface: QueryInterface) => {
		await queryInterface.sequelize.transaction(async (transaction) => {
			await queryInterface.sequelize.query(
				"CREATE TYPE \"enum_orders_status\" AS ENUM ('initiated','sent','delivered');",
				{ transaction },
			);

			await queryInterface.createTable(
				'orders',
				{
					id: { type: DataTypes.UUID, primaryKey: true, allowNull: false, defaultValue: DataTypes.UUIDV4 },
					clientName: { type: DataTypes.STRING(200), allowNull: false },
					status: {
						type: 'enum_orders_status' as unknown as DataTypes.EnumDataType<string>,
						allowNull: false,
						defaultValue: 'initiated',
					},
					sentAt: { type: DataTypes.DATE, allowNull: true },
					deliveredAt: { type: DataTypes.DATE, allowNull: true },
					deletedAt: { type: DataTypes.DATE, allowNull: true },
					createdAt: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
					updatedAt: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
				},
				{ transaction },
			);

			await queryInterface.addIndex('orders', ['status'], { transaction });
			await queryInterface.addIndex('orders', ['createdAt'], { transaction });
			await queryInterface.addIndex('orders', ['deletedAt'], { transaction });
		});
	},

	down: async (queryInterface: QueryInterface) => {
		await queryInterface.sequelize.transaction(async (transaction) => {
			await queryInterface.dropTable('orders', { transaction });
			await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_orders_status";', { transaction });
		});
	},
};


