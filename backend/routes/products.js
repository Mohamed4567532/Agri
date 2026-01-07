const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const User = require('../models/User');
const upload = require('../config/multer');

router.get('/', async (req, res) => {
    try {
        const { type, status } = req.query;
        
        // Construire la requête
        let query = {};
        
        // Filtrer par type si spécifié
        if (type) {
            query.type = type;
        }
        
        // Filtrer par statut du produit si spécifié
        if (status) {
            query.status = status;
        }
        
        // Récupérer tous les produits avec les informations du fermier
        let products = await Product.find(query)
            .populate({
                path: 'farmerId',
                select: 'name username email role status',
                match: { status: 'accepted' } // Filtrer uniquement les fermiers acceptés
            })
            .sort({ createdAt: -1 });
        
        // Filtrer les produits dont le fermier est null (fermier non accepté)
        products = products.filter(p => p.farmerId !== null && p.farmerId.status === 'accepted');
        
        console.log(`✅ ${products.length} produits retournés (fermiers acceptés uniquement)`);
        res.json(products);
    } catch (error) {
        console.error('❌ Erreur GET /api/products:', error);
        res.status(500).json({ message: error.message });
    }
});

router.get('/:id', async (req, res) => {
    try {
        const product = await Product.findById(req.params.id)
            .populate('farmerId', 'name username email');
        if (!product) {
            return res.status(404).json({ message: 'Produit non trouvé' });
        }
        res.json(product);
    } catch (error) {
        console.error('Erreur GET /api/products/:id:', error);
        res.status(500).json({ message: error.message });
    }
});

router.post('/', upload.fields([
    { name: 'image', maxCount: 1 },
    { name: 'medicalCertificatePDF', maxCount: 1 }
]), async (req, res) => {
    try {
        console.log('📥 POST /api/products - Body:', req.body);
        
        const { type, price, weight, hasMedicalCertificate, oilType, quantity, description, farmerId } = req.body;

        const errors = [];
        
        if (!type) errors.push('Le type de produit est requis');
        if (!description || description.trim().length === 0) errors.push('La description est requise');
        if (!farmerId) errors.push('L\'ID du fermier est requis');
        
        // Validation spécifique pour mouton
        if (type === 'mouton') {
            if (!price || price <= 0) errors.push('Le prix est requis pour un mouton');
            if (!weight || weight <= 0) errors.push('Le poids est requis pour un mouton');
        }
        
        // Validation spécifique pour huile
        if (type === 'huile') {
            if (!oilType) errors.push('Le type d\'huile est requis');
            if (!quantity || quantity <= 0) errors.push('La quantité est requise pour l\'huile');
        }
        
        if (errors.length > 0) {
            console.log('❌ Erreurs de validation:', errors);
            return res.status(400).json({ 
                message: 'Erreurs de validation',
                errors: errors
            });
        }

        const imageUrl = req.files && req.files['image'] ? `/uploads/${req.files['image'][0].filename}` : '';
        const pdfUrl = req.files && req.files['medicalCertificatePDF'] ? `/uploads/${req.files['medicalCertificatePDF'][0].filename}` : '';

        const productData = {
            type,
            farmerId,
            description: description.trim(),
            image: imageUrl,
            status: 'disponible'
        };
        
        if (type === 'mouton') {
            productData.price = price;
            productData.weight = weight;
            productData.hasMedicalCertificate = hasMedicalCertificate === 'true' || hasMedicalCertificate === true;
            productData.medicalCertificatePDF = productData.hasMedicalCertificate ? pdfUrl : '';
        } else if (type === 'huile') {
            productData.oilType = oilType;
            productData.quantity = quantity;
        }

        const product = new Product(productData);

        const savedProduct = await product.save();
        await savedProduct.populate('farmerId', 'name username email');
        
        console.log('✅ Produit créé:', savedProduct._id);
        res.status(201).json(savedProduct);
        
    } catch (error) {
        console.error('❌ Erreur POST /api/products:', error);
        res.status(400).json({ message: error.message });
    }
});

router.put('/:id', upload.fields([
    { name: 'image', maxCount: 1 },
    { name: 'medicalCertificatePDF', maxCount: 1 }
]), async (req, res) => {
    try {
        console.log('📥 PUT /api/products/:id - Body:', req.body);
        console.log('📥 PUT /api/products/:id - Files:', req.files);
        
        const { type, price, weight, hasMedicalCertificate, oilType, quantity, description, status } = req.body;
        
        // Trouver le produit existant
        const existingProduct = await Product.findById(req.params.id);
        if (!existingProduct) {
            return res.status(404).json({ message: 'Produit non trouvé' });
        }
        
        // Préparer les données de mise à jour
        const updateData = {
            description: description?.trim() || existingProduct.description,
            status: status || existingProduct.status
        };
        
        // Gérer l'image si uploadée
        if (req.files && req.files['image']) {
            updateData.image = `/uploads/${req.files['image'][0].filename}`;
            console.log('✅ Nouvelle image:', updateData.image);
        }
        
        // Gérer le PDF si uploadé
        if (req.files && req.files['medicalCertificatePDF']) {
            updateData.medicalCertificatePDF = `/uploads/${req.files['medicalCertificatePDF'][0].filename}`;
            console.log('✅ Nouveau PDF:', updateData.medicalCertificatePDF);
        }
        
        // Champs spécifiques selon le type
        if (type === 'mouton' || existingProduct.type === 'mouton') {
            if (price !== undefined) updateData.price = price;
            if (weight !== undefined) updateData.weight = weight;
            if (hasMedicalCertificate !== undefined) {
                updateData.hasMedicalCertificate = hasMedicalCertificate === 'true' || hasMedicalCertificate === true;
            }
        } else if (type === 'huile' || existingProduct.type === 'huile') {
            if (oilType !== undefined) updateData.oilType = oilType;
            if (quantity !== undefined) updateData.quantity = quantity;
        }
        
        const product = await Product.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true, runValidators: true }
        ).populate('farmerId', 'name username email');
        
        console.log('✅ Produit mis à jour:', product._id);
        res.json(product);
    } catch (error) {
        console.error('❌ Erreur PUT /api/products/:id:', error);
        res.status(400).json({ message: error.message });
    }
});

router.delete('/:id', async (req, res) => {
    try {
        const product = await Product.findByIdAndDelete(req.params.id);
        if (!product) {
            return res.status(404).json({ message: 'Produit non trouvé' });
        }
        res.json({ message: 'Produit supprimé avec succès' });
    } catch (error) {
        console.error('Erreur DELETE /api/products/:id:', error);
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;

