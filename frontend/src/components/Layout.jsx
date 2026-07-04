import { Outlet } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../context/useAuth';
import Sidebar from './Sidebar';
import Header from './Header';

function Layout() {
    const { utilisateur }                    = useAuth();
    const [sidebarOuverte, setSidebarOuverte] = useState(false);

    if (!utilisateur) {
        return (
            <>
                <Header />
                <Outlet />
            </>
        );
    }

    return (
        <div className="app-layout">
            {sidebarOuverte && (
                <div
                    className="sidebar-overlay"
                    onClick={() => setSidebarOuverte(false)}
                />
            )}
            <Sidebar
                ouverte={sidebarOuverte}
                fermer={() => setSidebarOuverte(false)}
            />
            <div className="app-content">
                <button
                    className="burger-mobile"
                    onClick={() => setSidebarOuverte(true)}
                    aria-label="Ouvrir le menu"
                >
                    ☰
                </button>
                <Outlet />
            </div>
        </div>
    );
}

export default Layout;