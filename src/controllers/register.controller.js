import bcrypt from 'bcrypt';
import User from '../models/user.model.js';

// Controller para registrar un nuevo usuario se hace: 
// Validación de campos, utilización de bcrypt para la encriptación y creación del usuario
const registerUser = async (req, res) => {
    try {
        const { name, email, password, phone } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Datos inválidos'
            });
        }

        const normalizedEmail = email.toLowerCase();
        const existingUser = await User.findOne({ where: { email: normalizedEmail } }); 
        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: 'El correo electrónico ya está en uso'
            });
        }

        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        const newUser = await User.create({
            name,
            email: normalizedEmail,
            password: hashedPassword,
            phone: phone || null
        });

        res.status(201).json({
            success: true,
            message: 'Operación realizada correctamente',
            user: {
                id: newUser.id,
                name: newUser.name,
                email: newUser.email,
                phone: newUser.phone
            }
        });

    } catch (error) {
        console.error('Error en registerUser:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
};

export { registerUser };
