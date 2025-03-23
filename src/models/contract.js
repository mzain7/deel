const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/database');
const Job = require('./job');

class Contract extends Model {}
Contract.init(
  {
    terms: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        notEmpty: true,
      }
    },
    status:{
      type: DataTypes.ENUM("new", "in_progress", "terminated"),
      defaultValue: "new",
      allowNull: false,
    }
  },
  {
    sequelize,
    tableName: "contracts",
    modelName: 'Contract'
  }
);

Contract.hasMany(Job, { foreignKey: "ContractId", onDelete: "CASCADE" });
Job.belongsTo(Contract, { foreignKey: "ContractId" });

module.exports = Contract;