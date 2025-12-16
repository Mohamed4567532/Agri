const mongoose = require('mongoose');
const readline = require('readline');
const User = require('../models/User');
const connectDB = require('../config/db');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

function question(query) {
    return new Promise(resolve => rl.question(query, resolve));
}

async function addUser() {
    try {
        console.log('\n═══════════════════════════════════════════════════');
        console.log('🔧 AJOUT D\'UN UTILISATEUR');
        console.log('═══════════════════════════════════════════════════\n');
        
        // Connexion à MongoDB
        await connectDB();
        
        // Demander les informations
        const name = await question('📝 Nom complet: ');
        const username = await question('👤 Nom d\'utilisateur: ');
        const email = await question('📧 Email: ');
        const password = await question('🔒 Mot de passe: ');
        
        console.log('\n📋 Rôle:');
        console.log('   1. farmer (Fermier)');
        console.log('   2. consumer (Consommateur)');
        console.log('   3. vet (Vétérinaire)');
        console.log('   4. admin (Administrateur)');
        const roleChoice = await question('Choisissez (1-4): ');
        
        const roles = { '1': 'farmer', '2': 'consumer', '3': 'vet', '4': 'admin' };
        const role = roles[roleChoice] || 'consumer';
        
        console.log('\n📋 Status:');
        console.log('   1. pending (En attente)');
        console.log('   2. accepted (Accepté)');
        console.log('   3. rejected (Rejeté)');
        console.log('   4. suspended (Suspendu)');
        const statusChoice = await question('Choisissez (1-4): ');
        
        const statuses = { '1': 'pending', '2': 'accepted', '3': 'rejected', '4': 'suspended' };
        const status = statuses[statusChoice] || 'pending';
        
        // Créer l'utilisateur
        console.log('\n💾 Création de l\'utilisateur...');
        
        const user = new User({
            name: name.trim(),
            username: username.trim().toLowerCase(),
            email: email.trim().toLowerCase(),
            password: password,
            role: role,
            status: status
        });
        
        await user.save();
        
        console.log('\n✅ Utilisateur créé avec succès!');
        console.log('\n📄 Détails:');
        console.log('   ID........:', user._id);
        console.log('   Nom.......:', user.name);
        console.log('   Username..:', user.username);
        console.log('   Email.....:', user.email);
        console.log('   Role......:', user.role);
        console.log('   Status....:', user.status);
        console.log('\n═══════════════════════════════════════════════════\n');
        
    } catch (error) {
        console.error('\n❌ Erreur:', error.message);
        
        if (error.code === 11000) {
            const field = Object.keys(error.keyPattern)[0];
            console.error(`   Ce ${field} est déjà utilisé!`);
        } else if (error.name === 'ValidationError') {
            console.error('   Erreurs de validation:');
            Object.values(error.errors).forEach(err => {
                console.error(`   - ${err.message}`);
            });
        }
    } finally {
        rl.close();
        mongoose.connection.close();
    }
}

addUser();

