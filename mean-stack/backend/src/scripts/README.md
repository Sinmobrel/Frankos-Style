# 📁 Scripts - Franko's Style

Esta carpeta contiene todos los scripts de mantenimiento y gestión de la base de datos para el proyecto Franko's Style.

## 🎯 Estructura de Scripts

### 📊 Análisis
- **`analyze-products.js`** - Analiza la estructura y contenido de productos en la DB
- **`run-scripts.js`** - Gestor centralizado para ejecutar scripts

### 📝 Actualización de Datos
- **`update-technical-descriptions.js`** - Actualiza descripciones técnicas de productos
- **`structure-products-db.js`** - Estructura la DB con campos técnicos completos

### 👤 Gestión de Usuarios
- **`create-admin-user.js`** - Crea usuarios administradores

## 🚀 Cómo Usar

### Opción 1: Gestor Centralizado (Recomendado)
```bash
# Desde la carpeta backend
node src/scripts/run-scripts.js [comando]

# Ejemplos:
node src/scripts/run-scripts.js analyze
node src/scripts/run-scripts.js structure-db
node src/scripts/run-scripts.js update-descriptions
```

### Opción 2: Ejecución Directa
```bash
# Desde la carpeta scripts
cd src/scripts
node analyze-products.js
node structure-products-db.js
```

## 📋 Comandos Disponibles

| Comando | Descripción | Uso |
|---------|-------------|-----|
| `analyze` | 📊 Analizar productos en la DB | `node run-scripts.js analyze` |
| `structure-db` | 🏗️ Estructurar DB con campos técnicos | `node run-scripts.js structure-db` |
| `update-descriptions` | 📝 Actualizar descripciones técnicas | `node run-scripts.js update-descriptions` |
| `create-admin` | 👤 Crear usuario administrador | `node run-scripts.js create-admin` |

## 🔧 Configuración

Todos los scripts usan las variables de entorno del archivo `.env` en la raíz del backend:

```env
MONGODB_URI=mongodb://localhost:27017/mean-stack-db
NODE_ENV=development
JWT_SECRET=Nokia2.0
```

## 📦 Dependencias

Los scripts requieren:
- Node.js
- MongoDB (local o remoto)
- Variables de entorno configuradas
- Modelo de Product actualizado

## 🛡️ Consideraciones

- ⚠️ **Respaldo**: Siempre respalda la DB antes de ejecutar scripts de estructura
- 🔒 **Permisos**: Asegúrate de tener permisos de escritura en la DB
- 📊 **Verificación**: Usa `analyze` antes y después de cambios importantes

## 📈 Orden Recomendado para Nueva Instalación

1. `analyze` - Ver estado actual
2. `update-descriptions` - Actualizar descripciones
3. `structure-db` - Agregar campos técnicos
4. `analyze` - Verificar cambios
5. `create-admin` - Crear usuario admin (si es necesario)

---

**Franko's Style - Sistema de Gestión de Productos**  
*Manteniendo la elegancia en el código y en la moda* ✨