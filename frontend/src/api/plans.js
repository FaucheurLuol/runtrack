import { API_URL, fetchAvecCookies } from './config';

export const recupererMesPlans = async () => {
    const res  = await fetchAvecCookies(`${API_URL}/plans/mes-plans`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.erreur);
    return data;
};

export const recupererPlanDetail = async (planId) => {
    const res  = await fetchAvecCookies(`${API_URL}/plans/${planId}/detail`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.erreur);
    return data;
};

export const selectionnerPlan = async (planId) => {
    const res  = await fetchAvecCookies(`${API_URL}/plans/${planId}/selectionner`, {
        method: 'PUT',
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.erreur);
    return data;
};

export const archiverPlan = async (planId) => {
    const res  = await fetchAvecCookies(`${API_URL}/plans/${planId}/archiver`, {
        method: 'PUT',
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.erreur);
    return data;
};

export const reactiverPlan = async (planId) => {
    const res  = await fetchAvecCookies(`${API_URL}/plans/${planId}/reactiver`, {
        method: 'PUT',
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.erreur);
    return data;
};

export const genererPlan = async (donnees) => {
    const res  = await fetchAvecCookies(`${API_URL}/plans/generer`, {
        method: 'POST',
        body:   JSON.stringify(donnees),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.erreur);
    return data;
};