const express = require('express');
const router = express.Router();
const Reclamation = require('../models/Reclamation');
const User = require('../models/User');
const Admin = require('../models/Admin');
const mongoose = require('mongoose');

// GET /api/reclamations/diagnostic - Diagnostic de la base de données
router.get('/diagnostic', async (req, res) => {
    try {
        const mongoose = require('mongoose');
        const diagnostic = {
            mongodb: {
                connected: mongoose.connection.readyState === 1,
                state: mongoose.connection.readyState,
                database: mongoose.connection.db?.databaseName,
                host: mongoose.connection.host,
                port: mongoose.connection.port
            },
            collection: {
                exists: false,
                count: 0,
                name: 'reclamations'
            },
            model: {
                name: 'Reclamation',
                schema: 'defined'
            }
        };

        if (mongoose.connection.readyState === 1) {
            // Vérifier si la collection existe
            const collections = await mongoose.connection.db.listCollections().toArray();
            const reclamationsCollection = collections.find(col => col.name === 'reclamations');
            diagnostic.collection.exists = !!reclamationsCollection;
            
            // Compter les documents
            diagnostic.collection.count = await Reclamation.countDocuments();
        }

        res.json(diagnostic);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// GET /api/reclamations - Récupérer toutes les réclamations (admin) ou les réclamations de l'utilisateur
router.get('/', async (req, res) => {
    try {
        const { userId, role } = req.query;
        
        let query = {};
        
        // Si ce n'est pas un admin, ne montrer que ses propres réclamations
        if (role !== 'admin' && userId) {
            query.createdBy = userId;
        }
        
        const reclamations = await Reclamation.find(query)
            .populate('createdBy', 'name email role')
            .populate('resolvedBy', 'prenom nom email')
            .sort({ createdAt: -1 });
        
        res.json(reclamations);
    } catch (error) {
        console.error('❌ Erreur GET /api/reclamations:', error);
        res.status(500).json({ message: 'Erreur lors de la récupération des réclamations' });
    }
});

// GET /api/reclamations/:id - Récupérer une réclamation spécifique
router.get('/:id', async (req, res) => {
    try {
        const reclamation = await Reclamation.findById(req.params.id)
            .populate('createdBy', 'name email role')
            .populate('resolvedBy', 'prenom nom email');
        
        if (!reclamation) {
            return res.status(404).json({ message: 'Réclamation non trouvée' });
        }
        
        res.json(reclamation);
    } catch (error) {
        console.error('❌ Erreur GET /api/reclamations/:id:', error);
        res.status(500).json({ message: 'Erreur lors de la récupération de la réclamation' });
    }
});

// POST /api/reclamations - Créer une nouvelle réclamation
router.post('/', async (req, res) => {
    try {
        console.log('📥 POST /api/reclamations - Body:', req.body);
        
        // Vérifier la connexion MongoDB
        if (mongoose.connection.readyState !== 1) {
            console.error('❌ MongoDB non connecté. État:', mongoose.connection.readyState);
            return res.status(503).json({ 
                message: 'Base de données non disponible. Veuillez réessayer plus tard.' 
            });
        }
        
        const { sujet, description, type, createdBy, priorite, fichiers } = req.body;
        
        // Validation des champs requis
        if (!sujet || !description || !createdBy) {
            console.error('❌ Champs manquants:', { sujet: !!sujet, description: !!description, createdBy: !!createdBy });
            return res.status(400).json({ 
                message: 'Le sujet, la description et l\'utilisateur sont requis' 
            });
        }
        
        // Vérifier que createdBy est un ObjectId valide
        if (!mongoose.Types.ObjectId.isValid(createdBy)) {
            console.error('❌ ObjectId invalide:', createdBy);
            return res.status(400).json({ 
                message: 'ID utilisateur invalide' 
            });
        }
        
        // Convertir en ObjectId
        const userId = new mongoose.Types.ObjectId(createdBy);
        console.log('🔍 Recherche utilisateur avec ID:', userId);
        
        // Vérifier que l'utilisateur existe
        const user = await User.findById(userId);
        if (!user) {
            console.error('❌ Utilisateur non trouvé:', createdBy);
            return res.status(404).json({ message: 'Utilisateur non trouvé' });
        }
        
        console.log('✅ Utilisateur trouvé:', user.email, 'ID:', user._id);
        
        // Créer la réclamation avec l'ObjectId converti et les nouveaux champs
        const reclamation = new Reclamation({
            sujet: sujet.trim(),
            description: description.trim(),
            type: type || 'autre',
            createdBy: userId,
            statut: 'en_attente',
            priorite: priorite || 'normale',
            fichiers: fichiers || [],
            lastStatusUpdate: new Date()
        });
        
        console.log('📝 Réclamation à créer:', {
            sujet: reclamation.sujet,
            description: reclamation.description,
            type: reclamation.type,
            createdBy: reclamation.createdBy,
            statut: reclamation.statut
        });
        
        // Valider avant de sauvegarder
        const validationError = reclamation.validateSync();
        if (validationError) {
            console.error('❌ Erreur de validation:', validationError);
            const errors = Object.values(validationError.errors).map(err => ({
                field: err.path,
                message: err.message
            }));
            return res.status(400).json({ 
                message: 'Erreur de validation',
                errors: errors 
            });
        }
        
        // Sauvegarder dans la base de données avec options explicites
        console.log('💾 Tentative de sauvegarde...');
        console.log('   État MongoDB:', mongoose.connection.readyState === 1 ? 'Connecté' : 'Déconnecté');
        console.log('   Base de données:', mongoose.connection.db?.databaseName);
        
        // Utiliser save() avec validation explicite
        const savedReclamation = await reclamation.save({ validateBeforeSave: true });
        console.log('✅ Réclamation sauvegardée avec save()!');
        console.log('   ID:', savedReclamation._id);
        console.log('   ID (string):', savedReclamation._id.toString());
        
        // Attendre un peu pour s'assurer que MongoDB a bien écrit
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // Vérifier immédiatement que la réclamation existe dans la base
        const verifyReclamation = await Reclamation.findById(savedReclamation._id);
        if (!verifyReclamation) {
            console.error('❌ CRITIQUE: La réclamation n\'existe pas après sauvegarde!');
            console.error('   ID recherché:', savedReclamation._id);
            
            // Essayer de compter toutes les réclamations
            const totalCount = await Reclamation.countDocuments();
            console.error('   Nombre total de réclamations dans la base:', totalCount);
            
            return res.status(500).json({ 
                message: 'Erreur: La réclamation n\'a pas pu être sauvegardée dans la base de données',
                debug: {
                    savedId: savedReclamation._id.toString(),
                    totalCount: totalCount
                }
            });
        }
        console.log('✅ Vérification: Réclamation trouvée dans la base de données');
        console.log('   Sujet vérifié:', verifyReclamation.sujet);
        
        // Compter le nombre total de réclamations pour confirmer
        const totalCount = await Reclamation.countDocuments();
        console.log('📊 Nombre total de réclamations après sauvegarde:', totalCount);
        
        // Populate les références
        await savedReclamation.populate('createdBy', 'name email role');
        
        console.log('✅ Réclamation créée et retournée:', savedReclamation._id);
        console.log('   Données complètes:', JSON.stringify(savedReclamation.toObject(), null, 2));
        
        res.status(201).json(savedReclamation);
    } catch (error) {
        console.error('❌ Erreur POST /api/reclamations:', error);
        console.error('   Nom:', error.name);
        console.error('   Message:', error.message);
        console.error('   Code:', error.code);
        console.error('   Stack:', error.stack);
        
        // Gérer les erreurs de validation Mongoose
        if (error.name === 'ValidationError') {
            const errors = Object.values(error.errors).map(err => ({
                field: err.path,
                message: err.message
            }));
            return res.status(400).json({ 
                message: 'Erreur de validation',
                errors: errors 
            });
        }
        
        // Gérer les erreurs de connexion MongoDB
        if (error.name === 'MongoServerError' || error.name === 'MongoNetworkError') {
            console.error('❌ Erreur MongoDB:', error.message);
            return res.status(503).json({ 
                message: 'Erreur de connexion à la base de données' 
            });
        }
        
        // Gérer les erreurs de duplication
        if (error.code === 11000) {
            return res.status(400).json({ 
                message: 'Cette réclamation existe déjà' 
            });
        }
        
        res.status(500).json({ 
            message: error.message || 'Erreur lors de la création de la réclamation',
            error: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
});

// PUT /api/reclamations/:id - Mettre à jour une réclamation
router.put('/:id', async (req, res) => {
    try {
        const { sujet, description, type, statut, reponse, resolvedBy, priorite, notesInternes, fichiers } = req.body;
        
        const reclamation = await Reclamation.findById(req.params.id);
        if (!reclamation) {
            return res.status(404).json({ message: 'Réclamation non trouvée' });
        }
        
        // Mettre à jour les champs modifiables par l'utilisateur
        if (sujet !== undefined) reclamation.sujet = sujet.trim();
        if (description !== undefined) reclamation.description = description.trim();
        if (type !== undefined) reclamation.type = type;
        
        // Mettre à jour les champs admin
        if (statut) {
            reclamation.statut = statut;
            reclamation.lastStatusUpdate = new Date();
        }
        if (reponse !== undefined) reclamation.reponse = reponse;
        if (resolvedBy) reclamation.resolvedBy = resolvedBy;
        if (priorite) reclamation.priorite = priorite;
        if (notesInternes !== undefined) reclamation.notesInternes = notesInternes;
        if (fichiers !== undefined) reclamation.fichiers = fichiers;
        
        // Si la réclamation est résolue, enregistrer la date
        if (statut === 'resolue' && !reclamation.resolvedAt) {
            reclamation.resolvedAt = new Date();
        }
        
        await reclamation.save();
        await reclamation.populate('createdBy', 'name email role');
        await reclamation.populate('resolvedBy', 'prenom nom email');
        
        console.log('✅ Réclamation mise à jour:', reclamation._id);
        res.json(reclamation);
    } catch (error) {
        console.error('❌ Erreur PUT /api/reclamations/:id:', error);
        res.status(400).json({ message: error.message });
    }
});

// DELETE /api/reclamations/:id - Supprimer une réclamation
router.delete('/:id', async (req, res) => {
    try {
        const reclamation = await Reclamation.findByIdAndDelete(req.params.id);
        
        if (!reclamation) {
            return res.status(404).json({ message: 'Réclamation non trouvée' });
        }
        
        console.log('✅ Réclamation supprimée:', req.params.id);
        res.json({ message: 'Réclamation supprimée avec succès' });
    } catch (error) {
        console.error('❌ Erreur DELETE /api/reclamations/:id:', error);
        res.status(500).json({ message: 'Erreur lors de la suppression de la réclamation' });
    }
});

module.exports = router;


