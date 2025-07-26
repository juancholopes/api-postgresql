import jwt from "jsonwebtoken"
import dotenv from "dotenv"
import User from "../models/user.model.js"
dotenv.config()

const profileUser = async (req, res ) => {
    const userId = req.userId;
    const user = await User.findByPk(userId);

    if (user) {
        res.status(200).json({ success: true, message: "Perfil obtenido exitosamente", user: { id: user.id, name: user.name, email: user.email, phone: user.phone } });
    } else {
        res.status(404).json({ success: false, message: "404 Not Found" });
    }
}

export { profileUser };