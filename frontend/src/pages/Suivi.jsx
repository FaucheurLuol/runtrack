import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { telechargerCsv } from '../utils/exportCsv';
import { API_URL } from '../api/config';
import { recupererSuivi }      from '../api/suivi';
import {
    BarChart, Bar, LineChart, Line,
    XAxis, YAxis, CartesianGrid, Tooltip,
    Legend, ResponsiveContainer, ReferenceLine
} from 'recharts';
import '../style/dashboard.css';
import '../style/suivi.css';

const RESSENTI_LABEL = ['', 'Très difficile', 'Difficile', 'Correct', 'Bien', 'Excellent'];
const RESSENTI_COULEUR = ['', '#ef4444', '#f97316', '#eab308', '#84cc16', '#22c55e'];

const secToAffichage = (sec) => {
    if (!sec) return '—';
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return s > 0 ? `${m}min ${s}s` : `${m}min`;
};

function StatCard({ label, valeur, detail, couleur }) {
    return (
        <div className="stat-card" style={{ borderLeftColor: couleur || 'var(--orange)' }}>
            <span className="stat-card-label">{label}</span>
            <span className="stat-card-valeur">{valeur}</span>
            {detail && <span className="stat-card-detail">{detail}</span>}
        </div>
    );
}

function Suivi() {
    const [donnees,    setDonnees]    = useState(null);
    const [chargement, setChargement] = useState(true);
    const [erreur,     setErreur]     = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const charger = async () => {
            try {
                const data = await recupererSuivi();
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
                    <h1>Aucune donnée disponible 📊</h1>
                    <p>Tu n'as pas encore de plan actif. Crée ton premier plan pour commencer à suivre tes progrès.</p>
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

    const { stats_globales, par_semaine, progression_tests, historique } = donnees;

    // Semaine actuelle = dernière semaine avec au moins une séance réalisée
    const derniereRealisee = par_semaine
        .filter(s => s.seances_realisees > 0)
        .map(s => s.semaine);
    const semaineCourante = derniereRealisee.length > 0
        ? Math.max(...derniereRealisee)
        : 0;

    // Données graphique volume — toutes les semaines
    const dataVolume = par_semaine.map(s => ({
        semaine: `S${s.semaine}`,
        realise: s.km_reels,
        prevu:   s.km_prevus,
    }));

    // Données graphique charge
    const dataCharge = par_semaine.map(s => ({
        semaine: `S${s.semaine}`,
        charge:  s.charge_entrainement,
        future:  s.semaine > semaineCourante,
    }));

    // Données graphique ressenti
    const dataRessenti = par_semaine
        .filter(s => s.ressenti_moyen !== null)
        .map(s => ({
            semaine:  `S${s.semaine}`,
            ressenti: s.ressenti_moyen,
        }));

    // Données graphique tests
    const dataTests = progression_tests.map(t => ({
        semaine: `S${t.semaine}`,
        allure:  t.allure_sec_km,
        label:   t.allure_affichage,
    }));

    const handleExportCsv = () => {
        const lignes = historique.map(s => ({
            Date:              new Date(s.date).toLocaleDateString('fr-FR'),
            Semaine:           s.semaine,
            Titre:             s.titre,
            Phase:             s.phase,
            'Durée (min)':     Math.round(s.duree_reelle / 60),
            'Distance (km)':   s.distance_reelle,
            'Allure réelle':   s.allure_reelle || '',
            'Allure prévue':   s.allure_prevue || '',
            Ressenti:          s.ressenti,
            Notes:             s.notes || '',
        }));
        telechargerCsv('historique-seances.csv', lignes);
    };

    return (
        <main className="dashboard">
            <h1>Suivi des séances</h1>

            <div className="plan-detail-actions-export">
                <button className="btn-annuler" onClick={handleExportCsv}>
                    Export CSV historique
                </button>
                <a
                    href={`${API_URL}/suivi/export-pdf`}
                    className="btn-annuler"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    Export PDF résumé
                </a>
            </div>

            {/* ── Stats globales ──────────────────────────────────── */}
            <div className="stats-grid">
                <StatCard
                    label="Kilomètres parcourus"
                    valeur={`${stats_globales.total_km} km`}
                    detail={`Record : ${stats_globales.record_distance} km`}
                />
                <StatCard
                    label="Temps d'entraînement"
                    valeur={`${stats_globales.total_heures}h`}
                    detail={`${stats_globales.total_seances_realisees} séances réalisées`}
                />
                <StatCard
                    label="Régularité"
                    valeur={`${stats_globales.consistency_score}%`}
                    detail={`${stats_globales.total_seances_realisees}/${stats_globales.total_seances_prevues} séances`}
                    couleur="var(--olive)"
                />
                <StatCard
                    label="Série en cours"
                    valeur={`${stats_globales.streak} sem.`}
                    detail="Semaines consécutives"
                    couleur="var(--amber)"
                />
                <StatCard
                    label="Ressenti moyen"
                    valeur={stats_globales.ressenti_moyen
                        ? `${stats_globales.ressenti_moyen}/5`
                        : '—'}
                    detail={stats_globales.ressenti_moyen
                        ? RESSENTI_LABEL[Math.round(stats_globales.ressenti_moyen)]
                        : 'Aucune donnée'}
                    couleur={RESSENTI_COULEUR[Math.round(stats_globales.ressenti_moyen)] || 'var(--ink-muted)'}
                />
                <StatCard
                    label="Meilleure allure 5km"
                    valeur={stats_globales.meilleure_allure_5km
                        ? stats_globales.meilleure_allure_5km.allure
                        : '—'}
                    detail={stats_globales.meilleure_allure_5km
                        ? `Semaine ${stats_globales.meilleure_allure_5km.semaine} · ${stats_globales.meilleure_allure_5km.duree_min} min`
                        : 'Aucun test réalisé'}
                    couleur="var(--orange)"
                />
            </div>

            {/* ── Graphique volume ────────────────────────────────── */}
            <section className="dashboard-card">
                <h2>Volume hebdomadaire (km)</h2>
                <ResponsiveContainer width="100%" height={240}>
                    <BarChart
                        data={dataVolume}
                        margin={{ top: 8, right: 16, left: 0, bottom: 0 }}
                        barSize={16}
                    >
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--olive-dark)" opacity={0.3} />
                        <XAxis dataKey="semaine" tick={{ fontSize: 11, fill: 'var(--ink-muted)' }} />
                        <YAxis tick={{ fontSize: 11, fill: 'var(--ink-muted)' }} unit=" km" />
                        <Tooltip
                            contentStyle={{
                                background: 'var(--sand-light)',
                                border: '1px solid var(--olive-dark)',
                                borderRadius: '8px',
                                fontSize: '0.82rem',
                            }}
                        />
                        <Legend />
                        {semaineCourante > 0 && (
                            <ReferenceLine
                                x={`S${semaineCourante}`}
                                stroke="var(--orange)"
                                strokeDasharray="4 4"
                                label={{ value: "Aujourd'hui", fill: 'var(--orange)', fontSize: 11 }}
                            />
                        )}
                        <Bar dataKey="prevu"   name="Prévu"   fill="var(--olive)"  radius={[4,4,0,0]} opacity={0.3} />
                        <Bar dataKey="realise" name="Réalisé" fill="var(--orange)" radius={[4,4,0,0]} />
                    </BarChart>
                </ResponsiveContainer>
            </section>

            {/* ── Graphique charge ────────────────────────────────── */}
            <section className="dashboard-card">
                <h2>Charge d'entraînement</h2>
                <p className="graphique-description">
                    Score combinant durée et intensité de chaque séance. Plus le score est élevé, plus la semaine était exigeante.
                    À terme, ce score sera enrichi par tes données Garmin ou Strava.
                </p>
                <ResponsiveContainer width="100%" height={240}>
                    <BarChart data={dataCharge} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--olive-dark)" opacity={0.3} />
                        <XAxis dataKey="semaine" tick={{ fontSize: 11, fill: 'var(--ink-muted)' }} />
                        <YAxis tick={{ fontSize: 11, fill: 'var(--ink-muted)' }} />
                        <Tooltip
                            contentStyle={{
                                background: 'var(--sand-light)',
                                border: '1px solid var(--olive-dark)',
                                borderRadius: '8px',
                                fontSize: '0.82rem',
                            }}
                            formatter={(val) => [`${val} pts`, 'Charge']}
                        />
                        {semaineCourante > 0 && (
                            <ReferenceLine
                                x={`S${semaineCourante}`}
                                stroke="var(--orange)"
                                strokeDasharray="4 4"
                            />
                        )}
                        <Bar dataKey="charge" fill="var(--amber)" radius={[4,4,0,0]} />
                    </BarChart>
                </ResponsiveContainer>
            </section>

            {/* ── Graphique ressenti ──────────────────────────────── */}
            {dataRessenti.length > 0 && (
                <section className="dashboard-card">
                    <h2>Ressenti moyen par semaine</h2>
                    <ResponsiveContainer width="100%" height={200}>
                        <LineChart data={dataRessenti} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="var(--olive-dark)" opacity={0.3} />
                            <XAxis dataKey="semaine" tick={{ fontSize: 11, fill: 'var(--ink-muted)' }} />
                            <YAxis domain={[1, 5]} ticks={[1,2,3,4,5]} tick={{ fontSize: 11, fill: 'var(--ink-muted)' }} />
                            <Tooltip
                                contentStyle={{
                                    background: 'var(--sand-light)',
                                    border: '1px solid var(--olive-dark)',
                                    borderRadius: '8px',
                                    fontSize: '0.82rem',
                                }}
                                formatter={(val) => [RESSENTI_LABEL[Math.round(val)], 'Ressenti']}
                            />
                            <Line
                                type="monotone"
                                dataKey="ressenti"
                                stroke="var(--olive)"
                                strokeWidth={2}
                                dot={{ fill: 'var(--olive)', r: 4 }}
                                activeDot={{ r: 6 }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </section>
            )}

            {/* ── Progression tests ───────────────────────────────── */}
            {dataTests.length > 0 && (
                <section className="dashboard-card">
                    <h2>Progression 5km</h2>
                    <ResponsiveContainer width="100%" height={200}>
                        <LineChart data={dataTests} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="var(--olive-dark)" opacity={0.3} />
                            <XAxis dataKey="semaine" tick={{ fontSize: 11, fill: 'var(--ink-muted)' }} />
                            <YAxis
                                tick={{ fontSize: 11, fill: 'var(--ink-muted)' }}
                                tickFormatter={(val) => {
                                    const min = Math.floor(val / 60);
                                    const sec = val % 60;
                                    return `${min}'${sec.toString().padStart(2,'0')}"`;
                                }}
                                reversed
                            />
                            <Tooltip
                                contentStyle={{
                                    background: 'var(--sand-light)',
                                    border: '1px solid var(--olive-dark)',
                                    borderRadius: '8px',
                                    fontSize: '0.82rem',
                                }}
                                formatter={(_, __, props) => [props.payload.label, 'Allure']}
                            />
                            <Line
                                type="monotone"
                                dataKey="allure"
                                stroke="var(--orange)"
                                strokeWidth={2}
                                dot={{ fill: 'var(--orange)', r: 5 }}
                                activeDot={{ r: 7 }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                    <p className="graphique-description">
                        * L'axe est inversé — une allure plus basse = plus rapide
                    </p>
                </section>
            )}

            {/* ── Historique complet ──────────────────────────────── */}
            <section className="dashboard-card">
                <h2>Historique des séances</h2>
                {historique.length === 0 ? (
                    <p className="vide">Aucune séance enregistrée</p>
                ) : (
                    <div className="historique-liste">
                        {historique.map((s, i) => (
                            <div
                                key={i}
                                className={`historique-carte ${s.type === 'test' ? 'seance-test' : ''}`}
                            >
                                <div className="historique-carte-header">
                                    <div>
                                        <span className="historique-date">
                                            {new Date(s.date).toLocaleDateString('fr-FR')}
                                            {' · '}Semaine {s.semaine}
                                        </span>
                                        <p className="historique-titre">{s.titre}</p>
                                    </div>
                                    <span className="badge-phase">{s.phase}</span>
                                </div>

                                <div className="plan-detail-stats" style={{ marginTop: '0.5rem' }}>
                                    <div className="stat">
                                        <span className="label">Durée</span>
                                        <strong>{secToAffichage(s.duree_reelle)}</strong>
                                    </div>
                                    <div className="stat">
                                        <span className="label">Distance</span>
                                        <strong>{s.distance_reelle} km</strong>
                                    </div>
                                    {s.allure_reelle && (
                                        <div className="stat">
                                            <span className="label">Allure réelle</span>
                                            <strong>{s.allure_reelle}</strong>
                                        </div>
                                    )}
                                    {s.allure_prevue && (
                                        <div className="stat">
                                            <span className="label">Allure prévue</span>
                                            <strong style={{ color: 'var(--ink-muted)' }}>
                                                {s.allure_prevue}
                                            </strong>
                                        </div>
                                    )}
                                    <div className="stat">
                                        <span className="label">Ressenti</span>
                                        <strong style={{ color: RESSENTI_COULEUR[s.ressenti] }}>
                                            {'★'.repeat(s.ressenti)}{'☆'.repeat(5 - s.ressenti)}
                                        </strong>
                                    </div>
                                </div>

                                {s.notes && (
                                    <p className="plan-detail-notes">💬 {s.notes}</p>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </section>
        </main>
    );
}

export default Suivi;