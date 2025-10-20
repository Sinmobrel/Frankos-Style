// Controlador para subir imágenes a Cloudinary
exports.uploadImage = async (req, res) => {
  try {
    console.log('Archivo recibido en upload:', req.file);
    if (!req.file) {
      console.error('No se ha recibido ningún archivo');
      return res.status(400).json({ error: 'No se ha seleccionado ningún archivo' });
    }

    // Con multer-storage-cloudinary, la estructura del objeto req.file puede variar
    // Asegurémonos de obtener la URL correctamente
    const imageUrl = req.file.path || req.file.secure_url || req.file.url;
    const publicId = req.file.filename || req.file.public_id;

    console.log('URL de imagen generada:', imageUrl);
    console.log('Public ID:', publicId);

    return res.status(200).json({
      success: true,
      url: imageUrl,
      filename: publicId,
      publicId: publicId
    });
  } catch (error) {
    console.error('Error al subir la imagen:', error);
    return res.status(500).json({ error: 'Error al procesar la subida de la imagen', details: error.message });
  }
};
