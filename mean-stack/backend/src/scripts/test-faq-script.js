const axios = require('axios');
const fs = require('fs');

// Configuración del servidor
const BASE_URL = 'http://localhost:3000';
const CHAT_ENDPOINT = `${BASE_URL}/api/chat`;

// Preguntas de prueba para el sistema FAQ
const testQuestions = [
  // INFORMACIÓN DE LA EMPRESA
  "¿Qué es Franko's Style?",
  "que hacen ustedes?",
  "cuál es su especialidad",
  "que tipo de negocio son",
  
  // PRODUCTOS GENERALES
  "en que se especializan?",
  "que productos venden",
  "que tipo de ropa tienen",
  
  // PÚBLICO OBJETIVO
  "para quienes es su ropa?",
  "venden ropa de mujer?",
  "tienen ropa para señoras?",
  
  // PRODUCTOS NO DISPONIBLES
  "tienen ropa casual?",
  "venden jeans?",
  "tienen poleras?",
  "venden zapatillas?",
  "tienen zapatos?",
  "que calzado manejan?",
  
  // UBICACIÓN Y HORARIOS
  "donde están ubicados?",
  "cual es su dirección?",
  "que horarios tienen?",
  "están abiertos los domingos?",
  
  // PAGOS Y COMPRAS
  "como puedo pagar?",
  "aceptan tarjetas?",
  "tienen delivery?",
  "hacen envios?",
  "cual es su política de cambios?",
  
  // OCASIONES ESPECÍFICAS
  "necesito algo para una boda",
  "que me recomiendan para una entrevista de trabajo?",
  "tengo una gala, que sugieren?",
  
  // ASESORAMIENTO
  "que colores me recomiendan?",
  "que tipos de trajes tienen?",
  "como sé mi talla?",
  "tengo presupuesto limitado",
  
  // CONSULTAS CONFUSAS
  "ayuda",
  "no se que quiero",
  "asdasd",
  "???"
];

// Función para hacer una pregunta al chatbot
async function askQuestion(question) {
  try {
    const response = await axios.post(CHAT_ENDPOINT, {
      message: question,
      history: []
    }, {
      timeout: 10000 // 10 segundos de timeout
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

// Función principal para ejecutar todas las pruebas
async function runFAQTests() {
  console.log('🚀 INICIANDO PRUEBAS DEL SISTEMA FAQ DE FRANKO\'S STYLE');
  console.log('=' .repeat(60));
  console.log(`📋 Total de preguntas a probar: ${testQuestions.length}`);
  console.log(`🌐 Servidor: ${BASE_URL}`);
  console.log('=' .repeat(60));
  
  const results = [];
  let faqResponses = 0;
  let aiResponses = 0;
  let errors = 0;
  
  for (let i = 0; i < testQuestions.length; i++) {
    const question = testQuestions[i];
    console.log(`\n[${i + 1}/${testQuestions.length}] Pregunta: "${question}"`);
    
    const result = await askQuestion(question);
    
    if (result.success) {
      const source = result.data.source || 'AI';
      const response = result.data.reply || result.data.response || 'Sin respuesta';
      
      console.log(`✅ Fuente: ${source}`);
      console.log(`💬 Respuesta: ${response.substring(0, 150)}${response.length > 150 ? '...' : ''}`);
      
      if (source === 'FAQ') {
        faqResponses++;
      } else {
        aiResponses++;
      }
      
      results.push({
        question,
        source,
        response,
        success: true
      });
    } else {
      console.log(`❌ Error: ${result.error}`);
      console.log(`📊 Status: ${result.status}`);
      errors++;
      
      results.push({
        question,
        error: result.error,
        status: result.status,
        success: false
      });
    }
    
    // Pausa pequeña entre preguntas para no saturar el servidor
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  // Resumen final
  console.log('\n' + '=' .repeat(60));
  console.log('📊 RESUMEN DE RESULTADOS');
  console.log('=' .repeat(60));
  console.log(`🎯 Respuestas FAQ: ${faqResponses}`);
  console.log(`🤖 Respuestas IA: ${aiResponses}`);
  console.log(`❌ Errores: ${errors}`);
  console.log(`✅ Total exitosas: ${faqResponses + aiResponses}`);
  console.log(`📈 Tasa de éxito: ${((faqResponses + aiResponses) / testQuestions.length * 100).toFixed(1)}%`);
  
  // Guardar resultados en archivo
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const filename = `faq-test-results-${timestamp}.json`;
  
  const report = {
    timestamp: new Date().toISOString(),
    summary: {
      totalQuestions: testQuestions.length,
      faqResponses,
      aiResponses,
      errors,
      successRate: ((faqResponses + aiResponses) / testQuestions.length * 100).toFixed(1)
    },
    results
  };
  
  fs.writeFileSync(filename, JSON.stringify(report, null, 2));
  console.log(`\n💾 Resultados guardados en: ${filename}`);
  
  return report;
}

// Función para probar conectividad del servidor
async function testServerConnection() {
  try {
    console.log('🔍 Verificando conectividad del servidor...');
    const response = await axios.get(`${BASE_URL}/api/health`, { timeout: 5000 });
    console.log('✅ Servidor accesible');
    return true;
  } catch (error) {
    console.log('❌ No se puede conectar al servidor');
    console.log(`Error: ${error.message}`);
    console.log(`\n💡 Asegúrate de que el servidor backend esté ejecutándose:`);
    console.log(`   npm start`);
    return false;
  }
}

// Ejecutar el script
async function main() {
  console.log('🧪 SCRIPT DE PRUEBA FAQ - FRANKO\'S STYLE CHATBOT');
  console.log('Fecha:', new Date().toLocaleString());
  console.log();
  
  const serverOk = await testServerConnection();
  if (!serverOk) {
    process.exit(1);
  }
  
  await runFAQTests();
  
  console.log('\n🎉 Pruebas completadas. Revisa los resultados arriba.');
}

// Ejecutar si es el archivo principal
if (require.main === module) {
  main().catch(error => {
    console.error('💥 Error fatal en el script:', error);
    process.exit(1);
  });
}

module.exports = {
  runFAQTests,
  testServerConnection,
  askQuestion
};