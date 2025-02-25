const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const User = require('./User');

const PasswordReset = sequelize.define('PasswordReset', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    resetCode: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    expiresAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users', // nome da tabela de usuários
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
  }, {
    timestamps: true,
    tableName: 'password_resets',
    schema: 'public',
  });
  
  // Associação
  User.hasMany(PasswordReset, { foreignKey: 'userId', onDelete: 'CASCADE' });
  PasswordReset.belongsTo(User, { foreignKey: 'userId' });
  
module.exports = PasswordReset;
