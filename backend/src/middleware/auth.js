const jwt = require('jsonwebtoken');

const authentifier = (req, res, next) => {
    // Le token est envoyé dans le header Authorization
    const authHeader = req.headers['authorization'];

    // Format attendu : "Bearer eyJhbGci..."
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ erreur: 'Token manquant' });
    }

    const token = authHeader.split(' ')[1];

    try {
        const payload = jwt.verify(token, process.env.JWT_SECRET);
        req.utilisateur = payload; // disponible dans la route suivante
        next();
    } catch (err) {
        return res.status(401).json({ erreur: 'Token invalide ou expiré' });
    }
};

module.exports = authentifier;