const express = require('express');
const { body, validationResult } = require('express-validator');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../db');

// Middleware de vérification des erreurs de validation
const valider = (req, res, next) => {
    const erreurs = validationResult(req);
    if (!erreurs.isEmpty()) {
        return res.status(400).json({
            erreur: erreurs.array()[0].msg
        });
    }
    next();
};

// POST /auth/inscription
router.post('/inscription',
    [
        body('username')
            .trim()
            .isLength({ min: 3, max: 20 })
            .withMessage("Le nom d'utilisateur doit contenir entre 3 et 20 caractères")
            .matches(/^[a-zA-Z0-9_]+$/)
            .withMessage("Le nom d'utilisateur ne peut contenir que des lettres, chiffres et underscores"),
        body('email')
            .trim()
            .isEmail()
            .withMessage('Adresse email invalide')
            .normalizeEmail(),
        body('password')
            .isLength({ min: 14 })
            .withMessage('Le mot de passe doit contenir au moins 14 caractères')
            .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z0-9])/)
            .withMessage('Le mot de passe doit contenir une majuscule, une minuscule, un chiffre et un caractère spécial'),
        body('nom')
            .trim()
            .isLength({ min: 2, max: 50 })
            .withMessage('Le nom doit contenir entre 2 et 50 caractères'),
        body('prenom')
            .trim()
            .isLength({ min: 2, max: 50 })
            .withMessage('Le prénom doit contenir entre 2 et 50 caractères'),
        body('sexe')
            .isIn(['homme', 'femme', 'autre'])
            .withMessage('Sexe invalide'),
        body('age')
            .optional()
            .isInt({ min: 1, max: 119 })
            .withMessage('Âge invalide'),
    ],
    valider,
    async (req, res, next) => {
        const { username, email, password, nom, prenom, sexe, age } = req.body;

        if (!username || !email || !password || !nom || !prenom || !sexe) {
            return res.status(400).json({
                erreur: 'Tous les champs obligatoires doivent être remplis'
            });
        }

        try {
            const emailExistant = await pool.query(
                'SELECT id FROM utilisateurs WHERE email = $1', [email]
            );
            if (emailExistant.rows.length > 0) {
                return res.status(409).json({ erreur: 'Cet email est déjà utilisé' });
            }

            const usernameExistant = await pool.query(
                'SELECT id FROM utilisateurs WHERE username = $1', [username]
            );
            if (usernameExistant.rows.length > 0) {
                return res.status(409).json({ erreur: "Ce nom d'utilisateur est déjà pris" });
            }

            // Hash du mot de passe
            const passwordHash = await bcrypt.hash(password, 10);

            const result = await pool.query(
                `INSERT INTO utilisateurs (username, email, password, nom, prenom, sexe, age)
                VALUES ($1, $2, $3, $4, $5, $6, $7)
                RETURNING id, username, email, nom, prenom, photo_url, created_at`,
                [username, email, passwordHash, nom, prenom, sexe, age || null]
            );

            const utilisateur = result.rows[0];

            const token = jwt.sign(
                { id: utilisateur.id },
                process.env.JWT_SECRET,
                { expiresIn: '7d' }
            );

            res.status(201).json({
                message: 'Inscription réussie',
                token,
                utilisateur: {
                    id:        utilisateur.id,
                    username:  utilisateur.username,
                    email:     utilisateur.email,
                    nom:       utilisateur.nom,
                    prenom:    utilisateur.prenom,
                    photo_url: utilisateur.photo_url,
                }
            });

        } catch (err) {
            next(err);
        }
    }
);

// POST /auth/connexion
router.post('/connexion',
    [
        body('email')
            .trim()
            .isEmail()
            .withMessage('Adresse email invalide')
            .normalizeEmail(),
        body('password')
            .notEmpty()
            .withMessage('Mot de passe requis'),
    ],
    valider,
    async (req, res, next) => {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ erreur: 'Email et mot de passe requis' });
        }

        try {
            const result = await pool.query(
                `SELECT id, username, email, password, photo_url, nom, prenom
                FROM utilisateurs WHERE email = $1`,
                [email]
            );

            if (result.rows.length === 0) {
                return res.status(401).json({ erreur: 'Email ou mot de passe incorrect' });
            }

            const utilisateur = result.rows[0];

            // Compare le mot de passe avec le hash
            const valide = await bcrypt.compare(password, utilisateur.password);

            if (!valide) {
                return res.status(401).json({ erreur: 'Email ou mot de passe incorrect' });
            }

            const token = jwt.sign(
                { id: utilisateur.id },
                process.env.JWT_SECRET,
                { expiresIn: '7d' }
            );

            res.status(200).json({
                message: 'Connexion réussie',
                token,
                utilisateur: {
                    id:        utilisateur.id,
                    username:  utilisateur.username,
                    email:     utilisateur.email,
                    photo_url: utilisateur.photo_url,
                    nom:       utilisateur.nom,
                    prenom:    utilisateur.prenom,
                }
            });

        } catch (err) {
            next(err);
        }
    }
);

module.exports = router;