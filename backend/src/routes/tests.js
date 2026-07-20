const express     = require('express');
const router      = express.Router();
const pool        = require('../db');
const authentifier = require('../middleware/auth');

/**
 * @swagger
 * /tests/utilisateur/{userId}:
 *   get:
 *     summary: Tous les tests d'un utilisateur (soi-même uniquement)
 *     tags: [Tests]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Liste des tests
 *       403:
 *         description: Accès refusé
 */
router.get('/utilisateur/:userId', authentifier, async (req, res, next) => {
    const { userId } = req.params;

    if (parseInt(userId) !== req.utilisateur.id) {
        return res.status(403).json({
            erreur: 'Accès refusé — vous ne pouvez consulter que vos propres tests'
        });
    }

    try {
        const result = await pool.query(
            `SELECT id, distance_km, temps_minutes, allure_sec_km, date_test, created_at
             FROM tests_performance
             WHERE utilisateur_id = $1
             ORDER BY date_test DESC`,
            [userId]
        );

        res.json(result.rows);

    } catch (err) {
        next(err);
    }
});

/**
 * @swagger
 * /tests:
 *   post:
 *     summary: Enregistre un nouveau test de performance
 *     tags: [Tests]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [distance_km, temps_minutes, date_test]
 *             properties:
 *               distance_km: { type: number, example: 5 }
 *               temps_minutes: { type: number, example: 23.5 }
 *               date_test: { type: string, format: date }
 *     responses:
 *       201:
 *         description: Test enregistré
 *       400:
 *         description: Champs manquants
 */
router.post('/', authentifier, async (req, res, next) => {
    const utilisateur_id = req.utilisateur.id; // ← toujours l'utilisateur connecté
    const { distance_km, temps_minutes, date_test } = req.body;

    if (!distance_km || !temps_minutes || !date_test) {
        return res.status(400).json({
            erreur: 'distance_km, temps_minutes et date_test sont obligatoires'
        });
    }

    try {
        const allure_sec_km = Math.round((temps_minutes * 60) / distance_km);

        const result = await pool.query(
            `INSERT INTO tests_performance
                (utilisateur_id, distance_km, temps_minutes, allure_sec_km, date_test)
             VALUES ($1, $2, $3, $4, $5)
             RETURNING *`,
            [utilisateur_id, distance_km, temps_minutes, allure_sec_km, date_test]
        );

        res.status(201).json({
            message: 'Test enregistré',
            test: result.rows[0]
        });

    } catch (err) {
        next(err);
    }
});

/**
 * @swagger
 * /tests/{id}:
 *   delete:
 *     summary: Supprime un test (uniquement le sien)
 *     tags: [Tests]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Test supprimé
 *       403:
 *         description: Accès refusé
 *       404:
 *         description: Test non trouvé
 */
router.delete('/:id', authentifier, async (req, res, next) => {
    const { id } = req.params;
    const utilisateur_id = req.utilisateur.id;

    try {
        // Vérifie que le test appartient bien à l'utilisateur avant suppression
        const result = await pool.query(
            'DELETE FROM tests_performance WHERE id = $1 AND utilisateur_id = $2 RETURNING id',
            [id, utilisateur_id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ erreur: 'Test non trouvé' });
        }

        res.json({ message: 'Test supprimé' });

    } catch (err) {
        next(err);
    }
});

module.exports = router;