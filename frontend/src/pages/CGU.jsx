import '../style/style.css';

function CGU() {
    return (
        <main style={{ maxWidth: '800px', margin: '0 auto', padding: '3rem 2rem' }}>
            <h1>Conditions Générales d'Utilisation</h1>
            <p style={{ color: 'var(--ink-muted)', marginBottom: '2rem' }}>
                Dernière mise à jour : 23 juillet 2026
            </p>

            <h2>1. Objet</h2>
            <p>
                Les présentes CGU régissent l'accès et l'utilisation de RunTrack, édité par
                Lucas Baretzki. En créant un compte, vous acceptez sans réserve les présentes CGU.
            </p>

            <h2>2. Description du service</h2>
            <p>
                RunTrack est une plateforme de génération de plans d'entraînement de course
                à pied personnalisés, de suivi des séances et d'analyse statistique.
            </p>

            <h2>3. Avertissement santé</h2>
            <p>
                <strong>Les plans générés par RunTrack sont établis à partir d'un algorithme
                basé sur des formules physiologiques standards. Ils ne remplacent en aucun
                cas l'avis d'un professionnel de santé ou d'un coach sportif qualifié.</strong>
            </p>
            <p>
                Vous reconnaissez pratiquer la course à pied sous votre seule responsabilité
                et qu'il vous appartient de consulter un médecin avant d'entamer tout programme
                d'entraînement, en particulier en cas d'antécédent médical.
            </p>

            <h2>4. Compte utilisateur</h2>
            <p>
                Vous vous engagez à fournir des informations exactes. Vous pouvez supprimer
                votre compte à tout moment depuis la page Profil — cette action est définitive.
            </p>

            <h2>5. Propriété intellectuelle</h2>
            <p>
                L'algorithme, le code source, le design et les contenus de RunTrack sont la
                propriété exclusive de Lucas Baretzki. Vos données personnelles et sportives
                restent votre propriété.
            </p>

            <h2>6. Disponibilité du service</h2>
            <p>
                RunTrack est un projet en développement continu, fourni gratuitement.
                La disponibilité continue n'est pas garantie.
            </p>

            <h2>7. Limitation de responsabilité</h2>
            <p>
                RunTrack est fourni "en l'état". L'éditeur ne pourra être tenu responsable
                des interruptions du service, de la perte de données ou de l'usage fait des
                recommandations d'entraînement.
            </p>

            <h2>8. Droit applicable</h2>
            <p>
                Les présentes CGU sont soumises au droit français.
            </p>

            <h2>9. Contact</h2>
            <p>
                Pour toute question : <a href="mailto:lucas.adrien.baretzki@gmail.com">lucas.adrien.baretzki@gmail.com</a>
            </p>
        </main>
    );
}

export default CGU;