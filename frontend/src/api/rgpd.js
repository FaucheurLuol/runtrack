import { API_URL, fetchAvecCookies } from './config';

export const exporterDonnees = async () => {
    const res = await fetchAvecCookies(`${API_URL}/rgpd/export`);
    if (!res.ok) {
        const data = await res.json();
        throw new Error(data.erreur);
    }
    return res.blob();
};

export const supprimerCompte = async (password) => {
    const res  = await fetchAvecCookies(`${API_URL}/rgpd/supprimer-compte`, {
        method: 'DELETE',
        body:   JSON.stringify({ password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.erreur);
    return data;
};