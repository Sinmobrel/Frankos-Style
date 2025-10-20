#!/usr/bin/env node

const { runFAQTests, testServerConnection } = require('./test-faq-script.js');

async function main() {
  console.log('🔧 EJECUTOR RÁPIDO DE PRUEBAS FAQ');
  console.log('==================================\n');
  
  // Verificar servidor
  const serverOk = await testServerConnection();
  if (!serverOk) {
    console.log('\n❌ El servidor no está disponible.');
    console.log('💡 Para iniciarlo, ejecuta:');
    console.log('   npm start');
    process.exit(1);
  }
  
  // Ejecutar pruebas
  console.log('\n🚀 Ejecutando pruebas FAQ...\n');
  await runFAQTests();
}

main().catch(console.error);