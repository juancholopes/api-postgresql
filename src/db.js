const { Sequelize } = require('sequelize'); // Importa Sequelize para manejar la base de datos con ORM
require('dotenv').config(); // Carga las variables de entorno desde el archivo .env

// Configuramos la conexión de la base de datos con Sequelize
const sequelize = new Sequelize(
    process.env.DB_NAME, // Nombre de la base de datos
    process.env.DB_USER, // Usuario de la base de datos
    process.env.DB_PASSWORD, // Contraseña del usuario
    {
        host: process.env.DB_HOST, // Host donde se encuentra la base de datos
        port: process.env.DB_PORT, // Puerto de PostgreSQL
        dialect: 'postgres', // Especifica que usamos PostgreSQL
        logging: false, // Desactiva los logs SQL en consola 
    }
);

module.exports = sequelize; // Exporta la instancia de Sequelize para que pueda ser utilizada en otros archivos