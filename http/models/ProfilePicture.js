const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const User = require('./User');  // Assumindo que o modelo User já está definido

const ProfilePicture = sequelize.define('ProfilePicture', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: User,  // Fazendo referência à tabela 'users'
            key: 'id',    // Chave estrangeira referenciando o id do usuário
        },
        onDelete: 'CASCADE',  // Se o usuário for deletado, a foto de perfil também será
    },
    fileName: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    fileExtension: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    imageId: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,  // ID único para a foto
        allowNull: false,
    },
    filePath: {
        type: DataTypes.STRING,  // Caminho onde a foto está armazenada
        allowNull: false,
    },
}, {
    timestamps: true,
    tableName: 'profile_pictures',
    schema: 'public',  
});

module.exports = ProfilePicture;
