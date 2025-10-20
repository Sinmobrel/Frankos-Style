require('dotenv').config({ path: '../../.env' });
const mongoose = require('mongoose');
const Product = require('../models/product');

// Conectar a MongoDB
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/mean-stack-db';

mongoose.connect(MONGODB_URI).then(() => {
  console.log('✅ Conectado a MongoDB');
  updateProductDescriptions();
}).catch(err => {
  console.error('❌ Error conectando a MongoDB:', err);
});

// Descripciones cortas y atractivas para el chatbot
const technicalDescriptions = {
  "Traje de Caballero Gris Claro Premium": {
    name: "Traje de Caballero Gris Claro Premium",
    description: "Elegancia moderna con detalles únicos y acabados de lujo para eventos especiales. Incluye corbata lazo burdeos con broche dorado y accesorios exclusivos que aportan sofisticación y personalidad."
  },
  
  "Traje de Caballero Burdeos Ejecutivo": {
    name: "Traje de Caballero Burdeos Ejecutivo", 
    description: "Distinción y personalidad con solapas satinadas para el hombre moderno. Combina audacia y elegancia clásica con detalles de lujo como prendedor plateado que refuerzan la exclusividad."
  },
  
  "Traje de Caballero Azul Eléctrico Fashion": {
    name: "Traje de Caballero Azul Eléctrico Fashion",
    description: "Sofisticación audaz con contraste vibrante para destacar con estilo. Ideal para quienes buscan elegancia con un look llamativo y contemporáneo que realza la silueta masculina."
  },
  
  "Traje de Caballero Azul Marino Clásico": {
    name: "Traje de Caballero Azul Marino Clásico",
    description: "Elegancia atemporal con toque moderno para el caballero refinado. Combina sobriedad clásica con detalles contemporáneos, perfecto para proyectar seguridad y estilo refinado."
  },
  
  "Traje de Caballero Rojo Statement": {
    name: "Traje de Caballero Rojo Statement",
    description: "Proyecta seguridad y estilo llamativo para ser el centro de atención. Diseñado para quienes buscan un look atrevido y sofisticado con contraste moderno y elegante."
  },
  
  "Traje de Caballero Gris Executive": {
    name: "Traje de Caballero Gris Executive",
    description: "Sobriedad elegante con toques modernos para el profesional distinguido. Combina tradición y vanguardia con un contraste llamativo perfecto para recepciones y eventos corporativos."
  },
  
  "Traje de Caballero Burdeos Luxury": {
    name: "Traje de Caballero Burdeos Luxury",
    description: "Fusión perfecta entre lo clásico y lo audaz con acabados de lujo exclusivos. Incluye detalles VIP como prendedor plateado con cadena, ideal para eventos donde quieras brillar con estilo único."
  }
};

async function updateProductDescriptions() {
  try {
    console.log('🔄 Actualizando descripciones técnicas de productos...');
    
    const products = await Product.find({});
    let updated = 0;
    
    for (const product of products) {
      const techDesc = technicalDescriptions[product.name];
      if (techDesc) {
        await Product.findByIdAndUpdate(product._id, {
          name: techDesc.name,
          description: techDesc.description
        });
        
        console.log(`✅ Actualizado: ${product.name} → ${techDesc.name}`);
        updated++;
      } else {
        console.log(`⚠️  No se encontró descripción técnica para: ${product.name}`);
      }
    }
    
    console.log(`\n📊 RESUMEN DE ACTUALIZACIÓN:`);
    console.log(`   • Productos actualizados: ${updated}/${products.length}`);
    console.log(`   • Descripciones técnicas aplicadas correctamente`);
    console.log(`   • Base de datos optimizada para chatbot`);
    
    // Verificar los cambios
    console.log(`\n🔍 VERIFICANDO CAMBIOS:`);
    const updatedProducts = await Product.find({});
    updatedProducts.forEach((product, index) => {
      console.log(`${index + 1}. ${product.name}`);
      console.log(`   Precio: $${product.price} | Stock: ${product.stock}`);
      console.log(`   Descripción: ${product.description.substring(0, 100)}...`);
      console.log('   ' + '─'.repeat(50));
    });
    
  } catch (error) {
    console.error('❌ Error actualizando descripciones:', error);
  } finally {
    mongoose.disconnect();
    console.log('\n✅ Actualización completada. Base de datos desconectada.');
    process.exit(0);
  }
}