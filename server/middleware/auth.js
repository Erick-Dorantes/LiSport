// server/middleware/auth.js
const jwt = require('jsonwebtoken');
const { User } = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET || 'lisport_secret_key_2024';

// Generar token JWT
const generateToken = (payload) => {
    return jwt.sign(payload, JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN || '24h',
        issuer: 'LiSport-API',
        subject: payload.userId.toString()
    });
};

// Middleware de autenticación
const authenticateToken = async (req, res, next) => {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Token de acceso requerido'
            });
        }

        // Verificar token
        const decoded = jwt.verify(token, JWT_SECRET);
        
        // Verificar que el usuario aún existe y está activo
        const user = await User.findByPk(decoded.userId);
        if (!user || !user.active) {
            return res.status(401).json({
                success: false,
                message: 'Token inválido o usuario inactivo'
            });
        }

        // Agregar usuario al request
        req.user = {
            userId: decoded.userId,
            username: decoded.username,
            role: decoded.role
        };

        next();

    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                message: 'Token expirado'
            });
        } else if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({
                success: false,
                message: 'Token inválido'
            });
        } else {
            return res.status(500).json({
                success: false,
                message: 'Error de autenticación'
            });
        }
    }
};

// Middleware para verificar rol de administrador
const requireAdmin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        res.status(403).json({
            success: false,
            message: 'Se requieren privilegios de administrador'
        });
    }
};

// Middleware para verificar rol de editor o admin
const requireEditor = (req, res, next) => {
    if (req.user && (req.user.role === 'admin' || req.user.role === 'editor')) {
        next();
    } else {
        res.status(403).json({
            success: false,
            message: 'Se requieren privilegios de editor o administrador'
        });
    }
};

module.exports = {
    generateToken,
    authenticateToken,
    requireAdmin,
    requireEditor,
    JWT_SECRET
};
