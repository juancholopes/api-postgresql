const express = require('express'); // Importa express como un framework para crear el servidor
const app = express(); // Crea una instancia de express para manejar las peticiones HTTP en general se le nombra app
const port = 3001; // Se define el puerto en el que se estará corriendo el servidor puede ser cualquier puerto que no esté en uso

// Importar las rutas
const authRoutes = require('./routes/auth.routes');

// Middleware para aceptar JSON en request 
app.use(express.json());

// Usar las rutas de autenticación
app.use('/api/auth', authRoutes);

// Ruta de prueba para verificar que el servidor está funcionando
app.get('/', (req, res) => {
  res.send('Servidor funcionando correctamente');
});

// Levantamos el servidor en el puerto especificado
app.listen(port, () => {
  console.log(`Servidor escuchando en http://localhost:${port}`);
});
