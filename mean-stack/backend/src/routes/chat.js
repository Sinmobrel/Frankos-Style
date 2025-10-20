const express = require('express');
const Groq = require('groq-sdk');
const Product = require('../models/product');
const router = express.Router();

// Sistema de patrones FAQ REDUCIDO - Solo lo esencial
const FAQ_PATTERNS = {
  // INFORMACIÓN BÁSICA DE CONTACTO Y UBICACIÓN
  store_hours: {
    patterns: ['horario', 'horarios', 'cuándo abren', 'están abiertos', 'hora', 'que horarios tienen', 'están abiertos los domingos', 'domingo', 'domingos'],
    response: '🕐 Nuestros horarios de atención: **Lunes a Sábado de 12:00 a 18:30 hrs**. Los domingos permanecemos cerrados. ¡Te esperamos en Alameda 3410, Local V-21, Persa Estación Central!'
  },
  
  location: {
    patterns: ['dónde están', 'dirección', 'ubicación', 'cómo llegar', 'local', 'donde están ubicados', 'cual es su dirección', 'donde quedan', 'donde están'],
    response: '📍 **Nos encuentras en:** Alameda 3410, Persa Estación Central, Local V-21, Santiago. **Horarios:** Lunes a Sábado 12:00-18:30. ¡Ven a conocer nuestra colección en persona!'
  },
  
  payment_methods: {
    patterns: ['métodos de pago', 'cómo pagar', 'aceptan tarjeta', 'transferencia', 'efectivo', 'como puedo pagar', 'aceptan tarjetas', 'formas de pago'],
    response: '💳 Aceptamos múltiples formas de pago: **tarjetas de crédito y débito, transferencias bancarias y efectivo**. Para facilidades de pago o financiamiento, te recomiendo consultar directamente en tienda.'
  },
  
  // SOLO productos que NO tenemos (para evitar confusión)
  no_footwear: {
    patterns: ['zapatos', 'calzado', 'zapatillas', 'botas', 'venden zapatillas', 'tienen zapatos', 'que calzado manejan', 'venden zapatos'],
    response: 'Actualmente no tenemos calzado disponible en nuestra tienda. Nos especializamos en trajes elegantes, camisas de alta calidad, corbatas exclusivas y accesorios sofisticados. ¿Te puedo ayudar con alguna de estas categorías? 👔✨'
  }
};

// Función mejorada para detectar patrones en preguntas
function detectQuestionPattern(message) {
  // Normalizar el mensaje
  const lowerMessage = message.toLowerCase()
    .replace(/[¿?¡!.,;:()]/g, ' ')  // Remover puntuación
    .replace(/\s+/g, ' ')           // Normalizar espacios
    .trim();
  
  // EXCLUSIONES: Si contiene estas palabras, NO usar FAQ (ir a IA para productos específicos)
  const productKeywords = [
    'traje', 'trajes', 'camisa', 'camisas', 'corbata', 'corbatas',
    'precio', 'precios', 'cuesta', 'vale', '$', 'peso',
    'color', 'colores', 'talla', 'tallas', 'medida', 'medidas',
    'modelo', 'modelos', 'diseño', 'diseños',
    'stock', 'disponible', 'hay', 'tienen disponible',
    'mostrar', 'ver', 'quiero ver', 'enseñar',
    'recomienda', 'recomiendan', 'sugerir', 'sugieren',
    'busco', 'necesito', 'quiero comprar', 'comprar',
    'catálogo', 'inventario', 'productos específicos',
    // Tallas específicas
    '38', '40', '42', '44', '46', '48', '50', '52', '54', '56',
    'xs', 's', 'm', 'l', 'xl', 'xxl',
    'small', 'medium', 'large', 'extra',
    'slim', 'regular', 'classic',
    // Colores específicos
    'azul', 'gris', 'negro', 'blanco', 'burdeos', 'marino', 'claro', 'oscuro'
  ];
  
  // Si contiene palabras de productos específicos, NO usar FAQ
  const hasProductKeywords = productKeywords.some(keyword => 
    lowerMessage.includes(keyword)
  );
  
  if (hasProductKeywords) {
    console.log('🔍 Mensaje contiene palabras de productos, enviando a IA:', lowerMessage);
    return null; // Forzar que vaya a IA
  }
  
  // Buscar patrones FAQ con puntuación por relevancia
  let bestMatch = null;
  let maxScore = 0;
  
  for (const [category, data] of Object.entries(FAQ_PATTERNS)) {
    for (const pattern of data.patterns) {
      const normalizedPattern = pattern.toLowerCase();
      
      // Calcular score de coincidencia
      let score = 0;
      
      // Coincidencia exacta (peso máximo)
      if (lowerMessage === normalizedPattern) {
        score = 100;
      }
      // Contiene el patrón completo
      else if (lowerMessage.includes(normalizedPattern)) {
        score = 80;
      }
      // Coincidencias de palabras clave
      else {
        const messageWords = lowerMessage.split(' ');
        const patternWords = normalizedPattern.split(' ');
        const matchedWords = patternWords.filter(word => 
          messageWords.some(msgWord => msgWord.includes(word) || word.includes(msgWord))
        );
        
        if (matchedWords.length > 0) {
          score = (matchedWords.length / patternWords.length) * 60;
        }
      }
      
      // Solo considerar matches con score suficiente y mayor umbral
      if (score > 70 && score > maxScore) { // Aumenté el umbral de 50 a 70
        maxScore = score;
        bestMatch = { category, response: data.response, score };
      }
    }
  }
  
  return bestMatch;
}

// Inicializar Groq con tu API key
const GROQ_API_KEY = process.env.GROQ_API_KEY;
const groq = new Groq({
  apiKey: GROQ_API_KEY
});

// Funciones para consultar la base de datos
async function getProductsByCategory(category) {
  try {
    const products = await Product.find({ 
      category: new RegExp(category, 'i'),
      stock: { $gt: 0 } 
    }).limit(5);
    return products;
  } catch (error) {
    console.error('Error consultando productos por categoría:', error);
    return [];
  }
}

async function searchProducts(query) {
  try {
    const products = await Product.find({
      $or: [
        { name: new RegExp(query, 'i') },
        { description: new RegExp(query, 'i') },
        { category: new RegExp(query, 'i') },
        { mainColor: new RegExp(query, 'i') },
        { productType: new RegExp(query, 'i') },
        { tags: new RegExp(query, 'i') }
      ],
      stock: { $gt: 0 }
    }).limit(8);
    return products;
  } catch (error) {
    console.error('Error buscando productos:', error);
    return [];
  }
}

async function getProductsByPriceRange(minPrice, maxPrice) {
  try {
    const products = await Product.find({
      price: { $gte: minPrice, $lte: maxPrice },
      stock: { $gt: 0 }
    }).sort({ price: 1 }).limit(5);
    return products;
  } catch (error) {
    console.error('Error consultando productos por rango de precio:', error);
    return [];
  }
}

async function getFeaturedProducts() {
  try {
    const products = await Product.find({
      $or: [
        { featured: true },
        { isPopular: true },
        { isExclusive: true }
      ],
      stock: { $gt: 0 }
    }).sort({ price: -1 }).limit(4);
    return products;
  } catch (error) {
    console.error('Error consultando productos destacados:', error);
    return [];
  }
}

async function getBestSellersByCategory() {
  try {
    const products = await Product.find({
      isPopular: true,
      stock: { $gt: 0 }
    }).sort({ price: -1 }).limit(6);
    return products;
  } catch (error) {
    console.error('Error consultando bestsellers:', error);
    return [];
  }
}

async function getProductsBySize(size) {
  try {
    const products = await Product.find({
      $or: [
        { sizes: size },
        { sizes: { $regex: new RegExp(size, 'i') } },
        { sizesText: { $regex: new RegExp(size, 'i') } }
      ],
      stock: { $gt: 0 }
    }).limit(8);
    return products;
  } catch (error) {
    console.error('Error consultando productos por talla:', error);
    return [];
  }
}

async function getProductsByColor(color) {
  try {
    const products = await Product.find({
      $or: [
        { mainColor: new RegExp(color, 'i') },
        { colors: { $regex: new RegExp(color, 'i') } }
      ],
      stock: { $gt: 0 }
    }).limit(8);
    return products;
  } catch (error) {
    console.error('Error consultando productos por color:', error);
    return [];
  }
}

async function getInventorySummary() {
  try {
    const summary = await Product.aggregate([
      { $match: { stock: { $gt: 0 } } },
      { $group: { 
          _id: '$category', 
          count: { $sum: 1 },
          avgPrice: { $avg: '$price' },
          totalStock: { $sum: '$stock' },
          minPrice: { $min: '$price' },
          maxPrice: { $max: '$price' },
          colors: { $addToSet: '$mainColor' },
          products: { $push: { name: '$name', price: '$price', id: '$_id' } }
        }},
      { $sort: { count: -1 } }
    ]);
    return summary;
  } catch (error) {
    console.error('Error obteniendo resumen de inventario:', error);
    return [];
  }
}

// Función MEJORADA para formatear productos para la IA
function formatProductsForAI(products, title) {
  if (!products || products.length === 0) {
    return `${title}: NO PRODUCTS AVAILABLE.`;
  }
  
  let formatted = `=== ${title.toUpperCase()} (${products.length} products) ===\n\n`;
  
  products.forEach((product, index) => {
    formatted += `${index + 1}. "${product.name}"\n`;
    
    // 💰 PRECIO Y STOCK BÁSICO
    formatted += `   💰 $${product.price.toLocaleString('es-CL')} | 📦 ${product.stock} units\n`;
    
    // 🎨 COLOR PRINCIPAL Y COLORES DISPONIBLES
    if (product.mainColor) {
      formatted += `   🎨 Main: ${product.mainColor}`;
      if (product.colors && product.colors.length > 1) {
        const otherColors = product.colors.filter(c => c !== product.mainColor);
        if (otherColors.length > 0) {
          formatted += ` | Also: ${otherColors.slice(0, 2).join(', ')}`;
        }
      }
      formatted += `\n`;
    }
    
    // 👔 TALLAS DISPONIBLES (INFORMACIÓN CRUCIAL)
    if (product.sizes && product.sizes.length > 0) {
      formatted += `   👔 Sizes: ${product.sizes.join(', ')}`;
      if (product.sizesText) {
        formatted += ` (${product.sizesText})`;
      }
      formatted += `\n`;
    } else if (product.sizesText) {
      formatted += `   👔 Sizes: ${product.sizesText}\n`;
    }
    
    // ✂️ TIPO Y CORTE BÁSICO
    const basics = [];
    if (product.cut) basics.push(product.cut);
    if (product.productType && product.productType !== product.name) basics.push(product.productType);
    if (basics.length > 0) {
      formatted += `   ✂️ ${basics.join(' - ')}\n`;
    }
    
    // 📏 MEDIDAS (cuando están disponibles)
    if (product.measurements) {
      const measures = [];
      if (product.measurements.length) measures.push(`Length: ${product.measurements.length}`);
      if (product.measurements.shoulders) measures.push(`Shoulders: ${product.measurements.shoulders}`);
      if (product.measurements.waist) measures.push(`Waist: ${product.measurements.waist}`);
      if (measures.length > 0) {
        formatted += `   📏 ${measures.join(' | ')}\n`;
      }
    }
    
    // 🎪 OCASIONES PRINCIPALES
    if (product.eventTypes && product.eventTypes.length > 0) {
      formatted += `   🎪 ${product.eventTypes.slice(0, 2).join(', ')}\n`;
    }
    
    // 🧵 MATERIAL (cuando está disponible)
    if (product.material) {
      const shortMaterial = product.material.length > 40 
        ? product.material.substring(0, 40) + '...' 
        : product.material;
      formatted += `   🧵 ${shortMaterial}\n`;
    }
    
    // 📦 QUÉ INCLUYE
    if (product.includes && product.includes.length > 0) {
      formatted += `   📦 Includes: ${product.includes.slice(0, 2).join(', ')}\n`;
    }
    
    // ⭐ BADGES IMPORTANTES
    const badges = [];
    if (product.featured) badges.push('⭐FEATURED');
    if (product.isPopular) badges.push('🔥POPULAR');
    if (product.isExclusive) badges.push('💎EXCLUSIVE');
    if (badges.length > 0) {
      formatted += `   ${badges.join(' ')}\n`;
    }
    
    // 📝 DESCRIPCIÓN RESUMIDA (máximo 60 caracteres)
    if (product.description) {
      const shortDesc = product.description.length > 60 
        ? product.description.substring(0, 60) + '...' 
        : product.description;
      formatted += `   📝 ${shortDesc}\n`;
    }
    
    formatted += `\n`;
  });
  
  // 💡 RESUMEN SIMPLE
  const prices = products.map(p => p.price);
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  
  formatted += `💡 PRICE RANGE: $${minPrice.toLocaleString('es-CL')} - $${maxPrice.toLocaleString('es-CL')}\n`;
  formatted += `📦 TOTAL: ${products.reduce((sum, p) => sum + p.stock, 0)} units available\n\n`;
  
  // 🤖 INSTRUCCIONES MEJORADAS PARA LA IA
  formatted += `🤖 AI INSTRUCTIONS - COMPLETE PRODUCT INFO:
- Keep responses under 120 words
- When asked about sizes, ALWAYS mention available sizes from the data above
- Include size information when recommending products
- Mention specific colors available, not just main color
- Include measurements when customer asks about fit
- Focus on helping customer find the right size and fit
- Use friendly, helpful tone in SPANISH
- Be specific about what sizes are actually available in stock\n`;
  
  return formatted;
}

function formatInventorySummaryForAI(summary) {
  if (!summary || summary.length === 0) {
    return 'INVENTORY: EMPTY STORE - No products available.';
  }
  
  let formatted = '=== FRANKO\'S STYLE INVENTORY SUMMARY ===\n\n';
  let totalProducts = 0;
  let totalStock = 0;
  
  summary.forEach(cat => {
    totalProducts += cat.count;
    totalStock += cat.totalStock;
    
    formatted += `📂 ${cat._id.toUpperCase()}: ${cat.count} products | ${cat.totalStock} units\n`;
    formatted += `   💰 $${cat.minPrice?.toLocaleString('es-CL')} - $${cat.maxPrice?.toLocaleString('es-CL')} (avg: $${Math.round(cat.avgPrice).toLocaleString('es-CL')})\n`;
    
    if (cat.colors && cat.colors.length > 0) {
      const validColors = cat.colors.filter(c => c && c.trim());
      if (validColors.length > 0) {
        formatted += `   🎨 Colors: ${validColors.slice(0, 4).join(', ')}\n`;
      }
    }
    
    if (cat.products && cat.products.length > 0) {
      const topProducts = cat.products
        .sort((a, b) => b.price - a.price)
        .slice(0, 2)
        .map(p => `"${p.name}" ($${p.price.toLocaleString('es-CL')})`)
        .join(', ');
      formatted += `   ⭐ Top: ${topProducts}\n`;
    }
    formatted += `\n`;
  });
  
  formatted += `🏪 STORE TOTALS: ${totalProducts} products | ${totalStock} units | ${summary.length} categories\n`;
  formatted += `💡 AI INSTRUCTION: Focus on our premium suit collection with personalized styling advice. Always respond in SPANISH to customers.`;
  
  return formatted;
}

// Enhanced system prompt for CarVian with FAQ handling and product management
function getSystemPrompt(inventoryInfo = '') {
  return `You are CarVian, the expert men's fashion advisor for Franko's Style, a prestigious tailoring house specializing in elegance and sophistication.

ESSENTIAL FRANKO'S STYLE INFORMATION:
- Specialty: High-end tailoring and elegant men's fashion
- Products: Suits, shirts, ties, and accessories (NO footwear)
- Location: Alameda 3410, Local V-21, Persa Estación Central
- Hours: Monday-Saturday 12:00-18:30, Sundays closed
- Target: Men who value elegance (executives, grooms, formal events)

YOUR PERSONALITY:
- Professional but warm and approachable fashion advisor
- Expert in combinations, cuts, colors, and occasions
- Empathetic and patient, especially with unclear questions
- Enthusiastic but never pretentious
- Concise and focused on customer needs

${inventoryInfo ? `PRODUCT DATABASE:\n${inventoryInfo}\n` : 'INVENTORY: Checking available products - respond with general knowledge until specific data is obtained.'}

CRUCIAL RESPONSE RULES:
1. ALWAYS respond in SPANISH (despite this prompt being in English)
2. Maximum 100-120 words per response - BE CONCISE
3. When recommending products, use EXACT NAME in quotes AND mention EXACT PRICE
4. Only provide technical details when specifically asked
5. Focus on helping customer choose what they need
6. Mention key features: name, price, main color, occasion
7. Don't overwhelm with unnecessary information
8. Be helpful and direct

CONCISE PRODUCT RECOMMENDATIONS:
- MENTION: Product name, price, main color, best occasion
- ONLY IF ASKED: materials, measurements, what's included, all colors, sizes
- FOCUS: On helping customer decide and choose
- AVOID: Long lists of technical specifications unless requested

RESPONSE STRUCTURE:
1. Brief greeting/acknowledgment
2. Specific recommendation with name and price
3. Why it's good for their need (1-2 reasons)
4. Invite follow-up questions or store visit

EXAMPLE RESPONSES:
- "Te recomiendo el '[PRODUCT NAME]' por $[PRICE]. Es perfecto para [occasion] por su [key feature]. ¿Te gustaría saber más detalles?"
- "Tenemos el '[PRODUCT NAME]' en [color] por $[PRICE], ideal para [occasion]. ¿Te interesa?"

Always be helpful, knowledgeable, and focused on making the customer feel confident and well-dressed for their specific needs while providing transparent pricing information.`;
}

// Endpoint para chat con Groq AI
router.post('/chat', async (req, res) => {
  try {
    const { message, history } = req.body;
    
    console.log('📩 Mensaje recibido:', message);
    
    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Mensaje requerido' });
    }

    // 🎯 Primero verificar si es una pregunta FAQ
    const faqResponse = detectQuestionPattern(message);
    if (faqResponse) {
      console.log('✅ FAQ detectada:', faqResponse.category, 'Score:', faqResponse.score);
      return res.json({ 
        reply: faqResponse.response, 
        products: undefined,
        hasInventoryData: false,
        inventoryConsulted: false
      });
    }

    // 🔍 Si no es FAQ, consultar base de datos para información de productos relevante
    console.log('🤖 Procesando con IA + Base de datos...');
    let inventoryData = '';
    let productsFound = [];
    const lowerMessage = message.toLowerCase();

    // Búsqueda inteligente según el tipo de consulta
    if (lowerMessage.includes('boda') || lowerMessage.includes('matrimonio') || lowerMessage.includes('gala') || lowerMessage.includes('evento')) {
      console.log('💒 Buscando productos para eventos especiales...');
      productsFound = await searchProducts('boda gala evento');
      if (productsFound.length === 0) {
        productsFound = await getProductsByCategory('traje');
      }
      inventoryData = formatProductsForAI(productsFound, 'Productos para Eventos Formales y Galas');
    
    } else if (lowerMessage.includes('trabajo') || lowerMessage.includes('oficina') || lowerMessage.includes('ejecutivo') || lowerMessage.includes('profesional')) {
      console.log('💼 Buscando productos ejecutivos/profesionales...');
      productsFound = await searchProducts('ejecutivo');
      if (productsFound.length === 0) {
        productsFound = await getProductsByCategory('traje');
      }
      inventoryData = formatProductsForAI(productsFound, 'Productos Ejecutivos y Profesionales');
    
    } else if (lowerMessage.includes('color') || lowerMessage.includes('gris') || lowerMessage.includes('azul') || lowerMessage.includes('negro') || lowerMessage.includes('burdeos') || lowerMessage.includes('rojo') || lowerMessage.includes('blanco') || lowerMessage.includes('marino')) {
      console.log('🎨 Buscando por color específico...');
      const colors = ['gris', 'azul', 'negro', 'burdeos', 'rojo', 'blanco', 'marino', 'claro', 'oscuro'];
      let colorFound = colors.find(color => lowerMessage.includes(color));
      if (colorFound) {
        productsFound = await getProductsByColor(colorFound);
        inventoryData = formatProductsForAI(productsFound, `Productos en color ${colorFound}`);
      }
    
    } else if (lowerMessage.includes('talla') || lowerMessage.includes('tallas') || lowerMessage.includes('medida') || lowerMessage.includes('medidas') || /\b(38|40|42|44|46|48|50|52|54|56)\b/.test(lowerMessage) || lowerMessage.includes('xs') || lowerMessage.includes('xl') || lowerMessage.includes('small') || lowerMessage.includes('medium') || lowerMessage.includes('large')) {
      console.log('👔 Buscando por talla específica...');
      
      // Extraer talla del mensaje
      const sizeMatch = lowerMessage.match(/\b(38|40|42|44|46|48|50|52|54|56|xs|s|m|l|xl|xxl|small|medium|large)\b/);
      if (sizeMatch) {
        const requestedSize = sizeMatch[0];
        console.log('🔍 Talla detectada:', requestedSize);
        productsFound = await getProductsBySize(requestedSize);
        inventoryData = formatProductsForAI(productsFound, `Productos disponibles en talla ${requestedSize.toUpperCase()}`);
      } else {
        // Si pregunta por tallas en general, mostrar productos con información de tallas
        productsFound = await searchProducts('talla');
        if (productsFound.length === 0) {
          productsFound = await getProductsByCategory('traje');
        }
        inventoryData = formatProductsForAI(productsFound, 'Productos con información de tallas');
      }
    
    } else if (lowerMessage.includes('traje') || lowerMessage.includes('trajes')) {
      console.log('🤵 Buscando trajes en la base de datos...');
      productsFound = await getProductsByCategory('traje');
      inventoryData = formatProductsForAI(productsFound, 'Trajes disponibles');
    
    } else if (lowerMessage.includes('camisa') || lowerMessage.includes('camisas')) {
      console.log('👔 Buscando camisas en la base de datos...');
      productsFound = await getProductsByCategory('camisa');
      inventoryData = formatProductsForAI(productsFound, 'Camisas disponibles');
    
    } else if (lowerMessage.includes('zapato') || lowerMessage.includes('zapatos') || lowerMessage.includes('calzado')) {
      console.log('❌ Consulta sobre calzado - producto no disponible');
      // Respuesta directa para consultas de calzado
      const directReply = 'Actualmente no tenemos calzado disponible en nuestra tienda. Nos especializamos en trajes elegantes, camisas de alta calidad, corbatas exclusivas y accesorios sofisticados. ¿Te puedo ayudar con alguna de estas categorías?';
      return res.json({ 
        reply: directReply, 
        products: undefined,
        hasInventoryData: false,
        inventoryConsulted: false
      });
    
    } else if (lowerMessage.includes('corbata') || lowerMessage.includes('corbatas') || lowerMessage.includes('accesorio')) {
      console.log('👔 Buscando corbatas y accesorios en la base de datos...');
      productsFound = await getProductsByCategory('corbata');
      inventoryData = formatProductsForAI(productsFound, 'Corbatas y Accesorios disponibles');
    
    } else if (lowerMessage.includes('inventario') || lowerMessage.includes('productos') || lowerMessage.includes('catalogo') || lowerMessage.includes('tienes') || lowerMessage.includes('disponible')) {
      console.log('🏪 Obteniendo resumen del inventario...');
      const summary = await getInventorySummary();
      inventoryData = formatInventorySummaryForAI(summary);
    
    } else if (lowerMessage.includes('más vendido') || lowerMessage.includes('bestseller') || lowerMessage.includes('popular')) {
      console.log('🔥 Buscando productos más vendidos...');
      productsFound = await getBestSellersByCategory();
      inventoryData = formatProductsForAI(productsFound, 'Productos Más Vendidos');
    
    } else if (lowerMessage.includes('buscar') || lowerMessage.includes('quiero') || lowerMessage.includes('necesito')) {
      console.log('🔍 Buscando productos por término general...');
      // Extraer términos de búsqueda del mensaje
      const searchTerms = message.replace(/buscar|quiero|necesito|un|una|el|la|de|para|en/gi, '').trim();
      if (searchTerms && searchTerms.length > 2) {
        productsFound = await searchProducts(searchTerms);
        inventoryData = formatProductsForAI(productsFound, `Resultados para "${searchTerms}"`);
      }
    }

    console.log('📦 Productos encontrados:', productsFound.length);

    // Si no hay información específica del inventario, obtener un resumen general
    if (!inventoryData && !lowerMessage.includes('hola') && !lowerMessage.includes('ayuda')) {
      console.log('🔍 Obteniendo resumen general del inventario...');
      const summary = await getInventorySummary();
      if (summary.length > 0) {
        inventoryData = formatInventorySummaryForAI(summary);
      }
    }

    // Construir el historial de conversación para el contexto
    const systemPrompt = getSystemPrompt(inventoryData);
    const messages = [
      { role: 'system', content: systemPrompt }
    ];

    // Agregar historial previo si existe (últimos 8 mensajes para no exceder límites)
    if (history && Array.isArray(history)) {
      const recentHistory = history.slice(-8);
      recentHistory.forEach(msg => {
        if (msg.from === 'user') {
          messages.push({ role: 'user', content: msg.text });
        } else if (msg.from === 'bot') {
          messages.push({ role: 'assistant', content: msg.text });
        }
      });
    }

    // Agregar el mensaje actual
    messages.push({ role: 'user', content: message });

    // Llamar a Groq AI
    console.log('🤖 Enviando a Groq con', messages.length, 'mensajes');
    const chatCompletion = await groq.chat.completions.create({
      messages: messages,
      model: 'llama-3.1-8b-instant',
      temperature: 0.1,
      max_tokens: 500,
      top_p: 1,
      stream: false,
      stop: null
    });

    const aiReply = chatCompletion.choices[0]?.message?.content || 'Lo siento, no pude procesar tu solicitud en este momento.';
    
    console.log('✅ Respuesta generada exitosamente');
    console.log('📝 Respuesta length:', aiReply.length);

    res.json({ 
      reply: aiReply, 
      products: productsFound.length > 0 ? productsFound : undefined,
      hasInventoryData: !!inventoryData,
      inventoryConsulted: true
    });

  } catch (error) {
    console.error('❌ Error en el chat:', error);
    console.error('❌ Stack trace:', error.stack);
    
    res.status(500).json({ 
      error: 'Error interno del servidor', 
      details: process.env.NODE_ENV === 'development' ? error.message : undefined 
    });
  }
});

module.exports = router;