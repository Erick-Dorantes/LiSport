// server/models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    username: { 
        type: String, 
        required: [true, 'El nombre de usuario es requerido'],
        unique: true,
        trim: true,
        minlength: [3, 'El usuario debe tener al menos 3 caracteres'],
        maxlength: [30, 'El usuario no puede exceder 30 caracteres'],
        match: [/^[a-zA-Z0-9_]+$/, 'Solo se permiten letras, números y guiones bajos']
    },
    password: { 
        type: String, 
        required: [true, 'La contraseña es requerida'],
        minlength: [6, 'La contraseña debe tener al menos 6 caracteres']
    },
    role: { 
        type: String, 
        enum: ['admin', 'editor'],
        default: 'admin'
    },
    email: {
        type: String,
        sparse: true,
        trim: true,
        lowercase: true,
        match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Email no válido']
    },
    lastLogin: {
        type: Date,
        default: null
    },
    loginAttempts: {
        type: Number,
        default: 0
    },
    lockUntil: {
        type: Date,
        default: null
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

// Middleware para encriptar contraseña antes de guardar
userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();
    
    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        this.updatedAt = Date.now();
        next();
    } catch (error) {
        next(error);
    }
});

// Método para comparar contraseñas
userSchema.methods.comparePassword = async function(candidatePassword) {
    if (!this.password) return false;
    return await bcrypt.compare(candidatePassword, this.password);
};

// Método para verificar si la cuenta está bloqueada
userSchema.methods.isLocked = function() {
    return !!(this.lockUntil && this.lockUntil > Date.now());
};

// Método para incrementar intentos de login fallidos
userSchema.methods.incrementLoginAttempts = async function() {
    // Si ya está bloqueado y el tiempo expiró, resetear
    if (this.lockUntil && this.lockUntil < Date.now()) {
        return await this.updateOne({
            $set: { loginAttempts: 1 },
            $unset: { lockUntil: 1 }
        });
    }
    
    // Incrementar intentos
    const updates = { $inc: { loginAttempts: 1 } };
    
    // Bloquear después de 5 intentos fallidos por 30 minutos
    if (this.loginAttempts + 1 >= 5 && !this.isLocked()) {
        updates.$set = { lockUntil: Date.now() + 30 * 60 * 1000 }; // 30 minutos
    }
    
    return await this.updateOne(updates);
};

// Método estático para buscar por username
userSchema.statics.findByUsername = function(username) {
    return this.findOne({ username, active: true });
};

// Método estático para obtener usuarios activos
userSchema.statics.findActiveUsers = function() {
    return this.find({ active: true }).select('-password');
};

// Virtual para nombre completo (si tuviera más campos)
userSchema.virtual('displayName').get(function() {
    return this.username;
});

// Ocultir password en JSON
userSchema.methods.toJSON = function() {
    const userObject = this.toObject();
    delete userObject.password;
    return userObject;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
// Agregar esta función al final de models/User.js

// Función para crear usuario admin inicial
const createInitialAdmin = async () => {
    try {
        const adminExists = await User.findOne({ username: 'admin' });
        if (!adminExists) {
            const admin = new User({
                username: 'admin',
                password: 'admin123', // Será hasheado por el pre-save hook
                role: 'admin',
                email: 'admin@lisport.com'
            });
            await admin.save();
            console.log('✅ Usuario admin creado: admin / admin123');
        } else {
            console.log('✅ Usuario admin ya existe');
        }
    } catch (error) {
        console.error('❌ Error creando usuario admin:', error);
    }
};

module.exports = User;
module.exports.createInitialAdmin = createInitialAdmin;