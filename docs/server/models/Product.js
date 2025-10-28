// server/models/Product.js
const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: { 
        type: String, 
        required: [true, 'El nombre del producto es requerido'],
        trim: true,
        maxlength: [100, 'El nombre no puede exceder 100 caracteres']
    },
    description: { 
        type: String, 
        required: [true, 'La descripción es requerida'],
        trim: true,
        maxlength: [500, 'La descripción no puede exceder 500 caracteres']
    },
    price: { 
        type: Number, 
        required: [true, 'El precio es requerido'],
        min: [0, 'El precio no puede ser negativo']
    },
    category: { 
        type: String, 
        required: [true, 'La categoría es requerida'],
        enum: {
            values: ['conjuntos', 'leggins', 'tops', 'enterizos', 'calcetas', 'sweaters'],
            message: 'Categoría no válida'
        }
    },
    sizes: [{ 
        type: String, 
        enum: ['XS', 'S', 'M', 'L', 'XL'],
        required: true
    }],
    stock: { 
        type: Number, 
        required: [true, 'El stock es requerido'],
        min: [0, 'El stock no puede ser negativo'],
        default: 0
    },
    image: { 
        type: String,
        default: null
    },
    featured: { 
        type: Boolean, 
        default: false 
    },
    active: {
        type: Boolean,
        default: true
    },
    createdAt: { 
        type: Date, 
        default: Date.now 
    },
    updatedAt: { 
        type: Date, 
        default: Date.now 
    }
});

// Middleware para actualizar updatedAt antes de guardar
productSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

// Método estático para buscar productos por categoría
productSchema.statics.findByCategory = function(category) {
    return this.find({ category, active: true }).sort({ createdAt: -1 });
};

// Método estático para productos destacados
productSchema.statics.findFeatured = function() {
    return this.find({ featured: true, active: true }).limit(8);
};

// Método estático para búsqueda avanzada
productSchema.statics.searchProducts = function(searchParams) {
    const { q, category, minPrice, maxPrice, sizes, featured } = searchParams;
    let filter = { active: true };

    if (q) {
        filter.$or = [
            { name: { $regex: q, $options: 'i' } },
            { description: { $regex: q, $options: 'i' } }
        ];
    }

    if (category) filter.category = category;
    if (featured !== undefined) filter.featured = featured === 'true';

    if (minPrice || maxPrice) {
        filter.price = {};
        if (minPrice) filter.price.$gte = parseFloat(minPrice);
        if (maxPrice) filter.price.$lte = parseFloat(maxPrice);
    }

    if (sizes) {
        const sizesArray = Array.isArray(sizes) ? sizes : [sizes];
        filter.sizes = { $in: sizesArray };
    }

    return this.find(filter).sort({ createdAt: -1 });
};

// Método de instancia para verificar stock bajo
productSchema.methods.isLowStock = function() {
    return this.stock < 10;
};

// Virtual para obtener el precio formateado
productSchema.virtual('priceFormatted').get(function() {
    return `$${this.price.toFixed(2)}`;
});

// Asegurar que los virtuals se incluyan en JSON
productSchema.set('toJSON', { virtuals: true });

const Product = mongoose.model('Product', productSchema);

module.exports = Product;