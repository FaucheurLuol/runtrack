const plan_debutant_1s = [
    // PHASE ENDURANCE (S1-S7)
    { s:1,  n:1, phase:'Endurance',     type:'normal', title:'Endurance fondamentale',      dist:4,    duree_travail:null, allure:'easy',      detail:"Activer les filières aérobies, habituer les tendons à la course. Marche 2 min toutes les 8 min si besoin.",    dayOff:4 },
    { s:2,  n:1, phase:'Endurance',     type:'normal', title:'Endurance fondamentale',      dist:4.5,  duree_travail:null, allure:'easy',      detail:"Consolider l'adaptation tendineuse et musculaire. Marche 2 min si besoin.",                                    dayOff:4 },
    { s:3,  n:1, phase:'Endurance',     type:'normal', title:'Endurance + accélérations',   dist:null, duree_travail:3,    allure:'aerobic',   detail:"Introduction des variations d'allure. 3x1 min légèrement plus vite. 2 min marche entre accélérations.",        dayOff:4 },
    { s:4,  n:1, phase:'Récupération',  type:'normal', title:'Semaine allégée',             dist:3,    duree_travail:null, allure:'easy',      detail:"Consolidation et régénération avant la progression. Aucune contrainte.",                                       dayOff:4 },
    { s:5,  n:1, phase:'Endurance',     type:'normal', title:'Endurance continue',          dist:5,    duree_travail:null, allure:'easy',      detail:"Premier 5 km continu - seuil psychologique. Marche 2 min si km 4 difficile.",                                  dayOff:4 },
    { s:6,  n:1, phase:'Endurance',     type:'normal', title:'Endurance + fractionné doux', dist:null, duree_travail:8,    allure:'race',      detail:"Introduction de l'allure cible 10 km. 4x2 min allure race. 2 min EF entre blocs.",                             dayOff:4 },
    { s:7,  n:1, phase:'Endurance',     type:'normal', title:'Sortie longue',               dist:5.5,  duree_travail:null, allure:'easy',      detail:"Extension de la durée d'effort. Marche si nécessaire km 5+.",                                                  dayOff:4 },

    // TEST 1 (S8)
    { s:8,  n:1, phase:'Test',          type:'test',   title:'TEST 5 km n°1',               dist:5,    duree_travail:null, allure:'race',      detail:"Effort soutenu 85% - mesurer chrono. 10 min marche retour au calme. Recalibrage des zones.",                   dayOff:4 },

    // PHASE DÉVELOPPEMENT 1 (S9-S11)
    { s:9,  n:1, phase:'Développement', type:'normal', title:'Endurance fondamentale',      dist:5.5,  duree_travail:null, allure:'aerobic',   detail:"Continuité d'endurance après test. Allure légèrement soutenue. Marche si besoin.",                             dayOff:4 },
    { s:10, n:1, phase:'Développement', type:'normal', title:'Sortie longue progressive',   dist:6,    duree_travail:null, allure:'easy',      detail:"Allonger la durée, introduire l'allure cible. 15 min finaux à allure race.",                                   dayOff:4 },
    { s:11, n:1, phase:'Récupération',  type:'normal', title:'Semaine allégée',             dist:3.5,  duree_travail:null, allure:'easy',      detail:"Récupération active, prévention blessures. Totale liberté.",                                                   dayOff:4 },

    // PHASE DÉVELOPPEMENT 2 (S12-S13)
    { s:12, n:1, phase:'Développement', type:'normal', title:'Sortie longue + fractionné',  dist:null, duree_travail:10,   allure:'aerobic',   detail:"Stimulation aérobie sans surcharger le volume. 5x2 min allure race. 90s EF entre blocs.",                      dayOff:4 },
    { s:13, n:1, phase:'Développement', type:'normal', title:'Sortie longue',               dist:7,    duree_travail:null, allure:'easy',      detail:"Franchir le cap des 7 km. Marche si km 6+.",                                                                   dayOff:4 },

    // TEST 2 (S14)
    { s:14, n:1, phase:'Test',          type:'test',   title:'TEST 5 km n°2',               dist:5,    duree_travail:null, allure:'race',      detail:"Mesure finale avant taper. Effort maximal contrôlé. 10 min retour au calme.",                                  dayOff:4 },

    // PHASE SPÉCIFIQUE (S15-S16)
    { s:15, n:1, phase:'Spécifique',    type:'normal', title:'Sortie longue',               dist:8,    duree_travail:null, allure:'easy',      detail:"Simulation partielle du 10 km. 20 min finaux à allure race. Marche 2 min si besoin.",                          dayOff:4 },
    { s:16, n:1, phase:'Spécifique',    type:'normal', title:'Sortie spécifique 10 km',     dist:null, duree_travail:30,   allure:'threshold', detail:"Simulation proche-course. Allure seuil 60% + EF début/fin. Marche libre.",                                     dayOff:4 },

    // PHASE AFFÛTAGE (S17-S19)
    { s:17, n:1, phase:'Affûtage',      type:'normal', title:'Taper - sortie légère',       dist:4.5,  duree_travail:null, allure:'easy',      detail:"Affûtage : repos musculaire. Totale liberté.",                                                                 dayOff:4 },
    { s:18, n:1, phase:'Affûtage',      type:'normal', title:'Sortie allure course',        dist:3,    duree_travail:null, allure:'race',      detail:"Échauffement 10'. 3x1 km à allure course. Récup 3'. Retour calme 10'.",                                        dayOff:4 },
    { s:19, n:1, phase:'Affûtage',      type:'normal', title:'Activation pré-course',       dist:2.5,  duree_travail:null, allure:'easy',      detail:"Activer sans fatiguer - J-4. Très légère + 3x30s vives.",                                                      dayOff:4 },

    // COURSE (S20)
    { s:20, n:1, phase:'Course',        type:'race',   title:'COURSE 10 km',                dist:10,   duree_travail:null, allure:'race',      detail:"Repos total la veille. ECha 15'. Partir à allure cible, ajuster au km 5.",                                     dayOff:6 },
];

module.exports = plan_debutant_1s;