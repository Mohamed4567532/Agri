const express = require('express');
const router = express.Router();
const Message = require('../models/Message');

router.get('/', async (req, res) => {
    try {
        const { userId, type } = req.query; // type: 'sent' ou 'received'
        const mongoose = require('mongoose');
        
        let query = {};
        
        if (userId) {
            // Vérifier que userId est un ObjectId valide
            if (!mongoose.Types.ObjectId.isValid(userId)) {
                return res.status(400).json({ message: 'ID utilisateur invalide' });
            }
            
            const userObjectId = new mongoose.Types.ObjectId(userId);
            
            // Filtrer selon le type demandé
            if (type === 'sent') {
                // Messages envoyés par l'utilisateur
                query = { senderId: userObjectId };
            } else if (type === 'received') {
                // Messages reçus par l'utilisateur
                query = { receiverId: userObjectId };
            } else {
                // Par défaut: tous les messages (envoyés et reçus)
                query = {
                    $or: [
                        { senderId: userObjectId },
                        { receiverId: userObjectId }
                    ]
                };
            }
        }
        
        console.log('📥 GET /api/messages - Query:', JSON.stringify(query));
        
        const messages = await Message.find(query)
            .populate('senderId', 'name username email role')
            .populate('receiverId', 'name username email role')
            .populate('productId', 'type price weight description')
            .sort({ createdAt: -1 });
        
        console.log(`✅ ${messages.length} messages trouvés`);
        
        // Vérifier que les populate ont fonctionné
        messages.forEach((msg, index) => {
            if (!msg.senderId || !msg.receiverId) {
                console.warn(`⚠️ Message ${index} a des références manquantes:`, {
                    senderId: !!msg.senderId,
                    receiverId: !!msg.receiverId
                });
            }
        });
            
        res.json(messages);
    } catch (error) {
        console.error('❌ Erreur GET /api/messages:', error);
        res.status(500).json({ message: error.message });
    }
});

router.get('/:id', async (req, res) => {
    try {
        const message = await Message.findById(req.params.id)
            .populate('senderId', 'name username email')
            .populate('receiverId', 'name username email')
            .populate('productId', 'name price');
            
        if (!message) {
            return res.status(404).json({ message: 'Message non trouvé' });
        }
        
        res.json(message);
    } catch (error) {
        console.error('Erreur GET /api/messages/:id:', error);
        res.status(500).json({ message: error.message });
    }
});

router.post('/', async (req, res) => {
    try {
        console.log('📥 POST /api/messages - Body:', req.body);
        
        const { senderId, receiverId, subject, message, productId } = req.body;
        const mongoose = require('mongoose');
        const User = require('../models/User');

        const errors = [];
        
        if (!senderId) {
            errors.push('L\'ID de l\'expéditeur est requis');
        }
        
        if (!receiverId) {
            errors.push('L\'ID du destinataire est requis');
        }
        
        if (!subject || subject.trim().length === 0) {
            errors.push('Le sujet est requis');
        }
        
        if (!message || message.trim().length === 0) {
            errors.push('Le message est requis');
        }
        
        if (errors.length > 0) {
            console.log('❌ Erreurs de validation:', errors);
            return res.status(400).json({ 
                message: 'Erreurs de validation',
                errors: errors
            });
        }

        // Vérifier et convertir les ObjectIds
        if (!mongoose.Types.ObjectId.isValid(senderId)) {
            return res.status(400).json({ message: 'ID expéditeur invalide' });
        }
        
        if (!mongoose.Types.ObjectId.isValid(receiverId)) {
            return res.status(400).json({ message: 'ID destinataire invalide' });
        }
        
        const senderObjectId = new mongoose.Types.ObjectId(senderId);
        const receiverObjectId = new mongoose.Types.ObjectId(receiverId);
        
        // Vérifier que l'expéditeur existe
        const sender = await User.findById(senderObjectId);
        if (!sender) {
            return res.status(404).json({ message: 'Expéditeur non trouvé' });
        }
        
        // Vérifier que le destinataire existe
        const receiver = await User.findById(receiverObjectId);
        if (!receiver) {
            return res.status(404).json({ message: 'Destinataire non trouvé' });
        }
        
        console.log('✅ Expéditeur trouvé:', sender.email, 'Rôle:', sender.role);
        console.log('✅ Destinataire trouvé:', receiver.email, 'Rôle:', receiver.role);
        
        // Vérifier productId si fourni
        let productObjectId = null;
        if (productId) {
            if (!mongoose.Types.ObjectId.isValid(productId)) {
                return res.status(400).json({ message: 'ID produit invalide' });
            }
            productObjectId = new mongoose.Types.ObjectId(productId);
        }

        const newMessage = new Message({
            senderId: senderObjectId,
            receiverId: receiverObjectId,
            subject: subject.trim(),
            message: message.trim(),
            productId: productObjectId,
            isRead: false
        });

        const savedMessage = await newMessage.save();
        await savedMessage.populate('senderId', 'name username email role');
        await savedMessage.populate('receiverId', 'name username email role');
        if (productObjectId) {
            await savedMessage.populate('productId', 'type price weight description');
        }
        
        console.log('✅ Message créé avec succès!');
        console.log('   ID:', savedMessage._id);
        console.log('   De:', savedMessage.senderId?.name, '(' + savedMessage.senderId?.role + ')');
        console.log('   À:', savedMessage.receiverId?.name, '(' + savedMessage.receiverId?.role + ')');
        console.log('   Sujet:', savedMessage.subject);
        
        res.status(201).json(savedMessage);
        
    } catch (error) {
        console.error('❌ Erreur POST /api/messages:', error);
        console.error('   Stack:', error.stack);
        res.status(400).json({ message: error.message });
    }
});

router.put('/:id', async (req, res) => {
    try {
        const { isRead } = req.body;
        
        const message = await Message.findByIdAndUpdate(
            req.params.id,
            { isRead },
            { new: true, runValidators: true }
        )
            .populate('senderId', 'name username email')
            .populate('receiverId', 'name username email')
            .populate('productId', 'name price');

        if (!message) {
            return res.status(404).json({ message: 'Message non trouvé' });
        }
        
        res.json(message);
    } catch (error) {
        console.error('Erreur PUT /api/messages/:id:', error);
        res.status(400).json({ message: error.message });
    }
});

router.delete('/:id', async (req, res) => {
    try {
        const message = await Message.findByIdAndDelete(req.params.id);
        if (!message) {
            return res.status(404).json({ message: 'Message non trouvé' });
        }
        res.json({ message: 'Message supprimé avec succès' });
    } catch (error) {
        console.error('Erreur DELETE /api/messages/:id:', error);
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;

