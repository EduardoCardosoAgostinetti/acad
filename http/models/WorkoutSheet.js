const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const User = require('./User');

const WorkoutSheet = sequelize.define('WorkoutSheet', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  muscleGroup: {
    type: DataTypes.STRING,
    allowNull: false
  },
  exercises: {
    type: DataTypes.JSON,
    allowNull: false
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: User, // Refere-se ao modelo User
      key: 'id'    // Chave primária na tabela users
    }
  }
}, {
  timestamps: true,
  tableName: 'workout_sheets',
  schema: 'public',
});

// Definindo o relacionamento entre WorkoutSheet e User
WorkoutSheet.belongsTo(User, { foreignKey: 'userId' }); // Um WorkoutSheet pertence a um usuário
User.hasMany(WorkoutSheet, { foreignKey: 'userId' });   // Um usuário pode ter muitos WorkoutSheets

module.exports = WorkoutSheet;
