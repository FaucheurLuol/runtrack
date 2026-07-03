import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import RouteProtegee from './components/RouteProtegee';
import Accueil from './pages/Accueil';
import Inscription from './pages/Inscription';
import Connexion from './pages/Connexion';
import Dashboard from './pages/Dashboard';

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route element={<Layout />}>
                    <Route path="/" element={<Accueil />} />
                    <Route path="/inscription" element={<Inscription />} />
                    <Route path="/connexion" element={<Connexion />} />
                    <Route path="/dashboard" element={
                        <RouteProtegee>
                            <Dashboard />
                        </RouteProtegee>
                    } />
                </Route>
            </Routes>
        </BrowserRouter>
    );
}

export default App;