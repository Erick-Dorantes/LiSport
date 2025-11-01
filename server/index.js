// ⬇️ LÍNEA #1: Carga las variables de entorno ANTES que cualquier otro código.
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const path = require('path');
const adminRoutes = require('./routes/adminRoutes'); // 🆕 AGREGAR ESTA LÍNEA
// Esta línea ahora puede leer 'process.env.DATABASE_URL' sin problema
const { connectDB } = require('./config/database'); 
const { createInitialAdmin } = require('./models/User');

// Importar rutas
const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/product');
const userRoutes = require('./routes/user');

const app = express();
const PORT = process.env.PORT || 10000; // Render.com usa puerto 10000

// Configuración para Render.com
const isProduction = process.env.NODE_ENV === 'production';
// ⬇️ CORRECCIÓN #2: Obtén la URL de Render dinámicamente
const RENDER_EXTERNAL_URL = process.env.RENDER_EXTERNAL_URL;

// Conectar a la base de datos
connectDB().then(async () => {
 await createInitialAdmin();
 console.log('✅ Base de datos PostgreSQL inicializada');
}).catch(error => {
 console.error('❌ Error inicializando base de datos:', error);
});

// Middleware
app.use(cors({
  // ⬇️ CORRECCIÓN #2: Configuración de CORS dinámica
 origin: (isProduction && RENDER_EXTERNAL_URL)
 ? [RENDER_EXTERNAL_URL] // Permite la URL de producción de Render
 : ['http://localhost:3000', 'http://127.0.0.1:3000'], // Permite desarrollo local
credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Servir archivos estáticos
app.use(express.static(path.join(__dirname, '../public')));

// Middleware de logging
app.use((req, res, next) => {
console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
next();
});

// Rutas de API
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes); // 🆕 AGREGAR ESTA LÍNEA

// Ruta de salud
app.get('/api/health', (req, res) => {
res.json({
 success: true,
 message: 'LiSport API - PostgreSQL - Render.com',
 timestamp: new Date().toISOString(),
 environment: process.env.NODE_ENV || 'development'
 });
});

// Ruta para panel admin
app.get('/admin', (req, res) => {
 res.sendFile(path.join(__dirname, '../public/admin-login.html'));
});

app.get('/admin/*', (req, res) => {
 res.sendFile(path.join(__dirname, '../public/admin-login.html'));
});

// Manejo de rutas no encontradas (API)
app.use('/api/*', (req, res) => {
 res.status(404).json({
 success: false,
 message: `Ruta de API no encontrada: ${req.originalUrl}`
 });
});

// Servir SPA
app.get('*', (req, res) => {
 if (req.url.startsWith('/api/') || req.url.startsWith('/admin/')) {
 return next();
 }
 res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Manejo global de errores
app.use((error, req, res, next) => {
 console.error('Error global:', error);
 
 res.status(500).json({
 success: false,
 message: 'Error interno del servidor',
 error: isProduction ? undefined : error.message
 });
});

app.listen(PORT, '0.0.0.0', () => {
 console.log(`🚀 Servidor LiSport en Render.com - Puerto ${PORT}`);
 console.log(`📊 Entorno: ${isProduction ? 'Producción' : 'Desarrollo'}`);
  // Tu log actualizado está perfecto
 console.log(`🌐 URL: https://lisport-1.onrender.com`); 
});
