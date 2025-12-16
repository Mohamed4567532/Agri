const mongoose = require('mongoose');

const statisticSchema = new mongoose.Schema({
    category: {
        type: String,
        required: [true, "La catégorie est requise"],
        enum: ['fruits', 'légumes', 'viande', 'huile']
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
    updatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, {
    timestamps: true,
    collection: 'statistiques'
});

module.exports = mongoose.model('Statistic', statisticSchema, 'statistiques');

