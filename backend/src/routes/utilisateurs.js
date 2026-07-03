const express = require('express');
const router = express.Router();
const pool = require('../db');

// GET /utilisateurs/:id — récupère un utilisateur
router.get('/:id', async (req, res, next) => {
    const { id } = req.params;

    try {
        const result = await pool.query(
            `SELECT id, username, email, nom, prenom, sexe, age, created_at
             FROM utilisateurs
             WHERE id = $1`,
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ erreur: 'Utilisateur non trouvé' });
        }

        res.json(result.rows[0]);

    } catch (err) {
        next(err); // transmet au gestionnaire centralisé
    }
});

// PUT /utilisateurs/:id — modifie un utilisateur
router.put('/:id', async (req, res, next) => {
    const { id } = req.params;
    const { nom, prenom, sexe, age } = req.body;

    try {
        const result = await pool.query(
            `UPDATE utilisateurs
             SET nom = COALESCE($1, nom),
                 prenom = COALESCE($2, prenom),
                 sexe = COALESCE($3, sexe),
                 age = COALESCE($4, age),
                 updated_at = NOW()
             WHERE id = $5
             RETURNING id, username, email, nom, prenom, sexe, age, updated_at`,
            [nom, prenom, sexe, age, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ erreur: 'Utilisateur non trouvé' });
        }

        res.json({
            message: 'Profil mis à jour',
            utilisateur: result.rows[0]
        });

    } catch (err) {
        next(err);
    }
});

// DELETE /utilisateurs/:id — supprime un utilisateur
router.delete('/:id', async (req, res, next) => {
    const { id } = req.params;

    try {
        const result = await pool.query(
            'DELETE FROM utilisateurs WHERE id = $1 RETURNING id',
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ erreur: 'Utilisateur non trouvé' });
        }

        res.json({ message: 'Utilisateur supprimé' });

    } catch (err) {
        next(err);
    }
});

module.exports = router;