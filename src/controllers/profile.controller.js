import jwt from "jsonwebtoken"
import dotenv from "dotenv"
import User from "../models/user.model.js"
dotenv.config()

const profileUser = async (req, res ) => {

    // Obtenemos el ID del usuario desde el token decodificado
    const userId = req.userId;
    const user = await User.findByPk(userId);

    // Si el usuario existe, respondemos con su perfil
    // Si no, respondemos con un error 404
    if (user) {
        res.status(200).json({ success: true, message: "Operación realizada correctamente", user: { id: user.id, name: user.name, email: user.email, phone: user.phone } });
    } else {
        res.status(404).json({ success: false, message: "No se pudo completar la operación" });
    }
}

export { profileUser };