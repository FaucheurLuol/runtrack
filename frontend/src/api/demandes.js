import { API_URL, fetchAvecCookies } from './config';

export const envoyerDemandePlan = async (donnees) => {
    const res  = await fetchAvecCookies(`${API_URL}/demandes-plans`, {
        method: 'POST',
        body:   JSON.stringify(donnees),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.erreur);
    return data;
};