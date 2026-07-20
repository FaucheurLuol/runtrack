import { API_URL, fetchAvecCookies } from './config';

export const recupererProfil = async () => {
    const res  = await fetchAvecCookies(`${API_URL}/profil`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.erreur);
    return data;
};

export const mettreAJourProfil = async (donnees) => {
    const res  = await fetchAvecCookies(`${API_URL}/profil`, {
        method: 'PUT',
        body:   JSON.stringify(donnees),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.erreur);
    return data;
};

export const uploadPhoto = async (fichier) => {
    const formData = new FormData();
    formData.append('photo', fichier);

    const res  = await fetch(`${API_URL}/profil/photo`, {
        method:      'PUT',
        credentials: 'include',
        body:        formData,
        // Pas de Content-Type ici — le navigateur le définit automatiquement avec le boundary multipart
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.erreur);
    return data;
};

export const changerMotDePasse = async (ancien_mdp, nouveau_mdp) => {
    const res  = await fetchAvecCookies(`${API_URL}/profil/mot-de-passe`, {
        method: 'PUT',
        body:   JSON.stringify({ ancien_mdp, nouveau_mdp }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.erreur);
    return data;
};