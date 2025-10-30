// server/models/Product.js
const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Product = sequelize.define('Product', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
    validate: {
      notEmpty: true,
      len: [1, 100]
    }
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false,
    validate: {
      notEmpty: true,
      len: [1, 500]
    }
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      min: 0
    }
  },
  category: {
    type: DataTypes.ENUM('conjuntos', 'leggins', 'tops', 'enterizos', 'calcetas', 'sweaters'),
    allowNull: false
  },
  sizes: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    allowNull: false,
    defaultValue: []
  },
  stock: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 0
    }
  },
  image: {
    type: DataTypes.STRING,
    allowNull: true
  },
  featured: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: 'products',
  timestamps: true
});

// Métodos de instancia
Product.prototype.isLowStock = function() {
  return this.stock < 10;
};

// Métodos estáticos
Product.findByCategory = function(category) {
  return this.findAll({
    where: { category, active: true },
    order: [['createdAt', 'DESC']]
  });
};

Product.findFeatured = function() {
  return this.findAll({
    where: { featured: true, active: true },
    limit: 8,
    order: [['createdAt', 'DESC']]
  });
};

module.exports = Product;