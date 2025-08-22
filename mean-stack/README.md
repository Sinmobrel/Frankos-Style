# MEAN Stack Application

Este proyecto es una aplicación full-stack desarrollada con el stack MEAN (MongoDB, Express, Angular, Node.js).

## Estructura del Proyecto

- **backend/**: API REST desarrollada con Node.js y Express
- **frontend/**: Aplicación cliente desarrollada con Angular

## Requisitos

- Node.js (v14 o superior)
- MongoDB
- Angular CLI

## Configuración e Instalación

### Backend

1. Navega a la carpeta `backend`:
   ```
   cd backend
   ```

2. Instala las dependencias:
   ```
   npm install
   ```

3. Configura las variables de entorno:
   - Crea un archivo `.env` basado en el ejemplo proporcionado
   - Configura la URI de conexión a MongoDB y otros parámetros

4. Inicia el servidor:
   ```
   npm run dev
   ```

El servidor se ejecutará en `http://localhost:3000`.

### Frontend

1. Navega a la carpeta `frontend`:
   ```
   cd frontend
   ```

2. Instala las dependencias:
   ```
   npm install
   ```

3. Inicia el servidor de desarrollo:
   ```
   npm start
   ```

La aplicación estará disponible en `http://localhost:4200`.

## API Endpoints

### Usuarios

- `GET /api/users` - Obtener todos los usuarios
- `GET /api/users/:id` - Obtener usuario por ID
- `POST /api/users` - Crear un nuevo usuario
- `PUT /api/users/:id` - Actualizar un usuario
- `DELETE /api/users/:id` - Eliminar un usuario

### Productos

- `GET /api/products` - Obtener todos los productos
- `GET /api/products/:id` - Obtener producto por ID
- `POST /api/products` - Crear un nuevo producto
- `PUT /api/products/:id` - Actualizar un producto
- `DELETE /api/products/:id` - Eliminar un producto

## Características

- Autenticación de usuarios (por implementar)
- CRUD de productos
- Diseño responsivo
- API RESTful

## Licencia

MIT
