const request = require('supertest');
const app     = require('../app');
const pool    = require('../db');

describe('Sécurité — isolation entre utilisateurs', () => {

    let cookieUtilisateur1;
    let idUtilisateur1;
    let idUtilisateur2;

    const user1 = {
        username: 'sec1' + Date.now().toString().slice(-8),
        email:    `securite_test1_${Date.now()}@example.com`,
        password: 'MotDePasseTest123!',
        nom: 'Test', prenom: 'Un', sexe: 'homme', age: 30,
    };

    const user2 = {
        username: 'sec2' + Date.now().toString().slice(-8),
        email:    `securite_test2_${Date.now()}@example.com`,
        password: 'MotDePasseTest123!',
        nom: 'Test', prenom: 'Deux', sexe: 'femme', age: 25,
    };

    beforeAll(async () => {
        const res1 = await request(app).post('/auth/inscription').send(user1);
        idUtilisateur1     = res1.body.utilisateur.id;
        cookieUtilisateur1 = res1.headers['set-cookie'];

        const res2 = await request(app).post('/auth/inscription').send(user2);
        idUtilisateur2 = res2.body.utilisateur.id;
    });

    afterAll(async () => {
        await pool.query('DELETE FROM utilisateurs WHERE email IN ($1, $2)', [user1.email, user2.email]);
        await pool.end();
    });

    test('GET /utilisateurs/:id — refuse l\'accès au profil d\'un autre utilisateur', async () => {
        const res = await request(app)
            .get(`/utilisateurs/${idUtilisateur2}`)
            .set('Cookie', cookieUtilisateur1);

        expect(res.statusCode).toBe(403);
    });

    test('GET /utilisateurs/:id — autorise l\'accès à son propre profil', async () => {
        const res = await request(app)
            .get(`/utilisateurs/${idUtilisateur1}`)
            .set('Cookie', cookieUtilisateur1);

        expect(res.statusCode).toBe(200);
        expect(res.body.id).toBe(idUtilisateur1);
    });

    test('GET /dashboard — refuse l\'accès sans authentification', async () => {
        const res = await request(app).get('/dashboard');
        expect(res.statusCode).toBe(401);
    });

    test('GET /tests/utilisateur/:userId — refuse l\'accès aux tests d\'un autre', async () => {
        const res = await request(app)
            .get(`/tests/utilisateur/${idUtilisateur2}`)
            .set('Cookie', cookieUtilisateur1);

        expect(res.statusCode).toBe(403);
    });

});