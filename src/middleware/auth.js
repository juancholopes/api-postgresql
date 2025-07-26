import jwt from "jsonwebtoken"
import dotenv from "dotenv"
dotenv.config()

const authMiddleware = async (req, res, next) => {

    // Verificamos si el token está presente en los headers de la solicitud
    const authHeader = req.headers.authorization;

    if (authHeader){

        // Verificamos que el token tenga el formato correcto
        const token = authHeader.split(' ')[1] // Baerer token 

        // Verificamos el token con jwt
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET )
            req.userId = decoded.id
            next();
        } catch (error){
            return res.status(401).json({error: "No autorizado"})
        }

    } else {
        res.status(401).json({error: "Unauthorized"})

    }
}

export { authMiddleware };