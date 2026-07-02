const formulaire = document.querySelector('form');
const messageDiv = document.querySelector('.form-message');
const burger = document.querySelector('.menu-burger');
const navLiens = document.querySelector('.nav-liens');

burger.addEventListener('click', () => {
    navLiens.classList.toggle('ouvert');
});

function afficherErreur(message) {
    messageDiv.innerHTML = ''; // On vide le contenu précédent
    messageDiv.classList.remove('hidden', 'success');
    messageDiv.classList.add('error');
    const p = document.createElement('p');
    p.textContent = message;
    messageDiv.appendChild(p);
}

function viderMessage() {
    messageDiv.innerHTML = '';
    messageDiv.classList.remove('error');
    messageDiv.classList.add('hidden');
}

formulaire.addEventListener('reset', function(event) {
    viderMessage();
});

formulaire.addEventListener('submit', function(event) {
    event.preventDefault(); // Empêche l'envoi du formulaire

    const password = document.getElementById('password').value;
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_\-+={}[\]|\\:;"'<>,.?/~`])[A-Za-z\d!@#$%^&*()_\-+={}[\]|\\:;"'<>,.?/~`]{14,}$/; // Expression régulière pour valider le mot de passe
    const confirmPassword = document.getElementById('confirm_password').value;
    const email = document.querySelector('#email').value;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // Expression régulière pour valider l'email
    const username = document.querySelector('#username').value;
    const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/; // Expression régulière pour valider le nom d'utilisateur
    const lastname = document.querySelector('#nom').value;
    const lastnameRegex = /^[a-zA-ZÀ-ÿ\s'-]{2,50}$/; // Expression régulière pour valider le nom
    const firstname = document.querySelector('#prenom').value;
    const firstnameRegex = /^[a-zA-ZÀ-ÿ\s'-]{2,50}$/; // Expression régulière pour valider le prénom
    const age= document.querySelector('#age').value;
    const ageRegex = /^\d+$/; // Expression régulière pour valider l'âge
    const sexe = document.querySelector('#sexe').value;

    // Validation du formulaire
    if (!emailRegex.test(email)) {
        afficherErreur('Veuillez entrer une adresse e-mail valide.');
        return;
    }

    if (!usernameRegex.test(username)) {
        afficherErreur("Le nom d'utilisateur doit comporter entre 3 et 20 caractères et ne contenir que des lettres, des chiffres et des underscores.");
        return;
    }

    if (!lastnameRegex.test(lastname)) {
        afficherErreur('Veuillez entrer un nom valide.');
        return;
    }

    if (!firstnameRegex.test(firstname)) {
        afficherErreur('Veuillez entrer un prénom valide.');
        return;
    }

    if (!ageRegex.test(age) || age < 0 || age > 120) {
        afficherErreur('Veuillez entrer un âge valide.');
        return;
    }

    if (sexe === '') {
        afficherErreur('Veuillez sélectionner votre sexe.');
        return;
    }

    if (!passwordRegex.test(password)) {
        afficherErreur('Le mot de passe doit contenir au moins 14 caractères, une majuscule, une minuscule, un chiffre et un caractère spécial.');
    return;
    }

    if (password !== confirmPassword) {
        afficherErreur('Les mots de passe ne correspondent pas.');
        return;
    }

    // Si toutes les validations passent
    viderMessage(); // On efface une éventuelle erreur précédente
    console.log('Formulaire valide, voici les données :');
    console.log({
        email,
        username,
        lastname,
        firstname,
        age,
        sexe,
        password
    });
});