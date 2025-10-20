const Product = require('../models/product');

// Obtener todos los productos
exports.getProducts = async (req, res) => {
  try {
    const products = await Product.find();
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Obtener un producto por ID
exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }
    res.status(200).json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Crear un nuevo producto
exports.createProduct = async (req, res) => {
  try {
    // Validar campos requeridos
    const { name, description, price, category } = req.body;
    
    if (!name || name.trim().length < 3) {
      return res.status(400).json({ 
        message: 'El nombre del producto es requerido y debe tener al menos 3 caracteres',
        field: 'name'
      });
    }

    if (!description || description.trim().length < 10) {
      return res.status(400).json({ 
        message: 'La descripción es requerida y debe tener al menos 10 caracteres',
        field: 'description'
      });
    }

    if (!price || price < 0) {
      return res.status(400).json({ 
        message: 'El precio es requerido y debe ser mayor o igual a 0',
        field: 'price'
      });
    }

    if (!category) {
      return res.status(400).json({ 
        message: 'La categoría es requerida',
        field: 'category'
      });
    }

    if (!req.body.imageUrl) {
      return res.status(400).json({ 
        message: 'La imagen del producto es requerida',
        field: 'imageUrl'
      });
    }

    // Crear producto con todos los campos del body
    const product = new Product(req.body);
    
    // Asegurar que stock tenga un valor por defecto
    if (!product.stock) {
      product.stock = 0;
    }

    const savedProduct = await product.save();
    res.status(201).json({
      message: 'Producto creado correctamente',
      product: savedProduct
    });
  } catch (error) {
    console.error('Error creando producto:', error);
    
    // Manejo específico de errores de MongoDB
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => ({
        field: err.path,
        message: err.message
      }));
      
      return res.status(400).json({
        message: 'Error de validación',
        errors: validationErrors
      });
    }
    
    // Error de duplicado (nombre único)
    if (error.code === 11000) {
      const duplicateField = Object.keys(error.keyValue)[0];
      return res.status(409).json({
        message: `Ya existe un producto con este ${duplicateField}`,
        field: duplicateField,
        value: error.keyValue[duplicateField]
      });
    }
    
    // Error genérico del servidor
    res.status(500).json({ 
      message: 'Error interno del servidor al crear el producto',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Actualizar un producto
exports.updateProduct = async (req, res) => {
  try {
    // Validar que el ID sea válido
    if (!req.params.id || req.params.id.length !== 24) {
      return res.status(400).json({ 
        message: 'ID de producto inválido',
        field: 'id'
      });
    }

    // Validar campos requeridos si están presentes
    if (req.body.name && req.body.name.trim().length < 3) {
      return res.status(400).json({ 
        message: 'El nombre del producto debe tener al menos 3 caracteres',
        field: 'name'
      });
    }

    if (req.body.description && req.body.description.trim().length < 10) {
      return res.status(400).json({ 
        message: 'La descripción debe tener al menos 10 caracteres',
        field: 'description'
      });
    }

    if (req.body.price !== undefined && req.body.price < 0) {
      return res.status(400).json({ 
        message: 'El precio debe ser mayor o igual a 0',
        field: 'price'
      });
    }

    // Actualizar con todos los campos del body
    const product = await Product.findByIdAndUpdate(
      req.params.id, 
      req.body, 
      { new: true, runValidators: true }
    );
    
    if (!product) {
      return res.status(404).json({ 
        message: 'Producto no encontrado',
        productId: req.params.id
      });
    }
    
    res.status(200).json({ 
      message: 'Producto actualizado correctamente', 
      product 
    });
  } catch (error) {
    console.error('Error actualizando producto:', error);
    
    // Manejo específico de errores de MongoDB
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => ({
        field: err.path,
        message: err.message
      }));
      
      return res.status(400).json({
        message: 'Error de validación',
        errors: validationErrors
      });
    }
    
    // Error de duplicado
    if (error.code === 11000) {
      const duplicateField = Object.keys(error.keyValue)[0];
      return res.status(409).json({
        message: `Ya existe un producto con este ${duplicateField}`,
        field: duplicateField,
        value: error.keyValue[duplicateField]
      });
    }
    
    // Error genérico del servidor
    res.status(500).json({ 
      message: 'Error interno del servidor al actualizar el producto',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Eliminar un producto
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }
    res.status(200).json({ message: 'Producto eliminado correctamente' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
