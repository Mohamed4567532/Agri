const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Admin = require('../models/Admin');

// POST /api/auth/register - Inscription
router.post('/register', async (req, res) => {
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
            status: 'pending'
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
                status: newUser.status
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
                    status: 'accepted'
                }
            });
        }
        
        // 2. Si pas admin, vérifier dans la table utilisateurs
        const user = await User.findOne({ email: email.toLowerCase() });
        
        if (!user || user.password !== password) {
            return res.status(401).json({
                success: false,
                message: 'Email ou mot de passe incorrect'
            });
        }
        
        if (user.status !== 'accepted') {
            const statusMessages = {
                'pending': 'Votre compte n\'est pas encore activé. Il est en attente d\'approbation par l\'administrateur.',
                'rejected': 'Votre compte a été rejeté par l\'administrateur.',
                'suspended': 'Votre compte a été suspendu. Contactez l\'administrateur.'
            };
            
            return res.status(403).json({
                success: false,
                message: statusMessages[user.status] || 'Votre compte n\'est pas encore activé',
                status: user.status
            });
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
                status: user.status
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
