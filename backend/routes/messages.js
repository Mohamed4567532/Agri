const express = require('express');
const router = express.Router();
const Message = require('../models/Message');

router.get('/', async (req, res) => {
    try {
        const { userId } = req.query;
        
        let query = {};
        if (userId) {
            query = {
                $or: [
                    { senderId: userId },
                    { receiverId: userId }
                ]
            };
        }
        
        const messages = await Message.find(query)
            .populate('senderId', 'name username email')
            .populate('receiverId', 'name username email')
            .populate('productId', 'name price')
            .sort({ createdAt: -1 });
            
        res.json(messages);
    } catch (error) {
        console.error('Erreur GET /api/messages:', error);
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

        const newMessage = new Message({
            senderId,
            receiverId,
            subject: subject.trim(),
            message: message.trim(),
            productId: productId || null,
            isRead: false
        });

        const savedMessage = await newMessage.save();
        await savedMessage.populate('senderId', 'name username email');
        await savedMessage.populate('receiverId', 'name username email');
        if (productId) {
            await savedMessage.populate('productId', 'name price');
        }
        
        console.log('✅ Message créé:', savedMessage._id);
        res.status(201).json(savedMessage);
        
    } catch (error) {
        console.error('❌ Erreur POST /api/messages:', error);
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

