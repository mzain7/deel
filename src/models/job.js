const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/database');

class Job extends Model {}
Job.init(
  {
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    price:{
      type: DataTypes.DECIMAL(12,2),
      allowNull: false,
      validate: {
        min: 0,
      },
    },
    paid: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    paymentDate:{
      type: DataTypes.DATE,
      defaultValue: null,
    }
  },
  {
    sequelize,
    tableName: "jobs",
    modelName: 'Job'
  }
);

module.exports = Job;