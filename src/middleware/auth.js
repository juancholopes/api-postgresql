import jwt from "jsonwebtoken"
import dotenv from "dotenv"
dotenv.config()

const authMiddleware = async (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (authHeader){
        const token = authHeader.split(' ')[1] // Baerer token 

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

export default authMiddleware;