const mongoose = require('mongoose');

const reclamationSchema = new mongoose.Schema({
    // Numéro de référence unique pour chaque réclamation
    numeroReference: {
        type: String,
        unique: true,
        sparse: true,
        trim: true
    },
    sujet: {
        type: String,
        required: [true, "Le sujet est requis"],
        trim: true,
        maxlength: [200, "Le sujet ne peut pas dépasser 200 caractères"]
    },
    description: {
        type: String,
        required: [true, "La description est requise"],
        trim: true,
        maxlength: [2000, "La description ne peut pas dépasser 2000 caractères"]
    },
    type: {
        type: String,
        enum: ['technique', 'produit', 'service', 'autre'],
        default: 'autre',
        required: true
    },
    statut: {
        type: String,
        enum: ['en_attente', 'en_cours', 'resolue', 'fermee'],
        default: 'en_attente',
        required: true
    },
    priorite: {
        type: String,
        enum: ['basse', 'normale', 'haute', 'urgente'],
        default: 'normale'
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, "L'utilisateur créateur est requis"]
    },
    reponse: {
        type: String,
        trim: true,
        maxlength: [2000, "La réponse ne peut pas dépasser 2000 caractères"]
    },
    resolvedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Admin'
    },
    resolvedAt: {
        type: Date
    },
    // Fichiers joints (chemins vers les fichiers)
    fichiers: [{
        nom: String,
        chemin: String,
        type: String,
        taille: Number,
        uploadedAt: {
            type: Date,
            default: Date.now
        }
    }],
    // Notes internes (visibles uniquement par les admins)
    notesInternes: {
        type: String,
        trim: true
    },
    // Date de dernière mise à jour du statut
    lastStatusUpdate: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true,
    collection: 'reclamations'
});

// Générer un numéro de référence unique avant la sauvegarde
reclamationSchema.pre('save', async function(next) {
    if (!this.numeroReference) {
        // Générer un numéro de référence: REC-YYYYMMDD-XXXX
        const date = new Date();
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const datePrefix = `${year}${month}${day}`;
        
        // Générer un numéro unique avec vérification en boucle
        let attempts = 0;
        const maxAttempts = 100; // Limite de sécurité pour éviter les boucles infinies
        
        do {
            const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
            this.numeroReference = `REC-${datePrefix}-${random}`;
            
            // Vérifier l'unicité
            const existing = await this.constructor.findOne({ 
                numeroReference: this.numeroReference,
                _id: { $ne: this._id } // Exclure le document actuel lors de la mise à jour
            });
            
            if (!existing) {
                // Numéro unique trouvé
                break;
            }
            
            attempts++;
            
            // Si trop de tentatives, utiliser un timestamp pour garantir l'unicité
            if (attempts >= maxAttempts) {
                const timestamp = Date.now().toString().slice(-6); // 6 derniers chiffres du timestamp
                this.numeroReference = `REC-${datePrefix}-${timestamp}`;
                break;
            }
        } while (attempts < maxAttempts);
    }
    
    // Mettre à jour lastStatusUpdate si le statut change
    if (this.isModified('statut')) {
        this.lastStatusUpdate = new Date();
    }
    
    next();
});

// Index pour améliorer les performances de recherche
reclamationSchema.index({ createdBy: 1, createdAt: -1 });
reclamationSchema.index({ statut: 1, createdAt: -1 });
reclamationSchema.index({ type: 1, statut: 1 });
reclamationSchema.index({ numeroReference: 1 });

// Éviter la recompilation du modèle si déjà compilé
const Reclamation = mongoose.models.Reclamation || mongoose.model('Reclamation', reclamationSchema, 'reclamations');

module.exports = Reclamation;


