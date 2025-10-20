require('dotenv').config({ path: '../../.env' });
const mongoose = require('mongoose');
const Product = require('../models/product');

// Conectar a MongoDB
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/mean-stack-db';

mongoose.connect(MONGODB_URI).then(() => {
  console.log('✅ Conectado a MongoDB');
  updateProductStructure();
}).catch(err => {
  console.error('❌ Error conectando a MongoDB:', err);
});

// Estructura técnica completa para cada producto
const productTechnicalData = {
  "Traje de Caballero Gris Claro Premium": {
    // Datos técnicos
    sizes: ["48", "50", "52", "54"],
    sizesText: "48 – 54 (S – XL)",
    measurements: {
      length: "72 cm",
      shoulders: "46 cm",
      waist: "92 cm"
    },
    colors: ["Gris Claro", "Burdeos", "Negro"],
    mainColor: "Gris Claro",
    productType: "Traje Completo",
    eventTypes: ["Bodas", "Galas", "Eventos Formales"],
    gender: "Masculino",
    cut: "Moderno Slim Fit",
    includes: [
      "Saco",
      "Pantalón", 
      "Chaleco",
      "Camisa Blanca",
      "Corbata Lazo Burdeos",
      "Pañuelo Blanco",
      "Flor Azul Eléctrico",
      "Prendedor con Cadena"
    ],
    material: "Mezcla premium de algodón y poliéster",
    tags: ["elegante", "slimfit", "formal", "frankosstyle", "modamasculina", "boda", "traje", "grisclaro", "premium", "eventos"],
    featured: true,
    available: true
  },

  "Traje de Caballero Burdeos Ejecutivo": {
    sizes: ["48", "50", "52", "54"],
    sizesText: "48 – 54 (S – XL)",
    measurements: {
      length: "73 cm",
      shoulders: "47 cm", 
      waist: "94 cm"
    },
    colors: ["Burdeos", "Negro", "Blanco", "Azul Marino"],
    mainColor: "Burdeos",
    productType: "Traje Completo",
    eventTypes: ["Recepciones", "Galas", "Cenas Formales"],
    gender: "Masculino",
    cut: "Moderno Ejecutivo",
    includes: [
      "Saco con Solapas Satinadas",
      "Pantalón",
      "Chaleco Blanco",
      "Camisa Azul Marino",
      "Corbata Blanca",
      "Pañuelo Blanco",
      "Prendedor Plateado"
    ],
    material: "Tejido premium con acabados de lujo",
    tags: ["elegante", "ejecutivo", "formal", "frankosstyle", "modamasculina", "burdeos", "traje", "gala", "lujo", "distinction"],
    featured: true,
    available: true
  },

  "Traje de Caballero Azul Eléctrico Fashion": {
    sizes: ["48", "50", "52", "54"],
    sizesText: "48 – 54 (S – XL)",
    measurements: {
      length: "71 cm",
      shoulders: "45 cm",
      waist: "90 cm"
    },
    colors: ["Azul Eléctrico", "Gris", "Negro", "Rojo"],
    mainColor: "Azul Eléctrico",
    productType: "Traje Completo",
    eventTypes: ["Eventos Sociales", "Fiestas", "Celebraciones"],
    gender: "Masculino",
    cut: "Slim Fit Contemporáneo",
    includes: [
      "Saco",
      "Pantalón",
      "Chaleco Gris",
      "Camisa Negra",
      "Corbata Roja",
      "Pañuelo Decorativo"
    ],
    material: "Mezcla moderna resistente y cómoda",
    tags: ["elegante", "slimfit", "moderno", "frankosstyle", "modamasculina", "azulelectrico", "traje", "fiesta", "audaz", "style"],
    featured: true,
    available: true
  },

  "Traje de Caballero Azul Marino Clásico": {
    sizes: ["48", "50", "52", "54"],
    sizesText: "48 – 54 (S – XL)",
    measurements: {
      length: "72 cm",
      shoulders: "46 cm",
      waist: "91 cm"
    },
    colors: ["Azul Marino", "Gris", "Burdeos", "Vino"],
    mainColor: "Azul Marino",
    productType: "Traje Completo",
    eventTypes: ["Oficina", "Cenas Formales", "Reuniones"],
    gender: "Masculino",
    cut: "Slim Fit Clásico",
    includes: [
      "Saco",
      "Pantalón",
      "Chaleco a Cuadros",
      "Camisa Burdeos",
      "Corbata Vino",
      "Pañuelo Decorativo"
    ],
    material: "Tejido clásico de alta calidad",
    tags: ["elegante", "slimfit", "clasico", "frankosstyle", "modamasculina", "azulmarino", "traje", "oficina", "formal", "refinado"],
    featured: false,
    available: true
  },

  "Traje de Caballero Rojo Statement": {
    sizes: ["48", "50", "52", "54"],
    sizesText: "48 – 54 (S – XL)",
    measurements: {
      length: "73 cm",
      shoulders: "47 cm",
      waist: "93 cm"
    },
    colors: ["Rojo", "Negro", "Burdeos", "Azul Eléctrico"],
    mainColor: "Rojo",
    productType: "Traje Completo",
    eventTypes: ["Fiestas", "Recepciones", "Eventos Especiales"],
    gender: "Masculino",
    cut: "Slim Fit Atrevido",
    includes: [
      "Saco con Solapas Negras",
      "Pantalón",
      "Chaleco Negro",
      "Camisa Burdeos",
      "Corbata Geométrica",
      "Pañuelo Azul Eléctrico"
    ],
    material: "Tejido de alta gama con acabados especiales",
    tags: ["elegante", "slimfit", "atrevido", "frankosstyle", "modamasculina", "rojo", "traje", "fiesta", "statement", "seguridad"],
    featured: true,
    available: true
  },

  "Traje de Caballero Gris Executive": {
    sizes: ["48", "50", "52", "54"],
    sizesText: "48 – 54 (S – XL)",
    measurements: {
      length: "72 cm",
      shoulders: "46 cm",
      waist: "92 cm"
    },
    colors: ["Gris", "Negro", "Blanco", "Rojo"],
    mainColor: "Gris",
    productType: "Traje Completo",
    eventTypes: ["Recepciones", "Eventos Corporativos", "Fiestas"],
    gender: "Masculino",
    cut: "Moderno Executive",
    includes: [
      "Saco con Solapas Satinadas",
      "Pantalón",
      "Chaleco a Cuadros",
      "Camisa Blanca",
      "Corbata Roja",
      "Pañuelo Rojo"
    ],
    material: "Mezcla premium con textura refinada",
    tags: ["elegante", "executive", "moderno", "frankosstyle", "modamasculina", "gris", "traje", "corporativo", "profesional", "distinguished"],
    featured: false,
    available: true
  },

  "Traje de Caballero Burdeos Luxury": {
    sizes: ["48", "50", "52", "54"],
    sizesText: "48 – 54 (S – XL)",
    measurements: {
      length: "74 cm",
      shoulders: "47 cm",
      waist: "94 cm"
    },
    colors: ["Burdeos", "Negro", "Blanco", "Azul Marino", "Azul Eléctrico"],
    mainColor: "Burdeos",
    productType: "Traje Completo",
    eventTypes: ["Bodas", "Recepciones VIP", "Galas"],
    gender: "Masculino",
    cut: "Slim Fit Luxury",
    includes: [
      "Saco con Solapas Satinadas",
      "Pantalón",
      "Chaleco Blanco",
      "Camisa Azul Marino",
      "Corbata Blanca",
      "Pañuelo Azul Eléctrico",
      "Prendedor Plateado con Cadena"
    ],
    material: "Tejidos de lujo importados, acabados artesanales",
    tags: ["elegante", "slimfit", "luxury", "frankosstyle", "modamasculina", "burdeos", "traje", "boda", "vip", "exclusivo", "premium"],
    featured: true,
    available: true
  }
};

async function updateProductStructure() {
  try {
    console.log('🔄 Actualizando estructura técnica completa de productos...');
    console.log('='.repeat(60));
    
    const products = await Product.find({});
    let updated = 0;
    
    for (const product of products) {
      const techData = productTechnicalData[product.name];
      if (techData) {
        // Crear el objeto de actualización con todos los campos técnicos
        const updateData = {
          // Campos técnicos nuevos
          sizes: techData.sizes,
          sizesText: techData.sizesText,
          measurements: techData.measurements,
          colors: techData.colors,
          mainColor: techData.mainColor,
          productType: techData.productType,
          eventTypes: techData.eventTypes,
          gender: techData.gender,
          cut: techData.cut,
          includes: techData.includes,
          material: techData.material,
          tags: techData.tags,
          featured: techData.featured,
          available: techData.available,
          
          // Campos de organización
          subcategory: techData.cut, // Ejemplo: "Slim Fit", "Executive"
          occasion: techData.eventTypes[0], // Ocasión principal
          priceRange: getPriceRange(product.price),
          
          // Campos de marketing
          isNew: false,
          isPopular: techData.featured,
          isExclusive: techData.material.includes('lujo') || techData.material.includes('importados'),
          
          // Timestamps
          updatedAt: new Date()
        };
        
        await Product.findByIdAndUpdate(product._id, updateData);
        
        console.log(`✅ ${product.name}`);
        console.log(`   📏 Tallas: ${techData.sizesText}`);
        console.log(`   🎨 Color principal: ${techData.mainColor}`);
        console.log(`   🎯 Tipo: ${techData.productType}`);
        console.log(`   👔 Corte: ${techData.cut}`);
        console.log(`   🎪 Eventos: ${techData.eventTypes.join(', ')}`);
        console.log(`   🏷️  Tags: ${techData.tags.slice(0, 5).join(', ')}...`);
        console.log(`   💰 Rango precio: ${getPriceRange(product.price)}`);
        console.log(`   ⭐ Destacado: ${techData.featured ? 'SÍ' : 'NO'}`);
        console.log('   ' + '─'.repeat(50));
        
        updated++;
      } else {
        console.log(`⚠️  No se encontró estructura técnica para: ${product.name}`);
      }
    }
    
    console.log(`\n📊 RESUMEN DE ESTRUCTURACIÓN:`);
    console.log(`   • Productos estructurados: ${updated}/${products.length}`);
    console.log(`   • Campos técnicos agregados: 20+ por producto`);
    console.log(`   • Base de datos optimizada para búsquedas avanzadas`);
    
    // Mostrar la nueva estructura
    console.log(`\n🔍 VERIFICANDO NUEVA ESTRUCTURA:`);
    const updatedProducts = await Product.find({}).limit(2);
    
    updatedProducts.forEach((product, index) => {
      console.log(`\n${index + 1}. ESTRUCTURA DE: ${product.name}`);
      console.log(`   📦 Datos básicos:`);
      console.log(`      • ID: ${product._id}`);
      console.log(`      • Precio: $${product.price}`);
      console.log(`      • Stock: ${product.stock}`);
      console.log(`      • Categoría: ${product.category}`);
      
      console.log(`   📏 Datos técnicos:`);
      console.log(`      • Tallas: ${product.sizesText || 'No definido'}`);
      console.log(`      • Color: ${product.mainColor || 'No definido'}`);
      console.log(`      • Corte: ${product.cut || 'No definido'}`);
      console.log(`      • Tipo: ${product.productType || 'No definido'}`);
      
      console.log(`   🎯 Categorización:`);
      console.log(`      • Eventos: ${product.eventTypes ? product.eventTypes.join(', ') : 'No definido'}`);
      console.log(`      • Subcategoría: ${product.subcategory || 'No definido'}`);
      console.log(`      • Rango precio: ${product.priceRange || 'No definido'}`);
      
      console.log(`   🏷️  Marketing:`);
      console.log(`      • Destacado: ${product.featured ? 'SÍ' : 'NO'}`);
      console.log(`      • Popular: ${product.isPopular ? 'SÍ' : 'NO'}`);
      console.log(`      • Exclusivo: ${product.isExclusive ? 'SÍ' : 'NO'}`);
      console.log(`      • Tags: ${product.tags ? product.tags.length + ' tags' : 'Sin tags'}`);
    });
    
  } catch (error) {
    console.error('❌ Error estructurando productos:', error);
  } finally {
    mongoose.disconnect();
    console.log('\n✅ Estructuración completada. Base de datos desconectada.');
    process.exit(0);
  }
}

// Función auxiliar para determinar rango de precios
function getPriceRange(price) {
  if (price < 150000) return "Económico";
  if (price < 250000) return "Medio";
  if (price < 350000) return "Premium";
  return "Luxury";
}

// Ejecutar la estructuración
updateProductStructure();