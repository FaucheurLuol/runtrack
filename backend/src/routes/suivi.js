const express    = require('express');
const router     = express.Router();
const PDFDocument = require('pdfkit');
const pool       = require('../db');
const authentifier = require('../middleware/auth');
const { formatAllure } = require('../services/planGenerator');

// Facteurs d'intensité par zone
const FACTEURS_INTENSITE = {
    easy:      1,
    aerobic:   1.5,
    threshold: 2,
    race:      2.5,
    vo2:       3,
};

/**
 * @swagger
 * /suivi:
 *   get:
 *     summary: Statistiques complètes et historique des séances
 *     tags: [Suivi]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Stats globales, volume hebdomadaire, historique
 *       404:
 *         description: Aucun plan actif
 */
router.get('/', authentifier, async (req, res, next) => {
    const utilisateur_id = req.utilisateur.id;

    try {
        // Plan sélectionné
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

        // ── Séances prévues avec réalisations ─────────────────────
        const seancesResult = await pool.query(
            `SELECT
                s.id, s.semaine, s.jour, s.type, s.titre, s.phase,
                s.duree_min         AS duree_prevue,
                s.distance_km       AS distance_prevue,
                s.allure_sec_km     AS allure_prevue_sec,
                s.allure_label,
                sr.duree_reelle,
                sr.distance_reelle,
                sr.allure_reelle_sec,
                sr.ressenti,
                sr.notes,
                sr.date_realisee,
                false AS bonus,
                CASE WHEN sr.id IS NOT NULL THEN true ELSE false END AS realisee
            FROM seances s
            LEFT JOIN seances_realisees sr
                ON sr.seance_id = s.id AND sr.utilisateur_id = $2
            WHERE s.plan_id = $1
            ORDER BY s.semaine, s.jour`,
            [plan.id, utilisateur_id]
        );

        // ── Séances bonus (hors plan, importées ou saisies librement) ──
        const bonusResult = await pool.query(
            `SELECT
                NULL::integer AS id,
                NULL::integer AS semaine,
                NULL::integer AS jour,
                'bonus'       AS type,
                titre,
                'Bonus'       AS phase,
                NULL::integer AS duree_prevue,
                NULL::numeric AS distance_prevue,
                NULL::integer AS allure_prevue_sec,
                NULL::varchar AS allure_label,
                duree_reelle,
                distance_reelle,
                allure_reelle_sec,
                ressenti,
                notes,
                date_realisee,
                true          AS bonus,
                true          AS realisee
            FROM seances_realisees
            WHERE plan_id = $1 AND utilisateur_id = $2 AND seance_id IS NULL
            ORDER BY date_realisee DESC`,
            [plan.id, utilisateur_id]
        );

        const seances = [...seancesResult.rows, ...bonusResult.rows];

        // ── Stats globales ────────────────────────────────────────
        const realisees = seances.filter(s => s.realisee);
        const tests     = realisees.filter(s => s.type === 'test');

        const total_km      = realisees.reduce((acc, s) => acc + parseFloat(s.distance_reelle || 0), 0);
        const total_minutes = realisees.reduce((acc, s) => acc + parseFloat(s.duree_reelle    || 0), 0);
        const total_seances = realisees.length;
        const total_prevues = seances.length;

        // Meilleure allure 5km (test avec allure_reelle_sec la plus basse)
        const meilleur_test = tests.length > 0
            ? tests.reduce((min, t) =>
                t.allure_reelle_sec < min.allure_reelle_sec ? t : min
            )
            : null;

        // Record distance
        const record_distance = realisees.length > 0
            ? Math.max(...realisees.map(s => parseFloat(s.distance_reelle || 0)))
            : 0;

        // Ressenti moyen
        const ressentis = realisees.filter(s => s.ressenti);
        const ressenti_moyen = ressentis.length > 0
            ? (ressentis.reduce((acc, s) => acc + s.ressenti, 0) / ressentis.length).toFixed(1)
            : null;

        // Consistency score
        const consistency = total_prevues > 0
            ? Math.round((total_seances / total_prevues) * 100)
            : 0;

        // Streak — semaines consécutives avec au moins une séance réalisée
        const semainesAvecSeance = new Set(realisees.map(s => s.semaine));
        let streak = 0;
        const semMax = Math.max(...Array.from(semainesAvecSeance), 0);
        for (let s = semMax; s >= 1; s--) {
            if (semainesAvecSeance.has(s)) streak++;
            else break;
        }

        // ── Par semaine ───────────────────────────────────────────
        const semaines = {};
        for (const seance of seances) {
            const s = seance.semaine;
            if (s === null) continue;
            if (!semaines[s]) {
                semaines[s] = {
                    semaine:            s,
                    km_reels:           0,
                    minutes_reelles:    0,
                    km_prevus:          0,
                    minutes_prevues:    0,
                    seances_realisees:  0,
                    seances_prevues:    0,
                    ressentis:          [],
                    charge:             0,
                    allures_reelles:    [],
                };
            }

            const sem = semaines[s];
            sem.seances_prevues++;
            sem.km_prevus      += parseFloat(seance.distance_prevue || 0);
            sem.minutes_prevues += parseFloat(seance.duree_prevue   || 0);

            if (seance.realisee) {
                sem.seances_realisees++;
                sem.km_reels       += parseFloat(seance.distance_reelle || 0);
                sem.minutes_reelles += parseFloat(seance.duree_reelle   || 0);

                if (seance.ressenti) sem.ressentis.push(seance.ressenti);
                if (seance.allure_reelle_sec) sem.allures_reelles.push(seance.allure_reelle_sec);

                // Charge = durée × facteur intensité
                const facteur = FACTEURS_INTENSITE[seance.allure_label] || 1;
                // Charge = durée en MINUTES × facteur intensité
                sem.charge += (parseFloat(seance.duree_reelle || 0) / 60) * facteur;
            }
        }

        // Formate les données par semaine
        const par_semaine = Object.values(semaines).map(sem => ({
            semaine:             sem.semaine,
            km_reels:            Math.round(sem.km_reels * 10) / 10,
            minutes_reelles:     Math.round(sem.minutes_reelles),
            km_prevus:           Math.round(sem.km_prevus * 10) / 10,
            minutes_prevues:     Math.round(sem.minutes_prevues),
            seances_realisees:   sem.seances_realisees,
            seances_prevues:     sem.seances_prevues,
            ressenti_moyen:      sem.ressentis.length > 0
                ? Math.round((sem.ressentis.reduce((a, b) => a + b, 0) / sem.ressentis.length) * 10) / 10
                : null,
            charge_entrainement: Math.round(sem.charge),
            allure_moyenne_reelle: sem.allures_reelles.length > 0
                ? Math.round(sem.allures_reelles.reduce((a, b) => a + b, 0) / sem.allures_reelles.length)
                : null,
        }));

        // ── Progression tests ─────────────────────────────────────
        const progression_tests = tests
            .sort((a, b) => a.semaine - b.semaine)
            .map(t => ({
                semaine:          t.semaine,
                duree_sec:        t.duree_reelle, 
                allure_sec_km:    t.allure_reelle_sec,
                allure_affichage: t.allure_reelle_sec
                    ? formatAllure(t.allure_reelle_sec)
                    : null,
            }));

        // ── Historique complet ────────────────────────────────────
        const historique = realisees
            .sort((a, b) => new Date(b.date_realisee) - new Date(a.date_realisee))
            .map(s => ({
                date:             s.date_realisee,
                semaine:          s.semaine,
                titre:            s.titre,
                phase:            s.phase,
                type:             s.type,
                duree_reelle:     s.duree_reelle,
                distance_reelle:  parseFloat(s.distance_reelle).toFixed(2),
                allure_reelle:    s.allure_reelle_sec ? formatAllure(s.allure_reelle_sec) : null,
                allure_prevue:    s.allure_prevue_sec ? formatAllure(s.allure_prevue_sec) : null,
                ressenti:         s.ressenti,
                notes:            s.notes,
            }));

        // ── Réponse ───────────────────────────────────────────────
        res.json({
            plan_id: plan.id,
            stats_globales: {
                total_km:              Math.round(total_km * 10) / 10,
                total_heures:          Math.round(total_minutes / 3600 * 10) / 10,
                total_seances_realisees: total_seances,
                total_seances_prevues:   total_prevues,
                consistency_score:     consistency,
                ressenti_moyen,
                streak,
                record_distance:       Math.round(record_distance * 10) / 10,
                meilleure_allure_5km:  meilleur_test ? {
                    duree_min:    meilleur_test.duree_reelle,
                    allure:       formatAllure(meilleur_test.allure_reelle_sec),
                    semaine:      meilleur_test.semaine,
                } : null,
            },
            par_semaine,
            progression_tests,
            historique,
        });

    } catch (err) {
        next(err);
    }
});

/**
 * @swagger
 * /suivi/export-pdf:
 *   get:
 *     summary: Exporte un résumé PDF des statistiques de suivi
 *     tags: [Suivi]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Fichier PDF
 *       404:
 *         description: Aucun plan actif
 */
router.get('/export-pdf', authentifier, async (req, res, next) => {
    const utilisateur_id = req.utilisateur.id;

    try {
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

        // Réutilise la même logique de stats que la route GET /suivi
        const seancesResult = await pool.query(
            `SELECT sr.date_realisee, sr.duree_reelle, sr.distance_reelle,
                    sr.allure_reelle_sec, sr.ressenti, sr.notes,
                    s.titre, s.phase, s.type, s.semaine
             FROM seances_realisees sr
             JOIN seances s ON sr.seance_id = s.id
             WHERE sr.utilisateur_id = $1 AND s.plan_id = $2
             ORDER BY sr.date_realisee DESC`,
            [utilisateur_id, plan.id]
        );

        const realisees = seancesResult.rows;
        const total_km = realisees.reduce((acc, s) => acc + parseFloat(s.distance_reelle || 0), 0);
        const total_sec = realisees.reduce((acc, s) => acc + parseFloat(s.duree_reelle || 0), 0);

        const doc = new PDFDocument({ margin: 50 });

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="suivi-${plan.objectif}.pdf"`);
        doc.pipe(res);

        doc.fontSize(20).font('Helvetica-Bold').text(`Résumé de suivi — ${plan.objectif}`, { align: 'center' });
        doc.moveDown(0.3);
        doc.fontSize(11).font('Helvetica').fillColor('#666')
            .text(`Généré le ${new Date().toLocaleDateString('fr-FR')}`, { align: 'center' });
        doc.moveDown(1.5);
        doc.fillColor('#000');

        doc.fontSize(14).font('Helvetica-Bold').fillColor('#e3520f').text('Statistiques globales');
        doc.fillColor('#000').font('Helvetica').fontSize(11);
        doc.moveDown(0.5);
        doc.text(`Total kilomètres parcourus : ${total_km.toFixed(2)} km`);
        doc.text(`Total temps d'entraînement : ${Math.round(total_sec / 3600 * 10) / 10} h`);
        doc.text(`Nombre de séances réalisées : ${realisees.length}`);
        doc.moveDown(1.5);

        doc.fontSize(14).font('Helvetica-Bold').fillColor('#e3520f').text('Historique des séances');
        doc.fillColor('#000').moveDown(0.5);

        realisees.forEach(s => {
            if (doc.y > 700) doc.addPage();
            doc.fontSize(10).font('Helvetica-Bold')
                .text(`${new Date(s.date_realisee).toLocaleDateString('fr-FR')} — Semaine ${s.semaine} — ${s.titre}`);
            doc.fontSize(9).font('Helvetica').fillColor('#666')
                .text(`${Math.round(s.duree_reelle / 60)} min · ${parseFloat(s.distance_reelle).toFixed(2)} km · Ressenti ${s.ressenti}/5`);
            if (s.notes) {
                doc.fontSize(8).font('Helvetica-Oblique').fillColor('#888').text(`💬 ${s.notes}`);
            }
            doc.fillColor('#000').font('Helvetica');
            doc.moveDown(0.4);
        });

        doc.end();

    } catch (err) {
        next(err);
    }
});

module.exports = router;