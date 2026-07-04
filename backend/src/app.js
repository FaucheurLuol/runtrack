require('dotenv').config();
const express = require('express');
const cors = require('cors');
require('./db');
const authRoutes = require('./routes/auth');
const utilisateursRoutes = require('./routes/utilisateurs');
const testsRoutes = require('./routes/tests');
const gestionnaireErreurs = require('./middleware/erreurs');
const plansRoutes = require('./routes/plans');
const seancesRoutes = require('./routes/seances');
const dashboardRoutes = require('./routes/dashboard');
const suiviRoutes = require('./routes/suivi');

const app = express();

// CORS — autorise uniquement le frontend React
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use('/auth', authRoutes);
app.use('/utilisateurs', utilisateursRoutes);
app.use('/tests', testsRoutes);
app.use('/plans', plansRoutes);
app.use('/seances', seancesRoutes);
app.use('/dashboard', dashboardRoutes);
app.use('/suivi', suiviRoutes);

app.get('/', (req, res) => {
    res.json({ message: 'Serveur RunTrack opérationnel' });
});

app.use(gestionnaireErreurs);

module.exports = app;