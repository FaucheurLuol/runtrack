import { useState } from 'react';
import { Link } from 'react-router-dom';

function Header() {
    const [menuOuvert, setMenuOuvert] = useState(false);

    return (
        <header>
            <nav>
                <button
                    className="menu-burger"
                    aria-label="Ouvrir le menu"
                    onClick={() => setMenuOuvert(!menuOuvert)}
                >
                    ☰
                </button>
                <ul className={menuOuvert ? 'nav-liens ouvert' : 'nav-liens'}>
                    <li>
                        <Link to="/" onClick={() => setMenuOuvert(false)}>
                            Accueil
                        </Link>
                    </li>
                    <li><Link to="/inscription" onClick={() => setMenuOuvert(false)}>
                        Inscription
                    </Link></li>
                    <li><Link to="/connexion" onClick={() => setMenuOuvert(false)}>
                        Connexion
                    </Link></li>
                </ul>
            </nav>
        </header>
    );
}

export default Header;