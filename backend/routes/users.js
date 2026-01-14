const express = require('express');
const router = express.Router();
const User = require('../models/User');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configurer Multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = 'uploads/users';
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        cb(null, 'user-' + Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        const filetypes = /jpeg|jpg|png|gif|webp/;
        const mimetype = filetypes.test(file.mimetype);
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
        if (mimetype && extname) {
            return cb(null, true);
        }
        cb(new Error('Seules les images sont autorisées!'));
    }
});

// GET /api/users - Récupérer tous les utilisateurs (pour l'admin)
router.get('/', async (req, res) => {
    try {
        const users = await User.find()
            .select('-password') // Exclure les mots de passe
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            users: users
        });
    } catch (error) {
        console.error('Erreur lors de la récupération des utilisateurs:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur serveur',
            error: error.message
        });
    }
});

// Handler pour mettre à jour un utilisateur
const updateUserHandler = async (req, res) => {
    try {
        console.log(`📥 ${req.method} /api/users/${req.params.id}`);
        console.log('   Body:', req.body);

        const { name, email, role, status, suspensionEndDate, suspensionReason, subscribed } = req.body;

        const updateData = {};
        if (name) updateData.name = name;
        if (email) updateData.email = email;
        if (role) updateData.role = role;
        if (status) updateData.status = status;
        if (suspensionEndDate !== undefined) updateData.suspensionEndDate = suspensionEndDate;
        if (suspensionReason !== undefined) updateData.suspensionReason = suspensionReason;
        if (subscribed !== undefined) updateData.subscribed = subscribed;
        if (req.file) updateData.image = `/uploads/users/${req.file.filename}`;

        console.log('   📝 UpdateData:', JSON.stringify(updateData));

        const user = await User.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true, runValidators: true }
        ).select('-password');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Utilisateur non trouvé'
            });
        }

        console.log('   ✅ Utilisateur mis à jour:', user._id);
        console.log('   📊 Subscribed après update:', user.subscribed);
        res.json({
            success: true,
            message: 'Utilisateur mis à jour',
            user: user
        });
    } catch (error) {
        console.error('   ❌ Erreur lors de la mise à jour:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur serveur',
            error: error.message
        });
    }
};

// PUT /api/users/:id - Mettre à jour un utilisateur (pour compatibilité avec admin dashboard)
router.put('/:id', upload.single('image'), updateUserHandler);

// PATCH /api/users/:id - Mettre à jour un utilisateur
router.patch('/:id', upload.single('image'), updateUserHandler);

// GET /api/users/:id - Récupérer un utilisateur par ID
router.get('/:id', async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('-password');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Utilisateur non trouvé'
            });
        }

        res.json({
            success: true,
            user: user
        });
    } catch (error) {
        console.error('Erreur lors de la récupération de l\'utilisateur:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur serveur',
            error: error.message
        });
    }
});

// DELETE /api/users/:id - Supprimer un utilisateur
router.delete('/:id', async (req, res) => {
    try {
        const user = await User.findByIdAndDelete(req.params.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Utilisateur non trouvé'
            });
        }

        res.json({
            success: true,
            message: 'Utilisateur supprimé'
        });
    } catch (error) {
        console.error('Erreur lors de la suppression:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur serveur',
            error: error.message
        });
    }
});

module.exports = router;
