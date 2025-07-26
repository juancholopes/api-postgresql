import express from "express";
import { registerUser } from "../controllers/register.controller.js";
import { loginUser } from "../controllers/login.controller.js";
import { profileUser } from "../controllers/profile.controller.js";
import {authMiddleware} from "../middleware/auth.js";
import { updateProfileController } from "../controllers/update.controller.js";
import { deleteAccountController } from "../controllers/delete.controller.js";
import { logoutController } from "../controllers/logout.controller.js";                     

const router = express.Router(); // Creamos un router de Express

// Ruta POST para registrar un nuevo usuario
router.post("/register", registerUser);

// Ruta POST para iniciar sesión
router.post("/login", loginUser);

// Ruta GET para profile
router.get("/profile", authMiddleware, profileUser);

// Ruta PUT para actualizar el perfil del usuario
router.put("/account", authMiddleware, updateProfileController)

// Ruta DELETE para eliminar la cuenta del usuario
router.delete("/delete", authMiddleware, deleteAccountController )

// Ruta para cerrar sesión
router.post("/logout", authMiddleware, logoutController); 

// Exportamos el router para usarlo en index.js
export default router;
