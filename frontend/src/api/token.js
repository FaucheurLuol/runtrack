const CLE = 'runtrack_token';

export const sauvegarderToken = (token) => {
    localStorage.setItem(CLE, token);
};

export const recupererToken = () => {
    return localStorage.getItem(CLE);
};

export const supprimerToken = () => {
    localStorage.removeItem(CLE);
};

export const estConnecte = () => {
    return !!localStorage.getItem(CLE);
};