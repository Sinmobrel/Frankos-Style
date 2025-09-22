/**
 * Script para crear un usuario administrador
 * Ejecutar desde la raíz del proyecto con:
 * node src/scripts/create-admin-user.js
 */

const mongoose = require('mongoose');
const User = require('../models/user');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');

// Cargar variables de entorno
dotenv.config();

// URL de conexión a MongoDB
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/mean-stack-db';

// Datos del usuario administrador
const adminUser = {
  name: 'Admin',
  email: 'admin@example.com',
  password: 'admin123', // Se hasheará antes de guardar
  role: 'admin'
};

async function createAdminUser() {
  try {
    // Conectar a MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('Conectado a MongoDB');
    
    // Verificar si ya existe un usuario con ese email
    const existingUser = await User.findOne({ email: adminUser.email });
    
    if (existingUser) {
      console.log('Ya existe un usuario con ese email. Actualizando a rol admin...');
      existingUser.role = 'admin';
      await existingUser.save();
      console.log('Usuario actualizado con éxito.');
    } else {
      // Hashear la contraseña
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(adminUser.password, salt);
      
      // Crear nuevo usuario administrador con contraseña hasheada
      await User.create({
        ...adminUser,
        password: hashedPassword
      });
      console.log('Usuario administrador creado con éxito.');
    }
  } catch (error) {
    console.error('Error:', error);
  } finally {
    // Cerrar conexión
    await mongoose.connection.close();
    console.log('Conexión cerrada');
  }
}

// Ejecutar la función
createAdminUser();