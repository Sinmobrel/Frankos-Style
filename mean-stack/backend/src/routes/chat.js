const express = require('express');
const Groq = require('groq-sdk');
const Product = require('../models/product');
const router = express.Router();

// ============================================
// SISTEMA DE CORRECCIÓN DE ERRORES ORTOGRÁFICOS
// ============================================

// Diccionario de correcciones ortográficas comunes (EXPANDIDO)
const SPELLING_CORRECTIONS = {
  // Productos
  'terno': 'traje',
  'ternos': 'trajes',
  'trage': 'traje',
  'trge': 'traje',
  'trjes': 'trajes',
  'teaje': 'traje',
  'trake': 'traje',
  
  // Ocasiones
  'vautizo': 'bautizo',
  'vautiso': 'bautizo',
  'bautiso': 'bautizo',
  'vautiso': 'bautizo',
  'bavtizo': 'bautizo',
  'voda': 'boda',
  'vboda': 'boda',
  'voba': 'boda',
  'vodas': 'bodas',
  'bodas': 'boda',
  'matriomonio': 'matrimonio',
  'matrimnio': 'matrimonio',
  'matrimnonio': 'matrimonio',
  'graducion': 'graduacion',
  'graduaion': 'graduacion',
  'graducion': 'graduacion',
  'gala': 'gala',
  'galas': 'gala',
  
  // Colores (EXPANDIDO - normalizados sin tildes)
  'azul': 'azul',
  'ázul': 'azul',
  'asul': 'azul',
  'azúl': 'azul',
  'azil': 'azul',
  'acul': 'azul',
  'azull': 'azul',
  'gris': 'gris',
  'griz': 'gris',
  'grizz': 'gris',
  'griis': 'gris',
  'griss': 'gris',
  'negro': 'negro',
  'negró': 'negro',
  'negr': 'negro',
  'negri': 'negro',
  'nwgro': 'negro',
  'blanco': 'blanco',
  'blanko': 'blanco',
  'vranco': 'blanco',
  'balnco': 'blanco',
  'blanxo': 'blanco',
  'burdeos': 'burdeos',
  'burdeoz': 'burdeos',
  'vurdeos': 'burdeos',
  'burdos': 'burdeos',
  'marino': 'marino',
  'marinho': 'marino',
  'marinó': 'marino',
  'marin': 'marino',
  'cafe': 'cafe',
  'café': 'cafe',
  'kafe': 'cafe',
  'caffe': 'cafe',
  'caf': 'cafe',
  'marron': 'marron',
  'marrón': 'marron',
  'maron': 'marron',
  'marrown': 'marron',
  'rojo': 'rojo',
  'roxo': 'rojo',
  'rogo': 'rojo',
  'rojjo': 'rojo',
  'verde': 'verde',
  'berde': 'verde',
  'veerde': 'verde',
  'berge': 'verde',
  'amarillo': 'amarillo',
  'amarilo': 'amarillo',
  'amarrillo': 'amarillo',
  'morado': 'morado',
  'morao': 'morado',
  'moraddo': 'morado',
  'violeta': 'violeta',
  'violetta': 'violeta',
  'bioleta': 'violeta',
  'rosa': 'rosa',
  'rossa': 'rosa',
  'beige': 'beige',
  'beije': 'beige',
  'beis': 'beige',
  'dorado': 'dorado',
  'dorao': 'dorado',
  'gold': 'dorado',
  'plateado': 'plateado',
  'plata': 'plateado',
  'silver': 'plateado',
  'turquesa': 'turquesa',
  'turkesa': 'turquesa',
  'turqesa': 'turquesa',
  'naranja': 'naranja',
  'naranja': 'naranja',
  'anaranjado': 'naranja',
  'celeste': 'celeste',
  'seleste': 'celeste',
  'cyan': 'celeste',
  
  // Atributos
  'elegnte': 'elegante',
  'elejante': 'elegante',
  'eleganté': 'elegante',
  'elegante': 'elegante',
  'elegantr': 'elegante',
  'prezio': 'precio',
  'presio': 'precio',
  'preçio': 'precio',
  'precio': 'precio',
  'precip': 'precio',
  'taya': 'talla',
  'taia': 'talla',
  'taja': 'talla',
  'tallá': 'talla',
  'talla': 'talla',
  'taia': 'talla',
  
  // Acciones
  'nesesito': 'necesito',
  'nesecito': 'necesito',
  'neçesito': 'necesito',
  'necesito': 'necesito',
  'necewito': 'necesito',
  'kiero': 'quiero',
  'kero': 'quiero',
  'kieró': 'quiero',
  'quiero': 'quiero',
  'qiero': 'quiero',
  'quierp': 'quiero',
  'komprar': 'comprar',
  'conprar': 'comprar',
  'comprar': 'comprar',
  'comprat': 'comprar',
  'busco': 'busco',
  'vusco': 'busco',
  'bisco': 'busco',
  'presupusto': 'presupuesto',
  'presupuesto': 'presupuesto',
  'presupesto': 'presupuesto',
  'presuouesto': 'presupuesto',
  
  // Otros términos comunes
  'kamisa': 'camisa',
  'camiza': 'camisa',
  'camisá': 'camisa',
  'camisa': 'camisa',
  'csmisa': 'camisa',
  'corvata': 'corbata',
  'korvata': 'corbata',
  'corbata': 'corbata',
  'corvatta': 'corbata',
  'corbatta': 'corbata',
  'aksesorio': 'accesorio',
  'acsesorio': 'accesorio',
  'accezorio': 'accesorio',
  'accesorio': 'accesorio',
  'acsesorio': 'accesorio'
};

// Mapa de teclas adyacentes en teclado QWERTY español
const KEYBOARD_ADJACENT = {
  'q': ['w', 'a'],
  'w': ['q', 'e', 's', 'a'],
  'e': ['w', 'r', 'd', 's'],
  'r': ['e', 't', 'f', 'd'],
  't': ['r', 'y', 'g', 'f'],
  'y': ['t', 'u', 'h', 'g'],
  'u': ['y', 'i', 'j', 'h'],
  'i': ['u', 'o', 'k', 'j'],
  'o': ['i', 'p', 'l', 'k'],
  'p': ['o', 'ñ', 'l'],
  'a': ['q', 'w', 's', 'z'],
  's': ['a', 'w', 'e', 'd', 'x', 'z'],
  'd': ['s', 'e', 'r', 'f', 'c', 'x'],
  'f': ['d', 'r', 't', 'g', 'v', 'c'],
  'g': ['f', 't', 'y', 'h', 'b', 'v'],
  'h': ['g', 'y', 'u', 'j', 'n', 'b'],
  'j': ['h', 'u', 'i', 'k', 'm', 'n'],
  'k': ['j', 'i', 'o', 'l', 'm'],
  'l': ['k', 'o', 'p', 'ñ'],
  'z': ['a', 's', 'x'],
  'x': ['z', 's', 'd', 'c'],
  'c': ['x', 'd', 'f', 'v'],
  'v': ['c', 'f', 'g', 'b'],
  'b': ['v', 'g', 'h', 'n'],
  'n': ['b', 'h', 'j', 'm'],
  'm': ['n', 'j', 'k']
};

// Función avanzada para corregir errores de tipeo por teclas adyacentes
function fixTypos(word, candidates) {
  const wordLower = word.toLowerCase();
  
  for (const candidate of candidates) {
    const candidateLower = candidate.toLowerCase();
    
    // Si la longitud es muy diferente, skip
    if (Math.abs(wordLower.length - candidateLower.length) > 2) continue;
    
    // Contar diferencias
    let differences = 0;
    let adjacentErrors = 0;
    
    for (let i = 0; i < Math.min(wordLower.length, candidateLower.length); i++) {
      if (wordLower[i] !== candidateLower[i]) {
        differences++;
        
        // Verificar si es un error de tecla adyacente
        const adjacent = KEYBOARD_ADJACENT[candidateLower[i]] || [];
        if (adjacent.includes(wordLower[i])) {
          adjacentErrors++;
        }
      }
    }
    
    // Si tiene máximo 2 diferencias y al menos 1 es de tecla adyacente
    if (differences <= 2 && adjacentErrors >= 1) {
      return candidate;
    }
  }
  
  return null;
}

// Función para normalizar y corregir texto (MEJORADA CON MULTI-CAPA)
function normalizeText(text) {
  if (!text || typeof text !== 'string') return '';
  
  console.log('🔧 AUTO-CORRECTOR INICIADO:', text);
  
  // CAPA 1: Normalización básica
  let normalized = text.toLowerCase()
    .normalize('NFD')  // Normalizar caracteres Unicode
    .replace(/[\u0300-\u036f]/g, '')  // Remover acentos
    .trim();
  
  // CAPA 2: Aplicar correcciones del diccionario (primera pasada)
  Object.keys(SPELLING_CORRECTIONS).forEach(misspelled => {
    const correct = SPELLING_CORRECTIONS[misspelled];
    const regex = new RegExp(`\\b${misspelled}\\b`, 'gi');
    if (regex.test(normalized)) {
      console.log(`  ✓ Diccionario: "${misspelled}" → "${correct}"`);
      normalized = normalized.replace(regex, correct);
    }
  });
  
  // CAPA 3: Corrección inteligente palabra por palabra
  const words = normalized.split(/\s+/);
  const correctedWords = words.map(word => {
    // Si la palabra ya está en el diccionario, mantenerla
    if (SPELLING_CORRECTIONS[word]) {
      return SPELLING_CORRECTIONS[word];
    }
    
    // Lista de palabras objetivo (productos, colores, ocasiones) - SIN TILDES
    const targetWords = [
      'traje', 'trajes', 'camisa', 'camisas', 'corbata', 'corbatas', 'accesorio', 'accesorios',
      'azul', 'gris', 'negro', 'blanco', 'burdeos', 'marino', 'rojo', 'verde', 'amarillo', 
      'morado', 'violeta', 'rosa', 'beige', 'cafe', 'marron', 'dorado', 'plateado', 'turquesa',
      'naranja', 'celeste', 'electrico',
      'bautizo', 'boda', 'matrimonio', 'graduacion', 'gala',
      'precio', 'talla', 'elegante', 'necesito', 'quiero', 'busco', 'comprar'
    ];
    
    // Intentar corrección por teclas adyacentes
    const fixed = fixTypos(word, targetWords);
    if (fixed) {
      console.log(`  ✓ Tecla adyacente: "${word}" → "${fixed}"`);
      return fixed;
    }
    
    // Si tiene más de 3 caracteres, intentar fuzzy matching agresivo
    if (word.length > 3) {
      for (const target of targetWords) {
        const distance = levenshteinDistance(word, target);
        // Umbral más agresivo para palabras cortas
        const threshold = word.length <= 5 ? 2 : 3;
        if (distance <= threshold) {
          console.log(`  ✓ Fuzzy match: "${word}" → "${target}" (distancia: ${distance})`);
          return target;
        }
      }
    }
    
    return word;
  });
  
  normalized = correctedWords.join(' ');
  
  // CAPA 4: Segunda pasada del diccionario (por si la corrección anterior creó nuevas palabras)
  Object.keys(SPELLING_CORRECTIONS).forEach(misspelled => {
    const correct = SPELLING_CORRECTIONS[misspelled];
    const regex = new RegExp(`\\b${misspelled}\\b`, 'gi');
    normalized = normalized.replace(regex, correct);
  });
  
  console.log('✨ RESULTADO FINAL:', normalized);
  
  return normalized;
}

// Función para calcular distancia de Levenshtein (similitud entre strings)
function levenshteinDistance(str1, str2) {
  const len1 = str1.length;
  const len2 = str2.length;
  const matrix = [];

  if (len1 === 0) return len2;
  if (len2 === 0) return len1;

  for (let i = 0; i <= len2; i++) {
    matrix[i] = [i];
  }

  for (let j = 0; j <= len1; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= len2; i++) {
    for (let j = 1; j <= len1; j++) {
      if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,  // Sustitución
          matrix[i][j - 1] + 1,      // Inserción
          matrix[i - 1][j] + 1       // Eliminación
        );
      }
    }
  }

  return matrix[len2][len1];
}

// Función para encontrar la palabra más similar de una lista
function findClosestMatch(word, candidatesList, threshold = 3) {
  let closestMatch = null;
  let minDistance = Infinity;
  
  const normalizedWord = normalizeText(word);
  
  candidatesList.forEach(candidate => {
    const normalizedCandidate = normalizeText(candidate);
    const distance = levenshteinDistance(normalizedWord, normalizedCandidate);
    
    // Si la distancia es menor al umbral y es la mejor hasta ahora
    if (distance < threshold && distance < minDistance) {
      minDistance = distance;
      closestMatch = candidate;
    }
  });
  
  return closestMatch;
}

// Función mejorada para búsqueda inteligente con corrección ortográfica
async function smartProductSearch(query) {
  try {
    // 1. Normalizar la consulta
    const normalizedQuery = normalizeText(query);
    console.log('🔍 Query normalizada:', normalizedQuery);
    
    // 2. Buscar con la query normalizada
    let products = await Product.find({
      $or: [
        { name: new RegExp(normalizedQuery, 'i') },
        { description: new RegExp(normalizedQuery, 'i') },
        { category: new RegExp(normalizedQuery, 'i') },
        { mainColor: new RegExp(normalizedQuery, 'i') },
        { productType: new RegExp(normalizedQuery, 'i') },
        { tags: new RegExp(normalizedQuery, 'i') }
      ],
      stock: { $gt: 0 }
    }).limit(3);
    
    // 3. Si no hay resultados, intentar fuzzy matching con categorías conocidas
    if (products.length === 0) {
      console.log('⚠️ Sin resultados directos, probando fuzzy matching...');
      
      const categories = ['traje', 'camisa', 'corbata', 'accesorio'];
      const colors = [
        'azul', 'gris', 'negro', 'blanco', 'burdeos', 'marino', 'rojo', 'verde',
        'cafe', 'marron', 'beige', 'amarillo', 'morado', 'rosa', 'violeta'
      ];
      
      const words = normalizedQuery.split(' ');
      
      for (const word of words) {
        // Buscar categoría similar
        const matchedCategory = findClosestMatch(word, categories);
        if (matchedCategory) {
          console.log(`✅ Categoría corregida: "${word}" → "${matchedCategory}"`);
          products = await Product.find({
            category: new RegExp(matchedCategory, 'i'),
            stock: { $gt: 0 }
          }).limit(3);
          if (products.length > 0) break;
        }
        
        // Buscar color similar
        const matchedColor = findClosestMatch(word, colors);
        if (matchedColor && products.length === 0) {
          console.log(`✅ Color corregido: "${word}" → "${matchedColor}"`);
          // Usar la función mejorada que busca sinónimos
          products = await getProductsByColor(matchedColor);
          if (products.length > 0) break;
        }
      }
    }
    
    return products;
  } catch (error) {
    console.error('❌ Error en búsqueda inteligente:', error);
    return [];
  }
}

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

// LISTA DE PALABRAS CLAVE DE PRODUCTOS (scope global para reutilización)
const productKeywords = [
  // Categorías de productos
  'traje', 'trajes', 'camisa', 'camisas', 'corbata', 'corbatas',
  'accesorio', 'accesorios',
  // Consultas sobre productos
  'precio', 'precios', 'cuesta', 'vale', '$', 'peso',
  'color', 'colores', 'talla', 'tallas', 'medida', 'medidas',
  'modelo', 'modelos', 'diseño', 'diseños', 'diseno', 'disenos',
  'stock', 'disponible', 'hay', 'tienen disponible',
  'mostrar', 'ver', 'quiero ver', 'enseñar', 'ensenar',
  'recomienda', 'recomiendan', 'sugerir', 'sugieren',
  'busco', 'necesito', 'quiero comprar', 'comprar',
  'catalogo', 'catálogo', 'inventario', 'productos', 'productos especificos',
  // Tallas específicas
  '38', '40', '42', '44', '46', '48', '50', '52', '54', '56',
  'xs', 's', 'm', 'l', 'xl', 'xxl',
  'small', 'medium', 'large', 'extra',
  'slim', 'regular', 'classic',
  // Paleta completa de colores (SIN TILDES - normalizados)
  'azul', 'gris', 'negro', 'blanco', 'burdeos', 'marino', 'claro', 'oscuro',
  'rojo', 'verde', 'amarillo', 'naranja', 'morado', 'violeta', 'rosa',
  'beige', 'cafe', 'marron', 'crema', 'ivory', 'champagne',
  'plateado', 'dorado', 'bronce', 'cobre',
  'celeste', 'turquesa', 'aqua', 'cyan',
  'vino', 'granate', 'carmesi', 'escarlata',
  'azul marino', 'azul rey', 'azul cielo', 'azul claro', 'azul oscuro', 'azul electrico',
  'gris claro', 'gris oscuro', 'gris plomo', 'gris carbon',
  'verde oliva', 'verde militar', 'verde oscuro',
  'berenjena', 'lavanda', 'lila'
];

// Función mejorada para detectar patrones en preguntas
function detectQuestionPattern(message) {
  // Normalizar y corregir el mensaje
  const normalizedMessage = normalizeText(message);
  const lowerMessage = normalizedMessage
    .replace(/[¿?¡!.,;:()]/g, ' ')  // Remover puntuación
    .replace(/\s+/g, ' ')           // Normalizar espacios
    .trim();
  
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

// Funciones para consultar la base de datos (OPTIMIZADAS - límite reducido a 3)
async function getProductsByCategory(category) {
  try {
    const products = await Product.find({ 
      category: new RegExp(category, 'i'),
      stock: { $gt: 0 } 
    }).limit(3); // Reducido de 5 a 3
    return products;
  } catch (error) {
    console.error('Error consultando productos por categoría:', error);
    return [];
  }
}

async function searchProducts(query) {
  // Usar la nueva función de búsqueda inteligente
  return await smartProductSearch(query);
}

async function getProductsByPriceRange(minPrice, maxPrice) {
  try {
    const products = await Product.find({
      price: { $gte: minPrice, $lte: maxPrice },
      stock: { $gt: 0 }
    }).sort({ price: 1 }).limit(3); // Reducido de 5 a 3
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
    }).sort({ price: -1 }).limit(3); // Reducido de 4 a 3
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
    }).sort({ price: -1 }).limit(3); // Reducido de 6 a 3
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
    }).limit(3); // Reducido de 8 a 3
    return products;
  } catch (error) {
    console.error('Error consultando productos por talla:', error);
    return [];
  }
}

async function getProductsByColor(color) {
  try {
    // Mapa de sinónimos de colores para búsqueda más amplia (INCLUYE VERSIONES CON Y SIN TILDES)
    const colorSynonyms = {
      'cafe': ['cafe', 'café', 'brown', 'marron', 'marrón', 'coffee', 'camel'],
      'marron': ['marron', 'marrón', 'cafe', 'café', 'brown', 'camel'],
      'azul': ['azul', 'blue', 'azul marino', 'azul eléctrico', 'azul electrico', 'navy'],
      'gris': ['gris', 'gray', 'grey', 'plomo', 'gris claro'],
      'negro': ['negro', 'black'],
      'blanco': ['blanco', 'white', 'ivory', 'crema'],
      'rojo': ['rojo', 'red', 'vino', 'granate', 'burdeos', 'burdeos'],
      'verde': ['verde', 'green', 'oliva'],
      'amarillo': ['amarillo', 'yellow', 'dorado', 'gold'],
      'morado': ['morado', 'purple', 'violeta', 'lila', 'púrpura', 'purpura'],
      'rosa': ['rosa', 'pink', 'rosado'],
      'beige': ['beige', 'beige', 'arena', 'crema'],
      'dorado': ['dorado', 'oro', 'gold', 'golden', 'amarillo'],
      'plateado': ['plateado', 'plata', 'silver', 'gris'],
      'turquesa': ['turquesa', 'turquoise', 'aqua', 'cyan'],
      'naranja': ['naranja', 'orange', 'anaranjado'],
      'celeste': ['celeste', 'sky blue', 'azul cielo', 'cyan'],
      'violeta': ['violeta', 'violet', 'morado', 'púrpura', 'purpura', 'lila']
    };
    
    // Obtener sinónimos del color (normalizado sin acentos)
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
    
    // Construir regex pattern con todos los sinónimos (escapar caracteres especiales)
    const escapedTerms = searchTerms.map(term => term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
    const colorPattern = escapedTerms.join('|');
    
    const products = await Product.find({
      $or: [
        { mainColor: new RegExp(colorPattern, 'i') },
        { colors: { $regex: new RegExp(colorPattern, 'i') } },
        { name: new RegExp(colorPattern, 'i') },
        { description: new RegExp(colorPattern, 'i') }
      ],
      stock: { $gt: 0 }
    }).limit(3);
    
    console.log(`✅ Encontrados ${products.length} productos para color "${color}"`);
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
      { $sort: { count: -1 } },
      { $limit: 10 } // OPTIMIZACIÓN: Limitar categorías para evitar sobrecarga
    ]);
    return summary;
  } catch (error) {
    console.error('Error obteniendo resumen de inventario:', error);
    return [];
  }
}

// Función SIMPLIFICADA para formatear productos para la IA (OPTIMIZADA PARA VERCEL)
function formatProductsForAI(products, title) {
  if (!products || products.length === 0) {
    return `${title}: NO PRODUCTS AVAILABLE.`;
  }
  
  let formatted = `=== ${title.toUpperCase()} (${products.length} products) ===\n\n`;
  
  products.forEach((product, index) => {
    formatted += `${index + 1}. "${product.name}"\n`;
    formatted += `   💰 $${product.price.toLocaleString('es-CL')}`;
    
    if (product.stock) formatted += ` | 📦 ${product.stock} units`;
    if (product.mainColor) formatted += ` | 🎨 ${product.mainColor}`;
    if (product.sizes && product.sizes.length > 0) formatted += ` | 👔 ${product.sizes.join(', ')}`;
    
    formatted += `\n\n`;
  });
  
  const prices = products.map(p => p.price);
  formatted += `💡 PRICE RANGE: $${Math.min(...prices).toLocaleString('es-CL')} - $${Math.max(...prices).toLocaleString('es-CL')}\n\n`;
  
  formatted += `🤖 INSTRUCTIONS:\n⚠️ ONLY recommend products from list above\n⚠️ Use EXACT names in quotes and EXACT prices\n- Keep under 100 words\n- Respond in SPANISH\n- If not in list, say "no tenemos" and suggest from list\n`;
  
  return formatted;
}

// Función SIMPLIFICADA para formatear resumen de inventario (OPTIMIZADA PARA VERCEL)
function formatInventorySummaryForAI(summary) {
  if (!summary || summary.length === 0) {
    return 'INVENTORY: No products available.';
  }
  
  let formatted = '=== INVENTORY ===\n\n';
  
  summary.forEach(cat => {
    formatted += `📂 ${cat._id}: ${cat.count} products\n`;
    if (cat.products && cat.products.length > 0) {
      formatted += `   Top: ${cat.products.slice(0, 2).map(p => `"${p.name}" $${p.price.toLocaleString('es-CL')}`).join(', ')}\n`;
    }
  });
  
  formatted += `\n💡 Respond in SPANISH with personalized advice.`;
  return formatted;
}

// Enhanced system prompt for CarVian with FAQ handling and product management
function getSystemPrompt(inventoryInfo = '', hasProducts = false) {
  return `You are CarVian, the expert men's fashion advisor for Franko's Style, a prestigious tailoring house specializing in elegance and sophistication.

ESSENTIAL FRANKO'S STYLE INFORMATION:
- Specialty: High-end tailoring and elegant men's fashion
- Products: Suits, shirts, ties, and accessories (NO footwear)
- Location: Alameda 3410, Local V-21, Persa Estación Central
- Contact: WhatsApp +56 9 5047 6935
- Hours: Monday-Saturday 12:00-18:30, Sundays closed
- Target: Men who value elegance (executives, grooms, formal events)

YOUR PERSONALITY:
- Professional but warm and approachable fashion advisor
- Expert in combinations, cuts, colors, and occasions
- Empathetic and patient, especially with unclear questions
- Enthusiastic but never pretentious
- Concise and focused on customer needs

${inventoryInfo ? `PRODUCT DATABASE:\n${inventoryInfo}\n` : 'INVENTORY: No specific products available for this query.'}

⚠️ CRITICAL RULES - NEVER HALLUCINATE:
1. ONLY recommend products that appear in the PRODUCT DATABASE above
2. If NO products in database, say "no tenemos productos específicos disponibles" and invite to visit store
3. NEVER invent product names, prices, or details not in the database
4. If database is empty or no products match, suggest visiting the store to see full collection
5. When in doubt, recommend visiting store or contacting via WhatsApp

CRUCIAL RESPONSE RULES:
1. ALWAYS respond in SPANISH (despite this prompt being in English)
2. Maximum 120-150 words per response - BE CONCISE but HELPFUL
3. When recommending products, use EXACT NAME in quotes AND mention EXACT PRICE from database
4. When customer mentions BUDGET and OCCASION, recommend 2-3 best options within budget
5. Focus on helping customer choose what they need
6. Mention key features: name, price, main color, why it's good for their occasion
7. Don't overwhelm with unnecessary information
8. Be helpful, enthusiastic and direct
9. When asked about contact, ALWAYS include the WhatsApp link: https://wa.me/56950476935
10. If NO products found: "Actualmente no tengo productos específicos que mostrar. Te invito a visitar nuestra tienda en Alameda 3410 o contactarnos por WhatsApp +56 9 5047 6935 para ver nuestra colección completa."

${hasProducts ? `CONCISE PRODUCT RECOMMENDATIONS (ONLY from database above):
- MENTION: Product name in quotes, exact price, main color, why it fits their need
- ONLY IF ASKED: materials, measurements, what's included, all colors, sizes
- FOCUS: On helping customer decide and choose
- WHEN BUDGET MENTIONED: Show how the price fits their budget, offer 2-3 options if available
- WHEN OCCASION MENTIONED: Explain why product is perfect for that specific event

RESPONSE STRUCTURE FOR BUDGET + OCCASION:
1. "Perfecto para un [occasion]! Con tu presupuesto de $[budget] te recomiendo:"
2. List 2-3 products with name, price, color, key feature
3. Brief explanation why each is good for their occasion
4. "¿Te gustaría más información sobre alguno?"

EXAMPLE RESPONSES:
- "Para un bautizo como padrino, te recomiendo el 'Traje Azul Marino Elegante' por $189.000. Es perfecto porque transmite sobriedad y elegancia. ¿Te interesa conocer más detalles?"
- "Con tu presupuesto de $200.000 para el bautizo, tengo 2 excelentes opciones: el '[PRODUCT 1]' por $[PRICE1] en [color] y el '[PRODUCT 2]' por $[PRICE2]. Ambos son ideales para padrinos. ¿Cuál te llama más la atención?"` : `NO PRODUCTS AVAILABLE:
When asked about products:
- Be honest: "No tengo información específica de ese producto en este momento"
- Invite to visit: "Te invito a visitar nuestra tienda en Alameda 3410, Local V-21"
- Offer contact: "O puedes consultarnos por WhatsApp al +56 9 5047 6935"
- Mention store hours: "Lunes a Sábado 12:00-18:30"
- NEVER invent product names or prices`}

Always be helpful, knowledgeable, and focused on making the customer feel confident and well-dressed for their specific needs while providing transparent pricing information. NEVER recommend products not in the database above.`;
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
    
    // Normalizar y corregir el mensaje
    const normalizedMessage = normalizeText(message);
    const lowerMessage = normalizedMessage.toLowerCase();
    console.log('📝 Mensaje original:', message);
    console.log('✨ Mensaje normalizado:', normalizedMessage);

    // === DETECCIÓN DE PRESUPUESTO ===
    const budgetPatterns = [
      /(\d{1,3}[.,]?\d{3}[.,]?\d{3})/g,  // Ej: 200.000 o 200,000 o 200000
      /(\d{1,3})\s*mil/gi,                 // Ej: 200 mil
      /\$\s*(\d+)/g                        // Ej: $200000
    ];
    
    let detectedBudget = null;
    for (const pattern of budgetPatterns) {
      const match = lowerMessage.match(pattern);
      if (match) {
        let amount = match[0].replace(/[.,\s$mil]/gi, '');
        if (lowerMessage.includes('mil')) {
          amount = parseInt(amount) * 1000;
        } else {
          amount = parseInt(amount);
        }
        if (amount > 1000) {
          detectedBudget = amount;
          console.log('💰 Presupuesto detectado:', detectedBudget);
          break;
        }
      }
    }
    
    // === DETECCIÓN DE OCASIÓN/EVENTO ===
    const occasions = {
      // Eventos religiosos
      bautizo: ['bautizo', 'bautismo', 'padrino', 'madrina', 'bautizar'],
      confirmacion: ['confirmación', 'confirmacion', 'confirmando'],
      comunion: ['comunión', 'comunion', 'primera comunión'],
      
      // Bodas y eventos nupciales
      boda: ['boda', 'matrimonio', 'casamiento', 'nupcial', 'novio', 'novia', 'testigo', 'casarse', 'enlace'],
      civil: ['civil', 'registro civil', 'matrimonio civil'],
      
      // Graduaciones y eventos académicos
      graduacion: ['graduación', 'graduacion', 'licenciatura', 'titulación', 'grado', 'titulo'],
      
      // Galas y eventos formales
      gala: ['gala', 'evento formal', 'fiesta elegante', 'cóctel', 'cocktail', 'black tie', 'etiqueta'],
      
      // Eventos laborales
      trabajo: ['trabajo', 'oficina', 'ejecutivo', 'profesional', 'reunión', 'entrevista', 'junta', 'presentación', 'pega'],
      
      // Cumpleaños y aniversarios
      cumpleanos: ['cumpleaños', 'cumpleanos', 'aniversario', 'celebración', 'celebracion', 'fiesta'],
      
      // Eventos de fin de año
      navidad: ['navidad', 'año nuevo', 'nochebuena', 'fin de año', 'fiestas patrias', 'pascua'],
      
      // Quinceaños y eventos juveniles
      quince: ['quinceaños', 'quinceanera', 'quinceañera', 'quinces', '15 años'],
      
      // Cenas y eventos sociales
      cena: ['cena', 'restaurante', 'salir a cenar', 'cita', 'date'],
      
      // Viajes y vacaciones
      viaje: ['viaje', 'vacaciones', 'crucero', 'luna de miel'],
      
      // Estilo casual
      casual: ['casual', 'informal', 'diario', 'cotidiano', 'relajado']
    };
    
    let detectedOccasion = null;
    for (const [occasion, keywords] of Object.entries(occasions)) {
      if (keywords.some(keyword => normalizedMessage.includes(keyword))) {
        detectedOccasion = occasion;
        console.log('🎭 Ocasión detectada:', detectedOccasion);
        break;
      }
    }
    
    // === BÚSQUEDA POR PRESUPUESTO Y/O OCASIÓN ===
    if (detectedBudget || detectedOccasion) {
      console.log('🎯 Búsqueda específica por presupuesto/ocasión...');
      
      let minPrice = 0;
      let maxPrice = detectedBudget || 999999999;
      
      if (detectedBudget) {
        minPrice = Math.floor(detectedBudget * 0.6);
        maxPrice = Math.ceil(detectedBudget * 1.2);
        console.log(`💰 Buscando entre $${minPrice.toLocaleString()} y $${maxPrice.toLocaleString()}`);
        productsFound = await getProductsByPriceRange(minPrice, maxPrice);
        // OPTIMIZACIÓN: Limitar a 3 productos
        if (productsFound.length > 3) {
          productsFound = productsFound.slice(0, 3);
        }
      }
      
      if (detectedOccasion && productsFound.length === 0) {
        console.log(`🎭 Buscando para ${detectedOccasion}...`);
        
        if (['bautizo', 'boda', 'gala', 'confirmacion', 'comunion', 'civil', 'graduacion'].includes(detectedOccasion)) {
          productsFound = await Product.find({ 
            category: new RegExp('traje', 'i'),
            stock: { $gt: 0 } 
          }).limit(3);
        } else if (detectedOccasion === 'trabajo') {
          productsFound = await Product.find({
            $or: [
              { name: new RegExp('ejecutivo', 'i') },
              { category: new RegExp('traje', 'i') }
            ],
            stock: { $gt: 0 }
          }).limit(3);
        } else {
          productsFound = await Product.find({
            name: new RegExp(detectedOccasion, 'i'),
            stock: { $gt: 0 }
          }).limit(3);
        }
        
        if (detectedBudget && productsFound.length > 0) {
          productsFound = productsFound.filter(p => p.price >= minPrice && p.price <= maxPrice);
        }
      }
      
      let contextInfo = '';
      if (detectedBudget && detectedOccasion) {
        contextInfo = `Productos para ${detectedOccasion} con presupuesto de $${detectedBudget.toLocaleString('es-CL')}`;
      } else if (detectedBudget) {
        contextInfo = `Productos dentro del presupuesto de $${detectedBudget.toLocaleString('es-CL')}`;
      } else if (detectedOccasion) {
        contextInfo = `Productos para ${detectedOccasion}`;
      }
      
      if (productsFound.length > 0) {
        inventoryData = formatProductsForAI(productsFound, contextInfo);
      } else {
        console.log('⚠️ No hay productos exactos, buscando alternativas...');
        productsFound = await Product.find({ 
          category: new RegExp('traje', 'i'),
          stock: { $gt: 0 } 
        }).limit(3);
        if (detectedBudget && productsFound.length > 0) {
          productsFound.sort((a, b) => Math.abs(a.price - detectedBudget) - Math.abs(b.price - detectedBudget));
          productsFound = productsFound.slice(0, 3);
        }
        if (productsFound.length > 0) {
          inventoryData = formatProductsForAI(productsFound, `Alternativas ${contextInfo ? 'para ' + contextInfo : 'disponibles'}`);
        }
      }
    }

    // Búsqueda inteligente según el tipo de consulta
    else if (lowerMessage.includes('boda') || lowerMessage.includes('matrimonio') || lowerMessage.includes('gala') || lowerMessage.includes('evento')) {
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
    
    } else if (lowerMessage.includes('color') || lowerMessage.includes('gris') || lowerMessage.includes('azul') || lowerMessage.includes('negro') || lowerMessage.includes('burdeos') || lowerMessage.includes('rojo') || lowerMessage.includes('blanco') || lowerMessage.includes('marino') || lowerMessage.includes('verde') || lowerMessage.includes('amarillo') || lowerMessage.includes('morado') || lowerMessage.includes('rosa') || lowerMessage.includes('beige') || lowerMessage.includes('cafe') || lowerMessage.includes('marron')) {
      console.log('🎨 Buscando por color específico...');
      const colors = [
        'gris', 'azul', 'negro', 'blanco', 'burdeos', 'marino',
        'rojo', 'verde', 'amarillo', 'naranja', 'morado', 'violeta', 'rosa',
        'beige', 'cafe', 'marron', 'crema', 'ivory', 'champagne',
        'plateado', 'dorado', 'bronce', 'cobre',
        'celeste', 'turquesa', 'vino', 'granate',
        'azul marino', 'azul rey', 'azul cielo', 'azul electrico',
        'gris claro', 'gris oscuro', 'gris plomo',
        'verde oliva', 'lavanda', 'lila', 'berenjena'
      ];
      
      // Primero buscar coincidencia exacta
      let colorFound = colors.find(color => lowerMessage.includes(color));
      
      // Si no hay coincidencia exacta, intentar fuzzy matching
      if (!colorFound) {
        const words = lowerMessage.split(' ');
        for (const word of words) {
          const matchedColor = findClosestMatch(word, colors);
          if (matchedColor) {
            console.log(`✅ Color corregido: "${word}" → "${matchedColor}"`);
            colorFound = matchedColor;
            break;
          }
        }
      }
      
      if (colorFound) {
        console.log(`🔍 Buscando productos con color: "${colorFound}"`);
        productsFound = await getProductsByColor(colorFound);
        console.log(`📦 Productos encontrados: ${productsFound.length}`);
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
    
    } else if (lowerMessage.includes('zapato') || lowerMessage.includes('zapatos') || lowerMessage.includes('calzado') || lowerMessage.includes('pantalon') || lowerMessage.includes('pantalones') || lowerMessage.includes('chaleco') || lowerMessage.includes('chalecos')) {
      console.log('❌ Consulta sobre productos no disponibles');
      // Respuesta directa para consultas de productos que no vendemos
      const directReply = 'Actualmente no tenemos calzado, pantalones ni chalecos disponibles en nuestra tienda. Nos especializamos en trajes elegantes, camisas de alta calidad, corbatas exclusivas y accesorios sofisticados. ¿Te puedo ayudar con alguna de estas categorías?';
      return res.json({ 
        reply: directReply, 
        products: undefined,
        hasInventoryData: false,
        inventoryConsulted: false
      });
    
    } else if (lowerMessage.includes('corbata') || lowerMessage.includes('corbatas') || lowerMessage.includes('accesorio') || lowerMessage.includes('accesorios')) {
      console.log('👔 Buscando corbatas y accesorios en la base de datos...');
      productsFound = await getProductsByCategory('corbata');
      if (productsFound.length === 0) {
        // Intentar buscar por "accesorio" si no hay corbatas
        productsFound = await getProductsByCategory('accesorio');
      }
      inventoryData = formatProductsForAI(productsFound, 'Corbatas y Accesorios disponibles');
    
    } else if ((lowerMessage.includes('inventario') || lowerMessage.includes('catalogo')) && !lowerMessage.includes('stock')) {
      // OPTIMIZACIÓN: Solo activar resumen completo para "inventario" o "catálogo", no para "stock"
      console.log('🏪 Obteniendo resumen del inventario...');
      const summary = await getInventorySummary();
      inventoryData = formatInventorySummaryForAI(summary);
    
    } else if (lowerMessage.includes('más vendido') || lowerMessage.includes('bestseller') || lowerMessage.includes('popular')) {
      console.log('🔥 Buscando productos más vendidos...');
      productsFound = await getBestSellersByCategory();
      inventoryData = formatProductsForAI(productsFound, 'Productos Más Vendidos');
    
    } else if (lowerMessage.includes('buscar') || lowerMessage.includes('quiero') || lowerMessage.includes('necesito')) {
      console.log('🔍 Buscando productos por término general...');
      // Extraer términos de búsqueda del mensaje normalizado
      const searchTerms = normalizedMessage.replace(/buscar|quiero|necesito|un|una|el|la|de|para|en/gi, '').trim();
      if (searchTerms && searchTerms.length > 2) {
        productsFound = await smartProductSearch(searchTerms);
        inventoryData = formatProductsForAI(productsFound, `Resultados para "${searchTerms}"`);
      }
    }

    console.log('📦 Productos encontrados:', productsFound.length);

    // Si no hay información específica del inventario y se detectaron palabras de productos, 
    // hacer una búsqueda general inteligente
    if (!inventoryData && productsFound.length === 0) {
      // Verificar si el mensaje contiene alguna palabra clave de producto
      const hasProductIntent = productKeywords.some(keyword => lowerMessage.includes(keyword));
      
      if (hasProductIntent) {
        console.log('🔍 Búsqueda general por palabras clave de producto...');
        productsFound = await smartProductSearch(normalizedMessage);
        
        if (productsFound.length > 0) {
          inventoryData = formatProductsForAI(productsFound, 'Productos relacionados');
        } else {
          // Si no encuentra productos específicos, NO obtener resumen
          console.log('⚠️ No se encontraron productos específicos para la consulta');
          inventoryData = ''; // Dejar vacío para que la IA responda que no hay productos
        }
      } else if (!lowerMessage.includes('hola') && !lowerMessage.includes('ayuda') && !lowerMessage.includes('quien eres')) {
        // Solo obtener resumen si no es saludo ni pregunta general
        console.log('🔍 Obteniendo resumen general del inventario...');
        const summary = await getInventorySummary();
        if (summary.length > 0) {
          inventoryData = formatInventorySummaryForAI(summary);
        }
      }
    }

    // Determinar si hay productos disponibles para recomendar
    const hasProducts = productsFound.length > 0;
    console.log('✅ ¿Tiene productos para recomendar?', hasProducts);

    // Construir el historial de conversación para el contexto
    const systemPrompt = getSystemPrompt(inventoryData, hasProducts);
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

    let aiReply = chatCompletion.choices[0]?.message?.content || 'Lo siento, no pude procesar tu solicitud en este momento.';
    
    console.log('✅ Respuesta generada exitosamente');
    console.log('📝 Respuesta length:', aiReply.length);

    // 🛡️ VERIFICACIÓN ANTI-ALUCINACIÓN: Si no hay productos pero la IA menciona precios específicos
    if (!hasProducts && /\$\s*\d{1,3}([\.,]\d{3})*/.test(aiReply)) {
      console.log('⚠️ ADVERTENCIA: IA mencionando precios sin productos disponibles - Reemplazando respuesta');
      aiReply = 'En este momento no tengo información específica de ese producto. Te invito a visitar nuestra tienda en Alameda 3410, Local V-21 (Lunes a Sábado 12:00-18:30) o contactarnos por WhatsApp al +56 9 5047 6935 para consultar nuestra colección completa y precios actualizados. 😊';
    }

    // 🛡️ VERIFICACIÓN: Si no hay productos pero menciona nombres entre comillas
    if (!hasProducts && /"[^"]{10,}"/.test(aiReply)) {
      console.log('⚠️ ADVERTENCIA: IA mencionando nombres de productos sin productos disponibles - Reemplazando respuesta');
      aiReply = 'Actualmente no tengo esos productos específicos. Para ver nuestra colección completa y disponibilidad actualizada, te invito a visitarnos en Alameda 3410, Local V-21 (Lunes a Sábado 12:00-18:30) o escribirnos por WhatsApp al +56 9 5047 6935. 😊';
    }

    // Detectar si la pregunta es sobre contacto
    const contactKeywords = ['contacto', 'telefono', 'teléfono', 'numero', 'número', 'whatsapp', 'llamar', 'comunicar', 'contactar', 'hablar'];
    const isContactQuery = contactKeywords.some(keyword => lowerMessage.includes(keyword));
    
    console.log('❓ ¿Es consulta de contacto?', isContactQuery);
    
    const responseData = { 
      reply: aiReply, 
      products: productsFound.length > 0 ? productsFound : undefined,
      hasInventoryData: !!inventoryData,
      inventoryConsulted: true
    };
    
    // Agregar información de contacto solo si la pregunta es sobre contacto
    if (isContactQuery) {
      console.log('📞 Consulta de contacto detectada, agregando contactInfo');
      responseData.contactInfo = {
        phone: '+56 9 5047 6935',
        whatsappLink: 'https://wa.me/56950476935'
      };
      console.log('📱 ContactInfo agregado a la respuesta');
    }

    res.json(responseData);

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