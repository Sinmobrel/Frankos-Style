const express = require('express');
const router = express.Router();

// Importar controladores
const userController = require('../controllers/userController');
const productController = require('../controllers/productController');
const uploadController = require('../controllers/uploadController');
const upload = require('../config/multer');

// Rutas para usuarios
router.get('/users', userController.getUsers);
router.get('/users/:id', userController.getUserById);
router.post('/users', userController.createUser);
router.put('/users/:id', userController.updateUser);
router.delete('/users/:id', userController.deleteUser);

// Rutas para productos
router.get('/products', productController.getProducts);
router.get('/products/:id', productController.getProductById);
router.post('/products', productController.createProduct);
router.put('/products/:id', productController.updateProduct);
router.delete('/products/:id', productController.deleteProduct);

// Ruta para subir imágenes
router.post('/upload', upload.single('file'), uploadController.uploadImage);

// Ruta de prueba
router.get('/test', (req, res) => {
  res.json({ message: 'La API está funcionando correctamente' });
});

module.exports = router;
