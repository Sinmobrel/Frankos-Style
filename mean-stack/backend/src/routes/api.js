const express = require('express');
const router = express.Router();

// Importar controladores
const userController = require('../controllers/userController');
const productController = require('../controllers/productController');
const uploadController = require('../controllers/uploadController');
const authController = require('../controllers/authController');
const upload = require('../config/cloudinary');
const chatRoutes = require('./chat');

// Rutas de autenticación
router.post('/auth/login', authController.login);
router.get('/auth/test', authController.verifyToken, authController.testAuth);

// Rutas para usuarios
router.get('/users', userController.getUsers);
router.get('/users/:id', userController.getUserById);
router.post('/users', userController.createUser);
router.put('/users/:id', userController.updateUser);
router.delete('/users/:id', userController.deleteUser);

// Rutas para productos
router.get('/products', productController.getProducts);
router.get('/products/:id', productController.getProductById);
// Proteger rutas de administración con middleware de autenticación
router.post('/products', authController.verifyToken, authController.isAdmin, productController.createProduct);
router.put('/products/:id', authController.verifyToken, authController.isAdmin, productController.updateProduct);
router.delete('/products/:id', authController.verifyToken, authController.isAdmin, productController.deleteProduct);

// Ruta para subir imágenes
router.post('/upload', authController.verifyToken, authController.isAdmin, upload.single('file'), uploadController.uploadImage);

// Rutas del chatbot
router.use('/', chatRoutes);

// Ruta de prueba
router.get('/test', (req, res) => {
  res.json({ message: 'La API está funcionando correctamente' });
});

module.exports = router;
