import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { envoyerDemandePlan } from '../api/demandes';
import '../style/dashboard.css';

const JOURS = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];

function DemandePlan() {
    const navigate = useNavigate();

    const [objectif,   setObjectif]   = useState('10km');
    const [minutes,    setMinutes]    = useState('');
    const [seances,    setSeances]    = useState(2);
    const [semaines,   setSemaines]   = useState(16);
    const [joursChoisis, setJoursChoisis] = useState([]);
    const [jourCourse, setJourCourse] = useState('Dimanche');
    const [publicCible, setPublicCible] = useState('');
    const [particularites, setParticularites] = useState('');

    const [chargement, setChargement] = useState(false);
    const [message,    setMessage]    = useState({ texte: '', type: '' });

    const toggleJour = (jour) => {
        setJoursChoisis(prev =>
            prev.includes(jour) ? prev.filter(j => j !== jour) : [...prev, jour]
        );
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!minutes || joursChoisis.length === 0 || !publicCible) {
            setMessage({ texte: 'Veuillez remplir tous les champs obligatoires.', type: 'error' });
            return;
        }

        setChargement(true);
        try {
            const data = await envoyerDemandePlan({
                objectif,
                temps_objectif_sec:  parseInt(minutes) * 60,
                seances_semaine:     seances,
                nombre_semaines:     semaines,
                jours_entrainement:  joursChoisis.join(', '),
                jour_course:         jourCourse,
                public_cible:        publicCible,
                particularites:      particularites || null,
            });

            if (data.match) {
                setMessage({
                    texte: `Bonne nouvelle — ce plan existe déjà ! Rends-toi sur "Nouveau plan" pour le générer.`,
                    type: 'success'
                });
            } else {
                setMessage({ texte: data.message, type: 'success' });
            }

        } catch (err) {
            setMessage({ texte: err.message, type: 'error' });
        } finally {
            setChargement(false);
        }
    };

    return (
        <main className="dashboard">
            <h1>Demander un plan personnalisé</h1>
            <p className="graphique-description">
                Ta combinaison idéale n'existe pas encore ? Décris ton besoin, on te notifie dès qu'il est prêt.
            </p>

            {message.texte && (
                <div className={`form-message ${message.type}`} style={{ maxWidth: '100%' }}>
                    <p>{message.texte}</p>
                </div>
            )}

            <form onSubmit={handleSubmit} className="nouveau-plan-form">

                <section className="dashboard-card">
                    <h2>Objectif</h2>
                    <div className="radio-groupe">
                        {['5km', '10km', 'semi', 'marathon'].map(obj => (
                            <label key={obj} className={`radio-carte ${objectif === obj ? 'active' : ''}`}>
                                <input type="radio" name="objectif" onChange={() => setObjectif(obj)} />
                                <span>{obj === 'semi' ? 'Semi-marathon' : obj === 'marathon' ? 'Marathon' : obj}</span>
                            </label>
                        ))}
                    </div>

                    <div className="saisie-champ" style={{ marginTop: '1rem' }}>
                        <label className="label">Objectif temps (minutes) *</label>
                        <input
                            className="input-field"
                            type="number"
                            value={minutes}
                            onChange={(e) => setMinutes(e.target.value)}
                            placeholder="ex: 45"
                            style={{ maxWidth: '150px' }}
                        />
                    </div>
                </section>

                <section className="dashboard-card">
                    <h2>Fréquence</h2>
                    <div className="saisie-selection">
                        <div className="saisie-champ">
                            <label className="label">Séances par semaine</label>
                            <input
                                className="input-field"
                                type="number"
                                min="1" max="7"
                                value={seances}
                                onChange={(e) => setSeances(parseInt(e.target.value))}
                            />
                        </div>
                        <div className="saisie-champ">
                            <label className="label">Nombre de semaines</label>
                            <input
                                className="input-field"
                                type="number"
                                min="4" max="52"
                                value={semaines}
                                onChange={(e) => setSemaines(parseInt(e.target.value))}
                            />
                        </div>
                    </div>
                </section>

                <section className="dashboard-card">
                    <h2>Jours d'entraînement *</h2>
                    <div className="radio-groupe">
                        {JOURS.map(jour => (
                            <label key={jour} className={`radio-carte ${joursChoisis.includes(jour) ? 'active' : ''}`}>
                                <input
                                    type="checkbox"
                                    checked={joursChoisis.includes(jour)}
                                    onChange={() => toggleJour(jour)}
                                />
                                <span>{jour}</span>
                            </label>
                        ))}
                    </div>

                    <div className="saisie-champ" style={{ marginTop: '1rem' }}>
                        <label className="label">Jour de course</label>
                        <select
                            className="input-field"
                            value={jourCourse}
                            onChange={(e) => setJourCourse(e.target.value)}
                            style={{ maxWidth: '200px' }}
                        >
                            {JOURS.map(jour => (
                                <option key={jour} value={jour}>{jour}</option>
                            ))}
                        </select>
                    </div>
                </section>

                <section className="dashboard-card">
                    <h2>Contexte</h2>
                    <div className="saisie-champ">
                        <label className="label">Public cible *</label>
                        <textarea
                            className="input-field"
                            rows={2}
                            value={publicCible}
                            onChange={(e) => setPublicCible(e.target.value)}
                            placeholder="Ex: Coureur régulier visant sub 45min sur 10km"
                        />
                    </div>
                    <div className="saisie-champ" style={{ marginTop: '0.75rem' }}>
                        <label className="label">Particularités (optionnel)</label>
                        <textarea
                            className="input-field"
                            rows={2}
                            value={particularites}
                            onChange={(e) => setParticularites(e.target.value)}
                            placeholder="Ex: Accent sur le travail de VMA"
                        />
                    </div>
                </section>

                <div className="saisie-actions">
                    <button type="submit" className="btn-saisie" disabled={chargement}>
                        {chargement ? 'Envoi...' : 'Envoyer ma demande →'}
                    </button>
                    <button type="button" className="btn-annuler" onClick={() => navigate('/nouveau-plan')}>
                        Retour
                    </button>
                </div>
            </form>
        </main>
    );
}

export default DemandePlan;