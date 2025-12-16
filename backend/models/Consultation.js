const mongoose = require('mongoose');

const consultationSchema = new mongoose.Schema({
    farmerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, "L'ID du fermier est requis"]
    },
    vetId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, "L'ID du vétérinaire est requis"]
    },
    sheepIds: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: [true, "Au moins un mouton doit être sélectionné"]
    }],
    description: {
        type: String,
        required: [true, "La description est requise"],
        trim: true
    },
    video: {
        type: String,
        default: ''
    },
    status: {
        type: String,
        enum: ['en_attente', 'en_cours', 'terminée', 'annulée'],
        default: 'en_attente'
    },
    vetResponse: {
        type: String,
        default: ''
    },
    responseDate: {
        type: Date
    }
}, {
    timestamps: true,
    collection: 'consultations'
});

module.exports = mongoose.model('Consultation', consultationSchema, 'consultations');

