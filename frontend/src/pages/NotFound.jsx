import { useNavigate } from 'react-router-dom';

function NotFound() {
    const navigate = useNavigate();

    return (
        <main className="not-found">
            <h1>404</h1>
            <p>Cette page n'existe pas.</p>
            <button
                className="btn-saisie"
                onClick={() => navigate('/')}
            >
                Retour à l'accueil
            </button>
        </main>
    );
}

export default NotFound;