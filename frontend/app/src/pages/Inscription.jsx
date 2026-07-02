import { useState } from 'react';

function Inscription() {
    const [username, setUsername] = useState('');
    const [lastname, setLastname] = useState('');
    const [firstname, setFirstname] = useState('');
    const [sexe, setSexe] = useState('');
    const [age, setAge] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [message, setMessage] = useState({ texte: '', type: '' });
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const usernameRegex = /^[a-zA-Z0-9_]{4,20}$/;
    const lastnameRegex = /^[a-zA-ZÀ-ÿ\s'-]{2,50}$/;
    const firstnameRegex = /^[a-zA-ZÀ-ÿ\s'-]{2,50}$/;
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_\-+={}[\]|\\:;"'<>,.?/~`])[A-Za-z\d!@#$%^&*()_\-+={}[\]|\\:;"'<>,.?/~`]{14,}$/;

    const afficherErreur = (texte) => setMessage({ texte, type: 'error' });
    const afficherSucces = (texte) => setMessage({ texte, type: 'success' });
    const viderMessage = () => {
        setMessage({ texte: '', type: '' });
        setUsername('');
        setLastname('');
        setFirstname('');
        setSexe('');
        setAge('');
        setEmail('');
        setPassword('');
        setConfirmPassword('');
    };

    const handleSubmit = (event) => {
        event.preventDefault();

        if (username === '' || lastname === '' || firstname === '' || sexe === '' || age === '' || email === '' || password === '' || confirmPassword === '') {
            afficherErreur('Veuillez remplir tous les champs.');
            return;
        }

        if (!usernameRegex.test(username)) {
            afficherErreur('Le nom d\'utilisateur doit contenir entre 4 et 20 caractères alphanumériques ou underscores.');
            return;
        }

        if (!lastnameRegex.test(lastname)) {
            afficherErreur('Le nom doit contenir entre 2 et 50 caractères alphabétiques, espaces, apostrophes ou tirets.');
            return;
        }

        if (!firstnameRegex.test(firstname)) {
            afficherErreur('Le prénom doit contenir entre 2 et 50 caractères alphabétiques, espaces, apostrophes ou tirets.');
            return;
        }

        if (!emailRegex.test(email)) {
            afficherErreur('Veuillez entrer une adresse email valide.');
            return;
        }

        if (!passwordRegex.test(password)) {
            afficherErreur('Le mot de passe doit contenir au moins 14 caractères, inclure au moins une majuscule, une minuscule, un chiffre et un caractère spécial.');
            return;
        }

        if (password !== confirmPassword) {
            afficherErreur('Les mots de passe ne correspondent pas.');
            return;
        }

        afficherSucces('Inscription prise en compte !');
    };


    return (
        <>
            <main className="inscription">
                <h1>Inscription</h1>
                <p>Pour accéder à toutes les fonctionnalités de RunTrack, veuillez vous inscrire.</p>

                {message.texte && (
                    <div className={`form-message ${message.type}`}>
                        <p>{message.texte}</p>
                    </div>
                )}

                <form onSubmit={handleSubmit} onReset={viderMessage}>
                    <label htmlFor="username">Nom d'utilisateur :</label>
                    <input
                        className="input-field"
                        type="text"
                        id="username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                    />
                    <label htmlFor="lastname">Nom :</label>
                    <input
                        className="input-field"
                        type="text"
                        id="lastname"
                        value={lastname}
                        onChange={(e) => setLastname(e.target.value)}
                    />
                    <label htmlFor="firstname">Prénom :</label>
                    <input
                        className="input-field"
                        type="text"
                        id="firstname"
                        value={firstname}
                        onChange={(e) => setFirstname(e.target.value)}
                    />
                    <label htmlFor="sexe">Sexe :</label>
                    <select
                        className="input-field"
                        id="sexe"
                        value={sexe}
                        onChange={(e) => setSexe(e.target.value)}
                    >
                        <option value="">Sélectionnez votre sexe</option>
                        <option value="homme">Homme</option>
                        <option value="femme">Femme</option>
                    </select>
                    <label htmlFor="age">Âge :</label>
                    <input
                        className="input-field"
                        type="number"
                        id="age"
                        value={age}
                        onChange={(e) => setAge(e.target.value)}
                    />
                    <label htmlFor="email">Email :</label>
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
                    <label htmlFor="confirmPassword">Confirmer le mot de passe :</label>
                    <input
                        className="input-field"
                        type="password"
                        id="confirmPassword"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                    />

                    <input className="btn" type="submit" value="S'inscrire" />
                    <input className="btn" type="reset" value="Réinitialiser" />
                </form>
            </main>
        </>
    );
}

export default Inscription;