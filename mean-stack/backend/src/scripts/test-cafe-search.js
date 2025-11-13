require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('../models/product');

async function testCafeSearch() {
  try {
    // Conectar a MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/frankos-style');
    console.log('✅ Conectado a MongoDB');

    console.log('\n🔍 BUSCANDO PRODUCTOS CON "CAFÉ" O "MARRÓN"...\n');

    // Buscar por mainColor
    console.log('1️⃣ Buscando por mainColor con variaciones:');
    const colorVariations = ['cafe', 'café', 'marron', 'marrón', 'brown', 'camel', 'coffee'];
    
    for (const color of colorVariations) {
      const products = await Product.find({
        mainColor: new RegExp(color, 'i'),
        stock: { $gt: 0 }
      });
      console.log(`   "${color}": ${products.length} productos encontrados`);
      if (products.length > 0) {
        products.forEach(p => console.log(`      - ${p.name} (mainColor: ${p.mainColor})`));
      }
    }

    // Buscar en campo colors (array)
    console.log('\n2️⃣ Buscando en array "colors":');
    for (const color of colorVariations) {
      const products = await Product.find({
        colors: { $regex: new RegExp(color, 'i') },
        stock: { $gt: 0 }
      });
      console.log(`   "${color}": ${products.length} productos encontrados`);
      if (products.length > 0) {
        products.forEach(p => console.log(`      - ${p.name} (colors: ${p.colors})`));
      }
    }

    // Buscar en nombre
    console.log('\n3️⃣ Buscando en "name":');
    for (const color of colorVariations) {
      const products = await Product.find({
        name: new RegExp(color, 'i'),
        stock: { $gt: 0 }
      });
      console.log(`   "${color}": ${products.length} productos encontrados`);
      if (products.length > 0) {
        products.forEach(p => console.log(`      - ${p.name}`));
      }
    }

    // Buscar en descripción
    console.log('\n4️⃣ Buscando en "description":');
    for (const color of colorVariations) {
      const products = await Product.find({
        description: new RegExp(color, 'i'),
        stock: { $gt: 0 }
      });
      console.log(`   "${color}": ${products.length} productos encontrados`);
      if (products.length > 0) {
        products.forEach(p => console.log(`      - ${p.name} (desc contiene "${color}")`));
      }
    }

    // Búsqueda combinada (como hace la función mejorada)
    console.log('\n5️⃣ BÚSQUEDA COMBINADA (como getProductsByColor mejorada):');
    const searchPattern = colorVariations.join('|');
    const products = await Product.find({
      $or: [
        { mainColor: new RegExp(searchPattern, 'i') },
        { colors: { $regex: new RegExp(searchPattern, 'i') } },
        { name: new RegExp(searchPattern, 'i') },
        { description: new RegExp(searchPattern, 'i') }
      ],
      stock: { $gt: 0 }
    }).limit(10);

    console.log(`\n✅ TOTAL ENCONTRADOS: ${products.length} productos\n`);
    products.forEach((p, i) => {
      console.log(`${i + 1}. "${p.name}"`);
      console.log(`   💰 $${p.price.toLocaleString('es-CL')}`);
      console.log(`   🎨 mainColor: ${p.mainColor}`);
      console.log(`   🎨 colors: ${p.colors}`);
      console.log(`   📦 stock: ${p.stock}`);
      console.log('');
    });

    // También mostrar todos los colores disponibles
    console.log('\n📊 RESUMEN DE COLORES DISPONIBLES EN LA BD:');
    const allColors = await Product.distinct('mainColor', { stock: { $gt: 0 } });
    console.log('Colores únicos:', allColors.sort());

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n👋 Desconectado de MongoDB');
  }
}

testCafeSearch();
