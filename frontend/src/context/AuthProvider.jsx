import { useState, useCallback } from 'react';
import { AuthContext }           from './AuthContext';
import { deconnecter }           from '../api/auth';

export function AuthProvider({ children }) {
    const [utilisateur,          setUtilisateur]          = useState(null);
    const [deconnexionVolontaire, setDeconnexionVolontaire] = useState(false);

    const connexion = useCallback((donneesUtilisateur) => {
        // Plus de token à stocker — le cookie est géré par le navigateur
        localStorage.setItem('runtrack_user', JSON.stringify(donneesUtilisateur));
        setUtilisateur(donneesUtilisateur);
    }, []);

    const deconnexion = useCallback(async () => {
        await deconnecter(); // efface le cookie côté serveur
        localStorage.removeItem('runtrack_user');
        setDeconnexionVolontaire(true);
        setUtilisateur(null);
    }, []);

    // Restaure les données utilisateur depuis localStorage au rechargement
    useState(() => {
        const userData = localStorage.getItem('runtrack_user');
        if (userData) {
            try {
                setUtilisateur(JSON.parse(userData));
            } catch {
                localStorage.removeItem('runtrack_user');
            }
        }
    });

    return (
        <AuthContext.Provider value={{ utilisateur, connexion, deconnexion, deconnexionVolontaire }}>
            {children}
        </AuthContext.Provider>
    );
}