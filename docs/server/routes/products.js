const express = require('express');
const router = express.Router();
const Product = require('../models/Product'); // Importar desde models

// Obtener todos los productos activos
router.get('/', async (req, res) => {
    try {
        const products = await Product.find({ active: true }).sort({ createdAt: -1 });
        res.json({
            success: true,
            count: products.length,
            data: products
        });
    } catch (error) {
        res.status(500).json({ 
            success: false,
            message: 'Error obteniendo productos', 
            error: error.message 
        });
    }
});

// Búsqueda avanzada
router.get('/search', async (req, res) => {
    try {
        const products = await Product.searchProducts(req.query);
        res.json({
            success: true,
            count: products.length,
            data: products
        });
    } catch (error) {
        res.status(500).json({ 
            success: false,
            message: 'Error buscando productos', 
            error: error.message 
        });
    }
});

// Obtener productos por categoría
router.get('/category/:category', async (req, res) => {
    try {
        const products = await Product.findByCategory(req.params.category);
        res.json({
            success: true,
            count: products.length,
            data: products
        });
    } catch (error) {
        res.status(500).json({ 
            success: false,
            message: 'Error obteniendo productos por categoría', 
            error: error.message 
        });
    }
});