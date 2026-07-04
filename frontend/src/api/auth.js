import { API_URL } from './config';

// Inscription
export const inscrire = async (donnees) => {
    const response = await fetch(`${API_URL}/auth/inscription`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(donnees)
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.erreur || 'Erreur lors de l\'inscription');
    }

    return data;
};

// Connexion
export const connecter = async (email, password) => {
    const response = await fetch(`${API_URL}/auth/connexion`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.erreur || 'Erreur lors de la connexion');
    }

    return data;
};