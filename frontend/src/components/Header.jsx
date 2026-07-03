import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/useAuth';

function Header() {
    const [menuOuvert, setMenuOuvert] = useState(false);
    const { utilisateur, deconnexion } = useAuth();
    const navigate = useNavigate();

    const fermerMenu = () => setMenuOuvert(false);

    const handleDeconnexion = () => {
        fermerMenu();
        navigate('/');
        deconnexion();
    };

    return (
        <header>
            <nav>
                {/* Logo cliquable */}
                <Link
                    to={utilisateur ? '/dashboard' : '/'}
                    className="nav-logo"
                    onClick={fermerMenu}
                >
                    RunTrack
                </Link>

                <button
                    className="menu-burger"
                    aria-label="Ouvrir le menu"
                    onClick={() => setMenuOuvert(!menuOuvert)}
                >
                    ☰
                </button>

                <ul className={menuOuvert ? 'nav-liens ouvert' : 'nav-liens'}>
                    {utilisateur ? (
                        // Menu connecté
                        <>
                            <li><Link to="/dashboard" onClick={fermerMenu}>Dashboard</Link></li>
                            <li><Link to="/saisie" onClick={fermerMenu}>Saisie</Link></li>
                            <li><Link to="/suivi" onClick={fermerMenu}>Suivi</Link></li>
                            <li><Link to="/test" onClick={fermerMenu}>Test</Link></li>
                            <li>
                                <button className="btn-nav-logout" onClick={handleDeconnexion}>
                                    Déconnexion
                                </button>
                            </li>
                        </>
                    ) : (
                        // Menu non connecté
                        <>
                            <li><Link to="/inscription" onClick={fermerMenu}>Inscription</Link></li>
                            <li><Link to="/connexion" onClick={fermerMenu}>Connexion</Link></li>
                        </>
                    )}
                </ul>
            </nav>
        </header>
    );
}

export default Header;