export const API_URL = import.meta.env.VITE_API_URL;

// Toutes les requêtes incluent les cookies automatiquement
export const fetchAvecCookies = async (url, options = {}) => {
    const res = await fetch(url, {
        ...options,
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
            ...options.headers,
        },
    });

    // Token expiré → redirect automatique vers /connexion
    if (res.status === 401) {
        localStorage.removeItem('runtrack_user');
        window.location.href = '/connexion';
        return res;
    }

    return res;
};