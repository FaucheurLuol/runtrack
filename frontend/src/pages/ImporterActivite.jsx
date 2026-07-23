import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { parserActivite, importerActivite } from '../api/activites';
import { recupererMesPlans } from '../api/plans';
import { recupererSeance } from '../api/seances';
import '../style/dashboard.css';

const secToAffichage = (sec) => {
    if (!sec) return '—';
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return s > 0 ? `${m}min ${s}s` : `${m}min`;
};

function ImporterActivite() {
    const navigate     = useNavigate();
    const inputRef      = useRef(null);

    const [fichier,       setFichier]       = useState(null);
    const [resume,        setResume]        = useState(null);
    const [chargementParse, setChargementParse] = useState(false);
    const [erreur,        setErreur]        = useState(null);

    const [plans,          setPlans]          = useState([]);
    const [planIdSelectionne, setPlanIdSelectionne] = useState('');

    const [modeAssociation, setModeAssociation] = useState('bonus'); // 'bonus' | 'seance'
    const [formSemaine,     setFormSemaine]     = useState('');
    const [formNumero,      setFormNumero]      = useState('');
    const [seancePrevue,    setSeancePrevue]    = useState(null);
    const [titreBonus,      setTitreBonus]      = useState('');

    const [ressenti, setRessenti] = useState(0);
    const [notes,    setNotes]    = useState('');

    const [chargementImport, setChargementImport] = useState(false);
    const [message, setMessage] = useState({ texte: '', type: '' });

    useEffect(() => {
        const charger = async () => {
            try {
                const data   = await recupererMesPlans();
                const actifs = data.filter(p => p.actif);
                setPlans(actifs);
                const principal = actifs.find(p => p.est_selectionne) || actifs[0];
                if (principal) setPlanIdSelectionne(String(principal.id));
            } catch {
                // silencieux
            }
        };
        charger();
    }, []);

    // Charge la séance prévue quand on cherche à l'associer
    useEffect(() => {
        if (modeAssociation !== 'seance' || !planIdSelectionne || !formSemaine || !formNumero) return;

        const charger = async () => {
            try {
                const data = await recupererSeance(planIdSelectionne, formSemaine, formNumero);
                setSeancePrevue(data);
            } catch {
                setSeancePrevue(null);
            }
        };
        charger();
    }, [modeAssociation, planIdSelectionne, formSemaine, formNumero]);

    const handleFichier = async (e) => {
        const f = e.target.files[0];
        if (!f) return;

        setFichier(f);
        setErreur(null);
        setResume(null);
        setChargementParse(true);

        try {
            const data = await parserActivite(f);
            setResume(data.resume);
        } catch (err) {
            setErreur(err.message);
        } finally {
            setChargementParse(false);
        }
    };

    const handleImporter = async (e) => {
        e.preventDefault();

        if (!resume || !planIdSelectionne || ressenti === 0) {
            setMessage({ texte: 'Veuillez remplir tous les champs obligatoires.', type: 'error' });
            return;
        }

        if (modeAssociation === 'seance' && (!seancePrevue || seancePrevue.realisee)) {
            setMessage({ texte: 'Sélectionne une séance prévue valide et non déjà réalisée.', type: 'error' });
            return;
        }

        if (modeAssociation === 'bonus' && !titreBonus.trim()) {
            setMessage({ texte: 'Donne un titre à ta séance bonus.', type: 'error' });
            return;
        }

        setChargementImport(true);
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
                date_realisee:   resume.date_realisee?.split('T')[0],
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
            setChargementImport(false);
        }
    };

    return (
        <main className="dashboard">
            <h1>Importer une activité</h1>
            <p className="graphique-description">
                Importe un fichier .fit ou .gpx exporté depuis Garmin Connect ou Strava.
            </p>

            {message.texte && (
                <div className={`form-message ${message.type}`} style={{ maxWidth: '100%' }}>
                    <p>{message.texte}</p>
                </div>
            )}

            {/* Upload */}
            <section className="dashboard-card">
                <h2>1. Sélectionne ton fichier</h2>
                <input
                    ref={inputRef}
                    type="file"
                    accept=".fit,.gpx"
                    onChange={handleFichier}
                    style={{ display: 'none' }}
                />
                <button type="button" className="btn-saisie" onClick={() => inputRef.current.click()}>
                    {fichier ? fichier.name : 'Choisir un fichier .fit ou .gpx'}
                </button>

                {chargementParse && <p style={{ marginTop: '0.75rem' }}>Analyse du fichier...</p>}

                {erreur && (
                    <div className="form-message error" style={{ marginTop: '0.75rem' }}>
                        <p>{erreur}</p>
                    </div>
                )}
            </section>

            {/* Résumé extrait */}
            {resume && (
                <section className="dashboard-card">
                    <h2>2. Résumé de l'activité</h2>
                    <div className="plan-detail-stats">
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
                        {resume.fc_max && (
                            <div className="stat">
                                <span className="label">FC max</span>
                                <strong>{resume.fc_max} bpm</strong>
                            </div>
                        )}
                        {resume.cadence_moyenne && (
                            <div className="stat">
                                <span className="label">Cadence</span>
                                <strong>{resume.cadence_moyenne} spm</strong>
                            </div>
                        )}
                    </div>
                </section>
            )}

            {/* Formulaire d'association */}
            {resume && (
                <form onSubmit={handleImporter} className="nouveau-plan-form">
                    <section className="dashboard-card">
                        <h2>3. Où l'associer ?</h2>

                        <div className="saisie-champ" style={{ marginBottom: '1rem' }}>
                            <label className="label">Plan</label>
                            <select
                                className="input-field"
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

                        <div className="radio-groupe">
                            <label className={`radio-carte ${modeAssociation === 'bonus' ? 'active' : ''}`}>
                                <input type="radio" name="mode" onChange={() => setModeAssociation('bonus')} />
                                <span>Séance bonus (hors plan)</span>
                            </label>
                            <label className={`radio-carte ${modeAssociation === 'seance' ? 'active' : ''}`}>
                                <input type="radio" name="mode" onChange={() => setModeAssociation('seance')} />
                                <span>Associer à une séance prévue</span>
                            </label>
                        </div>

                        {modeAssociation === 'bonus' && (
                            <div className="saisie-champ" style={{ marginTop: '1rem' }}>
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
                                <div className="saisie-selection" style={{ marginTop: '1rem' }}>
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
                                            value={formNumero}
                                            onChange={(e) => setFormNumero(e.target.value)}
                                        />
                                    </div>
                                </div>

                                {seancePrevue && !seancePrevue.realisee && (
                                    <div className="seance-prevue-recap" style={{ marginTop: '1rem' }}>
                                        <p className="prochaine-titre">{seancePrevue.titre}</p>
                                        <p className="prochaine-description">{seancePrevue.description}</p>
                                    </div>
                                )}
                                {seancePrevue?.realisee && (
                                    <div className="form-message error" style={{ marginTop: '1rem' }}>
                                        <p>Cette séance a déjà été enregistrée.</p>
                                    </div>
                                )}
                            </>
                        )}
                    </section>

                    <section className="dashboard-card">
                        <h2>4. Ressenti</h2>
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
                        </div>

                        <div className="saisie-champ saisie-notes" style={{ marginTop: '1rem' }}>
                            <label className="label">Notes (optionnel)</label>
                            <textarea
                                className="input-field"
                                rows={3}
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                            />
                        </div>
                    </section>

                    <div className="saisie-actions">
                        <button type="submit" className="btn-saisie" disabled={chargementImport}>
                            {chargementImport ? 'Import en cours...' : 'Importer cette activité →'}
                        </button>
                        <button type="button" className="btn-annuler" onClick={() => navigate('/dashboard')}>
                            Annuler
                        </button>
                    </div>
                </form>
            )}
        </main>
    );
}

export default ImporterActivite;