const express = require('express');
const router  = express.Router();
const pool    = require('../db');
const authentifier = require('../middleware/auth');

/**
 * @swagger
 * /rgpd/export:
 *   get:
 *     summary: Exporte toutes les données personnelles de l'utilisateur (droit d'accès RGPD)
 *     tags: [RGPD]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Export JSON complet des données personnelles
 */
router.get('/export', authentifier, async (req, res, next) => {
    const utilisateur_id = req.utilisateur.id;

    try {
        const utilisateurResult = await pool.query(
            `SELECT id, username, email, nom, prenom, sexe, age, photo_url,
                    raison, objectif_perso, fc_max_perso, created_at, updated_at
             FROM utilisateurs WHERE id = $1`,
            [utilisateur_id]
        );

        const plansResult = await pool.query(
            `SELECT * FROM plans_entrainement WHERE utilisateur_id = $1`,
            [utilisateur_id]
        );

        const seancesRealiseesResult = await pool.query(
            `SELECT * FROM seances_realisees WHERE utilisateur_id = $1`,
            [utilisateur_id]
        );

        const testsResult = await pool.query(
            `SELECT * FROM tests_performance WHERE utilisateur_id = $1`,
            [utilisateur_id]
        );

        const demandesResult = await pool.query(
            `SELECT * FROM demandes_plans WHERE utilisateur_id = $1`,
            [utilisateur_id]
        );

        const export_complet = {
            date_export: new Date().toISOString(),
            utilisateur: utilisateurResult.rows[0],
            plans_entrainement: plansResult.rows,
            seances_realisees: seancesRealiseesResult.rows,
            tests_performance: testsResult.rows,
            demandes_plans: demandesResult.rows,
        };

        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Content-Disposition', 'attachment; filename="mes-donnees-runtrack.json"');
        res.json(export_complet);

    } catch (err) {
        next(err);
    }
});

/**
 * @swagger
 * /rgpd/supprimer-compte:
 *   delete:
 *     summary: Supprime définitivement le compte et toutes les données associées (droit à l'effacement)
 *     tags: [RGPD]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [password]
 *             properties:
 *               password: { type: string, description: "Confirmation par mot de passe" }
 *     responses:
 *       200:
 *         description: Compte supprimé
 *       401:
 *         description: Mot de passe incorrect
 */
router.delete('/supprimer-compte', authentifier, async (req, res, next) => {
    const utilisateur_id = req.utilisateur.id;
    const { password } = req.body;
    const bcrypt = require('bcrypt');

    if (!password) {
        return res.status(400).json({ erreur: 'Mot de passe requis pour confirmer la suppression' });
    }

    try {
        const result = await pool.query(
            `SELECT password FROM utilisateurs WHERE id = $1`,
            [utilisateur_id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ erreur: 'Utilisateur non trouvé' });
        }

        const valide = await bcrypt.compare(password, result.rows[0].password);
        if (!valide) {
            return res.status(401).json({ erreur: 'Mot de passe incorrect' });
        }

        // Suppression en cascade (CASCADE déjà configuré sur les FK)
        await pool.query(`DELETE FROM utilisateurs WHERE id = $1`, [utilisateur_id]);

        res.clearCookie('token', {
            httpOnly: true,
            secure:   process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
        });

        res.json({ message: 'Compte supprimé définitivement' });

    } catch (err) {
        next(err);
    }
});

module.exports = router;