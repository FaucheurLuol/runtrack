const jwt = require('jsonwebtoken');

const authentifier = (req, res, next) => {
    // Lit le token depuis le cookie httpOnly
    const token = req.cookies?.token;

    // Fallback sur le header Authorization pour Bruno/tests
    const authHeader = req.headers['authorization'];
    const tokenHeader = authHeader?.startsWith('Bearer ')
        ? authHeader.split(' ')[1]
        : null;

    const tokenFinal = token || tokenHeader;

    if (!tokenFinal) {
        return res.status(401).json({ erreur: 'Token manquant' });
    }

    try {
        const payload = jwt.verify(tokenFinal, process.env.JWT_SECRET);
        req.utilisateur = payload;
        next();
    } catch (err) {
        return res.status(401).json({ erreur: 'Token invalide ou expiré' });
    }
};

module.exports = authentifier;