import { API_URL, fetchAvecCookies } from './config';

export const recupererSuivi = async () => {
    const res  = await fetchAvecCookies(`${API_URL}/suivi`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.erreur);
    return data;
};