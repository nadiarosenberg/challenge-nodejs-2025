require('dotenv').config();

module.exports = {
	development: {
		username: process.env.POSTGRES_USER || 'postgres',
		password: process.env.POSTGRES_PASSWORD || 'postgres',
		database: process.env.POSTGRES_DB || 'orders_api',
		host: process.env.POSTGRES_HOST || 'localhost',
		port: Number(process.env.POSTGRES_PORT) || 5432,
		dialect: 'postgres',
		migrationStorageTableName: 'sequelize_meta',
	},
};
