const mongoose = require('mongoose');
const Statistic = require('../models/Statistic');

// Configuration MongoDB
const MONGODB_URI = 'mongodb://localhost:27017/Agri';

const defaultStatistics = [
    {
        category: 'fruits',
        displayName: 'Fruits',
        icon: '🍎',
        color: '#e74c3c',
        parts: [
            { label: 'Agrumes', percentage: 30, color: '#e74c3c' },
            { label: 'Dattes', percentage: 25, color: '#3498db' },
            { label: 'Grenades', percentage: 20, color: '#2ecc71' },
            { label: 'Autres', percentage: 25, color: '#f39c12' }
        ]
    },
    {
        category: 'legumes',
        displayName: 'Légumes',
        icon: '🥬',
        color: '#27ae60',
        parts: [
            { label: 'Tomates', percentage: 35, color: '#e74c3c' },
            { label: 'Pommes de terre', percentage: 25, color: '#3498db' },
            { label: 'Oignons', percentage: 20, color: '#2ecc71' },
            { label: 'Autres', percentage: 20, color: '#f39c12' }
        ]
    },
    {
        category: 'viande',
        displayName: 'Viande',
        icon: '🥩',
        color: '#8e44ad',
        parts: [
            { label: 'Mouton', percentage: 40, color: '#e74c3c' },
            { label: 'Bœuf', percentage: 30, color: '#3498db' },
            { label: 'Volaille', percentage: 25, color: '#2ecc71' },
            { label: 'Autres', percentage: 5, color: '#f39c12' }
        ]
    },
    {
        category: 'huile',
        displayName: 'Huile d\'Olive',
        icon: '🫒',
        color: '#f39c12',
        parts: [
            { label: 'Chemlali', percentage: 35, color: '#e74c3c' },
            { label: 'Chetoui', percentage: 30, color: '#3498db' },
            { label: 'Oueslati', percentage: 20, color: '#2ecc71' },
            { label: 'Extra Vierge', percentage: 15, color: '#f39c12' }
        ]
    }
];

async function seedStatistics() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Connecté à MongoDB');

        // Supprimer les anciennes statistiques pour recréer avec le nouveau format
        await Statistic.deleteMany({});
        console.log('🗑️ Anciennes statistiques supprimées');

        for (const stat of defaultStatistics) {
            await Statistic.create(stat);
            console.log(`✅ Statistique "${stat.displayName}" créée`);
        }

        console.log('\n✅ Initialisation des statistiques terminée!');

    } catch (error) {
        console.error('❌ Erreur:', error.message);
    } finally {
        await mongoose.disconnect();
        console.log('🔌 Déconnecté de MongoDB');
    }
}

seedStatistics();
