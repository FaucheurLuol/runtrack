import { API_URL, fetchAvecCookies } from './config';

export const parserActivite = async (fichier) => {
    const formData = new FormData();
    formData.append('fichier', fichier);

    const res = await fetch(`${API_URL}/activites/parse`, {
        method:      'POST',
        credentials: 'include',
        body:        formData,
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.erreur);
    return data;
};

export const importerActivite = async (donnees) => {
    const res  = await fetchAvecCookies(`${API_URL}/activites/importer`, {
        method: 'POST',
        body:   JSON.stringify(donnees),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.erreur);
    return data;
};