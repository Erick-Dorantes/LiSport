// server/routes/auth.js
const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { generateToken, authenticateToken } = require('../middleware/auth');
const rateLimit = require('express-rate-limit');

// Rate limiting para prevenir ataques de fuerza bruta
const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 5, // máximo 5 intentos por ventana
    message: {
        success: false,
        message: 'Demasiados intentos de login. Intenta nuevamente en 15 minutos.'
    },
    standardHeaders: true,
    legacyHeaders: false,
});

// @desc    Login de usuario
// @route   POST /api/auth/login
// @access  Public
router.post('/login', loginLimiter, async (req, res) => {
    try {
        const { username, password } = req.body;

        // Validación básica
        if (!username || !password) {
            return res.status(400).json({
                success: false,
                message: 'Usuario y contraseña son requeridos'
            });
        }

        // Buscar usuario activo
        const user = await User.findOne({ 
            username: username.trim(),
            active: true 
        });

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Credenciales inválidas'
            });
        }

        // Verificar si la cuenta está bloqueada
        if (user.isLocked()) {
            const lockTime = Math.ceil((user.lockUntil - Date.now()) / 60000); // minutos restantes
            return res.status(423).json({
                success: false,
                message: `Cuenta temporalmente bloqueada. Intenta nuevamente en ${lockTime} minutos.`
            });
        }

        // Verificar contraseña
        const isPasswordValid = await user.comparePassword(password);
        
        if (!isPasswordValid) {
            // Incrementar intentos fallidos
            await user.incrementLoginAttempts();
            
            const attemptsLeft = 5 - (user.loginAttempts + 1);
            
            return res.status(401).json({
                success: false,
                message: `Credenciales inválidas. ${attemptsLeft > 0 ? `${attemptsLeft} intentos restantes.` : 'Cuenta será bloqueada.'}`
            });
        }

        // Login exitoso - resetear contadores
        await User.findByIdAndUpdate(user._id, {
            $set: { 
                lastLogin: new Date(),
                loginAttempts: 0 
            },
            $unset: { lockUntil: 1 }
        });

        // Generar token JWT
        const token = generateToken({
            userId: user._id,
            username: user.username,
            role: user.role
        });

        // Respuesta exitosa
        res.json({
            success: true,
            message: 'Login exitoso',
            data: {
                token,
                user: {
                    id: user._id,
                    username: user.username,
                    role: user.role,
                    lastLogin: user.lastLogin
                }
            }
        });

    } catch (error) {
        console.error('Error en login:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// @desc    Verificar token válido
// @route   GET /api/auth/verify
// @access  Private
router.get('/verify', authenticateToken, async (req, res) => {
    try {
        const user = await User.findById(req.user.userId).select('-password');
        
        if (!user || !user.active) {
            return res.status(401).json({
                success: false,
                message: 'Token inválido o usuario inactivo'
            });
        }

        res.json({
            success: true,
            data: {
                user: {
                    id: user._id,
                    username: user.username,
                    role: user.role,
                    lastLogin: user.lastLogin
                },
                valid: true
            }
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error verificando token',
            error: error.message
        });
    }
});

// @desc    Cambiar contraseña
// @route   POST /api/auth/change-password
// @access  Private
router.post('/change-password', authenticateToken, async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;

        // Validaciones
        if (!currentPassword || !newPassword) {
            return res.status(400).json({
                success: false,
                message: 'La contraseña actual y nueva son requeridas'
            });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({
                success: false,
                message: 'La nueva contraseña debe tener al menos 6 caracteres'
            });
        }

        // Obtener usuario
        const user = await User.findById(req.user.userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Usuario no encontrado'
            });
        }

        // Verificar contraseña actual
        const isCurrentPasswordValid = await user.comparePassword(currentPassword);
        if (!isCurrentPasswordValid) {
            return res.status(401).json({
                success: false,
                message: 'La contraseña actual es incorrecta'
            });
        }

        // Actualizar contraseña
        user.password = newPassword; // El pre-save hook se encargará del hash
        await user.save();

        res.json({
            success: true,
            message: 'Contraseña actualizada correctamente'
        });

    } catch (error) {
        console.error('Error cambiando contraseña:', error);
        res.status(500).json({
            success: false,
            message: 'Error cambiando contraseña',
            error: error.message
        });
    }
});

// @desc    Logout (manejado en el cliente, pero podemos invalidar token si usamos blacklist)
// @route   POST /api/auth/logout
// @access  Private
router.post('/logout', authenticateToken, (req, res) => {
    // En una implementación más avanzada, podrías agregar el token a una blacklist
    // Por ahora, el logout se maneja en el cliente eliminando el token
    
    res.json({
        success: true,
        message: 'Logout exitoso'
    });
});

// @desc    Refresh token (opcional)
// @route   POST /api/auth/refresh
// @access  Private
router.post('/refresh', authenticateToken, async (req, res) => {
    try {
        const user = await User.findById(req.user.userId);
        
        if (!user || !user.active) {
            return res.status(401).json({
                success: false,
                message: 'Usuario no válido para refrescar token'
            });
        }

        // Generar nuevo token
        const newToken = generateToken({
            userId: user._id,
            username: user.username,
            role: user.role
        });

        res.json({
            success: true,
            data: {
                token: newToken,
                user: {
                    id: user._id,
                    username: user.username,
                    role: user.role
                }
            }
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error refrescando token',
            error: error.message
        });
    }
});

module.exports = router;