const express = require('express');
const router = express.Router(); // Creamos un router de Express
const authController = require('../controllers/auth.controller'); // Importamos el controller

// Ruta POST para registrar un nuevo usuario
router.post('/register', authController.registerUser);

// Aquí podemos agregar más rutas de autenticación en el futuro
// router.post('/login', authController.loginUser);
// router.post('/logout', authController.logoutUser);

module.exports = router; // Exportamos el router para usarlo en index.js
