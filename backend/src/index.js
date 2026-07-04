require('dotenv').config();
const app     = require('./app');
const migrate = require('./migrate');

const PORT = process.env.PORT || 3000;

async function demarrer() {
    await migrate();
    app.listen(PORT, () => {
        console.log(`Serveur démarré sur http://localhost:${PORT}`);
    });
}

demarrer();