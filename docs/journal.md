# Journal de développement — RunTrack

## Contexte

Projet personnel de Lucas Baretzki, ingénieur en cybersécurité.
Objectif : apprendre le développement web full-stack par la pratique en construisant une vraie application.

---

## Module 1 — Environnement et Git

**Acquis :**
- Installation VS Code, Git, Node.js
- Création et gestion d'un dépôt GitHub
- Cycle `git add` → `git commit` → `git push`
- Différence entre `git add` (staging) et `git commit` (sauvegarde)

**Commandes clés :**
```bash
git init
git add .
git commit -m "message"
git push
```

---

## Module 2 — HTML sémantique

**Acquis :**
- Structure de base d'un document HTML5
- Balises sémantiques : `<header>`, `<nav>`, `<main>`, `<section>`, `<footer>`
- Formulaires : `<form>`, `<input>`, `<label>`, `<select>`
- Attribut `alt` obligatoire sur les images
- Différence `<a>` (navigation) vs `<button>` (action)

**Erreurs corrigées :**
- Utilisation de `<hero>` (balise inexistante) → remplacé par `<section class="hero">`
- `<br>` pour l'espacement → géré en CSS
- Balise `<form>` non fermée

---

## Module 3 — CSS moderne

**Acquis :**
- Box model et `box-sizing: border-box`
- Flexbox (`display: flex`, `justify-content`, `align-items`, `gap`)
- CSS Grid (`grid-template-columns`, `repeat()`, `fr`)
- Variables CSS (`--couleur-primaire`, `var()`)
- Media queries (approche mobile-first)
- `backdrop-filter: blur()` pour effets de verre
- `background-clip: text` pour dégradés sur le texte

**Charte graphique RunTrack :**
```css
--sand:    #dee1c5  /* fond principal */
--orange:  #e3520f  /* accent primaire */
--amber:   #f08418  /* accent secondaire */
--olive:   #8e8448  /* accent tertiaire */
--ink:     #1e1c18  /* texte principal */
```

---

## Module 4 — JavaScript vanilla

**Acquis :**
- `const` / `let` (jamais `var`)
- Arrow functions et template literals
- Manipulation du DOM (`querySelector`, `classList`, `textContent`)
- Événements (`addEventListener`, `event.preventDefault()`)
- Validation de formulaires côté client
- Différence GET vs POST (HTTPS protège les deux, GET expose dans l'URL)

**Sécurité :**
- `textContent` plutôt qu'`innerHTML` (protection XSS)
- Validation client ≠ sécurité (toujours valider côté serveur)
- Regex côté connexion : inutile et révèle la logique interne

---

## Module 5 — Introduction React

**Acquis :**
- Composants fonctionnels et JSX
- `className` au lieu de `class`
- Props et state (`useState`)
- Champs contrôlés (`value` + `onChange`)
- Affichage conditionnel (`&&`, opérateur ternaire)
- `export default` et imports

**Différence clé :**
```javascript
// DOM vanilla — impératif
element.classList.toggle('ouvert')

// React — déclaratif
setMenuOuvert(!menuOuvert)
className={menuOuvert ? 'nav-liens ouvert' : 'nav-liens'}
```

---

## Module 6 & 7 — React Router et Layout

**Acquis :**
- `<BrowserRouter>`, `<Routes>`, `<Route>`
- `<Link>` vs `<a>` (pas de rechargement de page)
- `useNavigate()` pour la navigation programmatique
- `<Outlet />` pour les layouts imbriqués
- Séparation Layout / Pages

**Architecture :**
```
App.jsx → Layout → Outlet → Page active
                 ↳ Sidebar
                 ↳ Footer
```

---

## Module 8 — Node.js et Express

**Acquis :**
- Différence `require` (CommonJS) vs `import` (ES Modules)
- Création d'un serveur Express
- Routes GET/POST/PUT/DELETE
- Middleware `express.json()`
- Variables d'environnement avec `dotenv`
- Test d'API avec Bruno

**Règle importante :**
```
frontend/ (Vite) → import/export (ES Modules)
backend/  (Node) → require/module.exports (CommonJS)
```

---

## Module 9 — PostgreSQL

**Acquis :**
- Modèle relationnel et tables
- Clés primaires, étrangères, contraintes
- SQL : SELECT, INSERT, UPDATE, DELETE, JOIN
- `SERIAL` pour auto-incrémentation
- `ON DELETE CASCADE` et `ON DELETE SET NULL`
- Connexion Node.js via `pg` Pool

**Bonne pratique :**
```javascript
// Jamais de concaténation SQL (injection)
pool.query('SELECT * FROM users WHERE id = ' + id)  // ❌

// Toujours des paramètres préparés
pool.query('SELECT * FROM users WHERE id = $1', [id])  // ✅
```

---

## Module 10 — API REST

**Acquis :**
- Convention REST (méthode HTTP + nom de ressource au pluriel)
- CRUD : Create, Read, Update, Delete
- Codes HTTP : 200, 201, 400, 401, 403, 404, 409, 500
- `COALESCE` SQL pour mise à jour partielle
- Gestion centralisée des erreurs (middleware)

---

## Module 11 — Authentification et sécurité

**Acquis :**
- bcrypt : hashage irréversible, salt automatique, cost factor
- JWT : Header.Payload.Signature, expiration, clé secrète
- Middleware d'authentification
- Protection des routes par utilisateur (403 vs 401)

**Principe fondamental :**
```
401 Unauthorized → pas de token (non authentifié)
403 Forbidden    → token valide mais accès refusé (mauvais utilisateur)
```

---

## Module 12 — Intégration Frontend/Backend

**Acquis :**
- CORS et pourquoi les navigateurs bloquent les requêtes cross-origin
- `fetch()` API et gestion des erreurs HTTP
- Context API React pour état global
- `localStorage` pour persistence du token
- Routes protégées React (`<RouteProtegee />`)
- Déconnexion volontaire vs accès non autorisé

---

## Module 13 — Algorithme de génération des plans

**Acquis :**
- Calcul des zones d'allure depuis un test 5km
- Plans templates séparés dans des fichiers dédiés
- Calcul dynamique de la durée selon l'allure du coureur
- Distinction séances continues vs fractionnées
- Coefficients physiologiques course à pied

---

## Modules 14-17 — Fonctionnalités et déploiement

**Acquis :**
- Suivi des séances avec recalibrage automatique
- Graphiques avec Recharts
- Déploiement Vercel (frontend) + Railway (backend + BDD)
- Variables d'environnement en production
- Migration SQL automatique au démarrage
- Upload Cloudinary via multer + buffer mémoire
- Routing SPA avec `vercel.json`

---

## Difficultés rencontrées et solutions

| Problème | Cause | Solution |
|----------|-------|---------|
| `import` dans Node.js | CommonJS vs ES Modules | Utiliser `require()` |
| `setState` dans `useEffect` | Règle ESLint React | Calcul dérivé ou fonction async |
| CORS en production | Origins différentes | Middleware cors + FRONTEND_URL |
| Durées en décimales | Calcul min + sec/60 | Stocker en secondes entières |
| Routes 404 sur Vercel | SPA routing | `vercel.json` avec rewrites |
| `CloudinaryStorage` not a constructor | Version incompatible | Upload via buffer + upload_stream |

---

## Prochaines étapes envisagées

- [ ] Intégration API Garmin / Strava
- [ ] Génération automatique de plans par IA
- [ ] Plans pour d'autres distances (5km, semi-marathon, marathon)
- [ ] Application mobile (React Native)
- [ ] Mode hors-ligne (PWA)
- [ ] Partage de plans entre utilisateurs