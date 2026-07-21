import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import RouteProtegee from './components/RouteProtegee';
import Accueil from './pages/Accueil';
import Inscription from './pages/Inscription';
import Connexion from './pages/Connexion';
import Dashboard from './pages/Dashboard';
import Saisie from './pages/Saisie';
import Suivi from './pages/Suivi';
import MesPlans from './pages/MesPlans';
import NouveauPlan from './pages/NouveauPlan';
import PlanDetail from './pages/PlanDetail';
import NotFound from './pages/NotFound';
import Profil from './pages/Profil';
import DemandePlan from './pages/DemandePlan';

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route element={<Layout />}>
                    <Route path="/"             element={<Accueil />} />
                    <Route path="/inscription"  element={<Inscription />} />
                    <Route path="/connexion"    element={<Connexion />} />
                    <Route path="/dashboard"    element={<RouteProtegee><Dashboard /></RouteProtegee>} />
                    <Route path="/saisie"       element={<RouteProtegee><Saisie /></RouteProtegee>} />
                    <Route path="/suivi"        element={<RouteProtegee><Suivi /></RouteProtegee>} />
                    <Route path="/mes-plans"    element={<RouteProtegee><MesPlans /></RouteProtegee>} />
                    <Route path="/nouveau-plan" element={<RouteProtegee><NouveauPlan /></RouteProtegee>} />
                    <Route path="/mes-plans/:id" element={<RouteProtegee><PlanDetail /></RouteProtegee>} />
                    <Route path="/profil" element={<RouteProtegee><Profil /></RouteProtegee>} />
                    <Route path="/demande-plan" element={<RouteProtegee><DemandePlan /></RouteProtegee>} />
                    <Route path="*" element={<NotFound />} />
                </Route>
            </Routes>
        </BrowserRouter>
    );
}

export default App;