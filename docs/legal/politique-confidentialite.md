# Politique de confidentialité — RunTrack

**Dernière mise à jour : 23 juillet 2026**

## 1. Responsable du traitement

Le responsable du traitement des données collectées via RunTrack est :

**Lucas Baretzki**, personne physique, exploitant l'application RunTrack à titre personnel.
Contact : [ton email de contact]

## 2. Données collectées

RunTrack collecte les données suivantes, strictement nécessaires au fonctionnement du service :

### Données d'identification
- Nom, prénom, nom d'utilisateur
- Adresse email
- Mot de passe (stocké sous forme hachée, jamais en clair)
- Sexe, âge (optionnel)
- Photo de profil (optionnelle, hébergée via Cloudinary)

### Données de performance sportive
- Plans d'entraînement générés
- Séances réalisées (durée, distance, allure, ressenti, notes)
- Données physiologiques optionnelles (fréquence cardiaque, cadence) issues
  de fichiers `.fit`/`.gpx` importés volontairement par l'utilisateur
- Objectifs personnels et motivations déclarées

### Données techniques
- Adresse IP (pour la sécurité et la limitation de débit des requêtes)
- Cookies d'authentification (strictement nécessaires, voir section 6)

## 3. Finalités du traitement

Ces données sont utilisées exclusivement pour :
- Créer et gérer votre compte utilisateur
- Générer des plans d'entraînement personnalisés
- Calculer vos statistiques de progression
- Assurer la sécurité de votre compte (authentification)
- Vous notifier en cas de demande de nouveau plan (email)

**RunTrack ne vend, ne loue et ne partage jamais vos données avec des tiers
à des fins commerciales ou publicitaires.**

## 4. Base légale du traitement

Le traitement de vos données repose sur :
- **L'exécution du contrat** : la fourniture du service RunTrack nécessite
  le traitement de vos données de performance et d'identification
- **Votre consentement explicite** : pour les données optionnelles
  (photo, FC max, objectifs personnels)

## 5. Durée de conservation

Vos données sont conservées tant que votre compte est actif. Vous pouvez
demander la suppression définitive de votre compte et de toutes les
données associées à tout moment depuis la page Profil.

## 6. Cookies

RunTrack utilise un unique cookie **strictement nécessaire** au
fonctionnement du service : un cookie d'authentification (httpOnly,
sécurisé) qui permet de maintenir votre session connectée. Ce cookie
ne nécessite pas de consentement préalable car il est indispensable
au fonctionnement du service (exemption légale prévue par la
réglementation ePrivacy).

RunTrack n'utilise aucun cookie de tracking, d'analyse comportementale
ou publicitaire.

## 7. Hébergement et sous-traitants

Vos données sont hébergées et traitées par les prestataires suivants :

| Service | Fonction | Localisation |
|---------|----------|--------------|
| Railway | Hébergement backend et base de données | Union Européenne / États-Unis |
| Vercel | Hébergement frontend | Réseau mondial (CDN) |
| Cloudinary | Stockage des photos de profil | États-Unis |
| Resend | Envoi d'emails transactionnels | États-Unis |
| Sentry | Monitoring des erreurs techniques | Union Européenne |

Ces prestataires n'ont accès qu'aux données strictement nécessaires
à l'exécution de leur service et sont soumis à leurs propres politiques
de confidentialité.

## 8. Vos droits (RGPD)

Conformément au Règlement Général sur la Protection des Données (RGPD),
vous disposez des droits suivants :

- **Droit d'accès** : consultez et exportez l'intégralité de vos données
  personnelles depuis la page Profil ("Exporter mes données")
- **Droit de rectification** : modifiez vos informations à tout moment
  depuis la page Profil
- **Droit à l'effacement** : supprimez définitivement votre compte et
  toutes les données associées depuis la page Profil
- **Droit à la portabilité** : l'export de vos données est fourni au
  format JSON, structuré et réutilisable
- **Droit d'opposition** : contactez-nous pour toute demande spécifique

Pour exercer ces droits, vous pouvez également nous contacter directement
à [ton email de contact].

## 9. Sécurité

RunTrack met en œuvre les mesures de sécurité suivantes :
- Mots de passe hachés (bcrypt)
- Authentification par cookies httpOnly sécurisés
- Chiffrement des communications (HTTPS/TLS)
- Limitation du taux de requêtes (rate limiting)
- Validation stricte des données côté serveur
- Surveillance des erreurs et incidents (Sentry)

## 10. Modifications de cette politique

Cette politique peut être mise à jour périodiquement. Toute modification
substantielle vous sera communiquée par email ou notification dans
l'application.

## 11. Contact

Pour toute question relative à cette politique de confidentialité ou à
vos données personnelles, contactez : [ton email de contact]

Vous disposez également du droit d'introduire une réclamation auprès de
la Commission Nationale de l'Informatique et des Libertés (CNIL) :
[www.cnil.fr](https://www.cnil.fr)
