import bcrypt from "bcrypt";
import User from "../models/user.model.js";
import jwt from "jsonwebtoken";

// Función para iniciar sesión de un usuario
const loginUser = async (req, res) => {
  // Extraemos el email y la contraseña del request body
  const { email, password } = req.body;

  // Validamos que ambos existan
  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: "Datos inválidos",
    });
  }

  try {
    // Buscamos el usuario por email
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Acceso denegado",
      });
    }

    // Comparamos la contraseña ingresada con la almacenada en la base de datos
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Credenciales incorrectas",
      });
    }

    // Generamos token JWT 
    const token = jwt.sign(
      { id: user.id },
      process.env.JWT_SECRET,
      { expiresIn: "1h" } // 1 hora
    );

    // Si es correcta respondemos con exito
    res.status(200).json({
      success: true,
      message: "Operación realizada correctamente",
      token: token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
      },
    });
  } catch (error) {
    console.error("Error en loginUser:", error);
    res.status(500).json({
      success: false,
      message: "Error interno del servidor",
    });
  }
};

export { loginUser };
