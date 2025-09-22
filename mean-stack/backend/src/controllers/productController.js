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
  const { name, description, price, imageUrl, category, stock } = req.body;
  
  try {
    const product = new Product({
      name,
      description,
      price,
      imageUrl,
      category,
      stock: stock || 0
    });

    const savedProduct = await product.save();
    res.status(201).json({
      message: 'Producto creado correctamente',
      product: savedProduct
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Actualizar un producto
exports.updateProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!product) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }
    res.status(200).json({ message: 'Producto actualizado correctamente', product });
  } catch (error) {
    res.status(500).json({ message: error.message });
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
