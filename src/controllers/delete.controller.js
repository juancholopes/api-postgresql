import User from "../models/user.model.js";

// Función para eliminar la cuenta de un usuario
const deleteAccountController = async (req, res) => {

    const userId = req.userId

    try{
        await User.destroy({where: {id: userId}})
        res.status(200).json({success: true, message: "Operación realizada correctamente"})
    }catch(error){
        console.error("Error al eliminar la cuenta:", error);
        res.status(500).json({ success: false, message: "Error interno del servidor" });
    }
    
}

export { deleteAccountController };