import { API_URL, fetchAvecCookies } from './config';

export const recupererSeance = async (planId, semaine, numeroSeance) => {
    const res  = await fetchAvecCookies(
        `${API_URL}/seances/plan/${planId}/semaine/${semaine}`
    );
    const data = await res.json();
    if (!res.ok) throw new Error(data.erreur);
    return data.find(s => s.numero_seance === parseInt(numeroSeance)) || null;
};

export const enregistrerSeance = async (donnees) => {
    const res  = await fetchAvecCookies(`${API_URL}/seances/realiser`, {
        method: 'POST',
        body:   JSON.stringify(donnees),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.erreur);
    return data;
};