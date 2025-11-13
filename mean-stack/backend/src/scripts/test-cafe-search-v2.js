require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('../models/product');

// Simular la función mejorada getProductsByColor
async function getProductsByColor(color) {
  try {
    const colorSynonyms = {
      'cafe': ['cafe', 'café', 'brown', 'marron', 'marrón', 'coffee', 'camel'],
      'marron': ['marron', 'marrón', 'cafe', 'café', 'brown', 'camel'],
      'azul': ['azul', 'blue', 'azul marino', 'navy', 'azul electrico'],
      'gris': ['gris', 'gray', 'grey', 'plomo', 'gris claro'],
      'negro': ['negro', 'black'],
      'blanco': ['blanco', 'white', 'ivory', 'crema'],
      'rojo': ['rojo', 'red', 'vino', 'granate', 'burdeos'],
      'verde': ['verde', 'green', 'oliva'],
      'amarillo': ['amarillo', 'yellow', 'dorado', 'gold'],
      'morado': ['morado', 'purple', 'violeta', 'lila'],
      'rosa': ['rosa', 'pink'],
      'beige': ['beige', 'beige', 'arena', 'crema']
    };
    
    const normalizedColor = color.toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
    
    let searchTerms = [color, normalizedColor];
    for (const [key, synonyms] of Object.entries(colorSynonyms)) {
      if (synonyms.some(s => s.toLowerCase() === normalizedColor)) {
        searchTerms = synonyms;
        console.log(`🎨 Buscando color "${color}" con sinónimos:`, searchTerms);
        break;
      }
    }
    
    const escapedTerms = searchTerms.map(term => term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
    const colorPattern = escapedTerms.join('|');
    
    console.log(`🔍 Pattern de búsqueda: /${colorPattern}/i`);
    
    const products = await Product.find({
      $or: [
        { mainColor: new RegExp(colorPattern, 'i') },
        { colors: { $regex: new RegExp(colorPattern, 'i') } },
        { name: new RegExp(colorPattern, 'i') },
        { description: new RegExp(colorPattern, 'i') }
      ],
      stock: { $gt: 0 }
    }).limit(3);
    
    console.log(`✅ Encontrados ${products.length} productos`);
    return products;
  } catch (error) {
    console.error('❌ Error:', error);
    return [];
  }
}

async function testSearch() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/frankos-style');
    console.log('✅ Conectado a MongoDB\n');

    // Probar diferentes variaciones de "cafe"
    const testQueries = ['cafe', 'café', 'kafe', 'caffe', 'cafee'];
    
    for (const query of testQueries) {
      console.log(`\n${'='.repeat(50)}`);
      console.log(`🧪 PROBANDO: "${query}"`);
      console.log('='.repeat(50));
      
      const products = await getProductsByColor(query);
      
      if (products.length > 0) {
        products.forEach((p, i) => {
          console.log(`\n${i + 1}. "${p.name}"`);
          console.log(`   💰 $${p.price.toLocaleString('es-CL')}`);
          console.log(`   🎨 mainColor: ${p.mainColor}`);
          console.log(`   🎨 colors: ${p.colors}`);
          console.log(`   📦 stock: ${p.stock}`);
        });
      } else {
        console.log('❌ No se encontraron productos');
      }
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n\n👋 Desconectado de MongoDB');
  }
}

testSearch();
