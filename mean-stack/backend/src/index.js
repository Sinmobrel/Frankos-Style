const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Cargar variables de entorno
dotenv.config();

// Importar rutas
const apiRoutes = require('./routes/api');

// Inicializar app
const app = express();

// Variables de entorno
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:4200';

// Configuración de CORS
app.use(cors({
  origin: [FRONTEND_URL, 'https://frankos-style.netlify.app'],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Servir archivos estáticos
app.use(express.static(path.join(__dirname, '../public')));

// Conexión a MongoDB
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/mean-stack-db';
mongoose.connect(MONGODB_URI, {
  serverSelectionTimeoutMS: 15000,  // Aumentar el timeout para la selección del servidor
  socketTimeoutMS: 45000,           // Aumentar el timeout para operaciones de socket
})
  .then(() => console.log('Conexión a MongoDB exitosa'))
  .catch(err => console.error('Error al conectar con MongoDB:', err));

// Rutas
app.use('/api', apiRoutes);

// Ruta básica para probar
app.get('/', (req, res) => {
  res.json({ message: 'API de Franko\'s Style funcionando correctamente' });
});

// Iniciar el servidor para desarrollo local
const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Servidor ejecutándose en http://localhost:${PORT}`);
});

// Exportar la app para Vercel
module.exports = app;
