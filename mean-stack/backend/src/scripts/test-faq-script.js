const axios = require('axios');
const fs = require('fs');

// Configuración del servidor
const BASE_URL = 'http://localhost:3000';
const CHAT_ENDPOINT = `${BASE_URL}/api/chat`;

// Preguntas de prueba AMBIGUAS Y COMPLEJAS para el sistema
const testQuestions = [
  // ===== PRESUPUESTO + OCASIÓN COMPLEJAS =====
  "tengo un bautizo y soy el padrino, ademas tengo un presupuesto de 200000",
  "me caso en 2 meses y solo puedo gastar 150 mil pesos que me recomiendas",
  "necesito algo elegante para una boda pero económico, digamos unos $100.000",
  "mi graduación es la próxima semana, tengo como 250000 para gastar",
  "voy a una gala de la empresa y mi presupuesto es de $300.000 más o menos",
  "soy testigo de matrimonio y tengo 180 mil, que opciones hay?",
  "comunión de mi sobrino, soy padrino, presupuesto 200.000 pesos chilenos",
  "tengo una entrevista importante y solo 120000 disponible",
  
  // ===== MULTI-OCASIÓN AMBIGUA =====
  "necesito algo que sirva tanto para bodas como para el trabajo",
  "busco un traje versátil para graduación y también para galas",
  "quiero algo que use en la oficina pero también en cenas elegantes",
  "necesito ropa para varias ocasiones: trabajo, bodas y eventos formales",
  
  // ===== PRESUPUESTO AMBIGUO SIN OCASIÓN =====
  "tengo 200 mil que me puedes mostrar",
  "mi presupuesto es limitado, solo $150.000",
  "cuento con $300000 para comprar",
  "tengo como 100 mil pesos nada mas",
  
  // ===== OCASIÓN SIN PRESUPUESTO =====
  "voy a un bautizo como padrino que me recomiendas",
  "me invitaron a una boda elegante",
  "tengo una cena romántica importante",
  "asisto a una graduación universitaria",
  "mi cumpleaños número 30 quiero algo especial",
  
  // ===== PREGUNTAS MUY AMBIGUAS =====
  "que tienen bonito?",
  "muestrame lo mejor",
  "quiero algo que se vea bien",
  "necesito ropa elegante",
  "algo formal pero no tanto",
  "busco algo discreto pero impactante",
  
  // ===== COLOR + OCASIÓN + PRESUPUESTO =====
  "quiero un traje azul para boda con presupuesto de 200000",
  "algo gris para trabajo que no cueste mas de 150 mil",
  "traje negro elegante para gala, tengo 250000",
  "busco algo en color marino para bautizo, máximo $180.000",
  
  // ===== TALLA + PRECIO + OCASIÓN =====
  "necesito talla 42 para boda, presupuesto 200 mil",
  "talla L o XL algo para oficina económico",
  "uso 46 que tienen para graduación bajo 300000",
  
  // ===== CONSULTAS CONTRADICTORIAS =====
  "quiero algo muy elegante pero barato",
  "necesito un traje económico de lujo",
  "algo exclusivo que no sea caro",
  "busco calidad premium con presupuesto ajustado",
  
  // ===== COMPARACIONES Y DUDAS =====
  "no se si azul o gris para una boda",
  "cual es mejor para entrevista, negro o marino?",
  "entre slim y regular cual me conviene?",
  "es mejor un traje de 200 mil o dos de 100 mil?",
  
  // ===== CONSULTAS INCOMPLETAS =====
  "tengo un evento y...",
  "estaba pensando en comprar algo",
  "me gustan los trajes pero",
  "quizás necesite",
  
  // ===== JERGA Y COLOQUIALISMOS =====
  "necesito un terno bacán para mi matrimonio",
  "quiero verme piola para la pega",
  "algo pulento para una talla importante",
  "cachái algo filete para una junta?",
  
  // ===== CONSULTAS EMOCIONALES =====
  "me siento perdido, no se que comprar",
  "estoy nervioso por mi boda y necesito ayuda",
  "es muy importante verme bien ese día",
  "quiero impresionar en mi entrevista",
  
  // ===== MÚLTIPLES REQUISITOS =====
  "busco traje azul marino, talla 44, para boda, máximo 200 mil, que sea moderno",
  "necesito camisa blanca, corbata elegante y traje gris, todo por 250000",
  "quiero un conjunto completo para graduación, soy talla L, presupuesto 300 mil",
  
  // ===== PREGUNTAS TÉCNICAS AMBIGUAS =====
  "que diferencia hay entre sus trajes?",
  "como se cual es mi talla exacta?",
  "que significa corte slim?",
  "cual es la diferencia de precio entre sus productos?",
  
  // ===== CONSULTAS TEMPORALES =====
  "mi evento es mañana que tienen disponible?",
  "necesito algo urgente para pasado mañana",
  "mi boda es en 3 meses, cuando debería comprar?",
  "cuanto demoran en tener stock?",
  
  // ===== PREGUNTAS SOBRE STOCK SIN ESPECIFICAR =====
  "tienen stock?",
  "hay disponibilidad?",
  "esta todo agotado?",
  "cuando llega mercadería nueva?",
  
  // ===== CONSULTAS CONFUSAS O EXTRAÑAS =====
  "ayuda",
  "no se que quiero",
  "asdasd",
  "???",
  "hola como estas que me recomiendas tengo un evento",
  "emmm... pues... necesito algo...",
  "traje? camisa? no se...",
  
  // ===== CONSULTAS CON ERRORES ORTOGRÁFICOS =====
  "tnego un vautiso y soy el padrno",
  "nesesito algo elejante para voda",
  "presupusto de 200mil pesos",
  "talla cuarenta y dos mas o meno",
  
  // ===== PREGUNTAS SOBRE CONTACTO Y UBICACIÓN AMBIGUAS =====
  "como los contacto?",
  "donde quedan?",
  "estan cerca del metro?",
  "puedo ir hoy?",
  
  // ===== COMPARACIÓN CON COMPETENCIA =====
  "son mejores que otras tiendas?",
  "por que debería comprar con ustedes?",
  "que los hace diferentes?"
];

// Función para hacer una pregunta al chatbot
async function askQuestion(question) {
  try {
    const response = await axios.post(CHAT_ENDPOINT, {
      message: question,
      history: []
    }, {
      timeout: 30000 // 30 segundos de timeout (aumentado de 10s)
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
    // Hacer una prueba simple al endpoint de chat
    const response = await axios.post(CHAT_ENDPOINT, {
      message: 'hola',
      history: []
    }, { timeout: 5000 });
    console.log('✅ Servidor accesible');
    return true;
  } catch (error) {
    console.log('❌ No se puede conectar al servidor');
    console.log(`Error: ${error.message}`);
    console.log(`\n💡 Asegúrate de que el servidor backend esté ejecutándose:`);
    console.log(`   npm start`);
    console.log(`\n🔍 URL intentada: ${CHAT_ENDPOINT}`);
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