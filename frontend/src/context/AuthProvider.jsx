import { useState, useCallback } from 'react';
import { AuthContext } from './AuthContext';
import { recupererToken, sauvegarderToken, supprimerToken } from '../api/token';

function initialiserUtilisateur() {
    const token = recupererToken();
    if (!token) return null;

    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        if (payload.exp * 1000 > Date.now()) {
            const userData = localStorage.getItem('runtrack_user');
            const donnees  = userData ? JSON.parse(userData) : {};
            return { ...donnees, id: payload.id, token };
        }
        supprimerToken();
        localStorage.removeItem('runtrack_user');
        return null;
    } catch {
        supprimerToken();
        localStorage.removeItem('runtrack_user');
        return null;
    }
}

export function AuthProvider({ children }) {
    const [utilisateur,          setUtilisateur]          = useState(initialiserUtilisateur);
    const [deconnexionVolontaire, setDeconnexionVolontaire] = useState(false);

    const connexion = useCallback((token, donneesUtilisateur) => {
        sauvegarderToken(token);
        localStorage.setItem('runtrack_user', JSON.stringify(donneesUtilisateur));
        setDeconnexionVolontaire(false);
        setUtilisateur({ ...donneesUtilisateur, token });
    }, []);

    const deconnexion = useCallback(() => {
        supprimerToken();
        localStorage.removeItem('runtrack_user');
        setDeconnexionVolontaire(true);
        setUtilisateur(null);
    }, []);

    return (
        <AuthContext.Provider value={{ utilisateur, connexion, deconnexion, deconnexionVolontaire }}>
            {children}
        </AuthContext.Provider>
    );
}