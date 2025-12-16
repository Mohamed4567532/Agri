const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    type: {
        type: String,
        required: [true, "Le type de produit est requis"],
        enum: ['mouton', 'huile']
    },
    farmerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, "L'ID du fermier est requis"]
    },
    
    // Champs pour MOUTON
    price: {
        type: Number,
        required: function() { return this.type === 'mouton'; },
        min: [0, "Le prix doit être positif"]
    },
    weight: {
        type: Number,
        required: function() { return this.type === 'mouton'; },
        min: [0, "Le poids doit être positif"]
    },
    hasMedicalCertificate: {
        type: Boolean,
        default: false
    },
    medicalCertificatePDF: {
        type: String,
        default: ''
    },
    
    // Champs pour HUILE
    oilType: {
        type: String,
        enum: ['la chemlali', 'la chetoui', 'oueslati', 'extra vierge', ''],
        required: function() { return this.type === 'huile'; }
    },
    quantity: {
        type: Number,
        required: function() { return this.type === 'huile'; },
        min: [0, "La quantité doit être positive"]
    },
    
    // Champs communs
    description: {
        type: String,
        required: [true, "La description est requise"],
        trim: true
    },
    image: {
        type: String,
        default: ''
    },
    status: {
        type: String,
        enum: ['disponible', 'épuisé', 'suspendu'],
        default: 'disponible'
    }
}, {
    timestamps: true,
    collection: 'produits'
});

module.exports = mongoose.model('Product', productSchema, 'produits');
