const plan_intermediaire_10km_3s = [
  // ===================== SEMAINE 1 - Endurance =====================
  { s: 1, n: 1, phase: "Endurance", type: "normal", title: "Footing endurance fondamentale", dist: 6, duree_travail: null, allure: "easy", detail: "Footing en endurance fondamentale, sensations très légères, respiration facile. Terminer par 4x20sec accélérations progressives sur ligne droite avec récupération marchée.", dayOff: 2 },
  { s: 1, n: 2, phase: "Endurance", type: "normal", title: "Footing aérobie", dist: 7, duree_travail: null, allure: "aerobic", detail: "Footing continu à allure aérobie stable, sur terrain plat ou vallonné léger. Bien s'hydrater avant et après.", dayOff: 4 },
  { s: 1, n: 3, phase: "Endurance", type: "normal", title: "Sortie longue", dist: 9, duree_travail: null, allure: "easy", detail: "Sortie longue à allure easy, régulière du début à la fin. Objectif : habituer le corps au volume, ne pas chercher la performance.", dayOff: 6 },

  // ===================== SEMAINE 2 - Endurance =====================
  { s: 2, n: 1, phase: "Endurance", type: "normal", title: "Footing endurance fondamentale", dist: 6, duree_travail: null, allure: "easy", detail: "Footing easy avec 4x20sec accélérations en fin de séance pour réveiller les jambes sans créer de fatigue.", dayOff: 2 },
  { s: 2, n: 2, phase: "Endurance", type: "normal", title: "Footing aérobie + lignes droites", dist: 8, duree_travail: null, allure: "aerobic", detail: "Footing aérobie continu. Ajouter 5x15sec lignes droites en fin de parcours, retour au calme en marchant.", dayOff: 4 },
  { s: 2, n: 3, phase: "Endurance", type: "normal", title: "Sortie longue", dist: 10, duree_travail: null, allure: "easy", detail: "Sortie longue à allure easy. Fractionner l'hydratation toutes les 30 minutes si besoin.", dayOff: 6 },

  // ===================== SEMAINE 3 - Endurance =====================
  { s: 3, n: 1, phase: "Endurance", type: "normal", title: "Footing endurance fondamentale", dist: 7, duree_travail: null, allure: "easy", detail: "Footing easy en continu, terrain varié conseillé pour renforcer les appuis.", dayOff: 2 },
  { s: 3, n: 2, phase: "Endurance", type: "normal", title: "Footing aérobie", dist: 8, duree_travail: null, allure: "aerobic", detail: "Footing aérobie soutenu mais confortable, cadence de course régulière du début à la fin.", dayOff: 4 },
  { s: 3, n: 3, phase: "Endurance", type: "normal", title: "Sortie longue", dist: 11, duree_travail: null, allure: "easy", detail: "Sortie longue easy, dernière grosse sortie avant le test de recalibrage des allures.", dayOff: 6 },

  // ===================== SEMAINE 4 - Test + Récupération =====================
  { s: 4, n: 1, phase: "Test", type: "test", title: "Test 5km", dist: 5, duree_travail: null, allure: "race", detail: "Échauffement 15min footing progressif + gammes athlétiques + 3 accélérations. Courir 5km à l'allure maximale soutenable sur la distance. Retour au calme 10min footing très léger. Ce chrono recalibre toutes les allures d'entraînement.", dayOff: 2 },
  { s: 4, n: 2, phase: "Récupération", type: "normal", title: "Footing récupération", dist: 5, duree_travail: null, allure: "easy", detail: "Footing très léger de récupération après le test, sensations prioritaires sur la vitesse.", dayOff: 4 },
  { s: 4, n: 3, phase: "Récupération", type: "normal", title: "Footing aérobie léger", dist: 7, duree_travail: null, allure: "aerobic", detail: "Footing aérobie modéré, semaine allégée pour bien digérer le test et repartir sur de bonnes bases.", dayOff: 6 },

  // ===================== SEMAINE 5 - Développement =====================
  { s: 5, n: 1, phase: "Développement", type: "normal", title: "Fractionné seuil", dist: null, duree_travail: 24, allure: "threshold", detail: "Échauffement 15min footing + gammes. 3x8min à allure seuil, récupération 2min trot entre chaque bloc. Retour au calme 10min footing léger.", dayOff: 2 },
  { s: 5, n: 2, phase: "Développement", type: "normal", title: "Footing aérobie", dist: 8, duree_travail: null, allure: "aerobic", detail: "Footing aérobie continu, allure stable du début à la fin.", dayOff: 4 },
  { s: 5, n: 3, phase: "Développement", type: "normal", title: "Sortie longue", dist: 12, duree_travail: null, allure: "easy", detail: "Sortie longue à allure easy, volume en hausse progressive. Bien gérer l'allure sur la première moitié.", dayOff: 6 },

  // ===================== SEMAINE 6 - Développement =====================
  { s: 6, n: 1, phase: "Développement", type: "normal", title: "Fractionné VO2max", dist: null, duree_travail: 12, allure: "vo2", detail: "Échauffement 15min footing + gammes + 2 accélérations. 6x2min à allure VO2max, récupération 2min trot entre chaque répétition. Retour au calme 10min footing léger.", dayOff: 2 },
  { s: 6, n: 2, phase: "Développement", type: "normal", title: "Footing aérobie", dist: 8, duree_travail: null, allure: "aerobic", detail: "Footing aérobie continu, cadence régulière, terrain au choix.", dayOff: 4 },
  { s: 6, n: 3, phase: "Développement", type: "normal", title: "Sortie longue", dist: 13, duree_travail: null, allure: "easy", detail: "Sortie longue easy, veiller à ne pas accélérer sur la seconde moitié du parcours.", dayOff: 6 },

  // ===================== SEMAINE 7 - Développement =====================
  { s: 7, n: 1, phase: "Développement", type: "normal", title: "Fractionné seuil", dist: null, duree_travail: 32, allure: "threshold", detail: "Échauffement 15min footing + gammes. 4x8min à allure seuil, récupération 2min trot entre chaque bloc. Retour au calme 10min footing léger.", dayOff: 2 },
  { s: 7, n: 2, phase: "Développement", type: "normal", title: "Footing aérobie", dist: 9, duree_travail: null, allure: "aerobic", detail: "Footing aérobie continu, dernière grosse semaine avant le test de recalibrage.", dayOff: 4 },
  { s: 7, n: 3, phase: "Développement", type: "normal", title: "Sortie longue avec fin dynamique", dist: 13, duree_travail: null, allure: "easy", detail: "Sortie longue à allure easy sur les 10 premiers km, puis les 3 derniers km à allure aérobie pour habituer les jambes à finir plus vite.", dayOff: 6 },

  // ===================== SEMAINE 8 - Test + Récupération =====================
  { s: 8, n: 1, phase: "Test", type: "test", title: "Test 5km", dist: 5, duree_travail: null, allure: "race", detail: "Échauffement 15min footing progressif + gammes + 3 accélérations. Courir 5km à l'allure maximale soutenable. Retour au calme 10min footing très léger. Recalibrage des allures d'entraînement.", dayOff: 2 },
  { s: 8, n: 2, phase: "Récupération", type: "normal", title: "Footing récupération", dist: 5, duree_travail: null, allure: "easy", detail: "Footing très léger de récupération post-test.", dayOff: 4 },
  { s: 8, n: 3, phase: "Récupération", type: "normal", title: "Footing aérobie léger", dist: 7, duree_travail: null, allure: "aerobic", detail: "Footing aérobie modéré, semaine allégée avant d'attaquer le bloc spécifique.", dayOff: 6 },

  // ===================== SEMAINE 9 - Spécifique =====================
  { s: 9, n: 1, phase: "Spécifique", type: "normal", title: "Fractionné VO2max", dist: null, duree_travail: 24, allure: "vo2", detail: "Échauffement 15min footing + gammes + 2 accélérations. 8x3min à allure VO2max, récupération 1min30 trot entre chaque répétition. Retour au calme 10min footing léger.", dayOff: 2 },
  { s: 9, n: 2, phase: "Spécifique", type: "normal", title: "Footing aérobie", dist: 9, duree_travail: null, allure: "aerobic", detail: "Footing aérobie continu, allure stable, bien s'échauffer avant d'accélérer légèrement en fin de parcours si les sensations sont bonnes.", dayOff: 4 },
  { s: 9, n: 3, phase: "Spécifique", type: "normal", title: "Sortie longue", dist: 14, duree_travail: null, allure: "easy", detail: "Sortie longue à allure easy, volume proche du pic. Bien fractionner l'hydratation.", dayOff: 6 },

  // ===================== SEMAINE 10 - Spécifique =====================
  { s: 10, n: 1, phase: "Spécifique", type: "normal", title: "Fractionné seuil", dist: null, duree_travail: 30, allure: "threshold", detail: "Échauffement 15min footing + gammes. 5x6min à allure seuil, récupération 90sec trot entre chaque bloc. Retour au calme 10min footing léger.", dayOff: 2 },
  { s: 10, n: 2, phase: "Spécifique", type: "normal", title: "Footing aérobie", dist: 9, duree_travail: null, allure: "aerobic", detail: "Footing aérobie continu, cadence régulière.", dayOff: 4 },
  { s: 10, n: 3, phase: "Spécifique", type: "normal", title: "Sortie longue avec portion allure course", dist: 14, duree_travail: null, allure: "easy", detail: "Sortie longue à allure easy, avec 3km au milieu du parcours à allure race pour habituer le corps au rythme de la course objectif. Reprendre l'allure easy ensuite.", dayOff: 6 },

  // ===================== SEMAINE 11 - Spécifique =====================
  { s: 11, n: 1, phase: "Spécifique", type: "normal", title: "Fractionné VO2max court", dist: null, duree_travail: 20, allure: "vo2", detail: "Échauffement 15min footing + gammes + 2 accélérations. 10x2min à allure VO2max, récupération 1min trot entre chaque répétition. Retour au calme 10min footing léger.", dayOff: 2 },
  { s: 11, n: 2, phase: "Spécifique", type: "normal", title: "Footing aérobie", dist: 10, duree_travail: null, allure: "aerobic", detail: "Footing aérobie continu, dernière grosse semaine du bloc avant le test.", dayOff: 4 },
  { s: 11, n: 3, phase: "Spécifique", type: "normal", title: "Sortie longue", dist: 15, duree_travail: null, allure: "easy", detail: "Sortie longue à allure easy, volume le plus élevé du plan. Bien gérer l'allure de départ.", dayOff: 6 },

  // ===================== SEMAINE 12 - Test + Récupération =====================
  { s: 12, n: 1, phase: "Test", type: "test", title: "Test 5km", dist: 5, duree_travail: null, allure: "race", detail: "Échauffement 15min footing progressif + gammes + 3 accélérations. Courir 5km à l'allure maximale soutenable. Retour au calme 10min footing très léger. Recalibrage des allures pour le bloc final.", dayOff: 2 },
  { s: 12, n: 2, phase: "Récupération", type: "normal", title: "Footing récupération", dist: 5, duree_travail: null, allure: "easy", detail: "Footing très léger de récupération post-test.", dayOff: 4 },
  { s: 12, n: 3, phase: "Récupération", type: "normal", title: "Footing aérobie léger", dist: 7, duree_travail: null, allure: "aerobic", detail: "Footing aérobie modéré, semaine allégée avant le bloc spécifique final.", dayOff: 6 },

  // ===================== SEMAINE 13 - Spécifique (peak) =====================
  { s: 13, n: 1, phase: "Spécifique", type: "normal", title: "Fractionné VO2max", dist: null, duree_travail: 24, allure: "vo2", detail: "Échauffement 15min footing + gammes + 2 accélérations. 6x4min à allure VO2max, récupération 2min trot entre chaque répétition. Retour au calme 10min footing léger.", dayOff: 2 },
  { s: 13, n: 2, phase: "Spécifique", type: "normal", title: "Footing aérobie", dist: 9, duree_travail: null, allure: "aerobic", detail: "Footing aérobie continu, allure stable.", dayOff: 4 },
  { s: 13, n: 3, phase: "Spécifique", type: "normal", title: "Sortie longue finition tempo", dist: 15, duree_travail: null, allure: "aerobic", detail: "Sortie longue avec les 4 derniers kilomètres courus à allure seuil pour habituer le corps à accélérer en fin d'effort. Le reste du parcours à allure aérobie.", dayOff: 6 },

  // ===================== SEMAINE 14 - Spécifique (peak) =====================
  { s: 14, n: 1, phase: "Spécifique", type: "normal", title: "Fractionné VO2max", dist: null, duree_travail: 20, allure: "vo2", detail: "Échauffement 15min footing + gammes + 2 accélérations. 5x4min à allure VO2max, récupération 2min trot entre chaque répétition. Retour au calme 10min footing léger.", dayOff: 2 },
  { s: 14, n: 2, phase: "Spécifique", type: "normal", title: "Footing aérobie", dist: 10, duree_travail: null, allure: "aerobic", detail: "Footing aérobie continu, cadence régulière.", dayOff: 4 },
  { s: 14, n: 3, phase: "Spécifique", type: "normal", title: "Sortie longue avec allure course", dist: 16, duree_travail: null, allure: "easy", detail: "Sortie longue à allure easy avec 5km à allure race insérés au milieu du parcours. Reprendre l'allure easy pour terminer. Plus longue sortie du plan.", dayOff: 6 },

  // ===================== SEMAINE 15 - Spécifique (peak, transition vers test) =====================
  { s: 15, n: 1, phase: "Spécifique", type: "normal", title: "Fractionné VO2max", dist: null, duree_travail: 24, allure: "vo2", detail: "Échauffement 15min footing + gammes + 2 accélérations. 8x3min à allure VO2max, récupération 1min30 trot entre chaque répétition. Retour au calme 10min footing léger.", dayOff: 2 },
  { s: 15, n: 2, phase: "Spécifique", type: "normal", title: "Footing aérobie", dist: 9, duree_travail: null, allure: "aerobic", detail: "Footing aérobie continu, réduire légèrement l'intensité avant le test de la semaine suivante.", dayOff: 4 },
  { s: 15, n: 3, phase: "Spécifique", type: "normal", title: "Sortie longue", dist: 14, duree_travail: null, allure: "easy", detail: "Sortie longue à allure easy, volume en légère baisse pour préparer le test.", dayOff: 6 },

  // ===================== SEMAINE 16 - Test + Récupération =====================
  { s: 16, n: 1, phase: "Test", type: "test", title: "Test 5km", dist: 5, duree_travail: null, allure: "race", detail: "Échauffement 15min footing progressif + gammes + 3 accélérations. Courir 5km à l'allure maximale soutenable. Retour au calme 10min footing très léger. Dernier recalibrage avant l'affûtage final.", dayOff: 2 },
  { s: 16, n: 2, phase: "Récupération", type: "normal", title: "Footing récupération", dist: 5, duree_travail: null, allure: "easy", detail: "Footing très léger de récupération post-test.", dayOff: 4 },
  { s: 16, n: 3, phase: "Récupération", type: "normal", title: "Footing aérobie léger", dist: 7, duree_travail: null, allure: "aerobic", detail: "Footing aérobie modéré, semaine allégée avant les dernières séances spécifiques.", dayOff: 6 },

  // ===================== SEMAINE 17 - Spécifique (dernier tour de vis) =====================
  { s: 17, n: 1, phase: "Spécifique", type: "normal", title: "Fractionné VO2max", dist: null, duree_travail: 18, allure: "vo2", detail: "Échauffement 15min footing + gammes + 2 accélérations. 6x3min à allure VO2max, récupération 1min30 trot entre chaque répétition. Retour au calme 10min footing léger.", dayOff: 2 },
  { s: 17, n: 2, phase: "Spécifique", type: "normal", title: "Footing aérobie", dist: 9, duree_travail: null, allure: "aerobic", detail: "Footing aérobie continu, allure stable.", dayOff: 4 },
  { s: 17, n: 3, phase: "Spécifique", type: "normal", title: "Sortie longue avec allure course", dist: 14, duree_travail: null, allure: "easy", detail: "Sortie longue à allure easy avec 4km à allure race insérés en fin de parcours pour ancrer les sensations de course.", dayOff: 6 },

  // ===================== SEMAINE 18 - Spécifique (dernier tour de vis) =====================
  { s: 18, n: 1, phase: "Spécifique", type: "normal", title: "Fractionné allure course", dist: null, duree_travail: 30, allure: "race", detail: "Échauffement 15min footing + gammes + 2 accélérations. 3x10min à allure race, récupération 2min trot entre chaque bloc. Retour au calme 10min footing léger.", dayOff: 2 },
  { s: 18, n: 2, phase: "Spécifique", type: "normal", title: "Footing aérobie", dist: 8, duree_travail: null, allure: "aerobic", detail: "Footing aérobie continu, début de la baisse de volume avant l'affûtage.", dayOff: 4 },
  { s: 18, n: 3, phase: "Spécifique", type: "normal", title: "Sortie longue", dist: 12, duree_travail: null, allure: "easy", detail: "Sortie longue à allure easy, volume en baisse pour entamer l'affûtage.", dayOff: 6 },

  // ===================== SEMAINE 19 - Affûtage =====================
  { s: 19, n: 1, phase: "Affûtage", type: "normal", title: "Fractionné VO2max réduit", dist: null, duree_travail: 10, allure: "vo2", detail: "Échauffement 15min footing + gammes + 2 accélérations. 5x2min à allure VO2max, récupération 2min trot entre chaque répétition. Retour au calme 10min footing léger. Volume réduit pour maintenir le tonus sans fatigue.", dayOff: 2 },
  { s: 19, n: 2, phase: "Affûtage", type: "normal", title: "Footing léger", dist: 6, duree_travail: null, allure: "easy", detail: "Footing très léger, focus sur la récupération et les sensations.", dayOff: 4 },
  { s: 19, n: 3, phase: "Affûtage", type: "normal", title: "Footing avec accélérations allure course", dist: 8, duree_travail: null, allure: "easy", detail: "Footing easy avec 4x1min à allure race intercalées, récupération complète en footing très léger entre chaque. Objectif : affûter les sensations de rythme sans fatigue.", dayOff: 6 },

  // ===================== SEMAINE 20 - Affûtage + Course =====================
  { s: 20, n: 1, phase: "Affûtage", type: "normal", title: "Footing très léger", dist: 5, duree_travail: null, allure: "easy", detail: "Footing très léger de décrassage, aucune intensité recherchée.", dayOff: 2 },
  { s: 20, n: 2, phase: "Affûtage", type: "normal", title: "Footing d'activation", dist: 4, duree_travail: null, allure: "easy", detail: "Footing court et très léger avec 3x20sec accélérations progressives pour activer les jambes avant la course. Bien s'étirer et se coucher tôt.", dayOff: 4 },
  { s: 20, n: 3, phase: "Course", type: "race", title: "Course finale 10km", dist: 10, duree_travail: null, allure: "race", detail: "Échauffement 15-20min footing progressif + gammes + 3 accélérations, environ 30min avant le départ. Courir les 10km à allure race en gérant bien le départ (ne pas partir trop vite). Négocier la seconde moitié en fonction des sensations. Retour au calme footing très léger après l'arrivée.", dayOff: 6 },
];

module.exports = plan_intermediaire_10km_3s;