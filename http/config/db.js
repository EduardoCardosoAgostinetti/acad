const { Sequelize } = require('sequelize');

// Configuração da conexão com o banco de dados PostgreSQL
const sequelize = new Sequelize('acad', 'admin', 'admin', {
    host: 'localhost',
    dialect: 'postgres',
    logging: false, // Desativa todos os logs de consulta
});

(async () => {
    try {
        await sequelize.authenticate();
        console.log('Connected to PostgreSQL successfully!');
    } catch (error) {
        console.error('Error connecting to PostgreSQL:', error);
    }
})();

module.exports = sequelize;
