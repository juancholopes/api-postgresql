import express from "express";
import { registerUser } from "../controllers/register.controller.js";
import { loginUser } from "../controllers/login.controller.js";
import { profileUser } from "../controllers/profile.controller.js";

const router = express.Router(); // Creamos un router de Express

// Ruta POST para registrar un nuevo usuario
router.post("/register", registerUser);

// Ruta POST para iniciar sesión
router.post("/login", loginUser);

// Ruta GET para profile
router.get("/profile", profileUser)

// Exportamos el router para usarlo en index.js
export default router;
