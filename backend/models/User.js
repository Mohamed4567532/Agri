const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: [true, "Le nom d'utilisateur est requis"],
        unique: true,
        trim: true,
        minlength: [3, "Le nom d'utilisateur doit contenir au moins 3 caractères"]
    },
    email: {
        type: String,
        required: [true, "L'email est requis"],
        unique: true,
        trim: true,
        lowercase: true,
        match: [/^\S+@\S+\.\S+$/, 'Email invalide']
    },
    password: {
        type: String,
        required: [true, 'Le mot de passe est requis'],
        minlength: [6, 'Le mot de passe doit contenir au moins 6 caractères']
    },
    name: {
        type: String,
        required: [true, 'Le nom complet est requis'],
        trim: true
    },
    role: {
        type: String,
        enum: ['farmer', 'consumer', 'vet', 'admin'],
        required: [true, 'Le rôle est requis']
    },
    status: {
        type: String,
        enum: ['pending', 'accepted', 'rejected', 'suspended'],
        default: 'pending'
    }
}, {
    timestamps: true,
    collection: 'utilisateurs'
});

module.exports = mongoose.model('User', userSchema, 'utilisateurs');
