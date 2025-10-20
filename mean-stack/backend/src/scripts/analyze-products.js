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
  analyzeProducts();
}).catch(err => {
  console.error('❌ Error conectando a MongoDB:', err);
});

async function analyzeProducts() {
  try {
    console.log('\n📊 ANÁLISIS COMPLETO DE PRODUCTOS EN LA BASE DE DATOS');
    console.log('='.repeat(60));
    
    // Obtener todos los productos
    const products = await Product.find({});
    console.log(`\n📦 TOTAL DE PRODUCTOS: ${products.length}\n`);
    
    if (products.length === 0) {
      console.log('❌ No hay productos en la base de datos');
      process.exit(0);
    }
    
    // Análisis por categorías
    const categories = {};
    const prices = [];
    const stockLevels = [];
    let withImages = 0;
    let withDescriptions = 0;
    
    console.log('📋 LISTADO COMPLETO DE PRODUCTOS:');
    console.log('-'.repeat(60));
    
    products.forEach((product, index) => {
      console.log(`\n${index + 1}. 📦 PRODUCTO: ${product.name}`);
      console.log(`   🏷️  ID: ${product._id}`);
      console.log(`   🎯 Categoría: ${product.category || 'SIN CATEGORÍA'}`);
      console.log(`   💰 Precio: $${product.price || 'NO DEFINIDO'}`);
      console.log(`   📦 Stock: ${product.stock || 0} unidades`);
      console.log(`   🖼️  Imagen: ${product.image || product.imageUrl || 'NO TIENE'}`);
      console.log(`   📝 Descripción: ${product.description ? `"${product.description}"` : 'SIN DESCRIPCIÓN'}`);
      
      // Mostrar información técnica adicional
      console.log(`   🎨 Color principal: ${product.mainColor || 'NO DEFINIDO'}`);
      console.log(`   📏 Tipo de producto: ${product.productType || 'NO DEFINIDO'}`);
      console.log(`   ✂️  Corte: ${product.cut || 'NO DEFINIDO'}`);
      console.log(`   🏷️  Rango de precio: ${product.priceRange || 'NO DEFINIDO'}`);
      console.log(`   📐 Tallas: ${product.sizesText || 'NO DEFINIDO'}`);
      console.log(`   🧵 Material: ${product.material || 'NO DEFINIDO'}`);
      console.log(`   🎪 Eventos: ${product.eventTypes && product.eventTypes.length > 0 ? product.eventTypes.join(', ') : 'NO DEFINIDO'}`);
      console.log(`   📦 Incluye: ${product.includes && product.includes.length > 0 ? product.includes.join(', ') : 'NO DEFINIDO'}`);
      console.log(`   🎨 Colores: ${product.colors && product.colors.length > 0 ? product.colors.join(', ') : 'NO DEFINIDO'}`);
      console.log(`   📅 Creado: ${product.createdAt || 'No disponible'}`);
      
      // Recopilar estadísticas
      if (product.category) {
        categories[product.category] = (categories[product.category] || 0) + 1;
      }
      
      if (product.price) {
        prices.push(product.price);
      }
      
      if (product.stock) {
        stockLevels.push(product.stock);
      }
      
      if (product.image || product.imageUrl) {
        withImages++;
      }
      
      if (product.description && product.description.trim()) {
        withDescriptions++;
      }
      
      console.log('   ' + '─'.repeat(50));
    });
    
    // Resumen estadístico
    console.log('\n📈 RESUMEN ESTADÍSTICO:');
    console.log('='.repeat(40));
    
    console.log(`\n🏷️  CATEGORÍAS (${Object.keys(categories).length} diferentes):`);
    Object.entries(categories)
      .sort(([,a], [,b]) => b - a)
      .forEach(([category, count]) => {
        console.log(`   • ${category}: ${count} productos`);
      });
    
    if (prices.length > 0) {
      const minPrice = Math.min(...prices);
      const maxPrice = Math.max(...prices);
      const avgPrice = prices.reduce((a, b) => a + b, 0) / prices.length;
      
      console.log(`\n💰 PRECIOS:`);
      console.log(`   • Mínimo: $${minPrice}`);
      console.log(`   • Máximo: $${maxPrice}`);
      console.log(`   • Promedio: $${avgPrice.toFixed(2)}`);
      console.log(`   • Productos con precio: ${prices.length}/${products.length}`);
    }
    
    if (stockLevels.length > 0) {
      const totalStock = stockLevels.reduce((a, b) => a + b, 0);
      const avgStock = totalStock / stockLevels.length;
      const inStock = stockLevels.filter(s => s > 0).length;
      
      console.log(`\n📦 INVENTARIO:`);
      console.log(`   • Stock total: ${totalStock} unidades`);
      console.log(`   • Stock promedio: ${avgStock.toFixed(1)} unidades`);
      console.log(`   • Productos en stock: ${inStock}/${products.length}`);
      console.log(`   • Productos sin stock: ${products.length - inStock}`);
    }
    
    console.log(`\n🖼️  IMÁGENES:`);
    console.log(`   • Con imagen: ${withImages}/${products.length} (${(withImages/products.length*100).toFixed(1)}%)`);
    console.log(`   • Sin imagen: ${products.length - withImages}/${products.length} (${((products.length - withImages)/products.length*100).toFixed(1)}%)`);
    
    console.log(`\n📝 DESCRIPCIONES:`);
    console.log(`   • Con descripción: ${withDescriptions}/${products.length} (${(withDescriptions/products.length*100).toFixed(1)}%)`);
    console.log(`   • Sin descripción: ${products.length - withDescriptions}/${products.length} (${((products.length - withDescriptions)/products.length*100).toFixed(1)}%)`);
    
    // Detectar problemas
    console.log(`\n⚠️  PROBLEMAS DETECTADOS:`);
    const issues = [];
    
    if (withImages < products.length * 0.8) {
      issues.push(`• Más del 20% de productos sin imagen`);
    }
    
    if (withDescriptions < products.length * 0.7) {
      issues.push(`• Más del 30% de productos sin descripción`);
    }
    
    const productsWithoutPrice = products.filter(p => !p.price || p.price <= 0).length;
    if (productsWithoutPrice > 0) {
      issues.push(`• ${productsWithoutPrice} productos sin precio válido`);
    }
    
    const productsOutOfStock = products.filter(p => !p.stock || p.stock <= 0).length;
    if (productsOutOfStock > products.length * 0.3) {
      issues.push(`• Más del 30% de productos sin stock`);
    }
    
    if (issues.length > 0) {
      issues.forEach(issue => console.log(`   ${issue}`));
    } else {
      console.log(`   ✅ No se detectaron problemas graves`);
    }
    
    console.log('\n' + '='.repeat(60));
    console.log('✅ Análisis completado');
    
  } catch (error) {
    console.error('❌ Error analizando productos:', error);
  } finally {
    mongoose.disconnect();
    process.exit(0);
  }
}