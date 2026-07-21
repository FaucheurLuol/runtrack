const request = require('supertest');
const app     = require('../app');
const pool    = require('../db');

describe('Auth routes', () => {

    const utilisateurTest = {
        username: 'jest' + Date.now().toString().slice(-8), // ex: jest62891234 (12 caractères)
        email:    `test_jest_${Date.now()}@example.com`,
        password: 'MotDePasseTest123!',
        nom:      'Test',
        prenom:   'Jest',
        sexe:     'homme',
        age:      30,
    };

    afterAll(async () => {
        // Nettoyage — supprime l'utilisateur de test créé
        await pool.query('DELETE FROM utilisateurs WHERE email = $1', [utilisateurTest.email]);
        await pool.end();
    });

    test('POST /auth/inscription — crée un compte avec succès', async () => {
        const res = await request(app)
            .post('/auth/inscription')
            .send(utilisateurTest);

        expect(res.statusCode).toBe(201);
        expect(res.body.utilisateur.email).toBe(utilisateurTest.email);
        expect(res.headers['set-cookie']).toBeDefined();
    });

    test('POST /auth/inscription — refuse un email déjà utilisé', async () => {
        const res = await request(app)
            .post('/auth/inscription')
            .send(utilisateurTest);

        expect(res.statusCode).toBe(409);
    });

    test('POST /auth/inscription — refuse un mot de passe trop court', async () => {
        const res = await request(app)
            .post('/auth/inscription')
            .send({ ...utilisateurTest, email: 'autre@test.com', password: 'court' });

        expect(res.statusCode).toBe(400);
    });

    test('POST /auth/connexion — connecte avec les bons identifiants', async () => {
        const res = await request(app)
            .post('/auth/connexion')
            .send({
                email:    utilisateurTest.email,
                password: utilisateurTest.password,
            });

        expect(res.statusCode).toBe(200);
        expect(res.headers['set-cookie']).toBeDefined();
    });

    test('POST /auth/connexion — refuse un mauvais mot de passe', async () => {
        const res = await request(app)
            .post('/auth/connexion')
            .send({
                email:    utilisateurTest.email,
                password: 'MauvaisMotDePasse123!',
            });

        expect(res.statusCode).toBe(401);
    });

});