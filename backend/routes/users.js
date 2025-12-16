const express = require('express');
const router = express.Router();
const User = require('../models/User');

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

// PUT /api/users/:id - Mettre à jour un utilisateur
router.put('/:id', async (req, res) => {
    try {
        const { name, email, role, status } = req.body;
        
        const user = await User.findByIdAndUpdate(
            req.params.id,
            { name, email, role, status },
            { new: true, runValidators: true }
        ).select('-password');
        
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Utilisateur non trouvé'
            });
        }
        
        res.json({
            success: true,
            message: 'Utilisateur mis à jour',
            user: user
        });
    } catch (error) {
        console.error('Erreur lors de la mise à jour:', error);
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
