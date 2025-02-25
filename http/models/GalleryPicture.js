const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const User = require('./User');

const GalleryPicture = sequelize.define('GalleryPicture', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: User,
            key: 'id',
        },
        onDelete: 'CASCADE',
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
        defaultValue: DataTypes.UUIDV4,
        allowNull: false,
    },
    filePath: {
        type: DataTypes.STRING,
        allowNull: false,
    },
}, {
    timestamps: true,
    tableName: 'gallery_pictures',
    schema: 'public',
});

module.exports = GalleryPicture;