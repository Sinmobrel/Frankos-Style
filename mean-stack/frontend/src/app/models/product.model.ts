export interface Product {
  // Campos básicos existentes
  _id?: string;
  name: string;
  description: string;
  price: number;
  imageUrl?: string;
  image?: string; // Campo adicional para compatibilidad
  category: string;
  stock: number;
  
  // Campos técnicos de producto
  sizes?: string[]; // ["48", "50", "52", "54"]
  sizesText?: string; // "48 – 54 (S – XL)"
  measurements?: {
    length?: string;
    shoulders?: string;
    waist?: string;
  };
  colors?: string[]; // ["Gris", "Negro", "Burdeos"]
  mainColor?: string; // Color principal
  productType?: string; // "Traje Completo", "Camisa", etc.
  eventTypes?: string[]; // ["Bodas", "Galas", "Oficina"]
  gender?: string; // "Masculino"
  cut?: string; // "Slim Fit", "Executive", etc.
  includes?: string[]; // Componentes incluidos
  material?: string; // Descripción del material
  
  // Categorización avanzada
  subcategory?: string; // Subcategoría específica
  occasion?: string; // Ocasión principal
  priceRange?: string; // "Económico", "Medio", "Premium", "Luxury"
  
  // Tags para búsqueda y chatbot
  tags?: string[]; // Tags para búsqueda semántica
  
  // Campos de marketing
  featured?: boolean; // Producto destacado
  available?: boolean; // Disponible para venta
  isNew?: boolean; // Producto nuevo
  isPopular?: boolean; // Producto popular
  isExclusive?: boolean; // Producto exclusivo
  
  // Campos de SEO y búsqueda
  searchKeywords?: string[]; // Palabras clave adicionales
  
  // Timestamps
  createdAt?: Date;
  updatedAt?: Date;
}
