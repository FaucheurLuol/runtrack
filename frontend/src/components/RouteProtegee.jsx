import { Navigate } from 'react-router-dom';
import { useAuth }  from '../context/useAuth';

function RouteProtegee({ children }) {
    const { utilisateur, deconnexionVolontaire } = useAuth();

    if (!utilisateur) {
        return <Navigate to={deconnexionVolontaire ? '/' : '/connexion'} replace />;
    }

    return children;
}

export default RouteProtegee;