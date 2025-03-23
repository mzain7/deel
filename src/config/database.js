const {Sequelize, Transaction} = require('sequelize');

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: './database.sqlite3',
  isolationLevel: Transaction.ISOLATION_LEVELS.READ_COMMITTED
});

module.exports = sequelize;