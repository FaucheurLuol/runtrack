const gestionnaireErreurs = (err, req, res, next) => {
    console.error(err.stack);

    // Erreur de contrainte PostgreSQL (ex: UNIQUE violated)
    if (err.code === '23505') {
        return res.status(409).json({
            erreur: 'Cette valeur existe déjà en base de données'
        });
    }

    // Erreur de clé étrangère
    if (err.code === '23503') {
        return res.status(400).json({
            erreur: 'Référence invalide'
        });
    }

    // Erreur générique
    res.status(err.status || 500).json({
        erreur: err.message || 'Erreur serveur interne'
    });
};

module.exports = gestionnaireErreurs;