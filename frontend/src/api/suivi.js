const API_URL = 'http://localhost:3000';

export const recupererSuivi = async (token) => {
    const res  = await fetch(`${API_URL}/suivi`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.erreur);
    return data;
};