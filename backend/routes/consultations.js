const express = require('express');
const router = express.Router();
const Consultation = require('../models/Consultation');
const upload = require('../config/multer');

// GET all consultations
router.get('/', async (req, res) => {
    try {
        const { farmerId, vetId } = req.query;
        
        let query = {};
        // Vérifier que les IDs sont valides (non "undefined" string)
        if (farmerId && farmerId !== 'undefined' && farmerId !== 'null') {
            query.farmerId = farmerId;
        }
        if (vetId && vetId !== 'undefined' && vetId !== 'null') {
            query.vetId = vetId;
        }
        
        const consultations = await Consultation.find(query)
            .populate('farmerId', 'name username email')
            .populate('vetId', 'name username email')
            .populate('sheepIds', 'price weight description image')
            .sort({ createdAt: -1 });
            
        res.json(consultations);
    } catch (error) {
        console.error('Erreur GET /api/consultations:', error);
        res.status(500).json({ message: error.message });
    }
});

// GET single consultation
router.get('/:id', async (req, res) => {
    try {
        const consultation = await Consultation.findById(req.params.id)
            .populate('farmerId', 'name username email')
            .populate('vetId', 'name username email')
            .populate('sheepIds', 'price weight description image');
            
        if (!consultation) {
            return res.status(404).json({ message: 'Consultation non trouvée' });
        }
        
        res.json(consultation);
    } catch (error) {
        console.error('Erreur GET /api/consultations/:id:', error);
        res.status(500).json({ message: error.message });
    }
});

// POST new consultation
router.post('/', upload.single('video'), async (req, res) => {
    try {
        console.log('📥 POST /api/consultations - Body:', req.body);
        
        const { farmerId, vetId, sheepIds, description } = req.body;

        const errors = [];
        
        if (!farmerId) errors.push('L\'ID du fermier est requis');
        if (!vetId) errors.push('L\'ID du vétérinaire est requis');
        if (!sheepIds || sheepIds.length === 0) errors.push('Au moins un mouton doit être sélectionné');
        if (!description || description.trim().length === 0) errors.push('La description est requise');
        
        if (errors.length > 0) {
            console.log('❌ Erreurs de validation:', errors);
            return res.status(400).json({ 
                message: 'Erreurs de validation',
                errors: errors
            });
        }

        const videoUrl = req.file ? `/uploads/${req.file.filename}` : '';
        
        const sheepIdsArray = Array.isArray(sheepIds) ? sheepIds : [sheepIds];

        const consultation = new Consultation({
            farmerId,
            vetId,
            sheepIds: sheepIdsArray,
            description: description.trim(),
            video: videoUrl,
            status: 'en_attente'
        });

        const savedConsultation = await consultation.save();
        await savedConsultation.populate('farmerId', 'name username email');
        await savedConsultation.populate('vetId', 'name username email');
        await savedConsultation.populate('sheepIds', 'price weight description image');
        
        console.log('✅ Consultation créée:', savedConsultation._id);
        res.status(201).json(savedConsultation);
        
    } catch (error) {
        console.error('❌ Erreur POST /api/consultations:', error);
        res.status(400).json({ message: error.message });
    }
});

// PUT update consultation (pour vétérinaire)
router.put('/:id', async (req, res) => {
    try {
        const { status, vetResponse } = req.body;
        
        const updateData = {};
        if (status) updateData.status = status;
        if (vetResponse) {
            updateData.vetResponse = vetResponse;
            updateData.responseDate = new Date();
        }
        
        const consultation = await Consultation.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true, runValidators: true }
        )
            .populate('farmerId', 'name username email')
            .populate('vetId', 'name username email')
            .populate('sheepIds', 'price weight description image');

        if (!consultation) {
            return res.status(404).json({ message: 'Consultation non trouvée' });
        }
        
        res.json(consultation);
    } catch (error) {
        console.error('Erreur PUT /api/consultations/:id:', error);
        res.status(400).json({ message: error.message });
    }
});

// DELETE consultation
router.delete('/:id', async (req, res) => {
    try {
        const consultation = await Consultation.findByIdAndDelete(req.params.id);
        if (!consultation) {
            return res.status(404).json({ message: 'Consultation non trouvée' });
        }
        res.json({ message: 'Consultation supprimée avec succès' });
    } catch (error) {
        console.error('Erreur DELETE /api/consultations/:id:', error);
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;

