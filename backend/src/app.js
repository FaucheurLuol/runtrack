require('dotenv').config();
const express = require('express');
require('./db');
const authRoutes = require('./routes/auth');
const utilisateursRoutes = require('./routes/utilisateurs');
const testsRoutes = require('./routes/tests');
const gestionnaireErreurs = require('./middleware/erreurs');

const app = express();
app.use(express.json());

app.use('/auth', authRoutes);
app.use('/utilisateurs', utilisateursRoutes);
app.use('/tests', testsRoutes);

app.get('/', (req, res) => {
    res.json({ message: 'Serveur RunTrack opérationnel' });
});

// Toujours en dernier
app.use(gestionnaireErreurs);

module.exports = app;