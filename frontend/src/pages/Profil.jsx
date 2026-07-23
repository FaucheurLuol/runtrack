import { useNavigate } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/useAuth';
import {
    recupererProfil,
    mettreAJourProfil,
    uploadPhoto,
    changerMotDePasse
} from '../api/profil';
import { exporterDonnees, supprimerCompte } from '../api/rgpd';
import '../style/dashboard.css';

const RAISONS = [
    { value: 'perte_poids',  label: 'Perte de poids' },
    { value: 'performance',  label: 'Performance et compétition' },
    { value: 'equilibre',    label: 'Meilleur équilibre de vie' },
    { value: 'sante',        label: 'Santé et bien-être' },
    { value: 'defi',         label: 'Relever un défi personnel' },
    { value: 'sante_mentale', label: 'Santé mentale' },
];

function Profil() {
    const inputPhotoRef = useRef(null);

    const [profil,      setProfil]      = useState(null);
    const [chargement,  setChargement]  = useState(true);
    const [erreur,      setErreur]      = useState(null);

    // Champs profil
    const [nom,           setNom]           = useState('');
    const [prenom,        setPrenom]        = useState('');
    const [age,           setAge]           = useState('');
    const [sexe,          setSexe]          = useState('');
    const [raison,        setRaison]        = useState('');
    const [objectifPerso, setObjectifPerso] = useState('');
    const [fcMaxPerso, setFcMaxPerso]       = useState('');

    // Mot de passe
    const [ancienMdp,  setAncienMdp]  = useState('');
    const [nouveauMdp, setNouveauMdp] = useState('');
    const [confirmMdp, setConfirmMdp] = useState('');

    // Messages
    const [msgProfil, setMsgProfil] = useState({ texte: '', type: '' });
    const [msgPhoto,  setMsgPhoto]  = useState({ texte: '', type: '' });
    const [msgMdp,    setMsgMdp]    = useState({ texte: '', type: '' });

    const [uploadEnCours, setUploadEnCours] = useState(false);

    // RGPD
    const navigate = useNavigate();
    const [afficherSuppression, setAfficherSuppression] = useState(false);
    const [motDePasseSuppression, setMotDePasseSuppression] = useState('');
    const [msgRgpd, setMsgRgpd] = useState({ texte: '', type: '' });

    const { mettreAJourUtilisateur } = useAuth();
    const { deconnexion } = useAuth();

    useEffect(() => {
        const charger = async () => {
            try {
                const data = await recupererProfil();
                setProfil(data);
                setNom(data.nom                      || '');
                setPrenom(data.prenom                || '');
                setAge(data.age                      || '');
                setSexe(data.sexe                    || '');
                setRaison(data.raison                || '');
                setObjectifPerso(data.objectif_perso || '');
                setFcMaxPerso(data.fc_max_perso      || '');
            } catch (err) {
                setErreur(err.message);
            } finally {
                setChargement(false);
            }
        };
        charger();
    }, []);

    const handleSauvegarderProfil = async (e) => {
        e.preventDefault();
        try {
            const data = await mettreAJourProfil({
                nom, prenom, age: parseInt(age), sexe, raison, 
                objectif_perso: objectifPerso, 
                fc_max_perso: fcMaxPerso ? parseInt(fcMaxPerso) : null,
            });
            setProfil(prev => ({ ...prev, ...data.utilisateur }));
            setMsgProfil({ texte: 'Profil mis à jour avec succès !', type: 'success' });
        } catch (err) {
            setMsgProfil({ texte: err.message, type: 'error' });
        }
    };

    const handlePhoto = async (e) => {
        const fichier = e.target.files[0];
        if (!fichier) return;

        setUploadEnCours(true);
        try {
            const data = await uploadPhoto(fichier);
            setProfil(prev => ({ ...prev, photo_url: data.photo_url }));
            mettreAJourUtilisateur({ photo_url: data.photo_url }); // ← ajoute cette ligne
            setMsgPhoto({ texte: 'Photo mise à jour !', type: 'success' });
        } catch (err) {
            setMsgPhoto({ texte: err.message, type: 'error' });
        } finally {
            setUploadEnCours(false);
        }
    };

    const handleMdp = async (e) => {
        e.preventDefault();
        if (nouveauMdp !== confirmMdp) {
            setMsgMdp({ texte: 'Les mots de passe ne correspondent pas.', type: 'error' });
            return;
        }
        try {
            await changerMotDePasse(ancienMdp, nouveauMdp);
            setMsgMdp({ texte: 'Mot de passe mis à jour !', type: 'success' });
            setAncienMdp('');
            setNouveauMdp('');
            setConfirmMdp('');
        } catch (err) {
            setMsgMdp({ texte: err.message, type: 'error' });
        }
    };

    const handleExporterDonnees = async () => {
        try {
            const blob = await exporterDonnees();
            const url  = URL.createObjectURL(blob);
            const lien = document.createElement('a');
            lien.href = url;
            lien.download = 'mes-donnees-runtrack.json';
            document.body.appendChild(lien);
            lien.click();
            document.body.removeChild(lien);
            URL.revokeObjectURL(url);
        } catch (err) {
            setMsgRgpd({ texte: err.message, type: 'error' });
        }
    };

    const handleSupprimerCompte = async (e) => {
        e.preventDefault();
        if (!motDePasseSuppression) {
            setMsgRgpd({ texte: 'Mot de passe requis pour confirmer.', type: 'error' });
            return;
        }
        try {
            await supprimerCompte(motDePasseSuppression);
            await deconnexion();
            navigate('/');
        } catch (err) {
            setMsgRgpd({ texte: err.message, type: 'error' });
        }
    };

    if (chargement) return <main className="dashboard"><p>Chargement...</p></main>;
    if (erreur)     return <main className="dashboard"><p>Erreur : {erreur}</p></main>;

    return (
        <main className="dashboard">
            <h1>Mon profil</h1>

            {/* ── Photo + identité ─────────────────────────────── */}
            <section className="dashboard-card profil-header">
                <div className="profil-avatar-bloc">
                    <div
                        className="profil-avatar"
                        onClick={() => inputPhotoRef.current.click()}
                        title="Changer la photo"
                    >
                        {profil.photo_url ? (
                            <img src={profil.photo_url} alt="Photo de profil" />
                        ) : (
                            <span className="profil-avatar-initiales">
                                {profil.prenom?.[0]}{profil.nom?.[0]}
                            </span>
                        )}
                        <div className="profil-avatar-overlay">
                            {uploadEnCours ? '⏳' : '📷'}
                        </div>
                    </div>
                    <input
                        ref={inputPhotoRef}
                        type="file"
                        accept="image/*"
                        style={{ display: 'none' }}
                        onChange={handlePhoto}
                    />
                    <div className="profil-identite">
                        <strong>{profil.username}</strong>
                        <p>Membre depuis le {new Date(profil.created_at).toLocaleDateString('fr-FR')}</p>
                        <p>{profil.email}</p>
                    </div>
                </div>
                {msgPhoto.texte && (
                    <div className={`form-message ${msgPhoto.type}`} style={{ maxWidth: '100%', marginTop: '0.75rem' }}>
                        <p>{msgPhoto.texte}</p>
                    </div>
                )}
            </section>

            {/* ── Informations personnelles ─────────────────────── */}
            <section className="dashboard-card">
                <h2>Informations personnelles</h2>
                <form onSubmit={handleSauvegarderProfil} className="profil-form">
                    <div className="saisie-selection">
                        <div className="saisie-champ">
                            <label className="label">Nom</label>
                            <input className="input-field" type="text" value={nom} onChange={e => setNom(e.target.value)} />
                        </div>
                        <div className="saisie-champ">
                            <label className="label">Prénom</label>
                            <input className="input-field" type="text" value={prenom} onChange={e => setPrenom(e.target.value)} />
                        </div>
                    </div>
                    <div className="saisie-selection">
                        <div className="saisie-champ">
                            <label className="label">Âge</label>
                            <input className="input-field" type="number" value={age} onChange={e => setAge(e.target.value)} />
                        </div>
                        <div className="saisie-champ">
                            <label className="label">Sexe</label>
                            <select className="input-field" value={sexe} onChange={e => setSexe(e.target.value)}>
                                <option value="">Sélectionner</option>
                                <option value="homme">Homme</option>
                                <option value="femme">Femme</option>
                                <option value="autre">Autre</option>
                            </select>
                        </div>
                    </div>

                    <h2>Ma course</h2>
                    <div className="saisie-champ">
                        <label className="label">Pourquoi je cours</label>
                        <select className="input-field" value={raison} onChange={e => setRaison(e.target.value)}>
                            <option value="">Sélectionner une raison</option>
                            {RAISONS.map(r => (
                                <option key={r.value} value={r.value}>{r.label}</option>
                            ))}
                        </select>
                    </div>
                    <div className="saisie-champ saisie-notes">
                        <label className="label">Mon objectif personnel</label>
                        <textarea
                            className="input-field"
                            rows={3}
                            value={objectifPerso}
                            onChange={e => setObjectifPerso(e.target.value)}
                            placeholder="Ex: Finir mon premier 10km en moins de 50 minutes d'ici décembre..."
                        />
                    </div>
                    <div className="saisie-champ" style={{ marginTop: '0.75rem' }}>
                        <label className="label">FC max (optionnel — sinon estimée depuis ton âge)</label>
                        <input
                            className="input-field"
                            type="number"
                            value={fcMaxPerso}
                            onChange={(e) => setFcMaxPerso(e.target.value)}
                            placeholder="ex: 190"
                            style={{ maxWidth: '150px' }}
                        />
                    </div>

                    {msgProfil.texte && (
                        <div className={`form-message ${msgProfil.type}`} style={{ maxWidth: '100%' }}>
                            <p>{msgProfil.texte}</p>
                        </div>
                    )}

                    <div className="saisie-actions">
                        <button type="submit" className="btn-saisie">
                            Enregistrer les modifications →
                        </button>
                    </div>
                </form>
            </section>

            {/* ── Mot de passe ─────────────────────────────────── */}
            <section className="dashboard-card">
                <h2>Changer le mot de passe</h2>
                <form onSubmit={handleMdp} className="profil-form">
                    <div className="saisie-champ">
                        <label className="label">Ancien mot de passe</label>
                        <input
                            className="input-field"
                            type="password"
                            value={ancienMdp}
                            onChange={e => setAncienMdp(e.target.value)}
                        />
                    </div>
                    <div className="saisie-selection">
                        <div className="saisie-champ">
                            <label className="label">Nouveau mot de passe</label>
                            <input
                                className="input-field"
                                type="password"
                                value={nouveauMdp}
                                onChange={e => setNouveauMdp(e.target.value)}
                                placeholder="14 caractères minimum"
                            />
                        </div>
                        <div className="saisie-champ">
                            <label className="label">Confirmer</label>
                            <input
                                className="input-field"
                                type="password"
                                value={confirmMdp}
                                onChange={e => setConfirmMdp(e.target.value)}
                            />
                        </div>
                    </div>

                    {msgMdp.texte && (
                        <div className={`form-message ${msgMdp.type}`} style={{ maxWidth: '100%' }}>
                            <p>{msgMdp.texte}</p>
                        </div>
                    )}

                    <div className="saisie-actions">
                        <button type="submit" className="btn-saisie">
                            Changer le mot de passe →
                        </button>
                    </div>
                </form>
            </section>
            
            {/* ── RGPD ─────────────────────────────────────────── */}
            <section className="dashboard-card">
                <h2>Mes données</h2>

                {msgRgpd.texte && (
                    <div className={`form-message ${msgRgpd.type}`} style={{ maxWidth: '100%' }}>
                        <p>{msgRgpd.texte}</p>
                    </div>
                )}

                <p className="graphique-description">
                    Conformément au RGPD, tu peux exporter toutes tes données personnelles
                    ou supprimer définitivement ton compte à tout moment.
                </p>

                <div className="saisie-actions" style={{ marginTop: '1rem' }}>
                    <button type="button" className="btn-annuler" onClick={handleExporterDonnees}>
                        Exporter mes données →
                    </button>
                </div>

                {!afficherSuppression ? (
                    <button
                        type="button"
                        className="btn-annuler"
                        style={{ marginTop: '1rem', borderColor: 'var(--orange)', color: 'var(--orange)' }}
                        onClick={() => setAfficherSuppression(true)}
                    >
                        Supprimer mon compte
                    </button>
                ) : (
                    <form onSubmit={handleSupprimerCompte} style={{ marginTop: '1rem' }}>
                        <div className="form-message error" style={{ maxWidth: '100%' }}>
                            <p>Cette action est irréversible. Toutes tes données seront définitivement supprimées.</p>
                        </div>
                        <div className="saisie-champ" style={{ marginTop: '0.75rem' }}>
                            <label className="label">Confirme avec ton mot de passe</label>
                            <input
                                className="input-field"
                                type="password"
                                value={motDePasseSuppression}
                                onChange={(e) => setMotDePasseSuppression(e.target.value)}
                            />
                        </div>
                        <div className="saisie-actions" style={{ marginTop: '0.75rem' }}>
                            <button type="submit" className="btn-saisie" style={{ background: 'var(--orange)' }}>
                                Confirmer la suppression définitive
                            </button>
                            <button type="button" className="btn-annuler" onClick={() => setAfficherSuppression(false)}>
                                Annuler
                            </button>
                        </div>
                    </form>
                )}
            </section>
        </main>
    );
}

export default Profil;