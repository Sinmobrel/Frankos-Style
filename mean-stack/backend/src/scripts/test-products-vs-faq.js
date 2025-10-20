const axios = require('axios');

// Configuración del servidor
const BASE_URL = 'http://localhost:3000';
const CHAT_ENDPOINT = `${BASE_URL}/api/chat`;

// Preguntas específicas sobre productos que DEBEN ir a IA
const productQuestions = [
  // CONSULTAS QUE DEBEN MOSTRAR TRAJES
  "que trajes tienen disponibles?",
  "quiero ver trajes",
  "muéstrame trajes",
  "tienen trajes azules?",
  "que precios tienen los trajes?",
  "necesito un traje para boda",
  "busco un traje elegante",
  "quiero comprar un traje",
  "tienen trajes en talla 42?",
  "que colores de trajes manejan?",
  
  // CONSULTAS QUE DEBEN MOSTRAR CAMISAS
  "que camisas tienen?",
  "muéstrame camisas",
  "camisas blancas disponibles?",
  "precio de las camisas",
  "camisas slim fit",
  
  // CONSULTAS QUE DEBEN MOSTRAR CORBATAS
  "que corbatas tienen?",
  "corbatas azules",
  "precio corbatas",
  "corbatas para eventos",
  
  // CONSULTAS GENERALES QUE DEBEN USAR IA
  "que productos recomiendan?",
  "que tienen en stock?",
  "muestrame el catálogo",
  "que hay disponible?",
  "productos más vendidos",
  
  // CONSULTAS QUE SÍ DEBEN SER FAQ
  "donde están ubicados?",
  "que horarios tienen?",
  "aceptan tarjetas?",
  "qué es Franko's Style?",
  "tienen zapatos?"
];

// Función para hacer una pregunta al chatbot
async function askQuestion(question) {
  try {
    const response = await axios.post(CHAT_ENDPOINT, {
      message: question,
      history: []
    }, {
      timeout: 15000
    });
    
    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
      status: error.response?.status || 'No status'
    };
  }
}

// Función principal para ejecutar las pruebas
async function testProductQueries() {
  console.log('🧪 PRUEBAS DE CONSULTAS DE PRODUCTOS VS FAQ');
  console.log('=' .repeat(60));
  console.log(`📋 Total de preguntas a probar: ${productQuestions.length}`);
  console.log(`🌐 Servidor: ${BASE_URL}`);
  console.log('=' .repeat(60));
  
  let faqResponses = 0;
  let aiResponses = 0;
  let errors = 0;
  let productResponsesFound = 0;
  
  for (let i = 0; i < productQuestions.length; i++) {
    const question = productQuestions[i];
    console.log(`\n[${i + 1}/${productQuestions.length}] Pregunta: "${question}"`);
    
    const result = await askQuestion(question);
    
    if (result.success) {
      const source = result.data.source || 'AI';
      const response = result.data.reply || result.data.response || 'Sin respuesta';
      const hasProducts = result.data.products && result.data.products.length > 0;
      
      console.log(`✅ Fuente: ${source}`);
      console.log(`📦 Productos: ${hasProducts ? result.data.products.length : 0}`);
      console.log(`💬 Respuesta: ${response.substring(0, 100)}${response.length > 100 ? '...' : ''}`);
      
      if (source === 'FAQ') {
        faqResponses++;
      } else {
        aiResponses++;
        if (hasProducts) {
          productResponsesFound++;
          console.log(`🎯 ¡PRODUCTOS ENCONTRADOS! (${result.data.products.length})`);
        }
      }
    } else {
      console.log(`❌ Error: ${result.error}`);
      errors++;
    }
    
    // Pausa entre preguntas
    await new Promise(resolve => setTimeout(resolve, 800));
  }
  
  // Resumen final
  console.log('\n' + '=' .repeat(60));
  console.log('📊 RESUMEN DE RESULTADOS - PRODUCTOS VS FAQ');
  console.log('=' .repeat(60));
  console.log(`🎯 Respuestas FAQ: ${faqResponses}`);
  console.log(`🤖 Respuestas IA: ${aiResponses}`);
  console.log(`📦 Con productos: ${productResponsesFound}`);
  console.log(`❌ Errores: ${errors}`);
  console.log(`📈 IA/Total: ${((aiResponses / productQuestions.length) * 100).toFixed(1)}%`);
  console.log(`🎯 Productos/IA: ${aiResponses > 0 ? ((productResponsesFound / aiResponses) * 100).toFixed(1) : 0}%`);
  
  return {
    faqResponses,
    aiResponses,
    productResponsesFound,
    errors,
    total: productQuestions.length
  };
}

// Ejecutar si es el archivo principal
if (require.main === module) {
  testProductQueries().catch(error => {
    console.error('💥 Error fatal en el script:', error);
    process.exit(1);
  });
}

module.exports = { testProductQueries };