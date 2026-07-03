import { useState, useCallback } from 'react';
import { AuthContext } from './AuthContext';
import { recupererToken, sauvegarderToken, supprimerToken } from '../../api/token';

function initialiserUtilisateur() {
    const token = recupererToken();
    if (!token) return null;

    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        if (payload.exp * 1000 > Date.now()) {
            return { id: payload.id, token };
        }
        supprimerToken();
        return null;
    } catch {
        supprimerToken();
        return null;
    }
}

export function AuthProvider({ children }) {
    const [utilisateur, setUtilisateur] = useState(initialiserUtilisateur);
    const [deconnexionVolontaire, setDeconnexionVolontaire] = useState(false);

    const connexion = useCallback((token, donneesUtilisateur) => {
        sauvegarderToken(token);
        setDeconnexionVolontaire(false);
        setUtilisateur({ ...donneesUtilisateur, token });
    }, []);

    const deconnexion = useCallback(() => {
        supprimerToken();
        setDeconnexionVolontaire(true);
        setUtilisateur(null);
    }, []);

    return (
        <AuthContext.Provider value={{ utilisateur, connexion, deconnexion, deconnexionVolontaire }}>
            {children}
        </AuthContext.Provider>
    );
}