require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('../models/product');

// Conectar a MongoDB
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/mean-stack-db';

mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('✅ Conectado a MongoDB');
  updateProductsWithTechnicalInfo();
}).catch(err => {
  console.error('❌ Error conectando a MongoDB:', err);
});

async function updateProductsWithTechnicalInfo() {
  try {
    console.log('\n🔄 ACTUALIZANDO INFORMACIÓN TÉCNICA DE PRODUCTOS SIN DATOS COMPLETOS');
    console.log('='.repeat(80));

    // Actualizar la camisa
    const camisaUpdate = {
      mainColor: 'Blanco',
      productType: 'Camisa Formal',
      cut: 'Slim Fit',
      priceRange: 'Económico',
      sizesText: 'S, M, L, XL, XXL',
      material: '100% algodón premium con detalles en contraste',
      eventTypes: ['Oficina', 'Eventos Formales', 'Cenas de Negocios'],
      colors: ['Blanco', 'Negro'],
      includes: ['Camisa'],
      occasion: 'Formal'
    };

    const camisaResult = await Product.updateOne(
      { name: 'Camisa Blanca Detalle Negro Slim Fit' },
      { $set: camisaUpdate }
    );
    console.log(`👔 Camisa actualizada: ${camisaResult.modifiedCount} documento(s) modificado(s)`);

    // Actualizar la corbata
    const corbataUpdate = {
      mainColor: 'Azul Marino',
      productType: 'Corbata Clásica',
      cut: 'Clásico',
      priceRange: 'Económico',
      sizesText: 'Talla Única (Largo: 145cm, Ancho: 8cm)',
      material: 'Seda sintética de alta calidad con acabado brillante',
      eventTypes: ['Oficina', 'Eventos Formales', 'Bodas', 'Reuniones'],
      colors: ['Azul Marino', 'Celeste'],
      includes: ['Corbata'],
      occasion: 'Formal'
    };

    const corbataResult = await Product.updateOne(
      { name: 'Corbata Azul Marino a Rayas Diagonales' },
      { $set: corbataUpdate }
    );
    console.log(`👔 Corbata actualizada: ${corbataResult.modifiedCount} documento(s) modificado(s)`);

    // Actualizar el accesorio
    const accesorioUpdate = {
      mainColor: 'Dorado',
      productType: 'Prendedor Decorativo',
      cut: 'Clásico',
      priceRange: 'Económico',
      sizesText: 'Talla Única (Largo total: 15cm)',
      material: 'Aleación metálica con baño dorado y acabado brillante',
      eventTypes: ['Bodas', 'Galas', 'Eventos Formales', 'Ceremonias'],
      colors: ['Dorado'],
      includes: ['Prendedor', 'Doble Cadena'],
      occasion: 'Ceremonial'
    };

    const accesorioResult = await Product.updateOne(
      { name: 'Prendedor Cadena Luna y Estrella Dorado' },
      { $set: accesorioUpdate }
    );
    console.log(`💎 Accesorio actualizado: ${accesorioResult.modifiedCount} documento(s) modificado(s)`);

    // Verificar actualizaciones
    console.log('\n✅ VERIFICANDO ACTUALIZACIONES:');
    console.log('-'.repeat(50));

    const updatedProducts = await Product.find({
      name: { $in: [
        'Camisa Blanca Detalle Negro Slim Fit',
        'Corbata Azul Marino a Rayas Diagonales',
        'Prendedor Cadena Luna y Estrella Dorado'
      ]}
    });

    updatedProducts.forEach(product => {
      console.log(`\n📦 ${product.name}`);
      console.log(`   🎨 Color: ${product.mainColor}`);
      console.log(`   📏 Tipo: ${product.productType}`);
      console.log(`   ✂️  Corte: ${product.cut}`);
      console.log(`   🏷️  Rango: ${product.priceRange}`);
      console.log(`   📐 Tallas: ${product.sizesText}`);
      console.log(`   🧵 Material: ${product.material}`);
      console.log(`   🎪 Eventos: ${product.eventTypes?.join(', ')}`);
      console.log(`   🎨 Colores: ${product.colors?.join(', ')}`);
      console.log(`   📦 Incluye: ${product.includes?.join(', ')}`);
    });

    console.log('\n🎉 ¡Actualización completada exitosamente!');
    console.log('Ahora todos los productos tienen información técnica completa para mostrar en los modales.');

  } catch (error) {
    console.error('❌ Error actualizando productos:', error);
  } finally {
    mongoose.connection.close();
    console.log('🔌 Conexión cerrada');
  }
}