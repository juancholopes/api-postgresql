import express from 'express'; // Importa express como un framework para crear el servidor
import dotenv from 'dotenv'; // Importa dotenv para variables de entorno
import authRoutes from './routes/auth.routes.js'; // Importar las rutas
import sequelize from './db.js';

dotenv.config(); // Carga las variables de entorno

const app = express(); // Crea una instancia de express para manejar las peticiones HTTP en general se le nombra app
const port = 3001; // Se define el puerto en el que se estará corriendo el servidor puede ser cualquier puerto que no esté en uso

// Función async para inicializar el servidor
async function startServer() {
    try {
        // Verificar conexión a la base de datos
        await sequelize.authenticate();
        console.log('✅ Conexión a PostgreSQL establecida correctamente');
        
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
    } catch (error) {
        console.error('❌ Error conectando a PostgreSQL:', error);
        process.exit(1);
    }
}

// Iniciar el servidor
startServer();

