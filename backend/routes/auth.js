const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Admin = require('../models/Admin');

const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configurer Multer pour les images de profil
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
        cb(new Error('Seules les images sont autorisées (jpeg, jpg, png, gif, webp)!'));
    }
});

// POST /api/auth/register - Inscription
router.post('/register', upload.single('image'), async (req, res) => {
    console.log('\n📥 POST /api/auth/register');
    console.log('   Body:', JSON.stringify(req.body, null, 2));

    try {
        const { username, email, password, name, role } = req.body;

        // Validation
        if (!username || !email || !password || !name || !role) {
            return res.status(400).json({
                success: false,
                message: 'Tous les champs sont requis',
                required: ['username', 'email', 'password', 'name', 'role']
            });
        }

        // Vérifier si l'utilisateur existe
        const existingUser = await User.findOne({
            $or: [
                { email: email.toLowerCase() },
                { username: username.toLowerCase() }
            ]
        });

        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: existingUser.email === email.toLowerCase()
                    ? 'Cet email est déjà utilisé'
                    : 'Ce nom d\'utilisateur est déjà utilisé'
            });
        }

        // Créer l'utilisateur
        const newUser = new User({
            username: username.toLowerCase().trim(),
            email: email.toLowerCase().trim(),
            password: password,
            name: name.trim(),
            role: role,
            name: name.trim(),
            role: role,
            status: 'pending',
            image: req.file ? `/uploads/users/${req.file.filename}` : ''
        });

        await newUser.save();

        console.log('   ✅ Utilisateur créé:', newUser._id);

        res.status(201).json({
            success: true,
            message: 'Inscription réussie ! Votre compte sera activé par l\'administrateur.',
            user: {
                id: newUser._id.toString(),
                username: newUser.username,
                email: newUser.email,
                name: newUser.name,
                role: newUser.role,
                name: newUser.name,
                role: newUser.role,
                status: newUser.status,
                image: newUser.image
            }
        });

    } catch (error) {
        console.error('   ❌ Erreur:', error);

        if (error.name === 'ValidationError') {
            const errors = Object.values(error.errors).map(e => e.message);
            return res.status(400).json({
                success: false,
                message: 'Erreur de validation',
                errors: errors
            });
        }

        if (error.code === 11000) {
            const field = Object.keys(error.keyPattern)[0];
            return res.status(400).json({
                success: false,
                message: `Ce ${field === 'email' ? 'email' : 'nom d\'utilisateur'} est déjà utilisé`
            });
        }

        res.status(500).json({
            success: false,
            message: 'Erreur serveur',
            error: error.message
        });
    }
});

// POST /api/auth/login - Connexion
router.post('/login', async (req, res) => {
    console.log('\n📥 POST /api/auth/login');

    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Email et mot de passe requis'
            });
        }

        // 1. Vérifier d'abord dans la table administrateurs
        const admin = await Admin.findOne({ email: email.toLowerCase() });

        if (admin) {
            // Vérifier le mot de passe admin
            if (admin.motdepasse !== password) {
                return res.status(401).json({
                    success: false,
                    message: 'Email ou mot de passe incorrect'
                });
            }

            console.log('   ✅ Connexion admin réussie:', admin.email);

            return res.json({
                success: true,
                message: 'Connexion administrateur réussie',
                user: {
                    id: admin._id.toString(),
                    email: admin.email,
                    name: `${admin.prenom} ${admin.nom}`,
                    prenom: admin.prenom,
                    nom: admin.nom,
                    role: 'admin',
                    role: 'admin',
                    status: 'accepted',
                    image: ''
                }
            });
        }

        // 2. Si pas admin, vérifier dans la table utilisateurs
        const user = await User.findOne({ email: email.toLowerCase() });

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Email ou mot de passe incorrect'
            });
        }

        // Comparer le mot de passe avec bcrypt
        const isPasswordValid = await user.comparePassword(password);
        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: 'Email ou mot de passe incorrect'
            });
        }

        if (user.status !== 'accepted') {
            // Special handling for suspended users
            if (user.status === 'suspended') {
                // Check if suspension has ended
                if (user.suspensionEndDate && new Date() >= new Date(user.suspensionEndDate)) {
                    // Automatically unsuspend the user
                    user.status = 'accepted';
                    user.suspensionEndDate = null;
                    user.suspensionReason = '';
                    await user.save();

                    console.log('   ✅ User auto-unsuspended:', user.email);

                    // Continue with normal login flow
                } else {
                    // Still suspended
                    const endDateStr = user.suspensionEndDate
                        ? new Date(user.suspensionEndDate).toLocaleDateString('fr-FR', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                        })
                        : 'indéfiniment';

                    const reasonStr = user.suspensionReason || 'Aucune raison spécifiée';

                    return res.status(403).json({
                        success: false,
                        message: `Votre compte est suspendu jusqu'au ${endDateStr}. Raison : ${reasonStr}`,
                        status: user.status,
                        suspensionEndDate: user.suspensionEndDate,
                        suspensionReason: user.suspensionReason
                    });
                }
            } else {
                // Handle other non-accepted statuses
                const statusMessages = {
                    'pending': 'Votre compte n\'est pas encore activé. Il est en attente d\'approbation par l\'administrateur.',
                    'rejected': 'Votre compte a été rejeté par l\'administrateur.'
                };

                return res.status(403).json({
                    success: false,
                    message: statusMessages[user.status] || 'Votre compte n\'est pas encore activé',
                    status: user.status
                });
            }
        }

        console.log('   ✅ Connexion réussie:', user.email);

        res.json({
            success: true,
            message: 'Connexion réussie',
            user: {
                id: user._id.toString(),
                username: user.username,
                email: user.email,
                name: user.name,
                role: user.role,
                role: user.role,
                status: user.status,
                image: user.image
            }
        });

    } catch (error) {
        console.error('   ❌ Erreur:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur serveur',
            error: error.message
        });
    }
});

module.exports = router;
