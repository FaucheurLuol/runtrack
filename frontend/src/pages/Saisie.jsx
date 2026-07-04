import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/useAuth';
import { recupererSeance, enregistrerSeance } from '../api/seances';
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

    const [dureeReelle,      setDureeReelle]       = useState('');
    const [distanceReelle,   setDistanceReelle]    = useState('');
    const [ressenti,         setRessenti]          = useState(0);
    const [notes,            setNotes]             = useState('');

    const [chargement,       setChargement]        = useState(false);
    const [message,          setMessage]           = useState({ texte: '', type: '' });

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

        if (!dureeReelle || !distanceReelle || ressenti === 0) {
            setMessage({ texte: 'Veuillez remplir tous les champs obligatoires.', type: 'error' });
            return;
        }

        setChargement(true);
        try {
            await enregistrerSeance(utilisateur.token, {
                plan_id:          parseInt(planId),
                semaine:          parseInt(formSemaine),
                numero_seance:    parseInt(formNumero),
                duree_reelle:     parseFloat(dureeReelle),
                distance_reelle:  parseFloat(distanceReelle),
                ressenti,
                notes: notes || null,
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

                        <div className="saisie-selection">
                            <div className="saisie-champ">
                                <label htmlFor="duree" className="label">Durée réelle (min) *</label>
                                <input
                                    className="input-field"
                                    type="number"
                                    id="duree"
                                    min="1"
                                    step="0.5"
                                    value={dureeReelle}
                                    onChange={(e) => setDureeReelle(e.target.value)}
                                    placeholder="ex: 34"
                                />
                            </div>
                            <div className="saisie-champ">
                                <label htmlFor="distance" className="label">Distance réelle (km) *</label>
                                <input
                                    className="input-field"
                                    type="number"
                                    id="distance"
                                    min="0.1"
                                    step="0.1"
                                    value={distanceReelle}
                                    onChange={(e) => setDistanceReelle(e.target.value)}
                                    placeholder="ex: 3.8"
                                />
                            </div>
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