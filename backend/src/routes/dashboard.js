const express = require('express');
const router = express.Router();
const pool = require('../db');
const redis = require('../config/redis');
const authentifier = require('../middleware/auth');
const { formatAllure, PROFILS } = require('../services/planGenerator');

/**
 * @swagger
 * /dashboard:
 *   get:
 *     summary: Récupère toutes les données du tableau de bord
 *     tags: [Dashboard]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Données complètes du dashboard
 *       401:
 *         description: Non authentifié
 *       404:
 *         description: Aucun plan actif
 */
router.get('/', authentifier, async (req, res, next) => {
    const utilisateur_id = req.utilisateur.id;
    const cleCache = `dashboard:${utilisateur_id}`;


    try {
        // Vérifie le cache d'abord
        const enCache = await redis.get(cleCache);
        if (enCache) {
            return res.json(JSON.parse(enCache));
        }

        // ── 1. Plan actif ──────────────────────────────────────────
        const planResult = await pool.query(
            `SELECT p.* FROM plans_entrainement p
            JOIN utilisateurs u ON u.plan_selectionne_id = p.id
            WHERE u.id = $1`,
            [utilisateur_id]
        );

        if (planResult.rows.length === 0) {
            return res.status(404).json({ erreur: 'Aucun plan actif' });
        }

        const plan = planResult.rows[0];

        // Semaines restantes
        const aujourd_hui    = new Date();
        const dateFin        = new Date(plan.date_fin);
        const dateDebut = new Date(plan.date_debut);
        const semaines_ecoulees = Math.max(
            0,
            Math.floor((aujourd_hui - dateDebut) / (1000 * 60 * 60 * 24 * 7))
        );
        const totalSemainesResult = await pool.query(
            `SELECT MAX(semaine) as total FROM seances WHERE plan_id = $1`,
            [plan.id]
        );
        const totalSemainesPlan = totalSemainesResult.rows[0].total || 20;
        const semaines_restantes = Math.max(0, totalSemainesPlan - semaines_ecoulees);

        // Progression globale
        const progressionResult = await pool.query(
            `SELECT
                COUNT(s.id)                           AS total_seances,
                COUNT(sr.id)                          AS seances_realisees,
                COALESCE(SUM(sr.distance_reelle), 0)  AS km_totaux,
                COALESCE(AVG(sr.ressenti), 0)         AS ressenti_moyen,
                COALESCE(SUM(sr.duree_reelle), 0)     AS total_minutes
             FROM seances s
             LEFT JOIN seances_realisees sr
                ON sr.seance_id = s.id AND sr.utilisateur_id = $2
             WHERE s.plan_id = $1`,
            [plan.id, utilisateur_id]
        );

        const prog = progressionResult.rows[0];

        // Dernier test réalisé
        const dernierTestResult = await pool.query(
            `SELECT sr.duree_reelle, sr.distance_reelle, sr.date_realisee,
                    sr.allure_reelle_sec
             FROM seances_realisees sr
             JOIN seances s ON sr.seance_id = s.id
             WHERE sr.utilisateur_id = $1
             AND s.type = 'test'
             AND s.plan_id = $2
             ORDER BY s.semaine DESC
             LIMIT 1`,
            [utilisateur_id, plan.id]
        );

        const dernierTest = dernierTestResult.rows[0] || null;

        // Allures de référence
        let allures_reference = null;
        let allure_course     = 'À définir suite au premier test';
        let dernier_5km       = null;
        let temps_cible_10km  = 'À définir suite au premier test';

        // Utilise le dernier test réalisé, sinon le temps initial du plan
        const tempsReference = dernierTest
            ? parseFloat(dernierTest.duree_reelle)
            : plan.temps5km_initial || null;

        if (tempsReference) {
            const allureRace = Math.round((tempsReference / 5) * 1.06);
            allures_reference = {
                easy:      formatAllure(Math.round(allureRace * 1.32)),
                aerobic:   formatAllure(Math.round(allureRace * 1.20)),
                threshold: formatAllure(Math.round(allureRace * 1.05)),
                race:      formatAllure(allureRace),
                vo2:       formatAllure(Math.round(allureRace * 0.94)),
            };
            allure_course = formatAllure(allureRace);

            const tempsCible_sec = allureRace * 10;
            const tempsCible_min = Math.floor(tempsCible_sec / 60);
            const tempsCible_s   = tempsCible_sec % 60;
            temps_cible_10km = `${tempsCible_min}'${tempsCible_s.toString().padStart(2, '0')}"`;

            if (dernierTest) {
                dernier_5km = {
                    duree_min: dernierTest.duree_reelle,
                    date:      dernierTest.date_realisee,
                    distance:  5, // les tests intégrés au plan sont toujours sur 5km
                };
            } else if (plan.temps5km_initial) {
                dernier_5km = {
                    duree_min: plan.temps5km_initial,
                    date:      plan.created_at,
                    distance:  plan.distance_reference_km || 5,
                };
            }
        }

        // ── 2. Prochaine séance ────────────────────────────────────
        const prochaineResult = await pool.query(
            `SELECT s.*
             FROM seances s
             LEFT JOIN seances_realisees sr
                ON sr.seance_id = s.id AND sr.utilisateur_id = $2
             WHERE s.plan_id = $1
             AND sr.id IS NULL
             AND s.type != 'race'
             ORDER BY s.semaine, s.jour
             LIMIT 1`,
            [plan.id, utilisateur_id]
        );

        const prochaine = prochaineResult.rows[0] || null;

        // ── 3. Deux semaines ───────────────────────────────────────
        let deux_semaines = { semaine_precedente: [], semaine_courante: [] };

        if (prochaine) {
            const semCourante  = prochaine.semaine;
            const semPrecedente = semCourante - 1;

            const deuxSemainesResult = await pool.query(
                `SELECT
                    s.id, s.semaine, s.jour AS numero_seance,
                    s.phase, s.type, s.titre, s.description,
                    s.duree_min       AS duree_prevue,
                    s.distance_km     AS distance_prevue,
                    s.allure_sec_km   AS allure_prevue_sec,
                    sr.duree_reelle,
                    sr.distance_reelle,
                    sr.allure_reelle_sec,
                    sr.ressenti,
                    sr.notes,
                    CASE WHEN sr.id IS NOT NULL THEN true ELSE false END AS realisee
                 FROM seances s
                 LEFT JOIN seances_realisees sr
                    ON sr.seance_id = s.id AND sr.utilisateur_id = $3
                 WHERE s.plan_id = $1
                 AND s.semaine IN ($2, $4)
                 ORDER BY s.semaine, s.jour`,
                [plan.id, semPrecedente, utilisateur_id, semCourante]
            );

            deux_semaines = {
                semaine_precedente: deuxSemainesResult.rows
                    .filter(s => s.semaine === semPrecedente)
                    .map(s => formaterSeance(s)),
                semaine_courante: deuxSemainesResult.rows
                    .filter(s => s.semaine === semCourante)
                    .map(s => formaterSeance(s)),
            };
        }

        // ── 4. Journal 4 dernières séances ────────────────────────
        const journalResult = await pool.query(
            `SELECT
                sr.date_realisee,
                sr.duree_reelle,
                sr.distance_reelle,
                sr.allure_reelle_sec,
                sr.ressenti,
                sr.notes,
                s.titre,
                s.phase,
                s.type
             FROM seances_realisees sr
             JOIN seances s ON sr.seance_id = s.id
             WHERE sr.utilisateur_id = $1
             AND s.plan_id = $2
             ORDER BY sr.date_realisee DESC
             LIMIT 4`,
            [utilisateur_id, plan.id]
        );

        const journal = journalResult.rows.map(s => ({
            date:           s.date_realisee,
            titre:          s.titre,
            phase:          s.phase,
            type:           s.type,
            duree_reelle:   s.duree_reelle,
            distance_reelle: s.distance_reelle,
            allure_reelle:  s.allure_reelle_sec
                ? formatAllure(s.allure_reelle_sec)
                : null,
            ressenti:       s.ressenti,
            notes:          s.notes,
        }));

        // ── KPI rapides ───────────────────────────────────────────────
        // Consistency score
        const consistencyResult = await pool.query(
            `SELECT
                COUNT(s.id)  AS total_prevues,
                COUNT(sr.id) AS total_realisees
            FROM seances s
            LEFT JOIN seances_realisees sr
                ON sr.seance_id = s.id AND sr.utilisateur_id = $2
            WHERE s.plan_id = $1`,
            [plan.id, utilisateur_id]
        );

        const cons = consistencyResult.rows[0];
        const consistency_score = parseInt(cons.total_prevues) > 0
            ? Math.round((parseInt(cons.total_realisees) / parseInt(cons.total_prevues)) * 100)
            : 0;

        // Streak
        const streakResult = await pool.query(
            `SELECT DISTINCT s.semaine
            FROM seances_realisees sr
            JOIN seances s ON sr.seance_id = s.id
            WHERE sr.utilisateur_id = $1 AND s.plan_id = $2
            ORDER BY s.semaine DESC`,
            [utilisateur_id, plan.id]
        );

        let streak = 0;
        const semaines = streakResult.rows.map(r => r.semaine);
        for (let i = 0; i < semaines.length; i++) {
            if (i === 0 || semaines[i - 1] - semaines[i] === 1) streak++;
            else break;
        }

        // Meilleure allure 5km
        const meilleureAllureResult = await pool.query(
            `SELECT sr.allure_reelle_sec, sr.duree_reelle, s.semaine
            FROM seances_realisees sr
            JOIN seances s ON sr.seance_id = s.id
            WHERE sr.utilisateur_id = $1
            AND s.plan_id = $2
            AND s.type = 'test'
            AND sr.allure_reelle_sec IS NOT NULL
            ORDER BY sr.allure_reelle_sec ASC
            LIMIT 1`,
            [utilisateur_id, plan.id]
        );

        const meilleure_allure_5km = meilleureAllureResult.rows.length > 0 ? {
            allure:    formatAllure(meilleureAllureResult.rows[0].allure_reelle_sec),
            duree_min: meilleureAllureResult.rows[0].duree_reelle,
            semaine:   meilleureAllureResult.rows[0].semaine,
        } : plan.temps5km_initial ? {
            // Utilise le temps initial du plan si pas encore de test réalisé
            allure:    formatAllure(Math.round((plan.temps5km_initial / 5) * 1.06)),
            duree_min: plan.temps5km_initial,
            semaine:   'initial',
        } : null;

        // ── Construction de la réponse ──────────────────────────────
        const reponse = {
            plan_actif: {
                id:                plan.id,
                objectif:          plan.objectif,
                niveau:            plan.niveau,
                niveau_label:      PROFILS[plan.niveau]?.label || null,
                seances_semaine:   plan.seances_semaine,
                date_debut:        plan.date_debut,
                date_fin:          plan.date_fin,
                semaines_restantes,
                allure_course,
                dernier_5km,
                temps_cible_10km,
                progression: {
                    realisees:  parseInt(prog.seances_realisees),
                    total:      parseInt(prog.total_seances),
                    pourcentage: Math.round(
                        (prog.seances_realisees / prog.total_seances) * 100
                    ),
                    km_totaux:      parseFloat(prog.km_totaux).toFixed(2),
                    ressenti_moyen: parseFloat(prog.ressenti_moyen).toFixed(1),
                    total_heures:   Math.round(parseFloat(prog.total_minutes) / 3600 * 10) / 10,
                },
            },
            prochaine_seance: prochaine ? {
                semaine:         prochaine.semaine,
                numero_seance:   prochaine.jour,
                phase:           prochaine.phase,
                type:            prochaine.type,
                titre:           prochaine.titre,
                description:     prochaine.description,
                duree_prevue:    prochaine.duree_min,
                distance_prevue: prochaine.distance_km,
                allure_prevue:   prochaine.allure_sec_km
                    ? formatAllure(prochaine.allure_sec_km)
                    : 'Effort maximal',
            } : null,
            deux_semaines,
            allures_reference,
            journal,
            kpi: {
                consistency_score,
                streak,
                meilleure_allure_5km,
            },
        };

        // Sauvegarde en cache pour 60 secondes
        await redis.setEx(cleCache, 60, JSON.stringify(reponse));

        res.json(reponse);

    } catch (err) {
        next(err);
    }
});

// Formate une séance pour l'affichage
function formaterSeance(s) {
    return {
        semaine:          s.semaine,
        numero_seance:    s.numero_seance,
        phase:            s.phase,
        type:             s.type,
        titre:            s.titre,
        description:      s.description,
        realisee:         s.realisee,
        prevu: {
            duree_min:    s.duree_prevue,
            distance_km:  s.distance_prevue,
            allure:       s.allure_prevue_sec
                ? formatAllure(s.allure_prevue_sec)
                : 'Effort maximal',
        },
        realise: s.realisee ? {
            duree_min:    s.duree_reelle,
            distance_km:  s.distance_reelle,
            allure:       s.allure_reelle_sec
                ? formatAllure(s.allure_reelle_sec)
                : null,
            ressenti:     s.ressenti,
            notes:        s.notes,
        } : null,
    };
}

module.exports = router;