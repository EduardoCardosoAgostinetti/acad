const sequelize = require('../config/db');
const User = require('./User');
const PasswordReset = require('./PasswordReset');
const ProfilePicture = require('./ProfilePicture');
const GalleryPicture = require('./GalleryPicture');

// Sincroniza os modelos com o banco de dados
(async () => {
  try {
    // Aqui usamos o { alter: true } para tentar ajustar as tabelas existentes
    await sequelize.sync({force: true });
    console.log('Synchronized tables!');
  } catch (error) {
    console.error('Erro ao sincronizar as tabelas:', error);
  }
})();
