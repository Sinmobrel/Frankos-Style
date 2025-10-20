#!/usr/bin/env node

/**
 * GESTOR DE SCRIPTS - FRANKO'S STYLE
 * ===================================
 * Script centralizado para ejecutar todas las operaciones de base de datos
 * y mantenimiento del proyecto de manera organizada.
 */

const path = require('path');
const { spawn } = require('child_process');

// Configuración de scripts disponibles
const SCRIPTS = {
  'analyze': {
    file: 'analyze-products.js',
    description: '📊 Analizar productos en la base de datos',
    category: 'análisis'
  },
  'update-descriptions': {
    file: 'update-technical-descriptions.js',
    description: '📝 Actualizar descripciones técnicas de productos',
    category: 'actualización'
  },
  'structure-db': {
    file: 'structure-products-db.js',
    description: '🏗️  Estructurar base de datos con campos técnicos',
    category: 'estructura'
  },
  'create-admin': {
    file: 'create-admin-user.js',
    description: '👤 Crear usuario administrador',
    category: 'usuarios'
  }
};

function showHelp() {
  console.log('\n🎯 GESTOR DE SCRIPTS - FRANKO\'S STYLE');
  console.log('=====================================\n');
  
  console.log('Uso: node run-scripts.js [comando]\n');
  
  console.log('📋 Comandos disponibles:\n');
  
  Object.entries(SCRIPTS).forEach(([cmd, info]) => {
    console.log(`  ${cmd.padEnd(20)} ${info.description}`);
  });
  
  console.log('\n💡 Ejemplos:');
  console.log('  node run-scripts.js analyze          # Analizar productos');
  console.log('  node run-scripts.js structure-db     # Estructurar DB');
  console.log('  node run-scripts.js update-descriptions # Actualizar descripciones');
  
  console.log('\n🔧 Para ejecutar desde la raíz del backend:');
  console.log('  node src/scripts/run-scripts.js [comando]\n');
}

function runScript(scriptName) {
  const script = SCRIPTS[scriptName];
  
  if (!script) {
    console.log(`❌ Script '${scriptName}' no encontrado.\n`);
    showHelp();
    return;
  }
  
  const scriptPath = path.join(__dirname, script.file);
  
  console.log(`\n🚀 Ejecutando: ${script.description}`);
  console.log(`📁 Archivo: ${script.file}`);
  console.log('='.repeat(50));
  
  const child = spawn('node', [scriptPath], {
    stdio: 'inherit',
    cwd: __dirname
  });
  
  child.on('close', (code) => {
    if (code === 0) {
      console.log(`\n✅ Script '${scriptName}' completado exitosamente.`);
    } else {
      console.log(`\n❌ Script '${scriptName}' terminó con errores (código: ${code}).`);
    }
  });
  
  child.on('error', (err) => {
    console.error(`❌ Error ejecutando script: ${err.message}`);
  });
}

// Procesar argumentos de línea de comandos
const args = process.argv.slice(2);

if (args.length === 0) {
  showHelp();
} else {
  const command = args[0];
  runScript(command);
}