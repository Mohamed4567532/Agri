const mongoose = require('mongoose');

const statisticSchema = new mongoose.Schema({
    category: {
        type: String,
        required: [true, "La catégorie est requise"],
        unique: true,
        trim: true
    },
    displayName: {
        type: String,
        required: [true, "Le nom d'affichage est requis"],
        trim: true
    },
    icon: {
        type: String,
        default: '📊'
    },
    color: {
        type: String,
        default: '#3498db'
    },
    parts: [{
        label: {
            type: String,
            required: [true, "Le label est requis"]
        },
        percentage: {
            type: Number,
            required: [true, "Le pourcentage est requis"],
            min: 0,
            max: 100
        },
        color: {
            type: String,
            default: '#3498db'
        }
    }],
    isActive: {
        type: Boolean,
        default: true
    },
    updatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Admin'
    }
}, {
    timestamps: true,
    collection: 'statistiques'
});

module.exports = mongoose.model('Statistic', statisticSchema, 'statistiques');
