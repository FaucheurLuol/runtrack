import '../style/style.css';

function MentionsLegales() {
    return (
        <main style={{ maxWidth: '800px', margin: '0 auto', padding: '3rem 2rem' }}>
            <h1>Mentions légales</h1>

            <h2>Éditeur du site</h2>
            <p>
                Lucas Baretzki, éditeur personnel (projet individuel, hors cadre commercial).<br />
                Contact : <a href="mailto:lucas.adrien.baretzki@gmail.com">lucas.adrien.baretzki@gmail.com</a>
            </p>

            <h2>Hébergement</h2>
            <p>
                <strong>Frontend</strong> : Vercel Inc., 440 N Barranca Ave #4133, Covina,
                CA 91723, États-Unis<br />
                <strong>Backend et base de données</strong> : Railway Corporation<br />
                <strong>Stockage des images</strong> : Cloudinary Ltd.
            </p>

            <h2>Propriété intellectuelle</h2>
            <p>
                L'ensemble des éléments constituant RunTrack (structure, textes, logos,
                algorithmes, code source, base de données) est protégé par le droit d'auteur.
                Toute reproduction sans autorisation préalable est interdite.
            </p>

            <h2>Données personnelles</h2>
            <p>
                Voir notre <a href="/confidentialite">Politique de confidentialité</a>.
            </p>

            <h2>Contact</h2>
            <p>
                <a href="mailto:lucas.adrien.baretzki@gmail.com">lucas.adrien.baretzki@gmail.com</a>
            </p>
        </main>
    );
}

export default MentionsLegales;