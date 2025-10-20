const User = require('../models/user');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// Clave secreta para JWT desde variables de entorno
const JWT_SECRET = process.env.JWT_SECRET || 'moda-store-secret-key';

// Login de usuario
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Verificar si el usuario existe
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    // Verificar la contraseña usando bcrypt
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Contraseña incorrecta' });
    }

    // Generar token JWT
    const token = jwt.sign(
      { 
        userId: user._id,
        email: user.email,
        role: user.role || 'user' 
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Enviar respuesta con token y datos del usuario
    res.status(200).json({
      message: 'Login exitoso',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role || 'user'
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Verificar token
exports.verifyToken = (req, res, next) => {
  try {
    // Obtener token del header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'No se proporcionó token de autenticación' });
    }

    // Extraer token
    const token = authHeader.split(' ')[1];
    
    // Verificar token
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Añadir datos del usuario al request
    req.userData = decoded;
    
    // Continuar con la siguiente función
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Token inválido o expirado' });
  }
};

// Endpoint de prueba de autenticación
exports.testAuth = (req, res) => {
  // Si llegamos aquí, el token es válido
  res.status(200).json({ 
    message: 'Autenticación válida',
    user: req.userData
  });
};

// Verificar si es administrador
exports.isAdmin = (req, res, next) => {
  if (req.userData.role !== 'admin') {
    return res.status(403).json({ message: 'Acceso denegado: se requieren privilegios de administrador' });
  }
  next();
};