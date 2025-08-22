const path = require('path');

// Controlador para subir imágenes
exports.uploadImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No se ha seleccionado ningún archivo' });
    }

    // Construir la URL del archivo
    const protocol = req.protocol;
    const host = req.get('host');
    const imagePath = path.join('uploads', req.file.filename).replace(/\\/g, '/');
    const imageUrl = `${protocol}://${host}/${imagePath}`;

    return res.status(200).json({
      success: true,
      url: imageUrl,
      filename: req.file.filename
    });
  } catch (error) {
    console.error('Error al subir la imagen:', error);
    return res.status(500).json({ error: 'Error al procesar la subida de la imagen' });
  }
};
