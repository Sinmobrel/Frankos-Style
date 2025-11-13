const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const productSchema = new Schema({
  // Campos básicos existentes
  name: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  imageUrl: { type: String },
  category: { type: String, required: true },
  stock: { type: Number, default: 0 },
  
  // Campos técnicos de producto
  sizes: [{ type: String }], // ["48", "50", "52", "54"]
  sizesText: { type: String }, // "48 – 54 (S – XL)"
  measurements: {
    length: { type: String },
    shoulders: { type: String },
    waist: { type: String }
  },
  colors: [{ type: String }], // ["Gris", "Negro", "Burdeos"]
  mainColor: { type: String }, // Color principal
  productType: { type: String }, // "Traje Completo", "Camisa", etc.
  eventTypes: [{ type: String }], // ["Bodas", "Galas", "Oficina"]
  gender: { type: String, default: "Masculino" },
  cut: { type: String }, // "Slim Fit", "Executive", etc.
  includes: [{ type: String }], // Componentes incluidos
  material: { type: String }, // Descripción del material
  
  // Categorización avanzada
  subcategory: { type: String }, // Subcategoría específica
  occasion: { type: String }, // Ocasión principal
  priceRange: { type: String }, // "Económico", "Medio", "Premium", "Luxury"
  
  // Tags para búsqueda y chatbot
  tags: [{ type: String }], // Tags para búsqueda semántica
  
  // Campos de marketing
  featured: { type: Boolean, default: false }, // Producto destacado
  available: { type: Boolean, default: true }, // Disponible para venta
  newProduct: { type: Boolean, default: false }, // Producto nuevo
  isPopular: { type: Boolean, default: false }, // Producto popular
  isExclusive: { type: Boolean, default: false }, // Producto exclusivo
  
  // Campos de SEO y búsqueda
  searchKeywords: [{ type: String }], // Palabras clave adicionales
  
  // Timestamps
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Índices para búsquedas eficientes
productSchema.index({ stock: 1, createdAt: -1 });      // Para listado principal paginado
productSchema.index({ category: 1, stock: 1 });        // Para filtro por categoría
productSchema.index({ price: 1 });                     // Para filtro por precio
productSchema.index({ mainColor: 1 });                 // Para filtro por color
productSchema.index({ category: 1, mainColor: 1 });
productSchema.index({ priceRange: 1, featured: 1 });
productSchema.index({ tags: 1 });
productSchema.index({ eventTypes: 1 });
productSchema.index({ name: 'text', description: 'text', tags: 'text' });

module.exports = mongoose.model('Product', productSchema);
