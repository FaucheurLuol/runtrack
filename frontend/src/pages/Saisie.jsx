import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/useAuth';
import { recupererSeance, enregistrerSeance } from '../api/seances';
import { recupererMesPlans } from '../api/plans';
import '../style/dashboard.css';

function Saisie() {
    const { utilisateur }            = useAuth();
    const [searchParams]             = useSearchParams();
    const navigate                   = useNavigate();

    // Paramètres depuis l'URL
    const planId       = searchParams.get('plan')    || '';
    const semaine      = searchParams.get('semaine') || '';
    const numeroSeance = searchParams.get('seance')  || '';

    // État du formulaire
    const [formSemaine,      setFormSemaine]      = useState(semaine);
    const [formNumero,       setFormNumero]        = useState(numeroSeance);
    const [seancePrevue,     setSeancePrevue]      = useState(null);
    const [chargementSeance, setChargementSeance]  = useState(false);
    const [erreurSeance,     setErreurSeance]      = useState(null);

    const [distance,         setDistance] = useState('');
    const [ressenti,         setRessenti]          = useState(0);
    const [notes,            setNotes]             = useState('');

    const [chargement,       setChargement]        = useState(false);
    const [message,          setMessage]           = useState({ texte: '', type: '' });

    const [plans,          setPlans]          = useState([]);
    const [chargementPlans, setChargementPlans] = useState(true);
    const [erreur, setErreur] = useState(null);

    const [dureeMinutes, setDureeMinutes] = useState('');
    const [dureeSecondes, setDureeSecondes] = useState('');
    const [dureeTexte, setDureeTexte] = useState('');

    const handleDureeMinChange = (val) => {
        setDureeMinutes(val);
        setDureeTexte(`${val.padStart(2,'0')}:${dureeSecondes.padStart(2,'0')}`);
    };
    const handleDureeSecChange = (val) => {
        setDureeSecondes(val);
        setDureeTexte(`${dureeMinutes.padStart(2,'0')}:${val.padStart(2,'0')}`);
    };
    const handleDureeTexteChange = (val) => {
        setDureeTexte(val);
        const parties = val.split(':');
        if (parties[0] !== undefined) setDureeMinutes(parties[0]);
        if (parties[1] !== undefined) setDureeSecondes(parties[1]);
    };

    const [dateSeance, setDateSeance] = useState(
        new Date().toISOString().split('T')[0] // format YYYY-MM-DD
    );

    // Charge les plans actifs de l'utilisateur
    useEffect(() => {
        const chargerPlans = async () => {
            try {
                const data   = await recupererMesPlans(utilisateur.token);
                const actifs = data.filter(p => p.actif);
                setPlans(actifs);

                if (!planId) {
                    const principal = actifs.find(p => p.est_selectionne);
                    if (principal) {
                        navigate(
                            `/saisie?plan=${principal.id}&semaine=${formSemaine}&seance=${formNumero}`,
                            { replace: true }
                        );
                    }
                }
            } catch (err) {
                setErreur(err.message);
            } finally {
                setChargementPlans(false);
            }
        };

        chargerPlans();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [utilisateur.token]);

    // Charge la séance prévue quand semaine/séance change
    useEffect(() => {
        if (!planId || !formSemaine || !formNumero) return;

        const charger = async () => {
            setChargementSeance(true);
            setErreurSeance(null);
            setSeancePrevue(null);

            try {
                const data = await recupererSeance(
                    utilisateur.token, planId, formSemaine, formNumero
                );

                if (!data) {
                    setErreurSeance('Séance introuvable pour cette semaine et ce numéro.');
                } else if (data.realisee) {
                    setErreurSeance('Cette séance a déjà été enregistrée.');
                } else {
                    setSeancePrevue(data);
                }
            } catch (err) {
                setErreurSeance(err.message);
            } finally {
                setChargementSeance(false);
            }
        };

        charger();
    }, [formSemaine, formNumero, planId, utilisateur.token]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        const min = parseInt(dureeMinutes) || 0;
        const sec = parseInt(dureeSecondes) || 0;
        const dureeReelleCalculee = min + sec / 60;

        if (!dureeReelleCalculee || dureeReelleCalculee <= 0) {
            setMessage({ texte: 'Veuillez saisir une durée valide.', type: 'error' });
            return;
        }

        if (!distance || ressenti === 0) {
            setMessage({ texte: 'Veuillez remplir tous les champs obligatoires.', type: 'error' });
            return;
        }

        setChargement(true);
        try {
            await enregistrerSeance(utilisateur.token, {
                plan_id:         parseInt(planId),
                semaine:         parseInt(formSemaine),
                numero_seance:   parseInt(formNumero),
                duree_reelle:    dureeReelleCalculee,
                distance_reelle: parseFloat(distance),
                ressenti,
                notes:           notes || null,
                date_realisee:   dateSeance,
            });

            setMessage({ texte: 'Séance enregistrée avec succès !', type: 'success' });
            setTimeout(() => navigate('/dashboard'), 1500);

        } catch (err) {
            setMessage({ texte: err.message, type: 'error' });
        } finally {
            setChargement(false);
        }
    };

    return (
        <main className="dashboard">
            <section className="dashboard-card">
                <h1>Saisie d'une séance</h1>
                
                {erreur && (
                    <div className="form-message error">
                        <p>{erreur}</p>
                    </div>
                )}

                {/* Sélecteur de plan */}
                {!chargementPlans && (
                    <div className="saisie-champ">
                        <label htmlFor="plan" className="label">Plan</label>
                        <select
                            className="input-field"
                            id="plan"
                            value={planId}
                            onChange={(e) => navigate(
                                `/saisie?plan=${e.target.value}&semaine=${formSemaine}&seance=${formNumero}`,
                                { replace: true }
                            )}
                        >
                            {plans.map(p => (
                                <option key={p.id} value={p.id}>
                                    {p.objectif} — {p.seances_semaine} séance{p.seances_semaine > 1 ? 's' : ''}/sem
                                    {p.est_selectionne ? ' (principal)' : ''}
                                </option>
                            ))}
                        </select>
                    </div>
                )}

                <div className="saisie-champ">
                    <label htmlFor="date" className="label">Date de la séance</label>
                    <input
                        className="input-field"
                        type="date"
                        id="date"
                        value={dateSeance}
                        max={new Date().toISOString().split('T')[0]}
                        onChange={(e) => setDateSeance(e.target.value)}
                    />
                </div>

                {/* Sélection semaine / séance */}
                <div className="saisie-selection">
                    <div className="saisie-champ">
                        <label htmlFor="semaine" className="label">Semaine</label>
                        <input
                            className="input-field"
                            type="number"
                            id="semaine"
                            min="1"
                            max="20"
                            value={formSemaine}
                            onChange={(e) => setFormSemaine(e.target.value)}
                        />
                    </div>
                    <div className="saisie-champ">
                        <label htmlFor="numero" className="label">Numéro de séance</label>
                        <input
                            className="input-field"
                            type="number"
                            id="numero"
                            min="1"
                            max="2"
                            value={formNumero}
                            onChange={(e) => setFormNumero(e.target.value)}
                        />
                    </div>
                </div>

                {/* Séance prévue */}
                {chargementSeance && <p>Chargement de la séance...</p>}

                {erreurSeance && (
                    <div className="form-message error">
                        <p>{erreurSeance}</p>
                    </div>
                )}

                {seancePrevue && !erreurSeance && (
                    <div className="seance-prevue-recap">
                        <div className="prochaine-header">
                            <span className="badge-phase">{seancePrevue.phase}</span>
                            <span className="badge-semaine">
                                Semaine {seancePrevue.semaine} · Séance {seancePrevue.numero_seance}
                            </span>
                        </div>
                        <p className="prochaine-titre">{seancePrevue.titre}</p>
                        <p className="prochaine-description">{seancePrevue.description}</p>
                        <div className="prochaine-stats">
                            <div className="stat">
                                <span className="label">Durée prévue</span>
                                <strong>{seancePrevue.duree_prevue} min</strong>
                            </div>
                            <div className="stat">
                                <span className="label">Distance prévue</span>
                                <strong>
                                    {seancePrevue.distance_prevue
                                        ? `${parseFloat(seancePrevue.distance_prevue).toFixed(1)} km`
                                        : '—'}
                                </strong>
                            </div>
                            <div className="stat">
                                <span className="label">Allure prévue</span>
                                <strong>
                                    {seancePrevue.allure_prevue_sec
                                        ? `${Math.floor(seancePrevue.allure_prevue_sec / 60)}'${(seancePrevue.allure_prevue_sec % 60).toString().padStart(2, '0')}"/km`
                                        : 'Effort maximal'}
                                </strong>
                            </div>
                        </div>
                    </div>
                )}

                {/* Formulaire de saisie */}
                {seancePrevue && (
                    <form onSubmit={handleSubmit} className="saisie-form">
                        <h2>Ce que tu as fait</h2>

                        <div className="saisie-champ">
                            <label className="label">Durée réelle *</label>
                            {/* Desktop */}
                            <div className="temps-desktop" style={{ gap: '1rem' }}>
                                <div className="saisie-champ">
                                    <label className="label">Minutes</label>
                                    <input
                                        className="input-field"
                                        type="number"
                                        min="0"
                                        max="300"
                                        value={dureeMinutes}
                                        onChange={(e) => handleDureeMinChange(e.target.value)}
                                        placeholder="34"
                                    />
                                </div>
                                <div className="saisie-champ">
                                    <label className="label">Secondes</label>
                                    <input
                                        className="input-field"
                                        type="number"
                                        min="0"
                                        max="59"
                                        value={dureeSecondes}
                                        onChange={(e) => handleDureeSecChange(e.target.value)}
                                        placeholder="30"
                                    />
                                </div>
                            </div>
                            {/* Mobile */}
                            <div className="temps-mobile">
                                <input
                                    className="input-field"
                                    type="text"
                                    value={dureeTexte}
                                    onChange={(e) => handleDureeTexteChange(e.target.value)}
                                    placeholder="34:30"
                                    pattern="\d{1,3}:\d{2}"
                                />
                            </div>
                        </div>

                        <div className="saisie-champ">
                            <label htmlFor="distance" className="label">Distance réelle (km) *</label>
                            <input
                                className="input-field"
                                type="number"
                                id="distance"
                                min="0.1"
                                step="0.1"
                                value={distance}
                                onChange={(e) => setDistance(e.target.value)}
                                placeholder="ex: 3.8"
                            />
                        </div>

                        {/* Ressenti en étoiles */}
                        <div className="saisie-ressenti">
                            <span className="label">Ressenti *</span>
                            <div className="etoiles-picker">
                                {[1, 2, 3, 4, 5].map((n) => (
                                    <span
                                        key={n}
                                        className={`etoile-pick ${n <= ressenti ? 'active' : ''}`}
                                        onClick={() => setRessenti(n)}
                                    >
                                        ★
                                    </span>
                                ))}
                                {ressenti > 0 && (
                                    <span className="ressenti-label">
                                        {['', 'Très difficile', 'Difficile', 'Correct', 'Bien', 'Excellent'][ressenti]}
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Notes */}
                        <div className="saisie-champ saisie-notes">
                            <label htmlFor="notes" className="label">Notes (optionnel)</label>
                            <textarea
                                className="input-field"
                                id="notes"
                                rows={3}
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                placeholder="Comment s'est passée la séance ?"
                            />
                        </div>

                        {message.texte && (
                            <div className={`form-message ${message.type}`}>
                                <p>{message.texte}</p>
                            </div>
                        )}

                        <div className="saisie-actions">
                            <button
                                type="submit"
                                className="btn-saisie"
                                disabled={chargement}
                            >
                                {chargement ? 'Enregistrement...' : 'Enregistrer la séance →'}
                            </button>
                            <button
                                type="button"
                                className="btn-annuler"
                                onClick={() => navigate('/dashboard')}
                            >
                                Annuler
                            </button>
                        </div>
                    </form>
                )}
            </section>
        </main>
    );
}

export default Saisie;