const {Sequelize, DataTypes} = require('sequelize'); // Importa Sequelize y DataTypes desde la librería sequelize para manejar la base de datos y definir modelos
const sequelize = require('../db'); // Importa la instancia de Sequelize configurada desde db.js

// Definimos el modelo User utilizando sequelize.define()
const User = sequelize.define('User', {
    name: {
        type: DataTypes.STRING,
        allowNull: false // No puede ser nulo
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true // Debe ser único
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false
    },
    phone: {
        type: DataTypes.STRING,
        allowNull: true // Puede ser nulo (opcional)
    }
});

module.exports = User; // Exporta el modelo para usarlo en otros archivos

