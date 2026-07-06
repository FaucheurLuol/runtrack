import { useState, useEffect } from 'react';
import { useNavigate }         from 'react-router-dom';
import { useAuth }             from '../context/useAuth';
import { genererPlan, recupererMesPlans } from '../api/plans';
import '../style/dashboard.css';

// Calcule les allures depuis un temps 5km en secondes
function calculerAllures(temps5km_sec) {
    const allureRace = Math.round((temps5km_sec / 5) * 1.06);
    return {
        race:      allureRace,
        threshold: Math.round(allureRace * 1.05),
        aerobic:   Math.round(allureRace * 1.20),
        easy:      Math.round(allureRace * 1.32),
        vo2:       Math.round(allureRace * 0.94),
    };
}

function formatAllure(sec) {
    const min = Math.floor(sec / 60);
    const s   = sec % 60;
    return `${min}'${s.toString().padStart(2, '0')}"/km`;
}

function determinerProfil(temps5km_sec) {
    if (temps5km_sec < 1260) return { label: 'Fast',     objectif: '42–44 min' };
    if (temps5km_sec < 1320) return { label: 'Good',     objectif: '44–46 min' };
    if (temps5km_sec < 1380) return { label: 'Base',     objectif: '45–47 min' };
    if (temps5km_sec < 1440) return { label: 'Moderate', objectif: '48–50 min' };
    return                          { label: 'Slow',     objectif: '50–52 min' };
}

function formatTempsCible(allureRace) {
    const sec = allureRace * 10;
    const min = Math.floor(sec / 60);
    const s   = sec % 60;
    return `${min}'${s.toString().padStart(2, '0')}"`;
}

function NouveauPlan() {
    const { utilisateur }              = useAuth();
    const navigate                     = useNavigate();

    // Test 5km
    const [aPeuCouru,    setAPeuCouru]    = useState(null);
    const [minutes,      setMinutes]      = useState('');
    const [secondes,     setSecondes]     = useState('');
    const [tempsTexte,   setTempsTexte]   = useState('');

    // Préférences
    const [seancesSemaine, setSeancesSemaine] = useState(2);
    const [dateDebut,      setDateDebut]      = useState(
        new Date().toISOString().split('T')[0]
    );
    const [objectif,       setObjectif]       = useState('10km');
    const [niveau,         setNiveau]         = useState('intermediaire');
    const PLANS_DISPONIBLES = [
        { niveau: 'debutant',      objectif: '10km', seances: 1 },
        { niveau: 'intermediaire', objectif: '10km', seances: 2 },
        { niveau: 'intermediaire', objectif: '10km', seances: 3 },
    ];
    const combinaisonDisponible = PLANS_DISPONIBLES.some(
        p => p.niveau === niveau && p.seances === seancesSemaine && p.objectif === objectif
    );

    // Plans existants (pour l'avertissement)
    const [aDejaUnPlan,  setADejaUnPlan]  = useState(false);

    // UI
    const [chargement,   setChargement]   = useState(false);
    const [message,      setMessage]      = useState({ texte: '', type: '' });

    // Charge les plans existants
    useEffect(() => {
        const charger = async () => {
            try {
                const data = await recupererMesPlans(utilisateur.token);
                setADejaUnPlan(data.some(p => p.actif));
            } catch {
                // silencieux
            }
        };
        charger();
    }, [utilisateur.token]);

    // Calcul de l'aperçu directement dans le composant (pas de useEffect)
    const apercu = (() => {
        if (!aPeuCouru || !minutes) return null;
        const min   = parseInt(minutes)  || 0;
        const sec   = parseInt(secondes) || 0;
        const total = min * 60 + sec;
        if (total <= 0) return null;
        const allures = calculerAllures(total);
        const profil  = determinerProfil(total);
        return { allures, profil, allureRace: allures.race };
    })();

    // Synchronise champ texte → min/sec
    const handleTempsTexteChange = (valeur) => {
        setTempsTexte(valeur);
        const parties = valeur.split(':');
        if (parties[0] !== undefined) setMinutes(parties[0]);
        if (parties[1] !== undefined) setSecondes(parties[1]);
    };

    // Synchronise min/sec → champ texte
    const handleMinChange = (val) => {
        setMinutes(val);
        setTempsTexte(`${val.padStart(2, '0')}:${secondes.padStart(2, '0')}`);
    };

    const handleSecChange = (val) => {
        setSecondes(val);
        setTempsTexte(`${minutes.padStart(2, '0')}:${val.padStart(2, '0')}`);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (aPeuCouru === null) {
            setMessage({ texte: 'Veuillez indiquer si vous avez déjà couru 5km.', type: 'error' });
            return;
        }

        let temps5km_sec = null;
        if (aPeuCouru) {
            const min = parseInt(minutes) || 0;
            const sec = parseInt(secondes) || 0;
            temps5km_sec = min * 60 + sec;

            if (temps5km_sec <= 0) {
                setMessage({ texte: 'Veuillez saisir un temps valide.', type: 'error' });
                return;
            }
        }

        setChargement(true);
        try {
            const data = await genererPlan(utilisateur.token, {
                seances_semaine: seancesSemaine,
                temps5km_sec,
                date_debut: dateDebut,
                niveau,
                objectif,
            });

            navigate(`/mes-plans/${data.plan_id}`);

        } catch (err) {
            // Message technique → message utilisateur
            if (err.message.includes('Aucun plan disponible')) {
                setMessage({
                    texte: `Cette combinaison n'est pas encore disponible. 
                            Essaie une autre combinaison niveau / séances par semaine.`,
                    type: 'error'
                });
            } else {
                setMessage({ texte: err.message, type: 'error' });
            }
        } finally {
            setChargement(false);
        }
    };

    return (
        <main className="dashboard">
            <h1>Nouveau plan</h1>

            {/* Avertissement plan existant */}
            {aDejaUnPlan && (
                <div className="form-message success" style={{ maxWidth: '100%' }}>
                    <p>
                        Tu as déjà un plan actif. Le nouveau plan deviendra ton plan principal —
                        l'ancien restera accessible dans "Mes plans".
                    </p>
                </div>
            )}

            {/* Messages */}
            {message.texte && (
                <div className={`form-message ${message.type}`} style={{ maxWidth: '100%' }}>
                    <p>{message.texte}</p>
                </div>
            )}

            <form onSubmit={handleSubmit} className="nouveau-plan-form">
                {/* ── Test 5km ── */}
                <section className="dashboard-card">
                    <h2>Ton test 5km</h2>
                    <p>As-tu déjà couru 5km sans t'arrêter ?</p>

                    <div className="radio-groupe">
                        <label className={`radio-carte ${aPeuCouru === true ? 'active' : ''}`}>
                            <input
                                type="radio"
                                name="aPeuCouru"
                                onChange={() => setAPeuCouru(true)}
                            />
                            <span>✅ Oui, j'ai un temps</span>
                        </label>
                        <label className={`radio-carte ${aPeuCouru === false ? 'active' : ''}`}>
                            <input
                                type="radio"
                                name="aPeuCouru"
                                onChange={() => setAPeuCouru(false)}
                            />
                            <span>❌ Non, je débute</span>
                        </label>
                    </div>

                    {aPeuCouru === true && (
                        <div className="temps-saisie">
                            {/* Desktop : deux champs */}
                            <div className="temps-desktop">
                                <div className="saisie-champ">
                                    <label className="label">Minutes</label>
                                    <input
                                        className="input-field"
                                        type="number"
                                        min="10"
                                        max="60"
                                        value={minutes}
                                        onChange={(e) => handleMinChange(e.target.value)}
                                        placeholder="22"
                                    />
                                </div>
                                <div className="saisie-champ">
                                    <label className="label">Secondes</label>
                                    <input
                                        className="input-field"
                                        type="number"
                                        min="0"
                                        max="59"
                                        value={secondes}
                                        onChange={(e) => handleSecChange(e.target.value)}
                                        placeholder="30"
                                    />
                                </div>
                            </div>

                            {/* Mobile : champ texte MM:SS */}
                            <div className="temps-mobile">
                                <div className="saisie-champ">
                                    <label className="label">Temps (MM:SS)</label>
                                    <input
                                        className="input-field"
                                        type="text"
                                        value={tempsTexte}
                                        onChange={(e) => handleTempsTexteChange(e.target.value)}
                                        placeholder="22:30"
                                        pattern="\d{1,2}:\d{2}"
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {aPeuCouru === false && (
                        <div className="info-debutant">
                            <p>
                                Pas de problème — ton plan débutera avec des allures adaptées aux débutants.
                                Après ton premier test intégré au plan (semaine 8), tes allures seront
                                recalibrées automatiquement.
                            </p>
                        </div>
                    )}
                </section>

                {/* ── Aperçu temps réel ── */}
                {apercu && (
                    <section className="dashboard-card apercu-allures">
                        <h2>Aperçu de ton profil</h2>
                        <div className="plan-actif-grid">
                            <div className="plan-actif-carte">
                                <span className="carte-label">Profil</span>
                                <span className="carte-valeur">{apercu.profil.label}</span>
                                <p className="carte-detail">Objectif estimé : {apercu.profil.objectif}</p>
                            </div>
                            <div className="plan-actif-carte">
                                <span className="carte-label">Allure course</span>
                                <span className="carte-valeur">{formatAllure(apercu.allureRace)}</span>
                                <p className="carte-detail">Temps cible : {formatTempsCible(apercu.allureRace)}</p>
                            </div>
                        </div>
                        <div className="allures-grid" style={{ marginTop: '1rem' }}>
                            {[
                                { label: 'Endurance facile', key: 'easy' },
                                { label: 'Aérobie',          key: 'aerobic' },
                                { label: 'Seuil',            key: 'threshold' },
                                { label: 'Allure course',    key: 'race' },
                                { label: 'VO2max',           key: 'vo2' },
                            ].map(({ label, key }) => (
                                <div key={key} className="allure-item">
                                    <span className="label">{label}</span>
                                    <strong>{formatAllure(apercu.allures[key])}</strong>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* ── Préférences ── */}
                <section className="dashboard-card">
                    <h2>Préférences</h2>

                    {/* Objectif */}
                    <div className="nouveau-plan-groupe">
                        <span className="label">Objectif</span>
                        <div className="radio-groupe">
                            {['5km', '10km', 'semi', 'marathon'].map(obj => {
                                const disponible = PLANS_DISPONIBLES.some(p => p.objectif === obj);
                                return (
                                    <label key={obj} className={`radio-carte ${objectif === obj ? 'active' : ''} ${!disponible ? 'disabled' : ''}`}>
                                        <input type="radio" name="objectif" disabled={!disponible} onChange={() => disponible && setObjectif(obj)} />
                                        <span>{obj === 'semi' ? 'Semi-marathon' : obj === 'marathon' ? 'Marathon' : obj}{!disponible && ' (bientôt)'}</span>
                                    </label>
                                );
                            })}
                        </div>
                    </div>

                    {/* Niveau */}
                    <div className="nouveau-plan-groupe">
                        <span className="label">Niveau</span>
                        <div className="radio-groupe">
                            {[
                                { value: 'debutant',      label: 'Débutant' },
                                { value: 'intermediaire', label: 'Intermédiaire' },
                                { value: 'avance',        label: 'Avancé' },
                            ].map(n => {
                                const disponible = PLANS_DISPONIBLES.some(p => p.niveau === n.value && p.objectif === objectif);
                                return (
                                    <label key={n.value} className={`radio-carte ${niveau === n.value ? 'active' : ''} ${!disponible ? 'disabled' : ''}`}>
                                        <input type="radio" name="niveau" disabled={!disponible} onChange={() => disponible && setNiveau(n.value)} />
                                        <span>{n.label}{!disponible && ' (bientôt)'}</span>
                                    </label>
                                );
                            })}
                        </div>
                    </div>

                    {/* Séances */}
                    <div className="nouveau-plan-groupe">
                        <span className="label">Séances par semaine</span>
                        <div className="radio-groupe">
                            {[1, 2, 3].map(n => {
                                const disponible = PLANS_DISPONIBLES.some(p => p.niveau === niveau && p.seances === n && p.objectif === objectif);
                                return (
                                    <label key={n} className={`radio-carte ${seancesSemaine === n ? 'active' : ''} ${!disponible ? 'disabled' : ''}`}>
                                        <input type="radio" name="seances" disabled={!disponible} onChange={() => disponible && setSeancesSemaine(n)} />
                                        <span>{n} séance{n > 1 ? 's' : ''} / semaine{!disponible && ' (bientôt)'}</span>
                                    </label>
                                );
                            })}
                        </div>
                    </div>

                    {/* Date de début */}
                    <div className="saisie-champ">
                        <label htmlFor="dateDebut" className="label">Date de début</label>
                        <input
                            className="input-field"
                            type="date"
                            id="dateDebut"
                            value={dateDebut}
                            min={new Date().toISOString().split('T')[0]}
                            onChange={(e) => setDateDebut(e.target.value)}
                            style={{ maxWidth: '220px' }}
                        />
                    </div>
                </section>

                {!combinaisonDisponible && (
                    <div className="form-message error" style={{ maxWidth: '100%' }}>
                        <p>
                            Cette combinaison n'est pas encore disponible.
                            Plans actuels : Débutant 1 séance · Intermédiaire 2 ou 3 séances · sur 10km.
                        </p>
                    </div>
                )}

                {/* Bouton */}
                <div className="saisie-actions">
                    <button
                        type="submit"
                        className="btn-saisie"
                        disabled={chargement}
                    >
                        {chargement ? 'Génération en cours...' : 'Générer mon plan →'}
                    </button>
                </div>

            </form>
        </main>
    );
}

export default NouveauPlan;