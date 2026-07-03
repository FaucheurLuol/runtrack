import { useAuth } from '../context/useAuth';
import { useNavigate } from 'react-router-dom';

function Dashboard() {
    const { utilisateur, deconnexion } = useAuth();
    const navigate = useNavigate();

    const handleDeconnexion = () => {
        navigate('/');        // navigue d'abord
        deconnexion();        // déconnecte ensuite
    };

    return (
        <main style={{ padding: '2rem' }}>
            <h1>Tableau de bord</h1>
            <p>Bienvenue, <strong>{utilisateur?.username}</strong> !</p>
            <button className="btn" onClick={handleDeconnexion}>
                Se déconnecter
            </button>
        </main>
    );
}

export default Dashboard;