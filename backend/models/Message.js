const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    senderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, "L'ID de l'expéditeur est requis"]
    },
    receiverId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, "L'ID du destinataire est requis"]
    },
    subject: {
        type: String,
        required: [true, "Le sujet est requis"],
        trim: true
    },
    message: {
        type: String,
        required: [true, "Le message est requis"],
        trim: true
    },
    isRead: {
        type: Boolean,
        default: false
    },
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product'
    }
}, {
    timestamps: true,
    collection: 'messages'
});

module.exports = mongoose.model('Message', messageSchema, 'messages');

