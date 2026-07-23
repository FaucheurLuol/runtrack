const express = require('express');
const router  = express.Router();
const pool    = require('../db');
const authentifier = require('../middleware/auth');
const { PLANS_METADATA } = require('../services/planGenerator');
const transporter = require('../config/mailer');

/**
 * @swagger
 * /demandes-plans:
 *   post:
 *     summary: Vérifie si un plan existe, sinon crée une demande (issue GitHub + email)
 *     tags: [Demandes]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [objectif, temps_objectif_sec, seances_semaine, nombre_semaines, jours_entrainement, jour_course, public_cible]
 *             properties:
 *               objectif: { type: string, enum: ['5km', '10km', semi, marathon] }
 *               temps_objectif_sec: { type: integer }
 *               seances_semaine: { type: integer }
 *               nombre_semaines: { type: integer }
 *               jours_entrainement: { type: string }
 *               jour_course: { type: string }
 *               public_cible: { type: string }
 *               particularites: { type: string, nullable: true }
 *     responses:
 *       200:
 *         description: Plan existant trouvé
 *       201:
 *         description: Demande enregistrée
 */
router.post('/', authentifier, async (req, res, next) => {
    const utilisateur_id = req.utilisateur.id;
    const {
        objectif, temps_objectif_sec, seances_semaine, nombre_semaines,
        jours_entrainement, jour_course, public_cible, particularites,
    } = req.body;

    if (!objectif || !temps_objectif_sec || !seances_semaine || !nombre_semaines || !jours_entrainement || !jour_course || !public_cible) {
        return res.status(400).json({ erreur: 'Tous les champs obligatoires doivent être remplis' });
    }

    try {
        // Vérifie si la combinaison existe déjà
        const match = PLANS_METADATA.find(p =>
            p.objectif === objectif &&
            p.seances === seances_semaine &&
            p.semaines === nombre_semaines
        );

        if (match) {
            return res.status(200).json({
                match: true,
                message: 'Ce plan existe déjà !',
                plan: match,
            });
        }

        // Enregistre la demande en base
        const result = await pool.query(
            `INSERT INTO demandes_plans
                (utilisateur_id, objectif, temps_objectif_sec, seances_semaine,
                 nombre_semaines, jours_entrainement, jour_course, public_cible, particularites)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
             RETURNING id`,
            [utilisateur_id, objectif, temps_objectif_sec, seances_semaine,
             nombre_semaines, jours_entrainement, jour_course, public_cible, particularites || null]
        );

        const demande_id = result.rows[0].id;

        const titreIssue = `Nouvelle demande de plan : ${objectif} · ${seances_semaine}séances/sem · ${nombre_semaines}sem`;
        const corpsIssue = `
**Demande #${demande_id}**

- **Objectif** : ${objectif}
- **Temps objectif** : ${Math.floor(temps_objectif_sec / 60)} min
- **Séances/semaine** : ${seances_semaine}
- **Nombre de semaines** : ${nombre_semaines}
- **Jours d'entraînement** : ${jours_entrainement}
- **Jour de course** : ${jour_course}
- **Public cible** : ${public_cible}
- **Particularités** : ${particularites || 'Aucune'}
        `.trim();

        // Crée l'issue GitHub
        let issue_url = null;
        try {
            const ghResponse = await fetch('https://api.github.com/repos/FaucheurLuol/runtrack/issues', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${process.env.GITHUB_TOKEN}`,
                    'Accept': 'application/vnd.github+json',
                },
                body: JSON.stringify({
                    title: titreIssue,
                    body: corpsIssue,
                    labels: ['nouveau-plan'],
                }),
            });
            const ghData = await ghResponse.json();
            issue_url = ghData.html_url;

            await pool.query(
                `UPDATE demandes_plans SET issue_url = $1 WHERE id = $2`,
                [issue_url, demande_id]
            );
        } catch (ghErr) {
            console.error('Erreur création issue GitHub :', ghErr.message);
        }

        // Envoie la réponse immédiatement, sans attendre l'email
        res.status(201).json({
            match: false,
            message: 'Ta demande a été envoyée ! Tu seras notifié une fois le plan créé.',
        });

        // Envoie l'email en tâche de fond (n'affecte plus le temps de réponse)
        const corpsHtml = `
            <h2>Nouvelle demande de plan</h2>
            <p><strong>Demande #${demande_id}</strong></p>
            <ul>
                <li><strong>Objectif</strong> : ${objectif}</li>
                <li><strong>Temps objectif</strong> : ${Math.floor(temps_objectif_sec / 60)} min</li>
                <li><strong>Séances/semaine</strong> : ${seances_semaine}</li>
                <li><strong>Nombre de semaines</strong> : ${nombre_semaines}</li>
                <li><strong>Jours d'entraînement</strong> : ${jours_entrainement}</li>
                <li><strong>Jour de course</strong> : ${jour_course}</li>
                <li><strong>Public cible</strong> : ${public_cible}</li>
                <li><strong>Particularités</strong> : ${particularites || 'Aucune'}</li>
            </ul>
            ${issue_url ? `<p><a href="${issue_url}">Voir l'issue GitHub</a></p>` : ''}
        `;

        transporter.sendMail({
            from:    process.env.EMAIL_USER,
            to:      process.env.EMAIL_USER,
            subject: titreIssue,
            html:    corpsHtml,
        }).catch(mailErr => {
            console.error('Erreur envoi email :', mailErr.message);
        });

    } catch (err) {
        next(err);
    }
});

module.exports = router;