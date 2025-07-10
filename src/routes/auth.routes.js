const express = require("express");
const router = express.Router(); // Creamos un router de Express
const authController = require("../controllers/register.controller"); // Importamos el controller
const loginController = require("../controllers/login.controller"); // Importamos el controller de login

// Ruta POST para registrar un nuevo usuario
router.post("/register", authController.registerUser);

// Ruta POST para iniciar sesión
router.post("/login", loginController.loginUser);

// Aquí podemos agregar más rutas de autenticación en el futuro
// router.post('/logout', authController.logoutUser);

module.exports = router; // Exportamos el router para usarlo en index.js
