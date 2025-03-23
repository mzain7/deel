const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/database');
const Contract = require('./contract');

class Profile extends Model {}
Profile.init(
  {
    firstName: {
      type: DataTypes.STRING,
      allowNull: false
    },
    lastName: {
      type: DataTypes.STRING,
      allowNull: false
    },
    profession: {
      type: DataTypes.STRING,
      allowNull: false
    },
    balance:{
      type:DataTypes.DECIMAL(12,2),
      allowNull: false,
      defaultValue: 0.00,
    },
    type: {
      type: DataTypes.ENUM("client", "contractor"),
      allowNull: false,
    }
  },
  {
    sequelize,
    modelName: 'Profile'
  }
);

Profile.hasMany(Contract, {as :'Contractor',foreignKey:'ContractorId'});
Contract.belongsTo(Profile, {as: 'Contractor'});
Profile.hasMany(Contract, {as : 'Client', foreignKey:'ClientId'});
Contract.belongsTo(Profile, {as: 'Client'});

module.exports = Profile;