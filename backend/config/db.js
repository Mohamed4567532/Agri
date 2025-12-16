const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/Agri';

const connectDB = async () => {
    try {
        console.log('🔌 Connexion à MongoDB...');
        console.log('   URI:', MONGODB_URI);
        
        await mongoose.connect(MONGODB_URI, {
            serverSelectionTimeoutMS: 10000,
        });
        
        console.log('✅ MongoDB connecté!');
        console.log('   📁 Base:', mongoose.connection.db.databaseName);
        console.log('   🌐 Host:', mongoose.connection.host);
        console.log('   📡 Port:', mongoose.connection.port);
        
    } catch (error) {
        console.error('❌ Erreur MongoDB:', error.message);
        console.error('💡 Assurez-vous que MongoDB est démarré sur le port 27017');
        throw error;
    }
};

module.exports = connectDB;
