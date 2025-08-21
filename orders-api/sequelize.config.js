require('dotenv').config();

const { ConfigService } = require('@nestjs/config');

const configService = new ConfigService();
const getConfig = (key) => configService.get(key);

module.exports = {
  development: {
    username: getConfig('POSTGRES_USER'),
    password: getConfig('POSTGRES_PASSWORD'),
    database: getConfig('POSTGRES_DB'),
    host: getConfig('POSTGRES_HOST'),
    port: parseInt(getConfig('POSTGRES_PORT')),
    dialect: 'postgres',
    migrationStorageTableName: 'sequelize_meta',
  },
};
