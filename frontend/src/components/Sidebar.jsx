import { NavLink, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard,
    PenLine,
    TrendingUp,
    ClipboardList,
    PlusCircle,
    LogOut
} from 'lucide-react';
import { useAuth } from '../context/useAuth';

const LIENS = [
    { to: '/dashboard',    label: 'Dashboard',        icone: LayoutDashboard },
    { to: '/saisie',       label: 'Saisie des séances', icone: PenLine        },
    { to: '/suivi',        label: 'Suivi des séances',  icone: TrendingUp     },
    { to: '/mes-plans',    label: 'Mes plans',          icone: ClipboardList  },
    { to: '/nouveau-plan', label: 'Nouveau plan',       icone: PlusCircle     },
];

function Sidebar({ ouverte, fermer }) {
    const { utilisateur, deconnexion } = useAuth();
    const navigate                     = useNavigate();

    const handleDeconnexion = () => {
        fermer();
        navigate('/');
        deconnexion();
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
                <span className="sidebar-username">{utilisateur?.username}</span>
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