const express = require('express');
const router = express.Router();
const Statistic = require('../models/Statistic');

// GET all statistics
router.get('/', async (req, res) => {
    try {
        const { category } = req.query;
        
        let query = {};
        if (category) query.category = category;
        
        const statistics = await Statistic.find(query)
            .populate('updatedBy', 'name username')
            .sort({ updatedAt: -1 });
            
        res.json(statistics);
    } catch (error) {
        console.error('Erreur GET /api/statistics:', error);
        res.status(500).json({ message: error.message });
    }
});

// GET single statistic
router.get('/:id', async (req, res) => {
    try {
        const statistic = await Statistic.findById(req.params.id)
            .populate('updatedBy', 'name username');
            
        if (!statistic) {
            return res.status(404).json({ message: 'Statistique non trouvée' });
        }
        
        res.json(statistic);
    } catch (error) {
        console.error('Erreur GET /api/statistics/:id:', error);
        res.status(500).json({ message: error.message });
    }
});

// POST new statistic (Admin only)
router.post('/', async (req, res) => {
    try {
        console.log('📥 POST /api/statistics - Body:', req.body);
        
        const { category, displayName, icon, color, parts, updatedBy } = req.body;

        const errors = [];
        
        if (!category) errors.push('La catégorie est requise');
        if (!displayName) errors.push('Le nom d\'affichage est requis');
        if (!parts || parts.length === 0) errors.push('Au moins une partie doit être définie');
        
        if (errors.length > 0) {
            console.log('❌ Erreurs de validation:', errors);
            return res.status(400).json({ 
                message: 'Erreurs de validation',
                errors: errors
            });
        }

        // Check if statistic already exists for this category
        let statistic = await Statistic.findOne({ category });
        
        if (statistic) {
            // Update existing
            statistic.displayName = displayName || statistic.displayName;
            statistic.icon = icon || statistic.icon;
            statistic.color = color || statistic.color;
            statistic.parts = parts;
            statistic.updatedBy = updatedBy;
            await statistic.save();
        } else {
            // Create new
            statistic = new Statistic({
                category,
                displayName: displayName || category,
                icon: icon || '📊',
                color: color || '#3498db',
                parts,
                updatedBy
            });
            await statistic.save();
        }
        
        await statistic.populate('updatedBy', 'prenom nom');
        
        console.log('✅ Statistique sauvegardée:', statistic._id);
        res.status(201).json(statistic);
        
    } catch (error) {
        console.error('❌ Erreur POST /api/statistics:', error);
        res.status(400).json({ message: error.message });
    }
});

// PUT update statistic (Admin only)
router.put('/:id', async (req, res) => {
    try {
        const { parts, updatedBy } = req.body;
        
        const statistic = await Statistic.findByIdAndUpdate(
            req.params.id,
            { parts, updatedBy, updatedAt: new Date() },
            { new: true, runValidators: true }
        ).populate('updatedBy', 'name username');

        if (!statistic) {
            return res.status(404).json({ message: 'Statistique non trouvée' });
        }
        
        res.json(statistic);
    } catch (error) {
        console.error('Erreur PUT /api/statistics/:id:', error);
        res.status(400).json({ message: error.message });
    }
});

// DELETE statistic
router.delete('/:id', async (req, res) => {
    try {
        const statistic = await Statistic.findByIdAndDelete(req.params.id);
        if (!statistic) {
            return res.status(404).json({ message: 'Statistique non trouvée' });
        }
        res.json({ message: 'Statistique supprimée avec succès' });
    } catch (error) {
        console.error('Erreur DELETE /api/statistics/:id:', error);
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;

