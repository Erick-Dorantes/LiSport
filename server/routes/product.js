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
        cb(null, path.join(__dirname, '../../uploads/'));
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'product-' + uniqueSuffix + path.extname(file.originalname));
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

// =============================================
// RUTAS PÚBLICAS
// =============================================

// @desc    Obtener todos los productos activos
// @route   GET /api/products
// @access  Public
router.get('/', async (req, res) => {
    try {
        const products = await Product.findAll({
            where: { status: 'active' },
            order: [['createdAt', 'DESC']]
        });

        res.json({
            success: true,
            count: products.length,
            data: products
        });
    } catch (error) {
        console.error('Error obteniendo productos:', error);
        res.status(500).json({ 
            success: false,
            message: 'Error obteniendo productos'
        });
    }
});

// @desc    Obtener productos destacados
// @route   GET /api/products/featured
// @access  Public
router.get('/featured', async (req, res) => {
    try {
        const products = await Product.findAll({
            where: { 
                featured: true,
                status: 'active'
            },
            order: [['createdAt', 'DESC']]
        });

        res.json({
            success: true,
            count: products.length,
            data: products
        });
    } catch (error) {
        console.error('Error obteniendo productos destacados:', error);
        res.status(500).json({ 
            success: false,
            message: 'Error obteniendo productos destacados'
        });
    }
});

// @desc    Obtener productos por categoría
// @route   GET /api/products/category/:category
// @access  Public
router.get('/category/:category', async (req, res) => {
    try {
        const { category } = req.params;
        const products = await Product.findAll({
            where: { 
                category: category,
                status: 'active'
            },
            order: [['createdAt', 'DESC']]
        });

        res.json({
            success: true,
            count: products.length,
            data: products
        });
    } catch (error) {
        console.error('Error obteniendo productos por categoría:', error);
        res.status(500).json({ 
            success: false,
            message: 'Error obteniendo productos por categoría'
        });
    }
});

// @desc    Búsqueda de productos
// @route   GET /api/products/search
// @access  Public
router.get('/search', async (req, res) => {
    try {
        const { q, category, minPrice, maxPrice, sizes, featured } = req.query;
        let where = { status: 'active' };

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
        console.error('Error buscando productos:', error);
        res.status(500).json({ 
            success: false,
            message: 'Error buscando productos'
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

        if (!product || product.status !== 'active') {
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
        console.error('Error obteniendo producto:', error);
        res.status(500).json({ 
            success: false,
            message: 'Error obteniendo producto'
        });
    }
});

// =============================================
// RUTAS PROTEGIDAS (ADMIN) - RUTAS CORREGIDAS
// =============================================

// @desc    Obtener estadísticas del dashboard
// @route   GET /api/products/admin/stats
// @access  Private/Admin
router.get('/admin/stats', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const totalProducts = await Product.count();
        const featuredProducts = await Product.count({ 
            where: { featured: true, status: 'active' } 
        });
        const lowStockProducts = await Product.count({ 
            where: { 
                stock: { [Op.lt]: 10 },
                status: 'active'
            } 
        });
        
        const categories = await Product.findAll({
            attributes: ['category'],
            group: ['category'],
            raw: true
        });
        const totalCategories = categories.length;

        res.json({
            success: true,
            data: {
                totalProducts,
                featuredProducts,
                lowStockProducts,
                totalCategories
            }
        });
    } catch (error) {
        console.error('Error obteniendo estadísticas:', error);
        res.status(500).json({ 
            success: false,
            message: 'Error obteniendo estadísticas'
        });
    }
});

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
        console.error('Error obteniendo productos admin:', error);
        res.status(500).json({ 
            success: false,
            message: 'Error obteniendo productos'
        });
    }
});

// @desc    Crear nuevo producto - RUTA CORREGIDA
// @route   POST /api/products
// @access  Private/Admin
router.post('/', authenticateToken, requireAdmin, upload.single('image'), async (req, res) => {
    try {
        console.log('📦 Creando producto - Body:', req.body);
        console.log('📁 Archivo:', req.file);
        
        const { name, description, price, category, sizes, stock, featured } = req.body;
        
        // Validaciones básicas
        if (!name || !price || !category || !description) {
            return res.status(400).json({
                success: false,
                message: 'Todos los campos obligatorios deben ser completados'
            });
        }

        const productData = {
            name: name.trim(),
            description: description.trim(),
            price: parseFloat(price),
            category: category,
            stock: parseInt(stock) || 0,
            featured: featured === 'true' || featured === true,
            status: 'active'
        };

        // Procesar tallas
        if (sizes) {
            if (typeof sizes === 'string') {
                try {
                    productData.sizes = JSON.parse(sizes);
                } catch (e) {
                    productData.sizes = [sizes];
                }
            } else {
                productData.sizes = sizes;
            }
        } else {
            productData.sizes = [];
        }

        // Procesar imagen
        if (req.file) {
            productData.image = `/uploads/${req.file.filename}`;
        } else {
            productData.image = 'https://via.placeholder.com/300';
        }

        const product = await Product.create(productData);

        console.log('✅ Producto creado:', product.id);

        res.status(201).json({ 
            success: true,
            message: 'Producto creado correctamente', 
            data: product 
        });
    } catch (error) {
        console.error('❌ Error creando producto:', error);
        res.status(500).json({ 
            success: false,
            message: 'Error creando producto: ' + error.message
        });
    }
});

// @desc    Actualizar producto - RUTA CORREGIDA
// @route   PUT /api/products/:id
// @access  Private/Admin
router.put('/:id', authenticateToken, requireAdmin, upload.single('image'), async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description, price, category, sizes, stock, featured } = req.body;
        
        console.log(`🔄 Actualizando producto ${id}:`, req.body);

        const product = await Product.findByPk(id);
        if (!product) {
            return res.status(404).json({ 
                success: false,
                message: 'Producto no encontrado' 
            });
        }

        const updateData = {
            name: name?.trim(),
            description: description?.trim(),
            featured: featured === 'true' || featured === true
        };

        // Solo actualizar estos campos si están presentes
        if (price) updateData.price = parseFloat(price);
        if (category) updateData.category = category;
        if (stock !== undefined) updateData.stock = parseInt(stock);

        // Procesar tallas
        if (sizes !== undefined) {
            if (typeof sizes === 'string') {
                try {
                    updateData.sizes = JSON.parse(sizes);
                } catch (e) {
                    updateData.sizes = [sizes];
                }
            } else {
                updateData.sizes = sizes;
            }
        }

        // Procesar imagen solo si se subió una nueva
        if (req.file) {
            updateData.image = `/uploads/${req.file.filename}`;
        }

        await product.update(updateData);

        console.log('✅ Producto actualizado:', id);

        res.json({ 
            success: true,
            message: 'Producto actualizado correctamente', 
            data: product 
        });
    } catch (error) {
        console.error('❌ Error actualizando producto:', error);
        res.status(500).json({ 
            success: false,
            message: 'Error actualizando producto: ' + error.message
        });
    }
});

// @desc    Eliminar producto - RUTA CORREGIDA
// @route   DELETE /api/products/:id
// @access  Private/Admin
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        console.log(`🗑️ Eliminando producto: ${id}`);
        
        const product = await Product.findByPk(id);
        
        if (!product) {
            return res.status(404).json({ 
                success: false,
                message: 'Producto no encontrado' 
            });
        }

        // Eliminar permanentemente
        await product.destroy();

        console.log('✅ Producto eliminado:', id);

        res.json({ 
            success: true,
            message: 'Producto eliminado correctamente' 
        });
    } catch (error) {
        console.error('❌ Error eliminando producto:', error);
        res.status(500).json({ 
            success: false,
            message: 'Error eliminando producto: ' + error.message
        });
    }
});

module.exports = router;
