const express = require('express');
const router = express.Router();
const pool = require('../db');

// GET /tests/utilisateur/:userId — tous les tests d'un utilisateur
router.get('/utilisateur/:userId', async (req, res, next) => {
    const { userId } = req.params;

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

// POST /tests — enregistre un nouveau test
router.post('/', async (req, res, next) => {
    const { utilisateur_id, distance_km, temps_minutes, date_test } = req.body;

    if (!utilisateur_id || !distance_km || !temps_minutes || !date_test) {
        return res.status(400).json({
            erreur: 'utilisateur_id, distance_km, temps_minutes et date_test sont obligatoires'
        });
    }

    try {
        // Calcule l'allure en secondes par km automatiquement
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

// DELETE /tests/:id — supprime un test
router.delete('/:id', async (req, res, next) => {
    const { id } = req.params;

    try {
        const result = await pool.query(
            'DELETE FROM tests_performance WHERE id = $1 RETURNING id',
            [id]
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