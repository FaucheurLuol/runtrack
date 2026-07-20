import { API_URL, fetchAvecCookies } from './config';

export const inscrire = async (donnees) => {
    const res  = await fetchAvecCookies(`${API_URL}/auth/inscription`, {
        method: 'POST',
        body:   JSON.stringify(donnees),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.erreur);
    return data;
};

export const connecter = async (email, password) => {
    const res  = await fetchAvecCookies(`${API_URL}/auth/connexion`, {
        method: 'POST',
        body:   JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.erreur);
    return data;
};

export const deconnecter = async () => {
    await fetchAvecCookies(`${API_URL}/auth/deconnexion`, {
        method: 'POST',
    });
};