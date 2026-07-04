import { API_URL } from './config';

export const recupererMesPlans = async (token) => {
    const res  = await fetch(`${API_URL}/plans/mes-plans`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.erreur);
    return data;
};

export const recupererPlanDetail = async (token, planId) => {
    const res  = await fetch(`${API_URL}/plans/${planId}/detail`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.erreur);
    return data;
};

export const selectionnerPlan = async (token, planId) => {
    const res  = await fetch(`${API_URL}/plans/${planId}/selectionner`, {
        method:  'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.erreur);
    return data;
};

export const archiverPlan = async (token, planId) => {
    const res  = await fetch(`${API_URL}/plans/${planId}/archiver`, {
        method:  'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.erreur);
    return data;
};

export const reactiverPlan = async (token, planId) => {
    const res  = await fetch(`${API_URL}/plans/${planId}/reactiver`, {
        method:  'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.erreur);
    return data;
};

export const genererPlan = async (token, donnees) => {
    const res  = await fetch(`${API_URL}/plans/generer`, {
        method:  'POST',
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