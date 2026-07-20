import { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/useAuth';

function Accueil() {
    const { utilisateur } = useAuth();
    const navigate        = useNavigate();

    useEffect(() => {
        if (utilisateur) navigate('/dashboard', { replace: true });
    }, [utilisateur, navigate]);

    return (
        <>
            <main>
                <section className="hero">
                    <h1>Bienvenue sur <span className="accent">RunTrack</span></h1>
                    <p>
                        RunTrack est votre compagnon idéal pour améliorer vos performances en course à pied.
                        Que vous soyez débutant ou coureur expérimenté, notre plateforme vous offre les outils
                        nécessaires pour suivre vos progrès et atteindre vos objectifs.
                    </p>
                    <Link to="/inscription"><strong>Inscrivez-vous dès maintenant</strong></Link>
                </section>
                <div className="container">
                    <section className="features">
                        <h2>Fonctionnalités principales :</h2>
                        <ul>
                            <li><strong>Test de performance</strong> : Évaluez votre niveau actuel grâce à notre test de 5 ou 10 km.</li>
                            <li><strong>Saisie des séances</strong> : Enregistrez vos séances d'entraînement et suivez vos progrès.</li>
                            <li><strong>Suivi des performances</strong> : Enregistrez vos courses, distances et temps pour suivre vos progrès au fil du temps.</li>
                        </ul>
                        <h2>Comment ça marche ?</h2>
                        <ol>
                            <li><strong>Inscrivez-vous</strong> : Créez un compte sur notre plateforme.</li>
                            <li><strong>Effectuez un test</strong> : Passez notre test de performance pour évaluer votre niveau actuel.</li>
                            <li><strong>Saisissez vos séances</strong> : Enregistrez vos entraînements et suivez vos progrès.</li>
                            <li><strong>Consultez votre suivi</strong> : Accédez à vos statistiques et analysez vos performances.</li>
                        </ol>
                        <h2>Prêt à accélérer ?</h2>
                        <p>
                            Rejoignez des milliers de coureurs qui améliorent leurs performances avec RunTrack. Gratuit. Pour toujours.
                        </p>
                        <Link to="/inscription"><strong>Inscrivez-vous dès maintenant</strong></Link>
                    </section>
                    <section className="logo">
                        <img src="/img/logo_1020x978.png" alt="Logo RunTrack" />
                    </section>
                </div>
            </main>
        </>
    );
}

export default Accueil;