const axios = require('axios');

// 🧪 Test específico para verificar que la IA muestre precios en las respuestas sobre productos
const PRICE_TEST_QUESTIONS = [
  "que trajes tienen disponibles?",
  "cuál es el precio de los trajes?",
  "que precios tienen los trajes?",
  "muéstrame trajes con precios",
  "cuánto cuesta un traje?",
  "necesito un traje, que precios manejan?",
  "que camisas tienen y cuánto cuestan?",
  "precio de las camisas",
  "corbatas disponibles con precios",
  "muéstrame el catálogo con precios"
];

const SERVER_URL = 'http://localhost:3000';

async function testPriceResponses() {
  console.log('💰 PRUEBAS DE RESPUESTAS CON PRECIOS');
  console.log('============================================================');
  console.log(`📋 Total de preguntas sobre precios: ${PRICE_TEST_QUESTIONS.length}`);
  console.log(`🌐 Servidor: ${SERVER_URL}`);
  console.log('============================================================\n');

  let pricesMentioned = 0;
  let aiResponses = 0;
  let specificPrices = 0;
  let priceRanges = 0;

  for (let i = 0; i < PRICE_TEST_QUESTIONS.length; i++) {
    const question = PRICE_TEST_QUESTIONS[i];
    
    try {
      console.log(`[${i+1}/${PRICE_TEST_QUESTIONS.length}] Pregunta: "${question}"`);
      
      const response = await axios.post(`${SERVER_URL}/api/chat`, {
        message: question
      });

      const { reply, products } = response.data;
      const source = products ? 'AI' : 'FAQ';
      
      console.log(`✅ Fuente: ${source}`);
      
      if (source === 'AI') {
        aiResponses++;
        
        // Verificar si menciona precios específicos ($123.456)
        const specificPriceMatches = reply.match(/\$[\d,\.]+/g);
        const hasSpecificPrices = specificPriceMatches && specificPriceMatches.length > 0;
        
        // Verificar si menciona rangos de precios
        const hasPriceRange = reply.includes('desde') || reply.includes('hasta') || reply.includes('rango');
        
        // Verificar palabras relacionadas con precios
        const priceKeywords = ['precio', 'cuesta', 'vale', 'costo', '$', 'peso'];
        const mentionsPrices = priceKeywords.some(keyword => 
          reply.toLowerCase().includes(keyword)
        );
        
        if (hasSpecificPrices) {
          specificPrices++;
          console.log(`💰 ¡PRECIOS ESPECÍFICOS! ${specificPriceMatches.join(', ')}`);
        }
        
        if (hasPriceRange) {
          priceRanges++;
          console.log(`📊 Menciona rango de precios`);
        }
        
        if (mentionsPrices) {
          pricesMentioned++;
          console.log(`💳 Menciona información de precios`);
        }
        
        if (!mentionsPrices && !hasSpecificPrices) {
          console.log(`⚠️  NO menciona precios en respuesta sobre productos`);
        }
        
        // Mostrar respuesta resumida
        const shortReply = reply.length > 100 ? reply.substring(0, 100) + '...' : reply;
        console.log(`💬 Respuesta: ${shortReply}`);
      }
      
      console.log('');
      
    } catch (error) {
      console.error(`❌ Error en pregunta "${question}":`, error.message);
    }
  }
  
  console.log('============================================================');
  console.log('📊 RESUMEN DE PRUEBAS DE PRECIOS');
  console.log('============================================================');
  console.log(`🤖 Respuestas IA: ${aiResponses}`);
  console.log(`💰 Respuestas que mencionan precios: ${pricesMentioned}`);
  console.log(`💳 Respuestas con precios específicos: ${specificPrices}`);
  console.log(`📊 Respuestas con rangos de precio: ${priceRanges}`);
  console.log(`📈 % IA que menciona precios: ${aiResponses > 0 ? ((pricesMentioned / aiResponses) * 100).toFixed(1) : 0}%`);
  console.log(`🎯 % IA con precios específicos: ${aiResponses > 0 ? ((specificPrices / aiResponses) * 100).toFixed(1) : 0}%`);
  
  // Evaluación
  const pricePercentage = aiResponses > 0 ? (pricesMentioned / aiResponses) * 100 : 0;
  
  if (pricePercentage >= 80) {
    console.log('\n✅ EXCELENTE: La IA menciona precios en la mayoría de respuestas');
  } else if (pricePercentage >= 60) {
    console.log('\n⚠️  BUENO: La IA menciona precios en muchas respuestas, pero puede mejorar');
  } else {
    console.log('\n❌ NECESITA MEJORA: La IA no está mencionando suficientes precios');
  }
}

// Ejecutar el test
testPriceResponses().catch(console.error);