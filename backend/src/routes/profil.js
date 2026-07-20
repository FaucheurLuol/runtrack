const express    = require('express');
const router     = express.Router();
const bcrypt     = require('bcrypt');
const pool       = require('../db');
const authentifier = require('../middleware/auth');
const { upload, cloudinary } = require('../config/cloudinary');

// GET /profil — récupère le profil
/**
 * @swagger
 * /profil:
 *   get:
 *     summary: Récupérer son profil complet
 *     tags: [Profil]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Données du profil
 */
router.get('/', authentifier, async (req, res, next) => {
    const utilisateur_id = req.utilisateur.id;

    try {
        const result = await pool.query(
            `SELECT id, username, email, nom, prenom, sexe, age,
                    photo_url, raison, objectif_perso, created_at
             FROM utilisateurs
             WHERE id = $1`,
            [utilisateur_id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ erreur: 'Utilisateur non trouvé' });
        }

        res.json(result.rows[0]);
    } catch (err) {
        next(err);
    }
});

// PUT /profil — met à jour le profil
/**
 * @swagger
 * /profil:
 *   put:
 *     summary: Modifier son profil
 *     tags: [Profil]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nom: { type: string }
 *               prenom: { type: string }
 *               age: { type: integer }
 *               sexe: { type: string }
 *               raison: { type: string }
 *               objectif_perso: { type: string }
 *     responses:
 *       200:
 *         description: Profil mis à jour
 */
router.put('/', authentifier, async (req, res, next) => {
    const utilisateur_id = req.utilisateur.id;
    const { nom, prenom, age, sexe, raison, objectif_perso } = req.body;

    try {
        const result = await pool.query(
            `UPDATE utilisateurs
             SET nom           = COALESCE($1, nom),
                 prenom        = COALESCE($2, prenom),
                 age           = COALESCE($3, age),
                 sexe          = COALESCE($4, sexe),
                 raison        = COALESCE($5, raison),
                 objectif_perso = COALESCE($6, objectif_perso),
                 updated_at    = NOW()
             WHERE id = $7
             RETURNING id, username, email, nom, prenom, age, sexe,
                       raison, objectif_perso, photo_url`,
            [nom, prenom, age, sexe, raison, objectif_perso, utilisateur_id]
        );

        res.json({
            message:     'Profil mis à jour',
            utilisateur: result.rows[0]
        });
    } catch (err) {
        next(err);
    }
});

// PUT /profil/photo
/**
 * @swagger
 * /profil/photo:
 *   put:
 *     summary: Uploader une photo de profil
 *     tags: [Profil]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               photo:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Photo mise à jour
 *       400:
 *         description: Aucun fichier fourni
 */
router.put('/photo', authentifier, upload.single('photo'), async (req, res, next) => {
    const utilisateur_id = req.utilisateur.id;

    try {
        if (!req.file) {
            return res.status(400).json({ erreur: 'Aucun fichier fourni' });
        }

        // Supprime l'ancienne photo si elle existe
        const ancien = await pool.query(
            'SELECT photo_url FROM utilisateurs WHERE id = $1',
            [utilisateur_id]
        );

        if (ancien.rows[0]?.photo_url) {
            try {
                const publicId = ancien.rows[0].photo_url
                    .split('/')
                    .slice(-2)
                    .join('/')
                    .split('.')[0];
                await cloudinary.uploader.destroy(publicId);
            } catch {
                // Si la suppression échoue, on continue quand même
            }
        }

        // Upload le buffer vers Cloudinary
        const resultat = await new Promise((resolve, reject) => {
            const stream = cloudinary.uploader.upload_stream(
                {
                    folder:         'runtrack/avatars',
                    transformation: [{ width: 200, height: 200, crop: 'fill', gravity: 'face' }],
                    public_id:      `avatar_${utilisateur_id}_${Date.now()}`,
                },
                (error, result) => {
                    if (error) reject(error);
                    else resolve(result);
                }
            );
            stream.end(req.file.buffer);
        });

        const photo_url = resultat.secure_url;

        await pool.query(
            'UPDATE utilisateurs SET photo_url = $1, updated_at = NOW() WHERE id = $2',
            [photo_url, utilisateur_id]
        );

        res.json({ message: 'Photo mise à jour', photo_url });

    } catch (err) {
        next(err);
    }
});

// PUT /profil/mot-de-passe — change le mot de passe
/**
 * @swagger
 * /profil/mot-de-passe:
 *   put:
 *     summary: Changer le mot de passe
 *     tags: [Profil]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [ancien_mdp, nouveau_mdp]
 *             properties:
 *               ancien_mdp: { type: string }
 *               nouveau_mdp: { type: string, minLength: 14 }
 *     responses:
 *       200:
 *         description: Mot de passe mis à jour
 *       401:
 *         description: Ancien mot de passe incorrect
 */
router.put('/mot-de-passe', authentifier, async (req, res, next) => {
    const utilisateur_id = req.utilisateur.id;
    const { ancien_mdp, nouveau_mdp } = req.body;

    if (!ancien_mdp || !nouveau_mdp) {
        return res.status(400).json({
            erreur: 'Ancien et nouveau mot de passe requis'
        });
    }

    if (nouveau_mdp.length < 14) {
        return res.status(400).json({
            erreur: 'Le nouveau mot de passe doit contenir au moins 14 caractères'
        });
    }

    try {
        const result = await pool.query(
            'SELECT password FROM utilisateurs WHERE id = $1',
            [utilisateur_id]
        );

        const valide = await bcrypt.compare(ancien_mdp, result.rows[0].password);
        if (!valide) {
            return res.status(401).json({ erreur: 'Ancien mot de passe incorrect' });
        }

        const hash = await bcrypt.hash(nouveau_mdp, 10);
        await pool.query(
            'UPDATE utilisateurs SET password = $1, updated_at = NOW() WHERE id = $2',
            [hash, utilisateur_id]
        );

        res.json({ message: 'Mot de passe mis à jour' });
    } catch (err) {
        next(err);
    }
});

module.exports = router;