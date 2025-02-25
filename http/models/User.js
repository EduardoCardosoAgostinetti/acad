const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const User = sequelize.define('User', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    uuid: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        allowNull: false,
        unique: true,
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    username: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    weight: {
        type: DataTypes.FLOAT,
        allowNull: true,
    },
    height: {
        type: DataTypes.FLOAT,
        allowNull: true,
    },
    birthdate: {
        type: DataTypes.DATEONLY,  // Usando DATEONLY para armazenar apenas a data, sem o horário
        allowNull: false,
    },
}, {
    timestamps: true,
    tableName: 'users',
    schema: 'public',  
});

module.exports = User;
