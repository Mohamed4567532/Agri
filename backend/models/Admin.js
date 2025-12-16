const mongoose = require('mongoose');

const adminSchema = new mongoose.Schema({
    prenom: {
        type: String,
        required: [true, "Le prénom est requis"],
        trim: true
    },
    nom: {
        type: String,
        required: [true, "Le nom est requis"],
        trim: true
    },
    email: {
        type: String,
        required: [true, "L'email est requis"],
        unique: true,
        trim: true,
        lowercase: true,
        match: [/^\S+@\S+\.\S+$/, 'Email invalide']
    },
    motdepasse: {
        type: String,
        required: [true, 'Le mot de passe est requis'],
        minlength: [6, 'Le mot de passe doit contenir au moins 6 caractères']
    }
}, {
    timestamps: true,
    collection: 'administrateurs'
});

module.exports = mongoose.model('Admin', adminSchema, 'administrateurs');

