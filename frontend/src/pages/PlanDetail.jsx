import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { telechargerCsv } from '../utils/exportCsv';
import { API_URL } from '../api/config';
import { recupererPlanDetail } from '../api/plans';
import '../style/dashboard.css';

const JOURS = ['', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];

const capitaliser = (str) => str.charAt(0).toUpperCase() + str.slice(1);

const formatAllure = (sec) => {
    if (!sec) return null;
    const min = Math.floor(sec / 60);
    const s   = sec % 60;
    return `${min}'${s.toString().padStart(2, '0')}"/km`;
};

const secToAffichage = (sec) => {
    if (!sec) return '—';
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return s > 0 ? `${m}min ${s}s` : `${m}min`;
};

function PlanDetail() {
    const { id }                      = useParams();
    const navigate                    = useNavigate();
    const [donnees,    setDonnees]    = useState(null);
    const [chargement, setChargement] = useState(true);
    const [erreur,     setErreur]     = useState(null);

    useEffect(() => {
        const charger = async () => {
            try {
                const data = await recupererPlanDetail(id);
                setDonnees(data);
            } catch (err) {
                setErreur(err.message);
            } finally {
                setChargement(false);
            }
        };
        charger();
    }, [id]);

    if (chargement) return <main className="dashboard"><p>Chargement...</p></main>;
    if (erreur)     return <main className="dashboard"><p>Erreur : {erreur}</p></main>;

    const { plan, semaines, total, realisees } = donnees;
    const progression = Math.round((realisees / total) * 100);

    const handleExportCsv = () => {
        const lignes = [];
        Object.values(semaines).forEach(seancesSemaine => {
            seancesSemaine.forEach(s => {
                lignes.push({
                    Semaine:            s.semaine,
                    Séance:             s.jour,
                    Phase:              s.phase,
                    Titre:              s.titre,
                    'Durée prévue (min)':    s.duree_min || '',
                    'Distance prévue (km)':  s.distance_km ? parseFloat(s.distance_km).toFixed(2) : '',
                    'Allure prévue':    s.allure_sec_km ? formatAllure(s.allure_sec_km) : '',
                    Réalisée:           s.realisee ? 'Oui' : 'Non',
                    'Durée réelle (min)':    s.duree_reelle ? Math.round(s.duree_reelle / 60) : '',
                    'Distance réelle (km)':  s.distance_reelle ? parseFloat(s.distance_reelle).toFixed(2) : '',
                    Ressenti:           s.ressenti || '',
                    Notes:              s.notes || '',
                });
            });
        });
        telechargerCsv(`plan-${plan.objectif}-${id}.csv`, lignes);
    };

    return (
        <main className="dashboard">

            {/* En-tête */}
            <div className="page-header-sticky">
                <div className="plan-detail-header">
                    <button
                        className="btn-retour"
                        onClick={() => navigate('/mes-plans')}
                    >
                        ← Mes plans
                    </button>
                    <div className="plan-detail-titre">
                        <h1>Plan {plan.objectif}</h1>
                        <p>
                            {capitaliser(plan.niveau)} · {plan.seances_semaine} séance{plan.seances_semaine > 1 ? 's' : ''}/semaine
                            · Du {new Date(plan.date_debut).toLocaleDateString('fr-FR')}
                            {' '}au {new Date(plan.date_fin).toLocaleDateString('fr-FR')}
                        </p>
                    </div>
                    <div className="plan-detail-actions-export">
                        <button className="btn-annuler" onClick={handleExportCsv}>
                            Export CSV
                        </button>
                        <a
                            href={`${API_URL}/plans/${id}/export-pdf`}
                            className="btn-annuler"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            Export PDF
                        </a>
                    </div>
                </div>
            </div>

            {/* Progression */}
            <section className="dashboard-card">
                <div className="progression-texte">
                    <span>{realisees} / {total} séances réalisées</span>
                    <span>{progression}%</span>
                </div>
                <div className="progression-barre">
                    <div
                        className="progression-fill"
                        style={{ width: `${progression}%` }}
                    />
                </div>
            </section>

            {/* Semaines */}
            {Object.entries(semaines).map(([numSemaine, seances]) => {
                const phase = seances[0]?.phase || '';
                const realiséesDansSemaine = seances.filter(s => s.realisee).length;

                return (
                    <section key={numSemaine} className="dashboard-card plan-detail-semaine">
                        <div className="plan-detail-semaine-header">
                            <h2>Semaine {numSemaine}</h2>
                            <div className="plan-detail-semaine-meta">
                                <span className="badge-phase">{phase}</span>
                                <span className="badge-semaine">
                                    {realiséesDansSemaine}/{seances.length} réalisée{realiséesDansSemaine > 1 ? 's' : ''}
                                </span>
                            </div>
                        </div>

                        <div className="plan-detail-seances">
                            {seances.map((seance, i) => (
                                <div
                                    key={i}
                                    className={`plan-detail-seance ${seance.realisee ? 'realisee' : 'a-faire'} ${seance.type === 'test' ? 'seance-test' : ''} ${seance.type === 'race' ? 'seance-race' : ''}`}
                                >
                                    {/* En-tête séance */}
                                    <div className="plan-detail-seance-header">
                                        <div>
                                            <span className="plan-detail-seance-jour">
                                                Séance {seance.jour} · {JOURS[seance.jour_semaine] || ''}
                                            </span>
                                            <p className="plan-detail-seance-titre">
                                                {seance.titre}
                                            </p>
                                        </div>
                                        <span className="plan-detail-seance-statut">
                                            {seance.type === 'race'  ? '🏁' :
                                             seance.type === 'test'  ? '⏱️' :
                                             seance.realisee         ? '✅' : '⏳'}
                                        </span>
                                    </div>

                                    {/* Description */}
                                    <p className="plan-detail-seance-desc">
                                        {seance.description}
                                    </p>

                                    {/* Valeurs prévues */}
                                    <div className="plan-detail-stats">
                                        {seance.duree_min && (
                                            <div className="stat">
                                                <span className="label">Durée prévue</span>
                                                <strong>{seance.duree_min} min</strong>
                                            </div>
                                        )}
                                        {seance.distance_km && (
                                            <div className="stat">
                                                <span className="label">Distance prévue</span>
                                                <strong>{parseFloat(seance.distance_km).toFixed(1)} km</strong>
                                            </div>
                                        )}
                                        {seance.allure_sec_km && (
                                            <div className="stat">
                                                <span className="label">Allure prévue</span>
                                                <strong>{formatAllure(seance.allure_sec_km)}</strong>
                                            </div>
                                        )}
                                    </div>

                                    {/* Valeurs réalisées */}
                                    {seance.realisee && (
                                        <div className="plan-detail-realise">
                                            <span className="plan-detail-realise-label">Réalisé</span>
                                            <div className="plan-detail-stats">
                                                <div className="stat">
                                                    <span className="label">Durée</span>
                                                    <strong>{secToAffichage(seance.duree_reelle)} min</strong>
                                                </div>
                                                <div className="stat">
                                                    <span className="label">Distance</span>
                                                    <strong>{parseFloat(seance.distance_reelle).toFixed(1)} km</strong>
                                                </div>
                                                {seance.allure_reelle_sec && (
                                                    <div className="stat">
                                                        <span className="label">Allure</span>
                                                        <strong>{formatAllure(seance.allure_reelle_sec)}</strong>
                                                    </div>
                                                )}
                                                <div className="stat">
                                                    <span className="label">Ressenti</span>
                                                    <strong>
                                                        {'★'.repeat(seance.ressenti)}{'☆'.repeat(5 - seance.ressenti)}
                                                    </strong>
                                                </div>
                                            </div>
                                            {seance.notes && (
                                                <p className="plan-detail-notes">
                                                    💬 {seance.notes}
                                                </p>
                                            )}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </section>
                );
            })}
        </main>
    );
}

export default PlanDetail;