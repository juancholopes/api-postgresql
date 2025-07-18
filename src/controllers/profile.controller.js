import jwt, { decode } from "jsonwebtoken"
import dotenv from "dotenv"
import User from "../models/user.model.js"
dotenv.config()

const profileUser = async (req, res ) => {

    const authHeader = req.headers.authorization;

    if (authHeader){
        const token = authHeader.split(' ')[1] // Baerer token 

        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET )
            const userId = decoded.id

            const user = await User.findByPk(userId)

            if (user){
                res.status(200).json({success: true, message: "Perfil obtenido exitosamente", user: {id: user.id, name: user.name, email: user.email, phone: user.phone }})
            } else {
                res.status(404).json({success: false, message: "404 Not Found"})
            }

        } catch (error){
            return res.status(401).json({error: "No autorizado"})
        }

    } else {
        res.status(401).json({error: "Unauthorized"})

    }
}

export { profileUser };