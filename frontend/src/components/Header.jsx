import { Link } from 'react-router-dom';

function Header() {
    return (
        <header>
            <nav>
                <Link to="/" className="nav-logo">RunTrack</Link>
                <ul className="nav-liens">
                    <li><Link to="/inscription">Inscription</Link></li>
                    <li><Link to="/connexion">Connexion</Link></li>
                </ul>
            </nav>
        </header>
    );
}

export default Header;