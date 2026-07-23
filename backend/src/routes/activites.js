const express = require('express');
const router  = express.Router();
const pool    = require('../db');
const authentifier = require('../middleware/auth');
const upload  = require('../config/uploadActivite');
const redis   = require('../config/redis');
const { parseFit, parseGpx } = require('../services/activiteParser');
const { formatAllure, calculerAllureRiegel, calculerZonesDepuisAllureRace } = require('../services/planGenerator');

/**
 * @swagger
 * /activites/parse:
 *   post:
 *     summary: Analyse un fichier .fit ou .gpx et retourne le résumé (sans l'enregistrer)
 *     tags: [Activités]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               fichier: { type: string, format: binary }
 *     responses:
 *       200:
 *         description: Résumé de l'activité extrait
 *       400:
 *         description: Fichier invalide ou non supporté
 */
router.post('/parse', authentifier, upload.single('fichier'), async (req, res, next) => {
    try {
        if (!req.file) {
            return res.status(400).json({ erreur: 'Aucun fichier fourni' });
        }

        const extension = req.file.originalname.slice(req.file.originalname.lastIndexOf('.')).toLowerCase();

        let resume;
        if (extension === '.fit') {
            resume = await parseFit(req.file.buffer);
        } else if (extension === '.gpx') {
            resume = await parseGpx(req.file.buffer);
        } else {
            return res.status(400).json({ erreur: 'Format non supporté' });
        }

        res.json({ resume, extension });

    } catch (err) {
        if (err.message.includes('session') || err.message.includes('trace') || err.message.includes('point')) {
            return res.status(400).json({ erreur: err.message });
        }
        next(err);
    }
});

/**
 * @swagger
 * /activites/importer:
 *   post:
 *     summary: Enregistre une activité importée, associée à une séance ou en bonus hors plan
 *     tags: [Activités]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [plan_id, duree_reelle, distance_reelle, ressenti, source]
 *             properties:
 *               plan_id: { type: integer }
 *               seance_id: { type: integer, nullable: true, description: "Null si séance bonus hors plan" }
 *               titre: { type: string, nullable: true, description: "Requis si seance_id est null" }
 *               duree_reelle: { type: integer, description: "En secondes" }
 *               distance_reelle: { type: number }
 *               ressenti: { type: integer, minimum: 1, maximum: 5 }
 *               notes: { type: string, nullable: true }
 *               date_realisee: { type: string, format: date }
 *               fc_moyenne: { type: integer, nullable: true }
 *               fc_max: { type: integer, nullable: true }
 *               cadence_moyenne: { type: integer, nullable: true }
 *               source: { type: string, enum: [import_fit, import_gpx] }
 *     responses:
 *       201:
 *         description: Activité enregistrée
 *       400:
 *         description: Champs manquants
 *       403:
 *         description: Accès refusé
 *       409:
 *         description: Séance déjà enregistrée
 */
router.post('/importer', authentifier, async (req, res, next) => {
    const utilisateur_id = req.utilisateur.id;
    const {
        plan_id, seance_id, titre, duree_reelle, distance_reelle,
        ressenti, notes, date_realisee, fc_moyenne, fc_max, cadence_moyenne, source,
    } = req.body;

    if (!plan_id || !duree_reelle || !distance_reelle || !ressenti || !source) {
        return res.status(400).json({
            erreur: 'plan_id, duree_reelle, distance_reelle, ressenti et source sont obligatoires'
        });
    }

    if (!seance_id && !titre) {
        return res.status(400).json({
            erreur: 'titre est obligatoire pour une séance bonus (sans seance_id)'
        });
    }

    try {
        // Vérifie que le plan appartient à l'utilisateur
        const planResult = await pool.query(
            `SELECT id, objectif FROM plans_entrainement WHERE id = $1 AND utilisateur_id = $2`,
            [plan_id, utilisateur_id]
        );

        if (planResult.rows.length === 0) {
            return res.status(403).json({ erreur: 'Accès refusé' });
        }

        // Si associé à une séance précise, vérifie qu'elle appartient au plan et n'est pas déjà réalisée
        let seance = null;
        if (seance_id) {
            const seanceResult = await pool.query(
                `SELECT * FROM seances WHERE id = $1 AND plan_id = $2`,
                [seance_id, plan_id]
            );

            if (seanceResult.rows.length === 0) {
                return res.status(404).json({ erreur: 'Séance non trouvée' });
            }
            seance = seanceResult.rows[0];

            const dejaRealisee = await pool.query(
                `SELECT id FROM seances_realisees WHERE seance_id = $1 AND utilisateur_id = $2`,
                [seance_id, utilisateur_id]
            );
            if (dejaRealisee.rows.length > 0) {
                return res.status(409).json({ erreur: 'Cette séance a déjà été enregistrée' });
            }
        }

        const allure_reelle_sec = Math.round(parseFloat(duree_reelle) / parseFloat(distance_reelle));

        const result = await pool.query(
            `INSERT INTO seances_realisees
                (seance_id, plan_id, utilisateur_id, date_realisee, titre,
                 duree_reelle, distance_reelle, ressenti, notes, allure_reelle_sec,
                 fc_moyenne, fc_max, cadence_moyenne, source)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
             RETURNING *`,
            [
                seance_id || null,
                plan_id,
                utilisateur_id,
                date_realisee || new Date(),
                seance_id ? null : titre,
                duree_reelle,
                distance_reelle,
                ressenti,
                notes || null,
                allure_reelle_sec,
                fc_moyenne || null,
                fc_max || null,
                cadence_moyenne || null,
                source,
            ]
        );

        const reponse = {
            message: 'Activité importée avec succès',
            activite: result.rows[0],
        };

        // Recalibrage si c'est un test intégré au plan
        if (seance && seance.type === 'test') {
            const allureRace = calculerAllureRiegel(
                parseFloat(duree_reelle),
                parseFloat(distance_reelle),
                planResult.rows[0].objectif
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
                 WHERE plan_id = $6 AND semaine > $7 AND type = 'normal'`,
                [
                    nouvellesAllures.easy, nouvellesAllures.aerobic, nouvellesAllures.threshold,
                    nouvellesAllures.race, nouvellesAllures.vo2, plan_id, seance.semaine,
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

module.exports = router;