import { NavLink, useNavigate, Link } from 'react-router-dom';
import {
    LayoutDashboard,
    PenLine,
    TrendingUp,
    ClipboardList,
    PlusCircle,
    LogOut,
    Upload
} from 'lucide-react';
import { useAuth } from '../context/useAuth';

const LIENS = [
    { to: '/dashboard',    label: 'Dashboard',        icone: LayoutDashboard },
    { to: '/saisie',       label: 'Saisie des séances', icone: PenLine        },
    { to: '/importer-activite', label: 'Importer activité', icone: Upload     },
    { to: '/suivi',        label: 'Suivi des séances',  icone: TrendingUp     },
    { to: '/mes-plans',    label: 'Mes plans',          icone: ClipboardList  },
    { to: '/nouveau-plan', label: 'Nouveau plan',       icone: PlusCircle     },
];

function Sidebar({ ouverte, fermer }) {
    const { utilisateur, deconnexion } = useAuth();
    const navigate                     = useNavigate();

    const handleDeconnexion = async () => {
        navigate('/');
        await deconnexion();
    };

    return (
        <aside className={`sidebar ${ouverte ? 'ouverte' : ''}`}>

            {/* Logo */}
            <NavLink
                to="/dashboard"
                className="sidebar-logo"
                onClick={fermer}
            >
                <img src="/img/favicon.png" alt="RunTrack" className="sidebar-favicon" />
                <span>RunTrack</span>
            </NavLink>

            {/* Navigation */}
            <nav className="sidebar-nav">
                {LIENS.map(({ to, label, icone: Icone }) => (
                    <NavLink
                        key={to}
                        to={to}
                        className={({ isActive }) =>
                            `sidebar-lien ${isActive ? 'actif' : ''}`
                        }
                        onClick={fermer}
                    >
                        <Icone size={18} strokeWidth={1.8} />
                        <span>{label}</span>
                    </NavLink>
                ))}
            </nav>

            {/* Déconnexion */}
            <div className="sidebar-footer">
                {/* Dans le sidebar-footer, remplace le bloc username */}
                <div className="sidebar-user-bloc">
                    {utilisateur?.photo_url ? (
                        <img
                            src={utilisateur.photo_url}
                            alt="Photo de profil"
                            className="sidebar-avatar"
                        />
                    ) : (
                        <div className="sidebar-avatar-initiales">
                            {utilisateur?.prenom?.[0]}{utilisateur?.nom?.[0]}
                        </div>
                    )}
                    <Link to="/profil" className="sidebar-username-link">
                        {utilisateur?.username}
                    </Link>
                </div>
                <button
                    className="sidebar-deconnexion"
                    onClick={handleDeconnexion}
                >
                    <LogOut size={18} strokeWidth={1.8} />
                    <span>Déconnexion</span>
                </button>
            </div>
        </aside>
    );
}

export default Sidebar;