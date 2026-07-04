import { useState, useEffect } from 'react';
import { useNavigate }         from 'react-router-dom';
import { useAuth }             from '../context/useAuth';
import {
    recupererMesPlans,
    selectionnerPlan,
    archiverPlan,
    reactiverPlan,
} from '../api/plans';
import '../style/dashboard.css';

const capitaliser = (str) => str.charAt(0).toUpperCase() + str.slice(1);

function MesPlans() {
    const { utilisateur }             = useAuth();
    const navigate                    = useNavigate();
    const [plans,       setPlans]     = useState([]);
    const [chargement,  setChargement] = useState(true);
    const [erreur,      setErreur]    = useState(null);
    const [actionEnCours, setAction]  = useState(null);

    useEffect(() => {
        const charger = async () => {
            try {
                const data = await recupererMesPlans(utilisateur.token);
                setPlans(data);
            } catch (err) {
                setErreur(err.message);
            } finally {
                setChargement(false);
            }
        };

        charger();
    }, [utilisateur.token]);

    const handleSelectionner = async (planId) => {
        setAction(planId);
        try {
            await selectionnerPlan(utilisateur.token, planId);
            const data = await recupererMesPlans(utilisateur.token);
            setPlans(data);
        } catch (err) {
            setErreur(err.message);
        } finally {
            setAction(null);
        }
    };


    const handleArchiver = async (planId) => {
        setAction(planId);
        try {
            await archiverPlan(utilisateur.token, planId);
            const data = await recupererMesPlans(utilisateur.token);
            setPlans(data);
        } catch (err) {
            setErreur(err.message);
        } finally {
            setAction(null);
        }
    };

    const handleReactiver = async (planId) => {
        setAction(planId);
        try {
            await reactiverPlan(utilisateur.token, planId);
            const data = await recupererMesPlans(utilisateur.token);
            setPlans(data);
        } catch (err) {
            setErreur(err.message);
        } finally {
            setAction(null);
        }
    };

    if (chargement) return <main className="dashboard"><p>Chargement...</p></main>;

    return (
        <main className="dashboard">
            <h1>Mes plans</h1>

            {erreur && (
                <div className="form-message error" style={{ maxWidth: '100%' }}>
                    <p>{erreur}</p>
                </div>
            )}

            {plans.length === 0 ? (
                <section className="dashboard-card">
                    <p>Aucun plan trouvé.</p>
                    <button
                        className="btn-saisie"
                        style={{ marginTop: '1rem' }}
                        onClick={() => navigate('/nouveau-plan')}
                    >
                        Créer mon premier plan →
                    </button>
                </section>
            ) : (
                <div className="plans-liste">
                    {plans.map(plan => {
                        const estSelectionne = plan.est_selectionne;
                        const estArchive     = !plan.actif;
                        const progression    = Math.round(
                            (parseInt(plan.seances_realisees) / parseInt(plan.total_seances)) * 100
                        );

                        return (
                            <section
                                key={plan.id}
                                className={`dashboard-card plan-carte ${estSelectionne ? 'plan-principal' : ''} ${estArchive ? 'plan-archive' : ''}`}
                            >
                                <div className="plan-carte-header">
                                    <div className="plan-carte-titre">
                                        <span className="plan-carte-objectif">
                                            🏃 {plan.objectif}
                                        </span>
                                        <span className="plan-carte-detail">
                                            {plan.seances_semaine} séance{plan.seances_semaine > 1 ? 's' : ''}/semaine
                                            · Profil {capitaliser(plan.niveau)}
                                        </span>
                                        <span className="plan-carte-dates">
                                            Du {new Date(plan.date_debut).toLocaleDateString('fr-FR')}
                                            {' '}au {new Date(plan.date_fin).toLocaleDateString('fr-FR')}
                                        </span>
                                    </div>
                                    <div className="plan-carte-tags">
                                        {estSelectionne && (
                                            <span className="tag tag-principal">Plan principal</span>
                                        )}
                                        {!estSelectionne && !estArchive && (
                                            <span className="tag tag-actif">Actif</span>
                                        )}
                                        {estArchive && (
                                            <span className="tag tag-archive">Archivé</span>
                                        )}
                                    </div>
                                </div>

                                {/* Progression */}
                                <div className="plan-carte-progression">
                                    <div className="progression-texte">
                                        <span>
                                            {plan.seances_realisees} / {plan.total_seances} séances
                                        </span>
                                        <span>{isNaN(progression) ? 0 : progression}%</span>
                                    </div>
                                    <div className="progression-barre">
                                        <div
                                            className="progression-fill"
                                            style={{ width: `${isNaN(progression) ? 0 : progression}%` }}
                                        />
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="plan-carte-actions">
                                    <button
                                        className="btn-voir"
                                        onClick={() => navigate(`/mes-plans/${plan.id}`)}
                                    >
                                        Voir le plan
                                    </button>

                                    {!estSelectionne && !estArchive && (
                                        <button
                                            className="btn-selectionner"
                                            disabled={actionEnCours === plan.id}
                                            onClick={() => handleSelectionner(plan.id)}
                                        >
                                            Sélectionner
                                        </button>
                                    )}

                                    {!estArchive && (
                                        <button
                                            className="btn-archiver"
                                            disabled={actionEnCours === plan.id}
                                            onClick={() => handleArchiver(plan.id)}
                                        >
                                            Archiver
                                        </button>
                                    )}

                                    {estArchive && (
                                        <button
                                            className="btn-reactiver"
                                            disabled={actionEnCours === plan.id}
                                            onClick={() => handleReactiver(plan.id)}
                                        >
                                            Réactiver
                                        </button>
                                    )}
                                </div>
                            </section>
                        );
                    })}
                </div>
            )}
        </main>
    );
}

export default MesPlans;