import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { recupererSeance, enregistrerSeance } from '../api/seances';
import { recupererMesPlans } from '../api/plans';
import { parserActivite, importerActivite } from '../api/activites';
import '../style/dashboard.css';

const secToAffichage = (sec) => {
    if (!sec) return '—';
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return s > 0 ? `${m}min ${s}s` : `${m}min`;
};

function Saisie() {
    const [searchParams] = useSearchParams();
    const navigate        = useNavigate();

    // ── Mode : saisie manuelle ou import fichier ─────────────────
    const [modeSaisie, setModeSaisie] = useState('manuel'); // 'manuel' | 'import'

    // ── Plan sélectionné (partagé entre les deux modes) ──────────
    const [planIdSelectionne, setPlanIdSelectionne] = useState(searchParams.get('plan') || '');
    const [plans,             setPlans]             = useState([]);
    const [chargementPlans,   setChargementPlans]   = useState(true);

    // ── Association à une séance prévue (partagé) ────────────────
    const [formSemaine,      setFormSemaine]      = useState(searchParams.get('semaine') || '');
    const [formNumero,       setFormNumero]       = useState(searchParams.get('seance')  || '');
    const [seancePrevue,     setSeancePrevue]     = useState(null);
    const [chargementSeance, setChargementSeance] = useState(false);
    const [erreurSeance,     setErreurSeance]     = useState(null);

    // ── Champs communs ────────────────────────────────────────────
    const [ressenti,   setRessenti]   = useState(0);
    const [notes,      setNotes]      = useState('');
    const [dateSeance, setDateSeance] = useState(new Date().toISOString().split('T')[0]);

    // ── Champs saisie manuelle ────────────────────────────────────
    const [distance,       setDistance]       = useState('');
    const [dureeMinutes,   setDureeMinutes]   = useState('');
    const [dureeSecondes,  setDureeSecondes]  = useState('');
    const [dureeTexte,     setDureeTexte]     = useState('');

    // ── Champs import fichier ─────────────────────────────────────
    const [fichier,          setFichier]          = useState(null);
    const [resume,           setResume]           = useState(null);
    const [chargementParse,  setChargementParse]  = useState(false);
    const [erreurParse,      setErreurParse]      = useState('');
    const [modeAssociation,  setModeAssociation]  = useState('bonus'); // 'bonus' | 'seance'
    const [titreBonus,       setTitreBonus]       = useState('');

    // ── UI générale ────────────────────────────────────────────────
    const [chargement, setChargement] = useState(false);
    const [message,    setMessage]    = useState({ texte: '', type: '' });
    const [erreur,     setErreur]     = useState(null);

    // Charge les plans actifs
    useEffect(() => {
        const chargerPlans = async () => {
            try {
                const data   = await recupererMesPlans();
                const actifs = data.filter(p => p.actif);
                setPlans(actifs);

                if (!planIdSelectionne) {
                    const principal = actifs.find(p => p.est_selectionne) || actifs[0];
                    if (principal) setPlanIdSelectionne(String(principal.id));
                }
            } catch (err) {
                setErreur(err.message);
            } finally {
                setChargementPlans(false);
            }
        };
        chargerPlans();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Charge la séance prévue quand semaine/séance change
    // (utilisé en mode manuel toujours, et en mode import si "seance" choisi)
    useEffect(() => {
        const doitCharger = modeSaisie === 'manuel' || (modeSaisie === 'import' && modeAssociation === 'seance');
        if (!doitCharger || !planIdSelectionne || !formSemaine || !formNumero) return;

        const charger = async () => {
            setChargementSeance(true);
            setErreurSeance(null);
            setSeancePrevue(null);

            try {
                const data = await recupererSeance(planIdSelectionne, formSemaine, formNumero);

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
    }, [formSemaine, formNumero, planIdSelectionne, modeSaisie, modeAssociation]);

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

    const handleFichier = async (e) => {
        const f = e.target.files[0];
        if (!f) return;

        setFichier(f);
        setErreurParse('');
        setResume(null);
        setChargementParse(true);

        try {
            const data = await parserActivite(f);
            setResume(data.resume);
            if (data.resume.date_realisee) {
                setDateSeance(data.resume.date_realisee.split('T')[0]);
            }
        } catch (err) {
            setErreurParse(err.message);
        } finally {
            setChargementParse(false);
        }
    };

    // ── Soumission — saisie manuelle ─────────────────────────────
    const handleSubmitManuel = async (e) => {
        e.preventDefault();

        const min = parseInt(dureeMinutes) || 0;
        const sec = parseInt(dureeSecondes) || 0;
        const dureeReelleCalculee = min * 60 + sec;

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
            await enregistrerSeance({
                plan_id:         parseInt(planIdSelectionne),
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

    // ── Soumission — import fichier ──────────────────────────────
    const handleSubmitImport = async (e) => {
        e.preventDefault();

        if (!resume || !planIdSelectionne || ressenti === 0) {
            setMessage({ texte: 'Veuillez remplir tous les champs obligatoires.', type: 'error' });
            return;
        }
        if (modeAssociation === 'bonus' && !titreBonus.trim()) {
            setMessage({ texte: 'Donne un titre à ta séance bonus.', type: 'error' });
            return;
        }
        if (modeAssociation === 'seance' && (!seancePrevue || seancePrevue.realisee)) {
            setMessage({ texte: 'Sélectionne une séance prévue valide et non déjà réalisée.', type: 'error' });
            return;
        }

        setChargement(true);
        try {
            const extension = fichier.name.slice(fichier.name.lastIndexOf('.')).toLowerCase();
            const source = extension === '.fit' ? 'import_fit' : 'import_gpx';

            await importerActivite({
                plan_id:         parseInt(planIdSelectionne),
                seance_id:       modeAssociation === 'seance' ? seancePrevue.id : null,
                titre:           modeAssociation === 'bonus' ? titreBonus : null,
                duree_reelle:    resume.duree_reelle,
                distance_reelle: resume.distance_reelle,
                ressenti,
                notes:           notes || null,
                date_realisee:   dateSeance,
                fc_moyenne:      resume.fc_moyenne,
                fc_max:          resume.fc_max,
                cadence_moyenne: resume.cadence_moyenne,
                source,
            });

            setMessage({ texte: 'Activité importée avec succès !', type: 'success' });
            setTimeout(() => navigate('/dashboard'), 1500);
        } catch (err) {
            setMessage({ texte: err.message, type: 'error' });
        } finally {
            setChargement(false);
        }
    };

    const changerMode = (nouveauMode) => {
        setModeSaisie(nouveauMode);
        setMessage({ texte: '', type: '' });
    };

    return (
        <main className="dashboard">
            <section className="dashboard-card">
                <h1>Saisir une séance</h1>

                {erreur && (
                    <div className="form-message error"><p>{erreur}</p></div>
                )}

                {/* ── Switch de mode ── */}
                <div className="radio-groupe" style={{ marginBottom: '1.25rem' }}>
                    <label className={`radio-carte ${modeSaisie === 'manuel' ? 'active' : ''}`}>
                        <input type="radio" name="modeSaisie" onChange={() => changerMode('manuel')} />
                        <span>✏️ Saisie manuelle</span>
                    </label>
                    <label className={`radio-carte ${modeSaisie === 'import' ? 'active' : ''}`}>
                        <input type="radio" name="modeSaisie" onChange={() => changerMode('import')} />
                        <span>📁 Importer un fichier (.fit/.gpx)</span>
                    </label>
                </div>

                {/* ── Sélecteur de plan (commun) ── */}
                {!chargementPlans && (
                    <div className="saisie-champ">
                        <label htmlFor="plan" className="label">Plan</label>
                        <select
                            className="input-field"
                            id="plan"
                            value={planIdSelectionne}
                            onChange={(e) => setPlanIdSelectionne(e.target.value)}
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

                {/* ══════════════════ MODE MANUEL ══════════════════ */}
                {modeSaisie === 'manuel' && (
                    <>
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

                        <div className="saisie-selection">
                            <div className="saisie-champ">
                                <label htmlFor="semaine" className="label">Semaine</label>
                                <input
                                    className="input-field"
                                    type="number"
                                    id="semaine"
                                    min="1"
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
                                    max="7"
                                    value={formNumero}
                                    onChange={(e) => setFormNumero(e.target.value)}
                                />
                            </div>
                        </div>

                        {chargementSeance && <p>Chargement de la séance...</p>}
                        {erreurSeance && (
                            <div className="form-message error"><p>{erreurSeance}</p></div>
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
                                                ? `${parseFloat(seancePrevue.distance_prevue).toFixed(2)} km`
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

                        {seancePrevue && (
                            <form onSubmit={handleSubmitManuel} className="saisie-form">
                                <h2>Ce que tu as fait</h2>

                                <div className="saisie-champ">
                                    <label className="label">Durée réelle *</label>
                                    <div className="temps-desktop" style={{ gap: '1rem' }}>
                                        <div className="saisie-champ">
                                            <label className="label">Minutes</label>
                                            <input
                                                className="input-field"
                                                type="number"
                                                min="0"
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
                                        min="0.01"
                                        step="0.01"
                                        value={distance}
                                        onChange={(e) => setDistance(e.target.value)}
                                        placeholder="ex: 3.8"
                                    />
                                </div>

                                <div className="saisie-ressenti">
                                    <span className="label">Ressenti *</span>
                                    <div className="etoiles-picker">
                                        {[1, 2, 3, 4, 5].map((n) => (
                                            <span
                                                key={n}
                                                className={`etoile-pick ${n <= ressenti ? 'active' : ''}`}
                                                onClick={() => setRessenti(n)}
                                            >★</span>
                                        ))}
                                        {ressenti > 0 && (
                                            <span className="ressenti-label">
                                                {['', 'Très difficile', 'Difficile', 'Correct', 'Bien', 'Excellent'][ressenti]}
                                            </span>
                                        )}
                                    </div>
                                </div>

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
                                    <div className={`form-message ${message.type}`}><p>{message.texte}</p></div>
                                )}

                                <div className="saisie-actions">
                                    <button type="submit" className="btn-saisie" disabled={chargement}>
                                        {chargement ? 'Enregistrement...' : 'Enregistrer la séance →'}
                                    </button>
                                    <button type="button" className="btn-annuler" onClick={() => navigate('/dashboard')}>
                                        Annuler
                                    </button>
                                </div>
                            </form>
                        )}
                    </>
                )}

                {/* ══════════════════ MODE IMPORT ══════════════════ */}
                {modeSaisie === 'import' && (
                    <>
                        <div className="saisie-champ" style={{ marginTop: '1rem' }}>
                            <label className="label">Fichier .fit ou .gpx</label>
                            <input
                                type="file"
                                accept=".fit,.gpx"
                                onChange={handleFichier}
                            />
                        </div>

                        {chargementParse && <p>Analyse du fichier...</p>}
                        {erreurParse && (
                            <div className="form-message error"><p>{erreurParse}</p></div>
                        )}

                        {resume && (
                            <>
                                <div className="seance-prevue-recap">
                                    <p className="prochaine-titre">Résumé de l'activité</p>
                                    <div className="prochaine-stats">
                                        <div className="stat">
                                            <span className="label">Durée</span>
                                            <strong>{secToAffichage(resume.duree_reelle)}</strong>
                                        </div>
                                        <div className="stat">
                                            <span className="label">Distance</span>
                                            <strong>{resume.distance_reelle} km</strong>
                                        </div>
                                        {resume.fc_moyenne && (
                                            <div className="stat">
                                                <span className="label">FC moyenne</span>
                                                <strong>{resume.fc_moyenne} bpm</strong>
                                            </div>
                                        )}
                                        {resume.cadence_moyenne && (
                                            <div className="stat">
                                                <span className="label">Cadence</span>
                                                <strong>{resume.cadence_moyenne} spm</strong>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="saisie-champ" style={{ marginTop: '1rem' }}>
                                    <label className="label">Où l'associer ?</label>
                                    <div className="radio-groupe">
                                        <label className={`radio-carte ${modeAssociation === 'bonus' ? 'active' : ''}`}>
                                            <input type="radio" name="modeAssoc" onChange={() => setModeAssociation('bonus')} />
                                            <span>Séance bonus (hors plan)</span>
                                        </label>
                                        <label className={`radio-carte ${modeAssociation === 'seance' ? 'active' : ''}`}>
                                            <input type="radio" name="modeAssoc" onChange={() => setModeAssociation('seance')} />
                                            <span>Associer à une séance prévue</span>
                                        </label>
                                    </div>
                                </div>

                                {modeAssociation === 'bonus' && (
                                    <div className="saisie-champ">
                                        <label className="label">Titre de la séance *</label>
                                        <input
                                            className="input-field"
                                            type="text"
                                            value={titreBonus}
                                            onChange={(e) => setTitreBonus(e.target.value)}
                                            placeholder="Ex: Sortie improvisée dimanche"
                                        />
                                    </div>
                                )}

                                {modeAssociation === 'seance' && (
                                    <>
                                        <div className="saisie-selection">
                                            <div className="saisie-champ">
                                                <label className="label">Semaine</label>
                                                <input
                                                    className="input-field"
                                                    type="number"
                                                    min="1"
                                                    value={formSemaine}
                                                    onChange={(e) => setFormSemaine(e.target.value)}
                                                />
                                            </div>
                                            <div className="saisie-champ">
                                                <label className="label">Numéro de séance</label>
                                                <input
                                                    className="input-field"
                                                    type="number"
                                                    min="1"
                                                    max="7"
                                                    value={formNumero}
                                                    onChange={(e) => setFormNumero(e.target.value)}
                                                />
                                            </div>
                                        </div>

                                        {chargementSeance && <p>Chargement de la séance...</p>}
                                        {erreurSeance && (
                                            <div className="form-message error"><p>{erreurSeance}</p></div>
                                        )}
                                        {seancePrevue && !erreurSeance && (
                                            <div className="seance-prevue-recap">
                                                <p className="prochaine-titre">{seancePrevue.titre}</p>
                                                <p className="prochaine-description">{seancePrevue.description}</p>
                                            </div>
                                        )}
                                    </>
                                )}

                                <div className="saisie-champ" style={{ marginTop: '1rem' }}>
                                    <label htmlFor="dateImport" className="label">Date de la séance</label>
                                    <input
                                        className="input-field"
                                        type="date"
                                        id="dateImport"
                                        value={dateSeance}
                                        max={new Date().toISOString().split('T')[0]}
                                        onChange={(e) => setDateSeance(e.target.value)}
                                    />
                                </div>

                                <form onSubmit={handleSubmitImport} className="saisie-form">
                                    <div className="saisie-ressenti">
                                        <span className="label">Ressenti *</span>
                                        <div className="etoiles-picker">
                                            {[1, 2, 3, 4, 5].map((n) => (
                                                <span
                                                    key={n}
                                                    className={`etoile-pick ${n <= ressenti ? 'active' : ''}`}
                                                    onClick={() => setRessenti(n)}
                                                >★</span>
                                            ))}
                                            {ressenti > 0 && (
                                                <span className="ressenti-label">
                                                    {['', 'Très difficile', 'Difficile', 'Correct', 'Bien', 'Excellent'][ressenti]}
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    <div className="saisie-champ saisie-notes">
                                        <label className="label">Notes (optionnel)</label>
                                        <textarea
                                            className="input-field"
                                            rows={3}
                                            value={notes}
                                            onChange={(e) => setNotes(e.target.value)}
                                            placeholder="Comment s'est passée la séance ?"
                                        />
                                    </div>

                                    {message.texte && (
                                        <div className={`form-message ${message.type}`}><p>{message.texte}</p></div>
                                    )}

                                    <div className="saisie-actions">
                                        <button type="submit" className="btn-saisie" disabled={chargement}>
                                            {chargement ? 'Import en cours...' : 'Importer cette activité →'}
                                        </button>
                                        <button type="button" className="btn-annuler" onClick={() => navigate('/dashboard')}>
                                            Annuler
                                        </button>
                                    </div>
                                </form>
                            </>
                        )}
                    </>
                )}
            </section>
        </main>
    );
}

export default Saisie;