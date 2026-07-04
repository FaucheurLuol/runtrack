import { API_URL } from './config';

export const recupererProfil = async (token) => {
    const res  = await fetch(`${API_URL}/profil`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.erreur);
    return data;
};

export const mettreAJourProfil = async (token, donnees) => {
    const res  = await fetch(`${API_URL}/profil`, {
        method:  'PUT',
        headers: {
            'Content-Type':  'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(donnees)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.erreur);
    return data;
};

export const uploadPhoto = async (token, fichier) => {
    const formData = new FormData();
    formData.append('photo', fichier);

    const res  = await fetch(`${API_URL}/profil/photo`, {
        method:  'PUT',
        headers: { 'Authorization': `Bearer ${token}` },
        body:    formData,
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.erreur);
    return data;
};

export const changerMotDePasse = async (token, ancien_mdp, nouveau_mdp) => {
    const res  = await fetch(`${API_URL}/profil/mot-de-passe`, {
        method:  'PUT',
        headers: {
            'Content-Type':  'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ ancien_mdp, nouveau_mdp })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.erreur);
    return data;
};