const mongoose = require('mongoose');
const Admin = require('../models/Admin');

// Configuration MongoDB
const MONGODB_URI = 'mongodb://localhost:27017/Agri';

async function createAdmin() {
    try {
        // Connexion à MongoDB
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Connecté à MongoDB');

        // Vérifier si l'admin existe déjà
        const existingAdmin = await Admin.findOne({ email: 'mohamedhamemi@gmail.com' });
        
        if (existingAdmin) {
            console.log('⚠️ L\'administrateur existe déjà dans la table administrateurs:');
            console.log(`   Prénom: ${existingAdmin.prenom}`);
            console.log(`   Nom: ${existingAdmin.nom}`);
            console.log(`   Email: ${existingAdmin.email}`);
        } else {
            // Créer l'administrateur dans la table administrateurs
            const admin = new Admin({
                prenom: 'Mohamed',
                nom: 'Hamemi',
                email: 'mohamedhamemi@gmail.com',
                motdepasse: 'admin123'
            });

            await admin.save();
            console.log('✅ Administrateur créé dans la table "administrateurs"!');
            console.log('   ══════════════════════════════════════════');
            console.log('   📧 Email: mohamedhamemi@gmail.com');
            console.log('   🔑 Mot de passe: admin123');
            console.log('   👤 Prénom: Mohamed');
            console.log('   👤 Nom: Hamemi');
            console.log('   ══════════════════════════════════════════');
        }

    } catch (error) {
        console.error('❌ Erreur:', error.message);
    } finally {
        await mongoose.disconnect();
        console.log('🔌 Déconnecté de MongoDB');
    }
}

createAdmin();
