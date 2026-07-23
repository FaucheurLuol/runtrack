import '../style/style.css';

function PolitiqueConfidentialite() {
    return (
        <main style={{ maxWidth: '800px', margin: '0 auto', padding: '3rem 2rem' }}>
            <h1>Politique de confidentialité</h1>
            <p style={{ color: 'var(--ink-muted)', marginBottom: '2rem' }}>
                Dernière mise à jour : 23 juillet 2026
            </p>

            <h2>1. Responsable du traitement</h2>
            <p>
                Le responsable du traitement des données collectées via RunTrack est
                <strong> Lucas Baretzki</strong>, personne physique, exploitant l'application
                RunTrack à titre personnel.
            </p>

            <h2>2. Données collectées</h2>
            <p><strong>Données d'identification</strong> : nom, prénom, nom d'utilisateur, email,
            mot de passe (haché), sexe, âge (optionnel), photo de profil (optionnelle).</p>
            <p><strong>Données de performance sportive</strong> : plans d'entraînement, séances
            réalisées (durée, distance, allure, ressenti, notes), données physiologiques
            optionnelles issues de fichiers importés (fréquence cardiaque, cadence).</p>
            <p><strong>Données techniques</strong> : adresse IP, cookie d'authentification.</p>

            <h2>3. Finalités du traitement</h2>
            <p>
                Ces données sont utilisées exclusivement pour créer et gérer votre compte,
                générer des plans d'entraînement personnalisés, calculer vos statistiques
                de progression, assurer la sécurité de votre compte et vous notifier en cas
                de demande de nouveau plan.
            </p>
            <p><strong>RunTrack ne vend, ne loue et ne partage jamais vos données avec des
            tiers à des fins commerciales ou publicitaires.</strong></p>

            <h2>4. Cookies</h2>
            <p>
                RunTrack utilise un unique cookie strictement nécessaire au fonctionnement
                du service (authentification, httpOnly, sécurisé). Aucun cookie de tracking,
                d'analyse comportementale ou publicitaire n'est utilisé.
            </p>

            <h2>5. Hébergement et sous-traitants</h2>
            <p>
                Vos données sont hébergées par Railway (backend et base de données), Vercel
                (frontend), Cloudinary (photos), Resend (emails) et Sentry (monitoring).
            </p>

            <h2>6. Vos droits (RGPD)</h2>
            <ul>
                <li><strong>Droit d'accès</strong> : exportez l'intégralité de vos données depuis la page Profil</li>
                <li><strong>Droit de rectification</strong> : modifiez vos informations depuis la page Profil</li>
                <li><strong>Droit à l'effacement</strong> : supprimez définitivement votre compte depuis la page Profil</li>
                <li><strong>Droit à la portabilité</strong> : export au format JSON structuré</li>
            </ul>

            <h2>7. Sécurité</h2>
            <p>
                Mots de passe hachés (bcrypt), cookies httpOnly sécurisés, chiffrement HTTPS/TLS,
                limitation du taux de requêtes, validation stricte des données, surveillance
                des incidents.
            </p>

            <h2>8. Contact</h2>
            <p>
                Pour toute question : <a href="mailto:lucas.adrien.baretzki@gmail.com">lucas.adrien.baretzki@gmail.com</a>
            </p>
            <p>
                Vous pouvez introduire une réclamation auprès de la CNIL :
                {' '}<a href="https://www.cnil.fr" target="_blank" rel="noopener noreferrer">www.cnil.fr</a>
            </p>
        </main>
    );
}

export default PolitiqueConfidentialite;