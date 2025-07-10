const bcrypt = require('bcrypt');
const User = require('../models/user.model');

// Función para registrar un nuevo usuario
const registerUser = async (req, res) => {
    try {
        // 1. Extraer datos del request body
        const { name, email, password, phone } = req.body;

        // 2. Validar que los campos requeridos estén presentes y no esten vacíos
        // Se podría utilizar una librería como Joi o express-validator para validaciones más robustas
        if (!name || !email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Nombre, email y contraseña son requeridos'
            });
        }

        // 3. Verificar si el usuario ya existe
        const existingUser = await User.findOne({ where: { email } }); // Esto devuelve un true o false 
        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: 'El email ya está registrado'
            });
        }

        // 4. Hashear la contraseña
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // 5. Crear el usuario en la base de datos
        const newUser = await User.create({
            name,
            email,
            password: hashedPassword,
            phone: phone || null
        });

        // 6. Responder con éxito (sin enviar la contraseña)
        res.status(201).json({
            success: true,
            message: 'Usuario registrado exitosamente',
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

module.exports = {
    registerUser
};
