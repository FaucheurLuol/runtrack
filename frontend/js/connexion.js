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

function afficherAccept(message) {
    messageDiv.innerHTML = ''; // On vide le contenu précédent
    messageDiv.classList.remove('hidden', 'error');
    messageDiv.classList.add('success');
    const p = document.createElement('p');
    p.textContent = message;
    messageDiv.appendChild(p);
}

function viderMessage() {
    messageDiv.innerHTML = '';
}

formulaire.addEventListener('reset', function(event) {
    viderMessage();
});

formulaire.addEventListener('submit', function(event) {
    event.preventDefault(); // Empêche l'envoi du formulaire

    const password = document.getElementById('password').value;
    const email = document.querySelector('#email').value;
    
    // Validation du formulaire
    if (email === "" || password === "") {
        afficherErreur("Veuillez remplir tous les champs.");
        return;
    }

    // Si toutes les validations passent
    afficherAccept("Connexion en cours !");
});