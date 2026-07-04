const fs   = require('fs');
const path = require('path');
const pool = require('./db');

async function migrate() {
    try {
        const sql = fs.readFileSync(
            path.join(__dirname, 'migration.sql'),
            'utf8'
        );
        await pool.query(sql);
        console.log('Migration exécutée ✓');
    } catch (err) {
        console.error('Erreur de migration :', err.message);
    }
}

module.exports = migrate;