const Sentry = require('@sentry/node');

Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV || 'development',
    tracesSampleRate: 1.0,
});

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
require('./db');
const cookieParser = require('cookie-parser');
const authRoutes = require('./routes/auth');
const utilisateursRoutes = require('./routes/utilisateurs');
const testsRoutes = require('./routes/tests');
const gestionnaireErreurs = require('./middleware/erreurs');
const plansRoutes = require('./routes/plans');
const seancesRoutes = require('./routes/seances');
const dashboardRoutes = require('./routes/dashboard');
const suiviRoutes = require('./routes/suivi');
const profilRoutes = require('./routes/profil');
const demandesRoutes = require('./routes/demandes');
const activitesRoutes = require('./routes/activites');

const app = express();

const rateLimit = require('express-rate-limit');

// Rate limiting global — toutes les routes
const limiterGlobal = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100,                  // 100 requêtes max par IP
    message: { erreur: 'Trop de requêtes, réessayez dans 15 minutes.' },
    standardHeaders: true,
    legacyHeaders: false,
});

// Rate limiting strict — routes d'authentification
const limiterAuth = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10,                   // 10 tentatives max par IP
    message: { erreur: 'Trop de tentatives de connexion, réessayez dans 15 minutes.' },
    standardHeaders: true,
    legacyHeaders: false,
});

const basicAuth = require('express-basic-auth');
const swaggerUi   = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger');

app.use(helmet());

app.use(limiterGlobal);
app.use('/auth', limiterAuth);

// CORS — autorise uniquement le frontend React
app.use(cors({
    origin:      process.env.FRONTEND_URL || 'http://localhost:5173',
    methods:     ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true, 
}));

app.use(cookieParser());
app.use(express.json());
app.use('/auth', authRoutes);
app.use('/utilisateurs', utilisateursRoutes);
app.use('/tests', testsRoutes);
app.use('/plans', plansRoutes);
app.use('/seances', seancesRoutes);
app.use('/dashboard', dashboardRoutes);
app.use('/suivi', suiviRoutes);
app.use('/profil', profilRoutes);
app.use('/demandes-plans', demandesRoutes);
app.use('/activites', activitesRoutes);

app.get('/', (req, res) => {
    res.json({ message: 'Serveur RunTrack opérationnel' });
});

app.use('/api-docs',
    basicAuth({
        users: { [process.env.SWAGGER_USER]: process.env.SWAGGER_PASSWORD },
        challenge: true,
        realm: 'RunTrack API Docs',
    }),
    swaggerUi.serve,
    swaggerUi.setup(swaggerSpec)
);

// Surveillance backend RunTrack
Sentry.setupExpressErrorHandler(app);
app.use(gestionnaireErreurs);

module.exports = app;