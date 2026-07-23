-- ============================================================
-- RUNTRACK — Migration
-- Correspond exactement à la base locale
-- ============================================================

-- Utilisateurs
CREATE TABLE IF NOT EXISTS utilisateurs (
    id                  SERIAL PRIMARY KEY,
    username            VARCHAR(20)  NOT NULL UNIQUE,
    email               VARCHAR(255) NOT NULL UNIQUE,
    password            VARCHAR(255) NOT NULL,
    nom                 VARCHAR(50)  NOT NULL,
    prenom              VARCHAR(50)  NOT NULL,
    sexe                VARCHAR(10)  NOT NULL,
    age                 INTEGER      CHECK (age > 0 AND age < 120),
    created_at          TIMESTAMP    DEFAULT NOW(),
    updated_at          TIMESTAMP    DEFAULT NOW(),
    plan_selectionne_id INTEGER,
    photo_url           VARCHAR(500),
    raison              TEXT,
    objectif_perso      TEXT
);

-- Tests de performance
CREATE TABLE IF NOT EXISTS tests_performance (
    id              SERIAL PRIMARY KEY,
    utilisateur_id  INTEGER      NOT NULL REFERENCES utilisateurs(id) ON DELETE CASCADE,
    distance_km     NUMERIC(5,2) NOT NULL,
    temps_minutes   NUMERIC(6,2) NOT NULL,
    allure_sec_km   INTEGER,
    date_test       DATE         NOT NULL,
    created_at      TIMESTAMP    DEFAULT NOW()
);

-- Plans d'entraînement
CREATE TABLE IF NOT EXISTS plans_entrainement (
    id                      SERIAL PRIMARY KEY,
    utilisateur_id          INTEGER     NOT NULL REFERENCES utilisateurs(id) ON DELETE CASCADE,
    test_id                 INTEGER     REFERENCES tests_performance(id),
    objectif                VARCHAR(20) NOT NULL,
    niveau                  VARCHAR(20) NOT NULL,
    seances_semaine         INTEGER     NOT NULL CHECK (seances_semaine BETWEEN 1 AND 7),
    date_debut              DATE        NOT NULL,
    date_fin                DATE        NOT NULL,
    actif                   BOOLEAN     DEFAULT TRUE,
    created_at              TIMESTAMP   DEFAULT NOW(),
    temps_reference_initial INTEGER
);

-- Clé étrangère plan_selectionne_id (après création de plans_entrainement)
DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE constraint_name = 'fk_plan_selectionne'
    ) THEN
        ALTER TABLE utilisateurs
            ADD CONSTRAINT fk_plan_selectionne
            FOREIGN KEY (plan_selectionne_id)
            REFERENCES plans_entrainement(id)
            ON DELETE SET NULL;
    END IF;
END $$;

-- Séances
CREATE TABLE IF NOT EXISTS seances (
    id            SERIAL PRIMARY KEY,
    plan_id       INTEGER     NOT NULL REFERENCES plans_entrainement(id) ON DELETE CASCADE,
    semaine       INTEGER     NOT NULL,
    jour          INTEGER     NOT NULL,
    type          VARCHAR(20) NOT NULL,
    description   TEXT,
    duree_min     INTEGER,
    distance_km   NUMERIC(5,2),
    allure_sec_km NUMERIC(5,2),
    created_at    TIMESTAMP   DEFAULT NOW(),
    phase         VARCHAR(50),
    titre         VARCHAR(100),
    allure_label  VARCHAR(20),
    jour_semaine  INTEGER,
    allure_sec    INTEGER
);

-- Séances réalisées
CREATE TABLE IF NOT EXISTS seances_realisees (
    id                SERIAL PRIMARY KEY,
    seance_id         INTEGER NOT NULL REFERENCES seances(id) ON DELETE CASCADE,
    utilisateur_id    INTEGER NOT NULL REFERENCES utilisateurs(id) ON DELETE CASCADE,
    date_realisee     DATE    NOT NULL,
    duree_reelle      INTEGER,
    distance_reelle   NUMERIC(5,2),
    ressenti          INTEGER CHECK (ressenti BETWEEN 1 AND 5),
    notes             TEXT,
    created_at        TIMESTAMP DEFAULT NOW(),
    allure_reelle_sec INTEGER
    plan_id         INTEGER REFERENCES plans_entrainement(id) ON DELETE CASCADE,
    titre           VARCHAR(150),
    source          VARCHAR(20) DEFAULT 'manuel',
    fc_moyenne      INTEGER,
    fc_max          INTEGER,
    cadence_moyenne INTEGER,
);

-- Demandes de nouveaux plans
CREATE TABLE IF NOT EXISTS demandes_plans (
    id                SERIAL PRIMARY KEY,
    utilisateur_id    INTEGER REFERENCES utilisateurs(id) ON DELETE SET NULL,
    objectif          VARCHAR(20)  NOT NULL,
    temps_objectif_sec INTEGER     NOT NULL,
    seances_semaine   INTEGER      NOT NULL,
    nombre_semaines   INTEGER      NOT NULL,
    jours_entrainement TEXT        NOT NULL,
    jour_course       VARCHAR(20),
    public_cible      TEXT         NOT NULL,
    particularites    TEXT,
    statut            VARCHAR(20)  DEFAULT 'en_attente',
    issue_url         VARCHAR(500),
    created_at        TIMESTAMP    DEFAULT NOW()
);