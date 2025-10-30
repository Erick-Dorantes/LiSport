// server/routes/user.js
const express = require('express');
const router = express.Router();
const { User } = require('../models/User');
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const { Op } = require('sequelize');

// @desc    Obtener perfil del usuario actual
// @route   GET /api/users/profile
// @access  Private
router.get('/profile', authenticateToken, async (req, res) => {
    try {
        const user = await User.findByPk(req.user.userId, {
            attributes: { exclude: ['password'] }
        });
        
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Usuario no encontrado'
            });
        }

        if (!user.active) {
            return res.status(403).json({
                success: false,
                message: 'Cuenta desactivada'
            });
        }

        res.json({
            success: true,
            data: {
                user: {
                    id: user.id,
                    username: user.username,
                    role: user.role,
                    email: user.email,
                    lastLogin: user.lastLogin,
                    createdAt: user.createdAt
                }
            }
        });

    } catch (error) {
        console.error('Error obteniendo perfil:', error);
        res.status(500).json({
            success: false,
            message: 'Error obteniendo perfil de usuario',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// @desc    Actualizar perfil de usuario
// @route   PUT /api/users/profile
// @access  Private
router.put('/profile', authenticateToken, async (req, res) => {
    try {
        const { email } = req.body;
        
        const user = await User.findByPk(req.user.userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Usuario no encontrado'
            });
        }

        // Validar email si se proporciona
        if (email) {
            const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
            if (!emailRegex.test(email)) {
                return res.status(400).json({
                    success: false,
                    message: 'Formato de email inválido'
                });
            }
            
            // Verificar si el email ya existe en otro usuario
            const existingUser = await User.findOne({ 
                where: { 
                    email, 
                    id: { [Op.ne]: req.user.userId } 
                }
            });
            
            if (existingUser) {
                return res.status(400).json({
                    success: false,
                    message: 'El email ya está en uso por otro usuario'
                });
            }
            
            user.email = email;
        }

        await user.save();

        res.json({
            success: true,
            message: 'Perfil actualizado correctamente',
            data: {
                user: {
                    id: user.id,
                    username: user.username,
                    role: user.role,
                    email: user.email,
                    lastLogin: user.lastLogin
                }
            }
        });

    } catch (error) {
        console.error('Error actualizando perfil:', error);
        res.status(500).json({
            success: false,
            message: 'Error actualizando perfil',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// @desc    Cambiar contraseña
// @route   POST /api/users/change-password
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

        if (currentPassword === newPassword) {
            return res.status(400).json({
                success: false,
                message: 'La nueva contraseña debe ser diferente a la actual'
            });
        }

        // Obtener usuario
        const user = await User.findByPk(req.user.userId);
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
        user.password = newPassword;
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
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// @desc    Obtener todos los usuarios (Solo Admin)
// @route   GET /api/users
// @access  Private/Admin
router.get('/', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const { page = 1, limit = 10, search = '' } = req.query;
        
        const where = { active: true };
        
        if (search) {
            where.username = { [Op.iLike]: `%${search}%` };
        }

        const users = await User.findAndCountAll({
            where,
            attributes: { exclude: ['password'] },
            order: [['createdAt', 'DESC']],
            limit: parseInt(limit),
            offset: (parseInt(page) - 1) * parseInt(limit)
        });

        res.json({
            success: true,
            data: {
                users: users.rows,
                pagination: {
                    current: parseInt(page),
                    pages: Math.ceil(users.count / limit),
                    total: users.count
                }
            }
        });

    } catch (error) {
        console.error('Error obteniendo usuarios:', error);
        res.status(500).json({
            success: false,
            message: 'Error obteniendo usuarios',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// @desc    Crear nuevo usuario (Solo Admin)
// @route   POST /api/users
// @access  Private/Admin
router.post('/', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const { username, password, role, email } = req.body;

        // Validaciones
        if (!username || !password) {
            return res.status(400).json({
                success: false,
                message: 'Usuario y contraseña son requeridos'
            });
        }

        if (username.length < 3) {
            return res.status(400).json({
                success: false,
                message: 'El usuario debe tener al menos 3 caracteres'
            });
        }

        if (password.length < 6) {
            return res.status(400).json({
                success: false,
                message: 'La contraseña debe tener al menos 6 caracteres'
            });
        }

        // Verificar si el usuario ya existe
        const existingUser = await User.findOne({ 
            where: { 
                [Op.or]: [
                    { username },
                    { email }
                ].filter(Boolean)
            }
        });

        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: existingUser.username === username 
                    ? 'El nombre de usuario ya existe' 
                    : 'El email ya está en uso'
            });
        }

        // Crear usuario
        const user = await User.create({
            username,
            password,
            role: role || 'editor',
            email
        });

        res.status(201).json({
            success: true,
            message: 'Usuario creado correctamente',
            data: {
                user: {
                    id: user.id,
                    username: user.username,
                    role: user.role,
                    email: user.email,
                    createdAt: user.createdAt
                }
            }
        });

    } catch (error) {
        console.error('Error creando usuario:', error);
        
        if (error.name === 'SequelizeValidationError') {
            const errors = error.errors.map(err => err.message);
            return res.status(400).json({
                success: false,
                message: 'Error de validación',
                errors
            });
        }
        
        res.status(500).json({
            success: false,
            message: 'Error creando usuario',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// @desc    Actualizar usuario (Solo Admin)
// @route   PUT /api/users/:id
// @access  Private/Admin
router.put('/:id', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const { username, role, email, active } = req.body;
        const userId = req.params.id;

        // No permitir auto-desactivación
        if (parseInt(userId) === req.user.userId && active === false) {
            return res.status(400).json({
                success: false,
                message: 'No puedes desactivar tu propia cuenta'
            });
        }

        const user = await User.findByPk(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Usuario no encontrado'
            });
        }

        // Validaciones
        if (username && username !== user.username) {
            const existingUser = await User.findOne({ where: { username } });
            if (existingUser) {
                return res.status(400).json({
                    success: false,
                    message: 'El nombre de usuario ya existe'
                });
            }
            user.username = username;
        }

        if (email && email !== user.email) {
            const existingUser = await User.findOne({ where: { email } });
            if (existingUser) {
                return res.status(400).json({
                    success: false,
                    message: 'El email ya está en uso'
                });
            }
            user.email = email;
        }

        if (role) user.role = role;
        if (typeof active === 'boolean') user.active = active;

        await user.save();

        res.json({
            success: true,
            message: 'Usuario actualizado correctamente',
            data: {
                user: {
                    id: user.id,
                    username: user.username,
                    role: user.role,
                    email: user.email,
                    active: user.active,
                    lastLogin: user.lastLogin
                }
            }
        });

    } catch (error) {
        console.error('Error actualizando usuario:', error);
        res.status(500).json({
            success: false,
            message: 'Error actualizando usuario',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// @desc    Eliminar usuario (Solo Admin)
// @route   DELETE /api/users/:id
// @access  Private/Admin
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const userId = req.params.id;

        // No permitir auto-eliminación
        if (parseInt(userId) === req.user.userId) {
            return res.status(400).json({
                success: false,
                message: 'No puedes eliminar tu propia cuenta'
            });
        }

        const user = await User.findByPk(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Usuario no encontrado'
            });
        }

        // En lugar de eliminar, marcar como inactivo
        user.active = false;
        await user.save();

        res.json({
            success: true,
            message: 'Usuario desactivado correctamente'
        });

    } catch (error) {
        console.error('Error eliminando usuario:', error);
        res.status(500).json({
            success: false,
            message: 'Error eliminando usuario',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// @desc    Obtener estadísticas de usuarios (Solo Admin)
// @route   GET /api/users/stats
// @access  Private/Admin
router.get('/stats', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const totalUsers = await User.count({ where: { active: true } });
        const adminUsers = await User.count({ where: { role: 'admin', active: true } });
        const editorUsers = await User.count({ where: { role: 'editor', active: true } });
        
        // Usuarios creados en los últimos 30 días
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        
        const recentUsers = await User.count({
            where: {
                active: true,
                createdAt: { [Op.gte]: thirtyDaysAgo }
            }
        });

        res.json({
            success: true,
            data: {
                totalUsers,
                adminUsers,
                editorUsers,
                recentUsers
            }
        });

    } catch (error) {
        console.error('Error obteniendo estadísticas:', error);
        res.status(500).json({
            success: false,
            message: 'Error obteniendo estadísticas de usuarios',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

module.exports = router;