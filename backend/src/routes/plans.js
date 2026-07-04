const express = require('express');
const router = express.Router();
const pool = require('../db');
const authentifier = require('../middleware/auth');
const { genererPlan } = require('../services/planGenerator');

// POST /plans/generer — génère et sauvegarde un plan
router.post('/generer', authentifier, async (req, res, next) => {
    const { seances_semaine, temps5km_sec, date_debut } = req.body;
    const utilisateur_id = req.utilisateur.id;

    if (!seances_semaine || !date_debut) {
        return res.status(400).json({
            erreur: 'seances_semaine et date_debut sont obligatoires'
        });
    }

    if (![1, 2].includes(seances_semaine)) {
        return res.status(400).json({
            erreur: 'seances_semaine doit être 1 ou 2'
        });
    }

    try {
        // Génère le plan
        const plan = genererPlan({ seances_semaine, temps5km_sec });

        // Calcule la date de fin (20 semaines)
        const dateDebut = new Date(date_debut);
        const dateFin = new Date(dateDebut);
        dateFin.setDate(dateFin.getDate() + 20 * 7);

        // Sauvegarde le plan en base
        const planResult = await pool.query(
            `INSERT INTO plans_entrainement
                (utilisateur_id, objectif, niveau, seances_semaine, date_debut, date_fin)
             VALUES ($1, $2, $3, $4, $5, $6)
             RETURNING id`,
            [utilisateur_id, '10km', plan.profil, seances_semaine, date_debut, dateFin]
        );

        const plan_id = planResult.rows[0].id;

        // Sauvegarde chaque séance
        for (const seance of plan.seances) {
            await pool.query(
                `INSERT INTO seances
                    (plan_id, semaine, jour, phase, type, titre, description,
                    duree_min, distance_km, allure_label, allure_sec_km, jour_semaine)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
                [
                    plan_id,
                    seance.s,
                    seance.n,
                    seance.phase,
                    seance.type,
                    seance.title,
                    seance.detail,
                    seance.duree_min || null,
                    seance.dist || null,
                    seance.allure_label,
                    seance.allure_sec,
                    seance.dayOff,
                ]
            );
        }

        res.status(201).json({
            message: 'Plan généré et sauvegardé',
            plan_id,
            profil: plan.profil,
            objectif: plan.objectif,
            allures_reference: plan.allures_reference,
            total_seances: plan.seances.length,
        });

    } catch (err) {
        next(err);
    }
});

// GET /plans/mon-plan — récupère le plan actif de l'utilisateur
router.get('/mon-plan', authentifier, async (req, res, next) => {
    const utilisateur_id = req.utilisateur.id;

    try {
        const planResult = await pool.query(
            `SELECT * FROM plans_entrainement
             WHERE utilisateur_id = $1 AND actif = true
             ORDER BY created_at DESC LIMIT 1`,
            [utilisateur_id]
        );

        if (planResult.rows.length === 0) {
            return res.status(404).json({ erreur: 'Aucun plan actif trouvé' });
        }

        const plan = planResult.rows[0];

        const seancesResult = await pool.query(
            `SELECT * FROM seances
             WHERE plan_id = $1
             ORDER BY semaine, jour`,
            [plan.id]
        );

        res.json({
            plan,
            seances: seancesResult.rows,
        });

    } catch (err) {
        next(err);
    }
});

module.exports = router;