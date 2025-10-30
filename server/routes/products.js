// server/routes/product.js
const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const { Op } = require('sequelize');

// Configuración de multer para subida de imágenes
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, '../public/images/'));
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

const upload = multer({ 
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
    fileFilter: function (req, file, cb) {
        const filetypes = /jpeg|jpg|png|gif/;
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = filetypes.test(file.mimetype);
        
        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb(new Error('Solo se permiten imágenes (JPEG, JPG, PNG, GIF)'));
        }
    }
});

// @desc    Obtener todos los productos activos
// @route   GET /api/products
// @access  Public
router.get('/', async (req, res) => {
    try {
        const products = await Product.findAll({
            where: { active: true },
            order: [['createdAt', 'DESC']]
        });

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

// @desc    Obtener productos destacados
// @route   GET /api/products/featured
// @access  Public
router.get('/featured', async (req, res) => {
    try {
        const products = await Product.findFeatured();
        res.json({
            success: true,
            count: products.length,
            data: products
        });
    } catch (error) {
        res.status(500).json({ 
            success: false,
            message: 'Error obteniendo productos destacados', 
            error: error.message 
        });
    }
});

// @desc    Obtener productos por categoría
// @route   GET /api/products/category/:category
// @access  Public
router.get('/category/:category', async (req, res) => {
    try {
        const { category } = req.params;
        const products = await Product.findByCategory(category);
        
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

// @desc    Búsqueda avanzada de productos
// @route   GET /api/products/search
// @access  Public
router.get('/search', async (req, res) => {
    try {
        const { q, category, minPrice, maxPrice, sizes, featured } = req.query;
        let where = { active: true };

        // Búsqueda por texto
        if (q) {
            where[Op.or] = [
                { name: { [Op.iLike]: `%${q}%` } },
                { description: { [Op.iLike]: `%${q}%` } }
            ];
        }

        // Filtros adicionales
        if (category) where.category = category;
        if (featured !== undefined) where.featured = featured === 'true';

        // Filtro por precio
        if (minPrice || maxPrice) {
            where.price = {};
            if (minPrice) where.price[Op.gte] = parseFloat(minPrice);
            if (maxPrice) where.price[Op.lte] = parseFloat(maxPrice);
        }

        // Filtro por tallas
        if (sizes) {
            const sizesArray = Array.isArray(sizes) ? sizes : [sizes];
            where.sizes = { [Op.overlap]: sizesArray };
        }

        const products = await Product.findAll({
            where,
            order: [['createdAt', 'DESC']]
        });

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

// @desc    Obtener producto por ID
// @route   GET /api/products/:id
// @access  Public
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const product = await Product.findByPk(id);

        if (!product || !product.active) {
            return res.status(404).json({
                success: false,
                message: 'Producto no encontrado'
            });
        }

        res.json({
            success: true,
            data: product
        });
    } catch (error) {
        res.status(500).json({ 
            success: false,
            message: 'Error obteniendo producto', 
            error: error.message 
        });
    }
});

// =============================================
// RUTAS PROTEGIDAS (ADMIN)
// =============================================

// @desc    Obtener todos los productos (admin)
// @route   GET /api/products/admin/all
// @access  Private/Admin
router.get('/admin/all', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const products = await Product.findAll({
            order: [['createdAt', 'DESC']]
        });

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

// @desc    Crear nuevo producto
// @route   POST /api/products/admin/create
// @access  Private/Admin
router.post('/admin/create', authenticateToken, requireAdmin, upload.single('image'), async (req, res) => {
    try {
        const { name, description, price, category, sizes, stock, featured } = req.body;
        
        const productData = {
            name,
            description,
            price: parseFloat(price),
            category,
            sizes: Array.isArray(sizes) ? sizes : [sizes],
            stock: parseInt(stock),
            featured: featured === 'true'
        };

        if (req.file) {
            productData.image = `/images/${req.file.filename}`;
        }

        const product = await Product.create(productData);

        res.status(201).json({ 
            success: true,
            message: 'Producto creado correctamente', 
            data: product 
        });
    } catch (error) {
        res.status(500).json({ 
            success: false,
            message: 'Error creando producto', 
            error: error.message 
        });
    }
});

// @desc    Actualizar producto
// @route   PUT /api/products/admin/update/:id
// @access  Private/Admin
router.put('/admin/update/:id', authenticateToken, requireAdmin, upload.single('image'), async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description, price, category, sizes, stock, featured } = req.body;
        
        const product = await Product.findByPk(id);
        if (!product) {
            return res.status(404).json({ 
                success: false,
                message: 'Producto no encontrado' 
            });
        }

        const updateData = {
            name,
            description,
            price: parseFloat(price),
            category,
            sizes: Array.isArray(sizes) ? sizes : [sizes],
            stock: parseInt(stock),
            featured: featured === 'true'
        };

        if (req.file) {
            updateData.image = `/images/${req.file.filename}`;
        }

        await product.update(updateData);

        res.json({ 
            success: true,
            message: 'Producto actualizado correctamente', 
            data: product 
        });
    } catch (error) {
        res.status(500).json({ 
            success: false,
            message: 'Error actualizando producto', 
            error: error.message 
        });
    }
});

// @desc    Eliminar producto
// @route   DELETE /api/products/admin/delete/:id
// @access  Private/Admin
router.delete('/admin/delete/:id', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const product = await Product.findByPk(id);
        
        if (!product) {
            return res.status(404).json({ 
                success: false,
                message: 'Producto no encontrado' 
            });
        }

        // En lugar de eliminar, marcar como inactivo
        await product.update({ active: false });

        res.json({ 
            success: true,
            message: 'Producto eliminado correctamente' 
        });
    } catch (error) {
        res.status(500).json({ 
            success: false,
            message: 'Error eliminando producto', 
            error: error.message 
        });
    }
});

module.exports = router;