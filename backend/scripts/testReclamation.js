const mongoose = require('mongoose');
const Reclamation = require('../models/Reclamation');
const User = require('../models/User');

// Configuration MongoDB
const MONGODB_URI = 'mongodb://localhost:27017/Agri';

async function testReclamation() {
    try {
        // Connexion à MongoDB
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Connecté à MongoDB');
        console.log('   Base de données:', mongoose.connection.db.databaseName);

        // Vérifier la connexion
        const state = mongoose.connection.readyState;
        console.log('   État de connexion:', state === 1 ? 'Connecté' : 'Non connecté');

        // Lister les collections
        const collections = await mongoose.connection.db.listCollections().toArray();
        console.log('\n📋 Collections existantes:');
        collections.forEach(col => {
            console.log(`   - ${col.name}`);
        });

        // Vérifier si la collection reclamations existe
        const reclamationsExists = collections.some(col => col.name === 'reclamations');
        console.log('\n🔍 Collection "reclamations" existe:', reclamationsExists);

        // Compter les réclamations existantes
        const count = await Reclamation.countDocuments();
        console.log(`\n📊 Nombre de réclamations dans la base: ${count}`);

        // Récupérer un utilisateur pour tester
        const user = await User.findOne();
        if (!user) {
            console.log('\n⚠️ Aucun utilisateur trouvé. Impossible de tester la création.');
        } else {
            console.log('\n👤 Utilisateur trouvé pour test:');
            console.log(`   ID: ${user._id}`);
            console.log(`   Email: ${user.email}`);
            console.log(`   Nom: ${user.name}`);

            // Créer une réclamation de test
            console.log('\n🧪 Création d\'une réclamation de test...');
            const testReclamation = new Reclamation({
                sujet: 'Test de réclamation',
                description: 'Ceci est une réclamation de test pour vérifier que la sauvegarde fonctionne',
                type: 'autre',
                createdBy: user._id,
                statut: 'en_attente'
            });

            // Valider
            const validationError = testReclamation.validateSync();
            if (validationError) {
                console.error('❌ Erreur de validation:', validationError);
            } else {
                console.log('✅ Validation réussie');
            }

            // Sauvegarder
            const saved = await testReclamation.save();
            console.log('✅ Réclamation sauvegardée!');
            console.log(`   ID: ${saved._id}`);
            console.log(`   Sujet: ${saved.sujet}`);

            // Vérifier qu'elle existe dans la base
            const found = await Reclamation.findById(saved._id);
            if (found) {
                console.log('✅ Réclamation trouvée dans la base de données!');
            } else {
                console.error('❌ ERREUR: Réclamation non trouvée après sauvegarde!');
            }

            // Compter à nouveau
            const newCount = await Reclamation.countDocuments();
            console.log(`\n📊 Nouveau nombre de réclamations: ${newCount}`);

            // Supprimer la réclamation de test
            await Reclamation.findByIdAndDelete(saved._id);
            console.log('🗑️ Réclamation de test supprimée');
        }

    } catch (error) {
        console.error('❌ Erreur:', error);
        console.error('   Stack:', error.stack);
    } finally {
        await mongoose.disconnect();
        console.log('\n🔌 Déconnecté de MongoDB');
    }
}

testReclamation();







