const bcrypt = require("bcrypt");
const User = require("../models/user.model");

// Función para iniciar sesión de un usuario
const loginUser = async (req, res) => {
  // Extraemos el email y la contraseña del request body
  const { email, password } = req.body;

  // Validamos que ambos existan
  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: "Email y contraseña son requeridos",
    });
  }

  try {
    // Buscamos el usuario por email
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Credenciales incorrectas",
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

    // Si es correcta respondemos con exito
    res.status(200).json({
      success: true,
      message: "Inicio de sesión exitoso",
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

module.exports = {
  loginUser,
};
