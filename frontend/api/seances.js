const API_URL = 'http://localhost:3000';

// Récupère une séance prévue depuis semaine + numéro
export const recupererSeance = async (token, planId, semaine, numeroSeance) => {
    const res = await fetch(
        `${API_URL}/seances/plan/${planId}/semaine/${semaine}`,
        { headers: { 'Authorization': `Bearer ${token}` } }
    );
    const data = await res.json();
    if (!res.ok) throw new Error(data.erreur);

    // Retourne uniquement la séance demandée
    return data.find(s => s.numero_seance === parseInt(numeroSeance)) || null;
};

// Enregistre une séance réalisée
export const enregistrerSeance = async (token, donnees) => {
    const res = await fetch(`${API_URL}/seances/realiser`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(donnees)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.erreur);
    return data;
};