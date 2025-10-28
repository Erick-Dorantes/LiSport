const express = require('express');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/database');
const { createInitialAdmin } = require('./models/User'); // Mover esta función al modelo User

// Importar rutas
const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/product');
const userRoutes = require('./routes/user');

const app = express();
const PORT = process.env.PORT || 3000;

// Conectar a la base de datos
connectDB().then(async () => {
    await createInitialAdmin(); // Crear admin si no existe
});

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '../public')));

// Rutas de API
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/users', userRoutes);

// Ruta de salud de la API
app.get('/api/health', (req, res) => {
    res.json({
        success: true,
        message: 'LiSport API está funcionando correctamente',
        timestamp: new Date().toISOString(),
        version: '1.0.0'
    });
});

// Manejo de rutas no encontradas (API)
app.use('/api/*', (req, res) => {
    res.status(404).json({
        success: false,
        message: `Ruta de API no encontrada: ${req.originalUrl}`
    });
});

// Servir aplicación React/Vue (para producción)
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Manejo global de errores
app.use((error, req, res, next) => {
    console.error('Error global:', error);
    res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
});

app.listen(PORT, () => {
    console.log(`🚀 Servidor LiSport corriendo en puerto ${PORT}`);
    console.log(`📊 API disponible en: http://localhost:${PORT}/api`);
    console.log(`🌐 Frontend disponible en: http://localhost:${PORT}`);
});