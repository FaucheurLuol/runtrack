import { useState, useCallback } from 'react';
import { AuthContext }   from './AuthContext';
import { deconnecter }   from '../api/auth';

function initialiserUtilisateur() {
    const userData = localStorage.getItem('runtrack_user');
    if (!userData) return null;
    try {
        return JSON.parse(userData);
    } catch {
        localStorage.removeItem('runtrack_user');
        return null;
    }
}

export function AuthProvider({ children }) {
    const [utilisateur,           setUtilisateur]           = useState(initialiserUtilisateur);
    const [deconnexionVolontaire, setDeconnexionVolontaire] = useState(false);

    const connexion = useCallback((donneesUtilisateur) => {
        localStorage.setItem('runtrack_user', JSON.stringify(donneesUtilisateur));
        setDeconnexionVolontaire(false);
        setUtilisateur(donneesUtilisateur);
    }, []);

    const mettreAJourUtilisateur = useCallback((nouvellesDonnees) => {
        setUtilisateur(prev => {
            const maj = { ...prev, ...nouvellesDonnees };
            localStorage.setItem('runtrack_user', JSON.stringify(maj));
            return maj;
        });
    }, []);

    const deconnexion = useCallback(async () => {
        await deconnecter();
        localStorage.removeItem('runtrack_user');
        setDeconnexionVolontaire(true);
        setUtilisateur(null);
    }, []);

    return (
        <AuthContext.Provider value={{ utilisateur, connexion, deconnexion, deconnexionVolontaire, mettreAJourUtilisateur }}>
            {children}
        </AuthContext.Provider>
    );
}