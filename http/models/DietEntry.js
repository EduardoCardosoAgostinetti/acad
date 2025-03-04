const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const User = require('./User');

const DietEntry = sequelize.define('DietEntry', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  mealType: {
    type: DataTypes.ENUM('Café da Manhã', 'Almoço', 'Jantar', 'Lanche', 'Pré-Treino', 'Pós-Treino'),
    allowNull: false
  },
  foods: {
    type: DataTypes.JSON, // JSON para armazenar múltiplos alimentos
    allowNull: false
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: User,
      key: 'id'
    }
  }
}, {
  timestamps: true,
  tableName: 'diet_entries',
  schema: 'public',
});

// Relacionamento com User
DietEntry.belongsTo(User, { foreignKey: 'userId' });
User.hasMany(DietEntry, { foreignKey: 'userId' });

module.exports = DietEntry;
