const mongoose = require('mongoose');
const Reclamation = require('../models/Reclamation');

const MONGODB_URI = 'mongodb://localhost:27017/Agri';

async function checkReclamations() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Connecté à MongoDB');
        
        // Vérifier l'état de la connexion
        console.log('\n📊 État de la connexion:');
        console.log('   État:', mongoose.connection.readyState === 1 ? '✅ Connecté' : '❌ Déconnecté');
        console.log('   Base:', mongoose.connection.db.databaseName);
        
        // Lister toutes les collections
        console.log('\n📋 Collections dans la base de données:');
        const collections = await mongoose.connection.db.listCollections().toArray();
        collections.forEach(col => {
            console.log(`   - ${col.name}`);
        });
        
        // Vérifier spécifiquement la collection reclamations
        const reclamationsExists = collections.some(col => col.name === 'reclamations');
        console.log('\n🔍 Collection "reclamations":', reclamationsExists ? '✅ Existe' : '❌ N\'existe pas');
        
        // Compter les réclamations
        const count = await Reclamation.countDocuments();
        console.log(`\n📊 Nombre de réclamations: ${count}`);
        
        // Afficher toutes les réclamations si elles existent
        if (count > 0) {
            console.log('\n📝 Réclamations existantes:');
            const reclamations = await Reclamation.find().populate('createdBy', 'name email').limit(10);
            reclamations.forEach((rec, index) => {
                console.log(`\n   ${index + 1}. ID: ${rec._id}`);
                console.log(`      Sujet: ${rec.sujet}`);
                console.log(`      Type: ${rec.type}`);
                console.log(`      Statut: ${rec.statut}`);
                console.log(`      Créé par: ${rec.createdBy?.name || rec.createdBy || 'N/A'}`);
                console.log(`      Date: ${rec.createdAt}`);
            });
        } else {
            console.log('\n⚠️ Aucune réclamation dans la base de données');
        }
        
        // Vérifier les index
        console.log('\n🔑 Index de la collection reclamations:');
        try {
            const indexes = await Reclamation.collection.getIndexes();
            console.log(JSON.stringify(indexes, null, 2));
        } catch (err) {
            console.log('   ❌ Erreur lors de la récupération des index:', err.message);
        }
        
    } catch (error) {
        console.error('❌ Erreur:', error);
    } finally {
        await mongoose.disconnect();
        console.log('\n🔌 Déconnecté de MongoDB');
    }
}

checkReclamations();

