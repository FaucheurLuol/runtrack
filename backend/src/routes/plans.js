const express = require('express');
const router = express.Router();
const PDFDocument = require('pdfkit');
const pool = require('../db');
const redis = require('../config/redis');
const authentifier = require('../middleware/auth');
const { 
    genererPlan, formatAllure, PROFILS, 
    DISTANCES_OBJECTIF, PLANS_METADATA 
} = require('../services/planGenerator');

/**
 * @swagger
 * /plans/generer:
 *   post:
 *     summary: Générer un nouveau plan d'entraînement
 *     tags: [Plans]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [seances_semaine, nombre_semaines, date_debut, objectif]
 *             properties:
 *               seances_semaine: { type: integer, example: 2 }
 *               nombre_semaines: { type: integer, example: 20, description: "Durée totale du plan en semaines" }
 *               temps5km_sec: { type: integer, example: 1423, nullable: true }
 *               distance_reference_km: { type: number, example: 5, nullable: true }
 *               date_debut: { type: string, format: date }
 *               objectif: { type: string, enum: ['5km', '10km', semi, marathon] }
 *     responses:
 *       201:
 *         description: Plan généré (niveau déduit automatiquement du template disponible)
 *       400:
 *         description: Aucun plan disponible pour cette combinaison objectif/séances/semaines
 */
router.post('/generer', authentifier, async (req, res, next) => {
    const { seances_semaine, nombre_semaines, temps5km_sec, date_debut, objectif, distance_reference_km } = req.body;
    const utilisateur_id = req.utilisateur.id;

    const objectifsValides = ['5km', '10km', 'semi', 'marathon'];

    if (!seances_semaine || !nombre_semaines || !date_debut || !objectif) {
        return res.status(400).json({
            erreur: 'seances_semaine, nombre_semaines, date_debut et objectif sont obligatoires'
        });
    }

    if (![1, 2, 3, 4].includes(seances_semaine)) {
        return res.status(400).json({ erreur: 'seances_semaine doit être 1, 2, 3 ou 4' });
    }

    if (!objectifsValides.includes(objectif)) {
        return res.status(400).json({
            erreur: `Objectif invalide. Valeurs : ${objectifsValides.join(', ')}`
        });
    }

    try {
        const plan = genererPlan({
            seances_semaine,
            nombre_semaines,
            temps5km_sec,
            distance_reference_km,
            objectif
        });

        let avertissement = null;
        if (distance_reference_km && distance_reference_km > (DISTANCES_OBJECTIF[objectif] || 10)) {
            avertissement = `Ta distance de référence (${distance_reference_km}km) est supérieure à ton objectif. La prédiction peut être moins précise pour un ${objectif}.`;
        }

        const dateDebut = new Date(date_debut);
        const dateFin   = new Date(dateDebut);
        dateFin.setDate(dateFin.getDate() + plan.total_semaines * 7);

        const planResult = await pool.query(
            `INSERT INTO plans_entrainement
                (utilisateur_id, objectif, niveau, seances_semaine, date_debut, date_fin, temps_reference_initial)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING id`,
            [utilisateur_id, objectif, plan.niveau, seances_semaine, date_debut, dateFin, temps5km_sec || null]
        );

        const plan_id = planResult.rows[0].id;

        await pool.query(
            `UPDATE utilisateurs SET plan_selectionne_id = $1 WHERE id = $2`,
            [plan_id, utilisateur_id]
        );

        for (const seance of plan.seances) {
            await pool.query(
                `INSERT INTO seances
                    (plan_id, semaine, jour, phase, type, titre, description,
                    duree_min, distance_km, allure_label, allure_sec_km, jour_semaine)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
                [
                    plan_id, seance.s, seance.n, seance.phase, seance.type,
                    seance.title, seance.detail, seance.duree_min || null,
                    seance.dist || null, seance.allure_label, seance.allure_sec, seance.dayOff,
                ]
            );
        }

        await redis.del(`dashboard:${utilisateur_id}`);

        res.status(201).json({
            message: 'Plan généré et sauvegardé',
            plan_id,
            avertissement,
            niveau: plan.niveau,
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
/**
 * @swagger
 * /plans/mon-plan:
 *   get:
 *     summary: Récupère le plan actif de l'utilisateur avec ses séances
 *     tags: [Plans]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Plan et séances
 *       404:
 *         description: Aucun plan actif trouvé
 */
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

// GET /plans/mes-plans — liste tous les plans de l'utilisateur
/**
 * @swagger
 * /plans/mes-plans:
 *   get:
 *     summary: Liste tous les plans de l'utilisateur
 *     tags: [Plans]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Liste des plans
 */
router.get('/mes-plans', authentifier, async (req, res, next) => {
    const utilisateur_id = req.utilisateur.id;

    try {
        const result = await pool.query(
            `SELECT
                p.*,
                COUNT(s.id)                  AS total_seances,
                COUNT(sr.id)                 AS seances_realisees,
                u.plan_selectionne_id = p.id AS est_selectionne
             FROM plans_entrainement p
             LEFT JOIN seances s ON s.plan_id = p.id
             LEFT JOIN seances_realisees sr
                ON sr.seance_id = s.id AND sr.utilisateur_id = p.utilisateur_id
             JOIN utilisateurs u ON u.id = p.utilisateur_id
             WHERE p.utilisateur_id = $1
             GROUP BY p.id, u.plan_selectionne_id
             ORDER BY p.created_at DESC`,
            [utilisateur_id]
        );

        res.json(result.rows);

    } catch (err) {
        next(err);
    }
});

/**
 * @swagger
 * /plans/disponibles:
 *   get:
 *     summary: Liste des combinaisons de plans actuellement disponibles avec leur durée
 *     tags: [Plans]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Liste des plans disponibles (objectif, niveau, séances, semaines)
 */
router.get('/disponibles', authentifier, async (req, res, next) => {
    try {
        res.json(PLANS_METADATA);
    } catch (err) {
        next(err);
    }
});

// PUT /plans/:id/selectionner — change le plan sélectionné
/**
 * @swagger
 * /plans/{id}/selectionner:
 *   put:
 *     summary: Sélectionner ce plan comme plan principal
 *     tags: [Plans]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Plan sélectionné
 *       404:
 *         description: Plan non trouvé
 */
router.put('/:id/selectionner', authentifier, async (req, res, next) => {
    const { id }         = req.params;
    const utilisateur_id = req.utilisateur.id;

    try {
        // Vérifie que le plan appartient à l'utilisateur
        const planResult = await pool.query(
            `SELECT id, actif FROM plans_entrainement
             WHERE id = $1 AND utilisateur_id = $2`,
            [id, utilisateur_id]
        );

        if (planResult.rows.length === 0) {
            return res.status(404).json({ erreur: 'Plan non trouvé' });
        }

        if (!planResult.rows[0].actif) {
            return res.status(400).json({
                erreur: 'Impossible de sélectionner un plan archivé'
            });
        }

        await pool.query(
            `UPDATE utilisateurs
             SET plan_selectionne_id = $1
             WHERE id = $2`,
            [id, utilisateur_id]
        );

        await redis.del(`dashboard:${utilisateur_id}`);

        res.json({ message: 'Plan sélectionné', plan_id: parseInt(id) });

    } catch (err) {
        next(err);
    }
});

// PUT /plans/:id/archiver — archive un plan
/**
 * @swagger
 * /plans/{id}/archiver:
 *   put:
 *     summary: Archiver un plan (impossible si sélectionné)
 *     tags: [Plans]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Plan archivé
 *       400:
 *         description: Impossible d'archiver le plan sélectionné
 */
router.put('/:id/archiver', authentifier, async (req, res, next) => {
    const { id }         = req.params;
    const utilisateur_id = req.utilisateur.id;

    try {
        const planResult = await pool.query(
            `SELECT id FROM plans_entrainement
             WHERE id = $1 AND utilisateur_id = $2`,
            [id, utilisateur_id]
        );

        if (planResult.rows.length === 0) {
            return res.status(404).json({ erreur: 'Plan non trouvé' });
        }

        // Vérifie que ce n'est pas le plan sélectionné
        const userResult = await pool.query(
            `SELECT plan_selectionne_id FROM utilisateurs WHERE id = $1`,
            [utilisateur_id]
        );

        if (userResult.rows[0].plan_selectionne_id === parseInt(id)) {
            return res.status(400).json({
                erreur: 'Impossible d\'archiver le plan actuellement sélectionné'
            });
        }

        await pool.query(
            `UPDATE plans_entrainement
             SET actif = false
             WHERE id = $1`,
            [id]
        );

        await redis.del(`dashboard:${utilisateur_id}`);

        res.json({ message: 'Plan archivé', plan_id: parseInt(id) });

    } catch (err) {
        next(err);
    }
});

// PUT /plans/:id/reactiver — réactive un plan archivé
/**
 * @swagger
 * /plans/{id}/reactiver:
 *   put:
 *     summary: Réactiver un plan archivé
 *     tags: [Plans]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Plan réactivé
 */
router.put('/:id/reactiver', authentifier, async (req, res, next) => {
    const { id }         = req.params;
    const utilisateur_id = req.utilisateur.id;

    try {
        const planResult = await pool.query(
            `SELECT id FROM plans_entrainement
             WHERE id = $1 AND utilisateur_id = $2`,
            [id, utilisateur_id]
        );

        if (planResult.rows.length === 0) {
            return res.status(404).json({ erreur: 'Plan non trouvé' });
        }

        await pool.query(
            `UPDATE plans_entrainement
             SET actif = true
             WHERE id = $1`,
            [id]
        );

        await redis.del(`dashboard:${utilisateur_id}`);

        res.json({ message: 'Plan réactivé', plan_id: parseInt(id) });

    } catch (err) {
        next(err);
    }
});

// GET /plans/:id/detail — plan complet avec toutes les séances
/**
 * @swagger
 * /plans/{id}/detail:
 *   get:
 *     summary: Détail complet d'un plan avec toutes les séances
 *     tags: [Plans]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Détail du plan
 *       404:
 *         description: Plan non trouvé
 */
router.get('/:id/detail', authentifier, async (req, res, next) => {
    const { id }         = req.params;
    const utilisateur_id = req.utilisateur.id;

    try {
        const planResult = await pool.query(
            `SELECT p.*, u.plan_selectionne_id = p.id AS est_selectionne
             FROM plans_entrainement p
             JOIN utilisateurs u ON u.id = p.utilisateur_id
             WHERE p.id = $1 AND p.utilisateur_id = $2`,
            [id, utilisateur_id]
        );

        if (planResult.rows.length === 0) {
            return res.status(404).json({ erreur: 'Plan non trouvé' });
        }

        const seancesResult = await pool.query(
            `SELECT
                s.*,
                sr.duree_reelle,
                sr.distance_reelle,
                sr.allure_reelle_sec,
                sr.ressenti,
                sr.notes,
                sr.date_realisee,
                CASE WHEN sr.id IS NOT NULL THEN true ELSE false END AS realisee
             FROM seances s
             LEFT JOIN seances_realisees sr
                ON sr.seance_id = s.id AND sr.utilisateur_id = $2
             WHERE s.plan_id = $1
             ORDER BY s.semaine, s.jour`,
            [id, utilisateur_id]
        );

        // Groupe par semaine
        const parSemaine = seancesResult.rows.reduce((acc, seance) => {
            const sem = seance.semaine;
            if (!acc[sem]) acc[sem] = [];
            acc[sem].push(seance);
            return acc;
        }, {});

        res.json({
            plan: planResult.rows[0],
            semaines: parSemaine,
            total:    seancesResult.rows.length,
            realisees: seancesResult.rows.filter(s => s.realisee).length,
        });

    } catch (err) {
        next(err);
    }
});

/**
 * @swagger
 * /plans/{id}/export-pdf:
 *   get:
 *     summary: Exporte le plan complet en PDF
 *     tags: [Plans]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Fichier PDF
 *         content:
 *           application/pdf: {}
 *       404:
 *         description: Plan non trouvé
 */
router.get('/:id/export-pdf', authentifier, async (req, res, next) => {
    const { id } = req.params;
    const utilisateur_id = req.utilisateur.id;

    try {
        const planResult = await pool.query(
            `SELECT * FROM plans_entrainement WHERE id = $1 AND utilisateur_id = $2`,
            [id, utilisateur_id]
        );

        if (planResult.rows.length === 0) {
            return res.status(404).json({ erreur: 'Plan non trouvé' });
        }

        const plan = planResult.rows[0];

        const seancesResult = await pool.query(
            `SELECT s.*, sr.duree_reelle, sr.distance_reelle, sr.ressenti, sr.notes,
                    CASE WHEN sr.id IS NOT NULL THEN true ELSE false END AS realisee
             FROM seances s
             LEFT JOIN seances_realisees sr
                ON sr.seance_id = s.id AND sr.utilisateur_id = $2
             WHERE s.plan_id = $1
             ORDER BY s.semaine, s.jour`,
            [id, utilisateur_id]
        );

        const seances = seancesResult.rows;

        // Génère le PDF
        const doc = new PDFDocument({ margin: 50 });

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="plan-${plan.objectif}-${id}.pdf"`);

        doc.pipe(res);

        // En-tête
        doc.fontSize(20).font('Helvetica-Bold').text(`Plan d'entraînement — ${plan.objectif}`, { align: 'center' });
        doc.moveDown(0.3);
        doc.fontSize(11).font('Helvetica').fillColor('#666')
            .text(`${plan.niveau} · ${plan.seances_semaine} séance(s)/semaine`, { align: 'center' });
        doc.text(
            `Du ${new Date(plan.date_debut).toLocaleDateString('fr-FR')} au ${new Date(plan.date_fin).toLocaleDateString('fr-FR')}`,
            { align: 'center' }
        );
        doc.moveDown(1.5);
        doc.fillColor('#000');

        // Groupe par semaine
        const semaines = {};
        seances.forEach(s => {
            if (!semaines[s.semaine]) semaines[s.semaine] = [];
            semaines[s.semaine].push(s);
        });

        Object.entries(semaines).forEach(([numSemaine, seancesSemaine]) => {
            // Vérifie s'il faut une nouvelle page
            if (doc.y > 680) doc.addPage();

            doc.fontSize(14).font('Helvetica-Bold').fillColor('#e3520f')
                .text(`Semaine ${numSemaine} — ${seancesSemaine[0].phase || ''}`);
            doc.moveDown(0.3);
            doc.fillColor('#000');

            seancesSemaine.forEach(seance => {
                if (doc.y > 700) doc.addPage();

                doc.fontSize(11).font('Helvetica-Bold')
                    .text(`Séance ${seance.jour} — ${seance.titre || ''}`);

                doc.fontSize(9).font('Helvetica').fillColor('#444')
                    .text(seance.description || '', { width: 480 });

                const details = [];
                if (seance.duree_min) details.push(`Durée : ${seance.duree_min} min`);
                if (seance.distance_km) details.push(`Distance : ${parseFloat(seance.distance_km).toFixed(2)} km`);
                if (seance.allure_sec_km) {
                    const min = Math.floor(seance.allure_sec_km / 60);
                    const sec = Math.round(seance.allure_sec_km % 60);
                    details.push(`Allure : ${min}'${sec.toString().padStart(2, '0')}"/km`);
                }
                if (details.length > 0) {
                    doc.fontSize(9).fillColor('#666').text(details.join(' · '));
                }

                if (seance.realisee) {
                    doc.fontSize(9).fillColor('#8e8448').font('Helvetica-Bold')
                        .text(`✓ Réalisé — ${seance.duree_reelle ? Math.round(seance.duree_reelle / 60) + ' min' : ''} · ${seance.distance_reelle ? parseFloat(seance.distance_reelle).toFixed(2) + ' km' : ''} · Ressenti ${seance.ressenti}/5`);
                    if (seance.notes) {
                        doc.fontSize(8).fillColor('#888').font('Helvetica-Oblique').text(`💬 ${seance.notes}`);
                    }
                }

                doc.fillColor('#000').font('Helvetica');
                doc.moveDown(0.6);
            });

            doc.moveDown(0.5);
        });

        doc.end();

    } catch (err) {
        next(err);
    }
});

module.exports = router;