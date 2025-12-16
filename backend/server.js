const express = require('express');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/db');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Log des requêtes
app.use((req, res, next) => {
    console.log(`📥 ${req.method} ${req.path}`);
    next();
});

// Routes API
app.get('/api/health', (req, res) => {
    res.json({
        status: 'OK',
        message: 'AgriSmart API fonctionnelle',
        timestamp: new Date().toISOString()
    });
});

const authRoutes = require('./routes/auth');
app.use('/api/auth', authRoutes);
console.log('   ✅ Routes /api/auth chargées');

const usersRoutes = require('./routes/users');
app.use('/api/users', usersRoutes);
console.log('   ✅ Routes /api/users chargées');

const productsRoutes = require('./routes/products');
app.use('/api/products', productsRoutes);
console.log('   ✅ Routes /api/products chargées');

const messagesRoutes = require('./routes/messages');
app.use('/api/messages', messagesRoutes);
console.log('   ✅ Routes /api/messages chargées');

const consultationsRoutes = require('./routes/consultations');
app.use('/api/consultations', consultationsRoutes);
console.log('   ✅ Routes /api/consultations chargées');

const statisticsRoutes = require('./routes/statistics');
app.use('/api/statistics', statisticsRoutes);
console.log('   ✅ Routes /api/statistics chargées');

console.log('✅ Toutes les routes API chargées');

// Servir les uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Servir le frontend depuis le dossier Front
const frontendPath = path.join(__dirname, '..', 'Front');
app.use(express.static(frontendPath));

app.get('*', (req, res) => {
    if (req.path.startsWith('/api')) {
        return res.status(404).json({ error: 'Route API non trouvée' });
    }
    res.sendFile(path.join(frontendPath, 'index.html'));
});

// Démarrer le serveur
const startServer = async () => {
    try {
        await connectDB();
        
        app.listen(PORT, () => {
            console.log('\n═══════════════════════════════════════════════════');
            console.log('✅ Serveur AgriSmart démarré!');
            console.log(`🌐 URL: http://localhost:${PORT}`);
            console.log(`📡 API: http://localhost:${PORT}/api`);
            console.log('═══════════════════════════════════════════════════\n');
        });
        
    } catch (error) {
        console.error('❌ Erreur:', error.message);
        console.error('⚠️ Le serveur démarre sans MongoDB...\n');
        
        app.listen(PORT, () => {
            console.log(`⚠️ Serveur démarré sur http://localhost:${PORT} (sans MongoDB)`);
        });
    }
};

startServer();
