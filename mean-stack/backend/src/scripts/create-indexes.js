/**
 * Script para crear índices en MongoDB
 * Ejecutar: node src/scripts/create-indexes.js
 */

const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Cargar variables de entorno
dotenv.config({ path: path.join(__dirname, '../../.env') });

// Importar modelo (esto creará los índices definidos en el schema)
const Product = require('../models/product');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/mean-stack-db';

async function createIndexes() {
  try {
    console.log('🔌 Conectando a MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Conectado a MongoDB\n');

    console.log('📊 Creando índices en la colección de productos...');
    
    // Esto ejecutará la creación de todos los índices definidos en el schema
    await Product.createIndexes();
    
    console.log('✅ Índices creados exitosamente\n');

    // Listar todos los índices
    console.log('📋 Índices actuales en la colección "products":');
    const indexes = await Product.collection.getIndexes();
    
    Object.entries(indexes).forEach(([name, index]) => {
      console.log(`   - ${name}`);
    });

    console.log('\n🎉 Proceso completado con éxito');
    
  } catch (error) {
    console.error('❌ Error creando índices:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Desconectado de MongoDB');
  }
}

// Ejecutar
createIndexes();
