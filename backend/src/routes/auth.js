const express = require('express');
const router = express.Router();
const pool = require('../db');

// POST /auth/inscription
router.post('/inscription', async (req, res) => {
    const { username, email, password, nom, prenom, sexe, age } = req.body;

    // Validation basique
    if (!username || !email || !password || !nom || !prenom || !sexe) {
        return res.status(400).json({
            erreur: 'Tous les champs obligatoires doivent être remplis'
        });
    }

    try {
        // Vérifie si l'email existe déjà
        const emailExistant = await pool.query(
            'SELECT id FROM utilisateurs WHERE email = $1',
            [email]
        );

        if (emailExistant.rows.length > 0) {
            return res.status(409).json({
                erreur: 'Cet email est déjà utilisé'
            });
        }

        // Vérifie si le username existe déjà
        const usernameExistant = await pool.query(
            'SELECT id FROM utilisateurs WHERE username = $1',
            [username]
        );

        if (usernameExistant.rows.length > 0) {
            return res.status(409).json({
                erreur: 'Ce nom d\'utilisateur est déjà pris'
            });
        }

        // Insère le nouvel utilisateur
        // ⚠️ Mot de passe stocké en clair temporairement — hashé au Module 11
        const result = await pool.query(
            `INSERT INTO utilisateurs (username, email, password, nom, prenom, sexe, age)
             VALUES ($1, $2, $3, $4, $5, $6, $7)
             RETURNING id, username, email, nom, prenom, created_at`,
            [username, email, password, nom, prenom, sexe, age || null]
        );

        res.status(201).json({
            message: 'Inscription réussie',
            utilisateur: result.rows[0]
        });

    } catch (err) {
        console.error('Erreur inscription :', err.message);
        res.status(500).json({ erreur: 'Erreur serveur' });
    }
});

// POST /auth/connexion
router.post('/connexion', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({
            erreur: 'Email et mot de passe requis'
        });
    }

    try {
        const result = await pool.query(
            'SELECT id, username, email, password FROM utilisateurs WHERE email = $1',
            [email]
        );

        if (result.rows.length === 0) {
            // Même message que mot de passe incorrect — on ne révèle pas si l'email existe
            return res.status(401).json({
                erreur: 'Email ou mot de passe incorrect'
            });
        }

        const utilisateur = result.rows[0];

        // ⚠️ Comparaison en clair temporairement — bcrypt au Module 11
        if (utilisateur.password !== password) {
            return res.status(401).json({
                erreur: 'Email ou mot de passe incorrect'
            });
        }

        res.status(200).json({
            message: 'Connexion réussie',
            utilisateur: {
                id: utilisateur.id,
                username: utilisateur.username,
                email: utilisateur.email
            }
        });

    } catch (err) {
        console.error('Erreur connexion :', err.message);
        res.status(500).json({ erreur: 'Erreur serveur' });
    }
});

module.exports = router;