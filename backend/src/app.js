require('dotenv').config();
const express = require('express');
require('./db');
const authRoutes = require('./routes/auth');

const app = express();
app.use(express.json());
app.use('/auth', authRoutes);

app.get('/', (req, res) => {
    res.json({ message: 'Serveur RunTrack opérationnel' });
});

module.exports = app;