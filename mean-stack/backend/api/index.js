const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Cargar variables de entorno
dotenv.config();

// Importar rutas
const apiRoutes = require('../src/routes/api');

// Inicializar app
const app = express();

// Variables de entorno
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/mean-stack-db';
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

// Rutas
app.use('/api', apiRoutes);

// Ruta básica para probar
app.get('/', (req, res) => {
  res.json({ message: 'API de Franko\'s Style funcionando correctamente' });
});

// Conectar a MongoDB
mongoose.connect(MONGODB_URI)
  .then(() => console.log('Conexión a MongoDB Atlas exitosa'))
  .catch(err => console.error('Error al conectar con MongoDB:', err));

// Para desarrollo local
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Servidor ejecutándose en el puerto ${PORT}`);
  });
}

// Exportar la app para Vercel
module.exports = app;