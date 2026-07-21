const { createClient } = require('redis');

const client = createClient({
    url: process.env.REDIS_URL || 'redis://localhost:6379',
});

client.on('error', (err) => console.error('Erreur Redis :', err.message));
client.on('connect', () => console.log('Connexion à Redis établie ✓'));

client.connect().catch(err => console.error('Impossible de se connecter à Redis :', err.message));

module.exports = client;