import { useState, useEffect } from 'react';
import { useNavigate }         from 'react-router-dom';
import { genererPlan, recupererMesPlans, recupererPlansDisponibles } from '../api/plans';
import '../style/dashboard.css';

const DISTANCES_OBJECTIF_FRONT = {
    '5km':      5,
    '10km':     10,
    'semi':     21.1,
    'marathon': 42.195,
};

function calculerAllures(temps_ref_sec, distance_ref_km, objectifChoisi) {
    const distance_objectif_km = DISTANCES_OBJECTIF_FRONT[objectifChoisi] || 10;
    const temps_objectif_sec = temps_ref_sec * Math.pow(distance_objectif_km / distance_ref_km, 1.06);
    const allureRace = Math.round(temps_objectif_sec / distance_objectif_km);

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
    const navigate = useNavigate();

    const [distanceReference, setDistanceReference] = useState('5');
    const [distanceLibre,     setDistanceLibre]     = useState('');
    const [useDistanceLibre,  setUseDistanceLibre]  = useState(false);

    // Test de référence
    const [aPeuCouru,    setAPeuCouru]    = useState(null);
    const [minutes,      setMinutes]      = useState('');
    const [secondes,     setSecondes]     = useState('');
    const [tempsTexte,   setTempsTexte]   = useState('');

    // Préférences
    const [seancesSemaine, setSeancesSemaine] = useState(2);
    const [nombreSemaines, setNombreSemaines] = useState(20);
    const [objectif,       setObjectif]       = useState('10km');
    const [dateDebut,      setDateDebut]      = useState(
        new Date().toISOString().split('T')[0]
    );

    // Date de fin — calculée dynamiquement selon le nombre de semaines choisi
    const dateFin = (() => {
        if (!dateDebut) return null;
        const debut = new Date(dateDebut);
        const fin   = new Date(debut);
        fin.setDate(fin.getDate() + nombreSemaines * 7);
        return fin;
    })();

    // Plans réellement disponibles (chargés depuis l'API)
    const [plansDisponibles, setPlansDisponibles] = useState([]);

    // Plans existants (pour l'avertissement "tu as déjà un plan actif")
    const [aDejaUnPlan, setADejaUnPlan] = useState(false);

    // UI
    const [chargement, setChargement] = useState(false);
    const [message,    setMessage]    = useState({ texte: '', type: '' });

    // Combinaison actuellement sélectionnée est-elle disponible ?
    const combinaisonDisponible = plansDisponibles.some(
        p => p.objectif === objectif && p.seances === seancesSemaine && p.semaines === nombreSemaines
    );

    // Charge les plans existants de l'utilisateur
    useEffect(() => {
        const charger = async () => {
            try {
                const data = await recupererMesPlans();
                setADejaUnPlan(data.some(p => p.actif));
            } catch {
                // silencieux
            }
        };
        charger();
    }, []);

    // Charge les combinaisons de plans disponibles
    useEffect(() => {
        const charger = async () => {
            try {
                const data = await recupererPlansDisponibles();
                setPlansDisponibles(data);
            } catch {
                // silencieux
            }
        };
        charger();
    }, []);

    // Calcul de l'aperçu directement dans le composant
    const apercu = (() => {
        if (!aPeuCouru || !minutes) return null;
        const min   = parseInt(minutes)  || 0;
        const sec   = parseInt(secondes) || 0;
        const total = min * 60 + sec;
        if (total <= 0) return null;

        const distanceRefFinale = useDistanceLibre
            ? parseFloat(distanceLibre)
            : parseFloat(distanceReference);

        if (!distanceRefFinale || distanceRefFinale <= 0) return null;

        const allures = calculerAllures(total, distanceRefFinale, objectif);

        // Convertit vers un équivalent 5km pour déterminer le profil correctement
        const temps5kmEquivalent = Math.round((allures.race * 5) / 1.06);
        const profil = determinerProfil(temps5kmEquivalent);

        return { allures, profil, allureRace: allures.race };
    })();

    const handleTempsTexteChange = (valeur) => {
        setTempsTexte(valeur);
        const parties = valeur.split(':');
        if (parties[0] !== undefined) setMinutes(parties[0]);
        if (parties[1] !== undefined) setSecondes(parties[1]);
    };

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
            setMessage({ texte: "Veuillez indiquer si vous avez déjà couru une distance sans t'arrêter.", type: 'error' });
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
            const distanceRefFinale = useDistanceLibre
                ? parseFloat(distanceLibre)
                : parseFloat(distanceReference);

            const data = await genererPlan({
                seances_semaine: seancesSemaine,
                nombre_semaines: nombreSemaines,
                temps5km_sec,
                distance_reference_km: distanceRefFinale,
                date_debut: dateDebut,
                objectif,
            });

            if (data.avertissement) {
                setMessage({ texte: data.avertissement, type: 'error' });
                setTimeout(() => navigate(`/mes-plans/${data.plan_id}`), 3000);
            } else {
                navigate(`/mes-plans/${data.plan_id}`);
            }
        } catch (err) {
            if (err.message.includes('Aucun plan disponible')) {
                setMessage({
                    texte: `Cette combinaison n'est pas encore disponible pour ${objectif} · ${seancesSemaine} séance(s)/sem · ${nombreSemaines} semaines.`,
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
                {/* ── Ton test ── */}
                <section className="dashboard-card">
                    <h2>Ton test de référence</h2>
                    <p>As-tu déjà couru une distance sans t'arrêter ?</p>

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
                        <div className="saisie-champ" style={{ marginTop: '1rem' }}>
                            <label className="label">Distance de référence de ton test</label>
                            <div className="radio-groupe">
                                {['3', '5', '10', '21.1'].map(d => (
                                    <label
                                        key={d}
                                        className={`radio-carte ${!useDistanceLibre && distanceReference === d ? 'active' : ''}`}
                                    >
                                        <input
                                            type="radio"
                                            name="distanceRef"
                                            onChange={() => { setDistanceReference(d); setUseDistanceLibre(false); }}
                                        />
                                        <span>{d === '21.1' ? 'Semi (21.1km)' : `${d} km`}</span>
                                    </label>
                                ))}
                                <label className={`radio-carte ${useDistanceLibre ? 'active' : ''}`}>
                                    <input
                                        type="radio"
                                        name="distanceRef"
                                        onChange={() => setUseDistanceLibre(true)}
                                    />
                                    <span>Autre distance</span>
                                </label>
                            </div>

                            {useDistanceLibre && (
                                <input
                                    className="input-field"
                                    type="number"
                                    step="0.1"
                                    min="1"
                                    placeholder="Distance en km"
                                    value={distanceLibre}
                                    onChange={(e) => setDistanceLibre(e.target.value)}
                                    style={{ marginTop: '0.75rem', maxWidth: '200px' }}
                                />
                            )}
                        </div>
                    )}

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
                                Après ton premier test intégré au plan, tes allures seront
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
                                const disponible = plansDisponibles.some(p => p.objectif === obj);
                                return (
                                    <label key={obj} className={`radio-carte ${objectif === obj ? 'active' : ''} ${!disponible ? 'disabled' : ''}`}>
                                        <input type="radio" name="objectif" disabled={!disponible} onChange={() => disponible && setObjectif(obj)} />
                                        <span>{obj === 'semi' ? 'Semi-marathon' : obj === 'marathon' ? 'Marathon' : obj}{!disponible && ' (bientôt)'}</span>
                                    </label>
                                );
                            })}
                        </div>
                    </div>

                    {/* Séances */}
                    <div className="nouveau-plan-groupe">
                        <span className="label">Séances par semaine</span>
                        <div className="radio-groupe">
                            {[1, 2, 3, 4].map(n => {
                                const disponible = plansDisponibles.some(p => p.objectif === objectif && p.seances === n);
                                return (
                                    <label key={n} className={`radio-carte ${seancesSemaine === n ? 'active' : ''} ${!disponible ? 'disabled' : ''}`}>
                                        <input type="radio" name="seances" disabled={!disponible} onChange={() => disponible && setSeancesSemaine(n)} />
                                        <span>{n} séance{n > 1 ? 's' : ''} / semaine{!disponible && ' (bientôt)'}</span>
                                    </label>
                                );
                            })}
                        </div>
                    </div>

                    {/* Nombre de semaines */}
                    <div className="nouveau-plan-groupe">
                        <span className="label">Nombre de semaines</span>
                        <div className="radio-groupe">
                            {[16, 20, 24].map(n => {
                                const disponible = plansDisponibles.some(
                                    p => p.objectif === objectif && p.seances === seancesSemaine && p.semaines === n
                                );
                                return (
                                    <label key={n} className={`radio-carte ${nombreSemaines === n ? 'active' : ''} ${!disponible ? 'disabled' : ''}`}>
                                        <input
                                            type="radio"
                                            name="nombreSemaines"
                                            disabled={!disponible}
                                            onChange={() => disponible && setNombreSemaines(n)}
                                        />
                                        <span>{n} semaines{!disponible && ' (bientôt)'}</span>
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
                        {dateFin && (
                            <p className="carte-detail" style={{ marginTop: '0.5rem' }}>
                                Ton plan se terminera le{' '}
                                <strong>{dateFin.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</strong>
                                {' '}({nombreSemaines} semaines)
                            </p>
                        )}
                    </div>
                </section>

                {!combinaisonDisponible && (
                    <div className="form-message error" style={{ maxWidth: '100%' }}>
                        <p>
                            Cette combinaison n'est pas encore disponible pour {objectif} · {seancesSemaine} séance(s)/sem · {nombreSemaines} semaines.
                        </p>
                    </div>
                )}

                <section className="dashboard-card">
                    <h2>Plans actuellement disponibles</h2>
                    <div className="plans-disponibles-liste">
                        {plansDisponibles.map(p => (
                            <div key={p.cle} className="plan-disponible-item">
                                <span className="plan-disponible-objectif">{p.objectif}</span>
                                <span className="plan-disponible-detail">
                                    {p.seances} séance{p.seances > 1 ? 's' : ''}/sem · {p.semaines} semaines
                                </span>
                            </div>
                        ))}
                    </div>
                    <p className="graphique-description" style={{ marginTop: '0.75rem' }}>
                        Ta combinaison idéale n'y est pas ?
                    </p>
                    <button
                        type="button"
                        className="btn-annuler"
                        onClick={() => navigate('/demande-plan')}
                    >
                        Demander un plan personnalisé →
                    </button>
                </section>

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