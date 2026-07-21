import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../style/dashboard.css';
import '../style/suivi.css';

import { API_URL } from '../api/config';

const secToAffichage = (sec) => {
    if (!sec) return '—';
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return s > 0 ? `${m}min ${s}s` : `${m}min`;
};

function Dashboard() {
    const navigate        = useNavigate();

    const [donnees,     setDonnees]     = useState(null);
    const [chargement,  setChargement]  = useState(true);
    const [erreur,      setErreur]      = useState(null);

    useEffect(() => {
        const charger = async () => {
            try {
                const res  = await fetch(`${API_URL}/dashboard`, {
                    credentials: 'include',
                });
                const data = await res.json();
                if (!res.ok) throw new Error(data.erreur);
                setDonnees(data);
            } catch (err) {
                setErreur(err.message);
            } finally {
                setChargement(false);
            }
        };
        charger();
    }, []);

    if (chargement) return <main className="dashboard"><p>Chargement...</p></main>;
    if (erreur) return (
        <main className="dashboard">
            {erreur === 'Aucun plan actif' ? (
                <>
                    <h1>Bienvenue sur RunTrack 👋</h1>
                    <p>Tu n'as pas encore de plan d'entraînement.</p>
                    <button
                        className="btn-saisie"
                        style={{ marginTop: '1rem' }}
                        onClick={() => navigate('/nouveau-plan')}
                    >
                        Créer mon premier plan →
                    </button>
                </>
            ) : (
                <p>Erreur : {erreur}</p>
            )}
        </main>
    );

    const {
        plan_actif,
        prochaine_seance,
        deux_semaines,
        allures_reference,
        journal,
        kpi,
    } = donnees;

    const { progression } = plan_actif;

    return (
        <main className="dashboard">

            {/* ── PLAN ACTIF ─────────────────────────────────────── */}
            <section className="dashboard-card plan-actif">
                <div className="plan-actif-grid">

                    {/* Carte 1 — Label */}
                    <div className="plan-actif-carte">
                        <span className="carte-label">Plan actif</span>
                        <span className="carte-valeur">{plan_actif.objectif}</span>
                        <p className="carte-detail">Course à pied</p>
                    </div>

                    {/* Carte 2 — Infos */}
                    <div className="plan-actif-carte">
                        <span className="carte-label">Profil</span>
                        <span className="carte-valeur">
                            {plan_actif.niveau.charAt(0).toUpperCase() + plan_actif.niveau.slice(1)} *
                        </span>
                        <p className="carte-detail">
                            {plan_actif.seances_semaine} séance{plan_actif.seances_semaine > 1 ? 's' : ''}/semaine
                            · {plan_actif.semaines_restantes} semaines restantes
                        </p>
                        {plan_actif.niveau_label && (
                            <p className="carte-asterisque">
                                * Basé sur ton dernier 5km ({plan_actif.niveau_label})
                            </p>
                        )}
                    </div>

                    {/* Carte 3 — Allures */}
                    <div className="plan-actif-carte">
                        <span className="carte-label">Allure course cible</span>
                        <span className="carte-valeur">{plan_actif.allure_course}</span>
                        <p className="carte-detail">
                            Temps cible 10km : {plan_actif.temps_cible_objectif}
                        </p>
                    </div>

                    {/* Carte 4 — Dernier test */}
                    <div className="plan-actif-carte">
                        <span className="carte-label">
                            Dernier test {plan_actif.dernier_5km ? `(${plan_actif.dernier_5km.distance}km)` : ''}
                        </span>
                        {plan_actif.dernier_5km ? (
                            <>
                                <span className="carte-valeur">
                                    {secToAffichage(plan_actif.dernier_5km.duree_min)}
                                </span>
                                <p className="carte-detail">
                                    {new Date(plan_actif.dernier_5km.date).toLocaleDateString('fr-FR')}
                                </p>
                            </>
                        ) : (
                            <span className="non-defini">À définir suite au premier test</span>
                        )}
                    </div>

                </div>

                {/* Barre de progression */}
                <div className="progression-container">
                    <div className="progression-texte">
                        <span>{progression.realisees} / {progression.total} séances</span>
                        <span>{progression.pourcentage}%</span>
                    </div>
                    <div className="progression-barre">
                        <div
                            className="progression-fill"
                            style={{ width: `${progression.pourcentage}%` }}
                        />
                    </div>
                    <p className="progression-detail">
                        {progression.km_totaux} km parcourus
                        · Ressenti moyen {progression.ressenti_moyen}/5
                    </p>
                </div>
            </section>

            {/* ── KPI rapides ────────────────────────────────────────── */}
            <div className="stats-grid">
                <div className="stat-card orange">
                    <span className="stat-card-label">Kilomètres parcourus</span>
                    <span className="stat-card-valeur">{plan_actif.progression.km_totaux} km</span>
                    <span className="stat-card-detail">
                        Record : {kpi.meilleure_allure_5km
                            ? `${secToAffichage(kpi.meilleure_allure_5km.duree_min)} sur 5km`
                            : '—'}
                    </span>
                </div>
                <div className="stat-card olive">
                    <span className="stat-card-label">Temps d'entraînement</span>
                    <span className="stat-card-valeur">
                        {plan_actif.progression.total_heures}h
                    </span>
                    <span className="stat-card-detail">
                        {plan_actif.progression.realisees} séances réalisées
                    </span>
                </div>
                <div className="stat-card olive">
                    <span className="stat-card-label">Régularité</span>
                    <span className="stat-card-valeur">{kpi.consistency_score}%</span>
                    <span className="stat-card-detail">
                        {plan_actif.progression.realisees}/{plan_actif.progression.total} séances
                    </span>
                </div>
                <div className="stat-card amber">
                    <span className="stat-card-label">Série en cours</span>
                    <span className="stat-card-valeur">{kpi.streak} sem.</span>
                    <span className="stat-card-detail">Semaines consécutives</span>
                </div>
                <div className="stat-card orange">
                    <span className="stat-card-label">Ressenti moyen</span>
                    <span className="stat-card-valeur">{plan_actif.progression.ressenti_moyen}/5</span>
                    <span className="stat-card-detail">
                        {['', 'Très difficile', 'Difficile', 'Correct', 'Bien', 'Excellent'][Math.round(plan_actif.progression.ressenti_moyen)]}
                    </span>
                </div>
                <div className="stat-card orange">
                    <span className="stat-card-label">Meilleure allure 5km</span>
                    <span className="stat-card-valeur">
                        {kpi.meilleure_allure_5km ? kpi.meilleure_allure_5km.allure : '—'}
                    </span>
                    <span className="stat-card-detail">
                        {kpi.meilleure_allure_5km
                            ? kpi.meilleure_allure_5km.semaine === 'initial'
                                ? `Test initial · ${secToAffichage(kpi.meilleure_allure_5km.duree_min)}`
                                : `Semaine ${kpi.meilleure_allure_5km.semaine} · ${secToAffichage(kpi.meilleure_allure_5km.duree_min)}`
                            : 'Aucun test réalisé'}
                    </span>
                </div>
            </div>

            {/* ── PROCHAINE SÉANCE ───────────────────────────────── */}
            {prochaine_seance && (
                <section className="dashboard-card prochaine-seance">
                    <h2>Prochaine séance</h2>
                    <div className="prochaine-header">
                        <span className="badge-phase">{prochaine_seance.phase}</span>
                        <span className="badge-semaine">
                            Semaine {prochaine_seance.semaine} · Séance {prochaine_seance.numero_seance}
                        </span>
                    </div>
                    <p className="prochaine-titre">{prochaine_seance.titre}</p>
                    <p className="prochaine-description">{prochaine_seance.description}</p>
                    <div className="prochaine-stats">
                        <div className="stat">
                            <span className="label">Durée</span>
                            <strong>{prochaine_seance.duree_prevue} min</strong>
                        </div>
                        <div className="stat">
                            <span className="label">Distance</span>
                            <strong>{parseFloat(prochaine_seance.distance_prevue).toFixed(2)} km</strong>
                        </div>
                        <div className="stat">
                            <span className="label">Allure</span>
                            <strong>{prochaine_seance.allure_prevue}</strong>
                        </div>
                    </div>
                    <button
                        className="btn-saisie"
                        onClick={() => navigate(`/saisie?semaine=${prochaine_seance.semaine}&seance=${prochaine_seance.numero_seance}&plan=${plan_actif.id}`)}
                    >
                        Saisir cette séance →
                    </button>
                </section>
            )}

            {/* ── DEUX SEMAINES ──────────────────────────────────── */}
            <div className="deux-semaines">
                {/* Semaine précédente */}
                <section className="dashboard-card semaine-bloc">
                    <h2>
                        Semaine {prochaine_seance
                            ? prochaine_seance.semaine - 1
                            : '—'}
                    </h2>
                    {deux_semaines.semaine_precedente.length === 0 ? (
                        <p className="vide">Première semaine du plan</p>
                    ) : (
                        deux_semaines.semaine_precedente.map((seance, i) => (
                            <SeanceResume key={i} seance={seance} />
                        ))
                    )}
                </section>

                {/* Semaine courante */}
                <section className="dashboard-card semaine-bloc">
                    <h2>
                        Semaine {prochaine_seance
                            ? prochaine_seance.semaine
                            : '—'}
                    </h2>
                    {deux_semaines.semaine_courante.length === 0 ? (
                        <p className="vide">Aucune séance</p>
                    ) : (
                        deux_semaines.semaine_courante.map((seance, i) => (
                            <SeanceResume key={i} seance={seance} />
                        ))
                    )}
                </section>
            </div>

            {/* ── ALLURES DE RÉFÉRENCE ───────────────────────────── */}
            <section className="dashboard-card allures-ref">
                <h2>Allures de référence</h2>
                {allures_reference ? (
                    <div className="allures-grid">
                        <div className="allure-item">
                            <span className="label">Endurance facile</span>
                            <strong>{allures_reference.easy}</strong>
                        </div>
                        <div className="allure-item">
                            <span className="label">Aérobie</span>
                            <strong>{allures_reference.aerobic}</strong>
                        </div>
                        <div className="allure-item">
                            <span className="label">Seuil</span>
                            <strong>{allures_reference.threshold}</strong>
                        </div>
                        <div className="allure-item">
                            <span className="label">Allure course</span>
                            <strong>{allures_reference.race}</strong>
                        </div>
                        <div className="allure-item">
                            <span className="label">VO2max</span>
                            <strong>{allures_reference.vo2}</strong>
                        </div>
                    </div>
                ) : (
                    <p className="non-defini">
                        À définir suite au premier test
                    </p>
                )}
            </section>

            {/* ── JOURNAL ────────────────────────────────────────── */}
            <section className="dashboard-card journal">
                <h2>Journal des séances</h2>
                {journal.length === 0 ? (
                    <p className="vide">Aucune séance enregistrée</p>
                ) : (
                    <div className="journal-liste">
                        {journal.map((entree, i) => (
                            <div key={i} className="journal-entree">
                                <div className="journal-date">
                                    {new Date(entree.date).toLocaleDateString('fr-FR')}
                                </div>
                                <div className="journal-info">
                                    <p className="journal-titre">{entree.titre}</p>
                                    <p className="journal-phase">{entree.phase}</p>
                                </div>
                                <div className="journal-stats">
                                    <span>{parseFloat(entree.distance_reelle).toFixed(2)} km</span>
                                    <span>{entree.allure_reelle}</span>
                                </div>
                                <div className="journal-ressenti">
                                    {Array.from({ length: 5 }, (_, j) => (
                                        <span
                                            key={j}
                                            className={j < entree.ressenti ? 'etoile active' : 'etoile'}
                                        >
                                            ★
                                        </span>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </section>

        </main>
    );
}

// ── Composant SeanceResume ──────────────────────────────────────
function SeanceResume({ seance }) {
    return (
        <div className={`seance-resume ${seance.realisee ? 'realisee' : 'a-faire'}`}>
            <div className="seance-resume-header">
                <span className="seance-resume-titre">{seance.titre}</span>
                <span className="seance-resume-statut">
                    {seance.realisee ? '✅' : '⏳'}
                </span>
            </div>
            <div className="seance-resume-valeurs">
                {seance.realisee ? (
                    <>
                        <span>{secToAffichage(seance.realise.duree_min)} min</span>
                        <span>{parseFloat(seance.realise.distance_km).toFixed(2)} km</span>
                        <span>{seance.realise.allure}</span>
                        <span className="ressenti-inline">
                            {'★'.repeat(seance.realise.ressenti)}{'☆'.repeat(5 - seance.realise.ressenti)}
                        </span>
                    </>
                ) : (
                    <>
                        <span>{seance.prevu.duree_min} min prévu</span>
                        <span>{parseFloat(seance.prevu.distance_km).toFixed(2)} km prévu</span>
                        <span>{seance.prevu.allure}</span>
                    </>
                )}
            </div>
        </div>
    );
}

export default Dashboard;