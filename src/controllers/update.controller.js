import User from '../models/user.model.js'
import bcrypt from 'bcrypt';

const updateProfileController = async (req, res) => {
    const userId = req.userId 

    const { name, email, password, phone } = req.body;

    if (password) {
        const saltRounds = 10;
        req.body.password = await bcrypt.hash(password, saltRounds);
    }
    try {
        await User.update(req.body, {where: {id: userId}})
        const updatedUser = await User.findByPk(userId);
        res.status(200).json({
            success: true,
            message: 'Perfil actualizado exitosamente',
            user: {
                id: updatedUser.id,
                name: updatedUser.name,
                email: updatedUser.email,
                phone: updatedUser.phone
            }
        });
    } catch (error) {
        console.error('Error en updateProfileController:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }

}

export { updateProfileController };
