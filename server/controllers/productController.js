const { Product } = require('../models');
const { Op } = require('sequelize');

const productController = {
  // Obtener todos los productos
  async getProducts(req, res) {
    try {
      const products = await Product.findAll({
        where: { status: 'active' },
        order: [['createdAt', 'DESC']]
      });

      res.json({
        success: true,
        data: products
      });
    } catch (error) {
      console.error('Error obteniendo productos:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  },

  // Obtener producto por ID
  async getProductById(req, res) {
    try {
      const product = await Product.findByPk(req.params.id);

      if (!product) {
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
        message: 'Error interno del servidor'
      });
    }
  },

  // Crear producto
  async createProduct(req, res) {
    try {
      const {
        name,
        price,
        category,
        stock,
        description,
        sizes,
        featured
      } = req.body;

      // Validaciones básicas
      if (!name || !price || !category || !description) {
        return res.status(400).json({
          success: false,
          message: 'Todos los campos obligatorios deben ser completados'
        });
      }

      const productData = {
        name,
        price: parseFloat(price),
        category,
        stock: parseInt(stock) || 0,
        description,
        featured: featured === 'true' || featured === true,
        status: 'active'
      };

      // Procesar tallas
      if (sizes) {
        productData.sizes = typeof sizes === 'string' ? JSON.parse(sizes) : sizes;
      }

      // Procesar imagen
      if (req.file) {
        productData.image = `/uploads/${req.file.filename}`;
      }

      const product = await Product.create(productData);

      res.status(201).json({
        success: true,
        message: 'Producto creado exitosamente',
        data: product
      });
    } catch (error) {
      console.error('Error creando producto:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  },

  // Actualizar producto
  async updateProduct(req, res) {
    try {
      const product = await Product.findByPk(req.params.id);

      if (!product) {
        return res.status(404).json({
          success: false,
          message: 'Producto no encontrado'
        });
      }

      const updateData = { ...req.body };

      // Procesar números
      if (updateData.price) updateData.price = parseFloat(updateData.price);
      if (updateData.stock) updateData.stock = parseInt(updateData.stock);
      if (updateData.featured !== undefined) {
        updateData.featured = updateData.featured === 'true' || updateData.featured === true;
      }

      // Procesar tallas
      if (updateData.sizes) {
        updateData.sizes = typeof updateData.sizes === 'string' 
          ? JSON.parse(updateData.sizes) 
          : updateData.sizes;
      }

      // Procesar imagen
      if (req.file) {
        updateData.image = `/uploads/${req.file.filename}`;
      }

      await product.update(updateData);

      res.json({
        success: true,
        message: 'Producto actualizado exitosamente',
        data: product
      });
    } catch (error) {
      console.error('Error actualizando producto:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  },

  // Eliminar producto
  async deleteProduct(req, res) {
    try {
      const product = await Product.findByPk(req.params.id);

      if (!product) {
        return res.status(404).json({
          success: false,
          message: 'Producto no encontrado'
        });
      }

      await product.destroy();

      res.json({
        success: true,
        message: 'Producto eliminado exitosamente'
      });
    } catch (error) {
      console.error('Error eliminando producto:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  },

  // Obtener estadísticas
  async getStats(req, res) {
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
        message: 'Error interno del servidor'
      });
    }
  }
};

module.exports = productController;