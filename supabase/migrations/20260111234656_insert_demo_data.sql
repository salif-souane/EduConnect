/*
  # Données de démonstration
  
  Insertion de données de test pour faciliter la démonstration de la plateforme :
  
  1. Classes
    - Plusieurs classes de différents niveaux
  
  2. Matières
    - Mathématiques, Français, Histoire, etc.
  
  3. Utilisateurs de test
    Note: Les utilisateurs doivent être créés via Supabase Auth
    Ce script prépare la structure pour les accueillir
  
  4. Annonces de test
  
  5. Événements de test
*/

-- ========================================
-- CLASSES
-- ========================================

INSERT INTO classes (name, level, academic_year) VALUES
  ('6ème A', '6ème', '2024-2025'),
  ('5ème B', '5ème', '2024-2025'),
  ('4ème C', '4ème', '2024-2025'),
  ('3ème D', '3ème', '2024-2025')
ON CONFLICT (name) DO NOTHING;

-- ========================================
-- MATIÈRES
-- ========================================

INSERT INTO subjects (name, code, description) VALUES
  ('Mathématiques', 'MATH', 'Enseignement des mathématiques'),
  ('Français', 'FR', 'Langue et littérature françaises'),
  ('Histoire-Géographie', 'HISTGEO', 'Sciences humaines et sociales'),
  ('Sciences Physiques', 'PHYSIQUE', 'Physique et chimie'),
  ('Sciences de la Vie et de la Terre', 'SVT', 'Biologie et géologie'),
  ('Anglais', 'ANG', 'Langue anglaise'),
  ('Éducation Physique et Sportive', 'EPS', 'Sport et activités physiques'),
  ('Arts Plastiques', 'ARTS', 'Expression artistique'),
  ('Musique', 'MUSIQUE', 'Éducation musicale'),
  ('Technologie', 'TECH', 'Enseignement technologique')
ON CONFLICT (code) DO NOTHING;

-- ========================================
-- NOTE SUR LES UTILISATEURS
-- ========================================

-- Les utilisateurs doivent être créés via Supabase Auth
-- Pour créer des comptes de test :
-- 1. Allez dans Supabase Dashboard > Authentication > Users
-- 2. Créez des utilisateurs avec les emails suivants :
--    - admin@ecole.fr (role: admin)
--    - prof1@ecole.fr (role: teacher)
--    - eleve1@ecole.fr (role: student)
--    - parent1@ecole.fr (role: parent)
-- 3. Mot de passe suggéré : Demo123!
-- 4. Les profils seront créés automatiquement lors de l'inscription

-- Vous pouvez également créer les utilisateurs via le frontend
-- en utilisant l'interface d'inscription