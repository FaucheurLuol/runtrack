import { useState } from 'react';

function Connexion() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState({ texte: '', type: '' });

    const afficherErreur = (texte) => setMessage({ texte, type: 'error' });
    const afficherSucces = (texte) => setMessage({ texte, type: 'success' });
    const viderMessage = () => setMessage({ texte: '', type: '' });

    const handleSubmit = (event) => {
        event.preventDefault();

        if (email === '' || password === '') {
            afficherErreur('Veuillez remplir tous les champs.');
            return;
        }

        afficherSucces('Connexion en cours !');
    };

    return (
        <>
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
                    />

                    <label htmlFor="password">Mot de passe :</label>
                    <input
                        className="input-field"
                        type="password"
                        id="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />

                    <input className="btn" type="submit" value="Se connecter" />
                    <input className="btn" type="reset" value="Réinitialiser" />
                </form>
            </main>
        </>
    );
}

export default Connexion;