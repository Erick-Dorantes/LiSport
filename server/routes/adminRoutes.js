// server/routes/adminRoutes.js
const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');

// Configuración de multer (la misma que en product.js)
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
    limits: { fileSize: 5 * 1024 * 1024 },
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

// @desc    Obtener todos los productos (admin)
// @route   GET /api/admin/products
// @access  Private/Admin
router.get('/products', authenticateToken, requireAdmin, async (req, res) => {
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

// @desc    Crear nuevo producto
// @route   POST /api/admin/products
// @access  Private/Admin
router.post('/products', authenticateToken, requireAdmin, upload.single('image'), async (req, res) => {
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

// @desc    Actualizar producto
// @route   PUT /api/admin/products/:id
// @access  Private/Admin
router.put('/products/:id', authenticateToken, requireAdmin, upload.single('image'), async (req, res) => {
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

// @desc    Eliminar producto
// @route   DELETE /api/admin/products/:id
// @access  Private/Admin
router.delete('/products/:id', authenticateToken, requireAdmin, async (req, res) => {
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