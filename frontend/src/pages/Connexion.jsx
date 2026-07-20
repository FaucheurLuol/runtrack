import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { connecter } from '../api/auth';
import { useAuth } from '../context/useAuth';

function Connexion() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState({ texte: '', type: '' });
    const [chargement, setChargement] = useState(false);

    const { connexion } = useAuth();
    const navigate = useNavigate();

    const afficherErreur = (texte) => setMessage({ texte, type: 'error' });
    const viderMessage = () => setMessage({ texte: '', type: '' });

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (email === '' || password === '') {
            afficherErreur('Veuillez remplir tous les champs.');
            return;
        }

        setChargement(true);

        try {
            const data = await connecter(email, password);
            connexion(data.utilisateur);
            navigate('/dashboard'); // redirige après connexion
        } catch (err) {
            afficherErreur(err.message);
        } finally {
            setChargement(false);
        }
    };

    return (
        <main className="connexion">
            <h1>Connexion</h1>
            <p>Pour accéder à toutes les fonctionnalités de RunTrack, veuillez vous connecter.</p>

            {message.texte && (
                <div className={`form-message ${message.type}`}>
                    <p>{message.texte}</p>
                </div>
            )}

            <form onSubmit={handleSubmit} onReset={viderMessage}>
                <label htmlFor="email">Adresse e-mail :</label>
                <input
                    className="input-field"
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={chargement}
                />

                <label htmlFor="password">Mot de passe :</label>
                <input
                    className="input-field"
                    type="password"
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={chargement}
                />

                <input
                    className="btn"
                    type="submit"
                    value={chargement ? 'Connexion...' : 'Se connecter'}
                    disabled={chargement}
                />
                <input className="btn" type="reset" value="Réinitialiser" disabled={chargement} />
            </form>
        </main>
    );
}

export default Connexion;