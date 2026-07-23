import { Link } from 'react-router-dom';

function Footer() {
    return (
        <footer>
            <p>© 2026 RunTrack. Tous droits réservés.</p>
            <div style={{ display: 'flex', gap: '1.5rem', justifyContent: 'center', marginTop: '0.5rem' }}>
                <Link to="/mentions-legales" style={{ fontSize: '0.85rem' }}>Mentions légales</Link>
                <Link to="/confidentialite" style={{ fontSize: '0.85rem' }}>Confidentialité</Link>
                <Link to="/cgu" style={{ fontSize: '0.85rem' }}>CGU</Link>
            </div>
        </footer>
    );
}

export default Footer;