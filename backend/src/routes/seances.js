const express = require('express');
const router = express.Router();
const pool = require('../db');
const redis = require('../config/redis');
const authentifier = require('../middleware/auth');
const { formatAllure, calculerAllureRiegel, calculerZonesDepuisAllureRace } = require('../services/planGenerator');

/**
 * @swagger
 * /seances/realiser:
 *   post:
 *     summary: Enregistrer une séance réalisée (déclenche recalibrage si test)
 *     tags: [Séances]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [plan_id, semaine, numero_seance, duree_reelle, distance_reelle, ressenti]
 *             properties:
 *               plan_id: { type: integer }
 *               semaine: { type: integer }
 *               numero_seance: { type: integer }
 *               duree_reelle: { type: integer, description: "En secondes" }
 *               distance_reelle: { type: number }
 *               ressenti: { type: integer, minimum: 1, maximum: 5 }
 *               notes: { type: string, nullable: true }
 *               date_realisee: { type: string, format: date }
 *     responses:
 *       201:
 *         description: Séance enregistrée
 *       404:
 *         description: Séance introuvable
 *       409:
 *         description: Séance déjà enregistrée
 */
router.post('/realiser', authentifier, async (req, res, next) => {
    const { plan_id, semaine, numero_seance, duree_reelle, distance_reelle, ressenti, notes, date_realisee } = req.body;

    const utilisateur_id = req.utilisateur.id;

    // Validation
    if (!plan_id || !semaine || !numero_seance || !duree_reelle || !distance_reelle || !ressenti) {
        return res.status(400).json({
            erreur: 'plan_id, semaine, numero_seance, duree_reelle, distance_reelle et ressenti sont obligatoires'
        });
    }

    if (ressenti < 1 || ressenti > 5) {
        return res.status(400).json({
            erreur: 'Le ressenti doit être entre 1 et 5'
        });
    }

    try {
        // Retrouve la séance depuis plan_id + semaine + numero_seance
        const seanceResult = await pool.query(
            `SELECT s.*, p.utilisateur_id, p.id AS plan_id
             FROM seances s
             JOIN plans_entrainement p ON s.plan_id = p.id
             WHERE s.plan_id = $1
             AND s.semaine   = $2
             AND s.jour      = $3`,
            [plan_id, semaine, numero_seance]
        );

        if (seanceResult.rows.length === 0) {
            return res.status(404).json({ erreur: 'Séance non trouvée' });
        }

        const seance = seanceResult.rows[0];

        // Vérifie que le plan appartient à l'utilisateur
        if (seance.utilisateur_id !== utilisateur_id) {
            return res.status(403).json({ erreur: 'Accès refusé' });
        }

        // Vérifie que la séance n'a pas déjà été enregistrée
        const dejaRealisee = await pool.query(
            `SELECT id FROM seances_realisees
             WHERE seance_id = $1 AND utilisateur_id = $2`,
            [seance.id, utilisateur_id]
        );

        if (dejaRealisee.rows.length > 0) {
            return res.status(409).json({
                erreur: 'Cette séance a déjà été enregistrée'
            });
        }

        // Calcule l'allure réelle en sec/km
        const allure_reelle_sec = Math.round(parseFloat(duree_reelle) / parseFloat(distance_reelle));

        // Enregistre la séance réalisée
        const result = await pool.query(
            `INSERT INTO seances_realisees
                (seance_id, utilisateur_id, date_realisee,
                duree_reelle, distance_reelle, ressenti, notes, allure_reelle_sec)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            RETURNING *`,
            [
                seance.id,
                utilisateur_id,
                date_realisee || new Date(),  
                duree_reelle,
                distance_reelle,
                ressenti,
                notes || null,
                allure_reelle_sec,
            ]
        );

        const reponse = {
            message:          'Séance enregistrée',
            semaine,
            numero_seance,
            seance_prevue: {
                titre:             seance.titre,
                phase:             seance.phase,
                type:              seance.type,
                duree_prevue:      seance.duree_min,
                distance_prevue:   seance.distance_km,
                allure_prevue:     seance.allure_sec_km
                    ? formatAllure(seance.allure_sec_km)
                    : 'Effort maximal',
            },
            seance_realisee: {
                duree_reelle,
                distance_reelle,
                allure_reelle:    formatAllure(allure_reelle_sec),
                ressenti,
                notes:            notes || null,
            },
        };

        // Si c'est un test → recalibrer les allures des séances futures
        if (seance.type === 'test') {
            // Récupère l'objectif du plan pour calculer l'allure cible via Riegel
            const planInfoResult = await pool.query(
                `SELECT objectif FROM plans_entrainement WHERE id = $1`,
                [seance.plan_id]
            );
            const objectifPlan = planInfoResult.rows[0].objectif;

            // Riegel : temps réel sur distance_reelle → allure cible sur l'objectif du plan
            const allureRace = calculerAllureRiegel(
                parseFloat(duree_reelle),
                parseFloat(distance_reelle),
                objectifPlan
            );
            const nouvellesAllures = calculerZonesDepuisAllureRace(allureRace);

            await pool.query(
                `UPDATE seances
                SET allure_sec_km = CASE allure_label
                    WHEN 'easy'      THEN $1
                    WHEN 'aerobic'   THEN $2
                    WHEN 'threshold' THEN $3
                    WHEN 'race'      THEN $4
                    WHEN 'vo2'       THEN $5
                    ELSE allure_sec_km
                END
                WHERE plan_id = $6
                AND semaine   > $7
                AND type      = 'normal'`,
                [
                    nouvellesAllures.easy,
                    nouvellesAllures.aerobic,
                    nouvellesAllures.threshold,
                    nouvellesAllures.race,
                    nouvellesAllures.vo2,
                    seance.plan_id,
                    seance.semaine,
                ]
            );

            reponse.recalibrage = {
                message: 'Allures recalibrées pour les séances suivantes',
                nouvelles_allures: {
                    easy:      formatAllure(nouvellesAllures.easy),
                    aerobic:   formatAllure(nouvellesAllures.aerobic),
                    threshold: formatAllure(nouvellesAllures.threshold),
                    race:      formatAllure(nouvellesAllures.race),
                    vo2:       formatAllure(nouvellesAllures.vo2),
                }
            };
        }

        await redis.del(`dashboard:${utilisateur_id}`);

        res.status(201).json(reponse);

    } catch (err) {
        next(err);
    }
});

// GET /seances/plan/:planId — toutes les séances avec statut réalisé
/**
 * @swagger
 * /seances/plan/{planId}:
 *   get:
 *     summary: Toutes les séances d'un plan
 *     tags: [Séances]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: planId
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Séances groupées par semaine
 */
router.get('/plan/:planId', authentifier, async (req, res, next) => {
    const { planId }       = req.params;
    const utilisateur_id   = req.utilisateur.id;

    try {
        // Vérifie que le plan appartient à l'utilisateur
        const planResult = await pool.query(
            `SELECT id FROM plans_entrainement
             WHERE id = $1 AND utilisateur_id = $2`,
            [planId, utilisateur_id]
        );

        if (planResult.rows.length === 0) {
            return res.status(404).json({ erreur: 'Plan non trouvé' });
        }

        const result = await pool.query(
            `SELECT
                s.id,
                s.semaine,
                s.jour              AS numero_seance,
                s.phase,
                s.type,
                s.titre,
                s.description,
                s.duree_min         AS duree_prevue,
                s.distance_km       AS distance_prevue,
                s.allure_sec_km     AS allure_prevue_sec,
                s.allure_label,
                s.jour_semaine,
                sr.id               AS realisation_id,
                sr.date_realisee,
                sr.duree_reelle,
                sr.distance_reelle,
                sr.allure_reelle_sec,
                sr.ressenti,
                sr.notes,
                CASE WHEN sr.id IS NOT NULL
                    THEN true
                    ELSE false
                END                 AS realisee
             FROM seances s
             LEFT JOIN seances_realisees sr
                ON sr.seance_id = s.id
                AND sr.utilisateur_id = $2
             WHERE s.plan_id = $1
             ORDER BY s.semaine, s.jour`,
            [planId, utilisateur_id]
        );

        // Groupe par semaine pour faciliter l'affichage frontend
        const parSemaine = result.rows.reduce((acc, seance) => {
            const sem = seance.semaine;
            if (!acc[sem]) acc[sem] = [];
            acc[sem].push(seance);
            return acc;
        }, {});

        res.json({
            plan_id:    parseInt(planId),
            semaines:   parSemaine,
            total:      result.rows.length,
            realisees:  result.rows.filter(s => s.realisee).length,
        });

    } catch (err) {
        next(err);
    }
});

// GET /seances/plan/:planId/semaine/:semaine — séances d'une semaine précise
/**
 * @swagger
 * /seances/plan/{planId}/semaine/{semaine}:
 *   get:
 *     summary: Séances d'une semaine précise
 *     tags: [Séances]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: planId
 *         required: true
 *         schema: { type: integer }
 *       - in: path
 *         name: semaine
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Séances de la semaine
 */
router.get('/plan/:planId/semaine/:semaine', authentifier, async (req, res, next) => {
    const { planId, semaine } = req.params;
    const utilisateur_id      = req.utilisateur.id;

    try {
        const planResult = await pool.query(
            `SELECT id FROM plans_entrainement
             WHERE id = $1 AND utilisateur_id = $2`,
            [planId, utilisateur_id]
        );

        if (planResult.rows.length === 0) {
            return res.status(404).json({ erreur: 'Plan non trouvé' });
        }

        const result = await pool.query(
            `SELECT
                s.id,
                s.semaine,
                s.jour              AS numero_seance,
                s.phase,
                s.type,
                s.titre,
                s.description,
                s.duree_min         AS duree_prevue,
                s.distance_km       AS distance_prevue,
                s.allure_sec_km     AS allure_prevue_sec,
                s.allure_label,
                s.jour_semaine,
                sr.date_realisee,
                sr.duree_reelle,
                sr.distance_reelle,
                sr.allure_reelle_sec,
                sr.ressenti,
                sr.notes,
                CASE WHEN sr.id IS NOT NULL
                    THEN true
                    ELSE false
                END                 AS realisee
             FROM seances s
             LEFT JOIN seances_realisees sr
                ON sr.seance_id = s.id
                AND sr.utilisateur_id = $3
             WHERE s.plan_id = $1
             AND   s.semaine = $2
             ORDER BY s.jour`,
            [planId, semaine, utilisateur_id]
        );

        res.json(result.rows);

    } catch (err) {
        next(err);
    }
});

module.exports = router;