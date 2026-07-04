require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool(
    process.env.DATABASE_URL
        ? {
            connectionString: process.env.DATABASE_URL,
            ssl: { rejectUnauthorized: false } // obligatoire sur Railway
          }
        : {
            host:     process.env.DB_HOST,
            port:     process.env.DB_PORT,
            database: process.env.DB_NAME,
            user:     process.env.DB_USER,
            password: process.env.DB_PASSWORD,
          }
);

pool.connect((err, client, release) => {
    if (err) {
        console.error('Erreur de connexion PostgreSQL :', err.message);
        return;
    }
    console.log('Connexion à PostgreSQL établie ✓');
    release();
});

module.exports = pool;