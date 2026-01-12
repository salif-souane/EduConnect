# Guide de Démarrage

## Configuration Initiale

### 1. Base de Données Supabase

La base de données est déjà configurée avec :
- ✅ Toutes les tables nécessaires
- ✅ Row Level Security activé
- ✅ Politiques d'accès configurées
- ✅ Données de démonstration (classes et matières)

### 2. Créer des Comptes de Test

Pour tester l'application, vous devez créer des comptes utilisateurs. Il y a deux méthodes :

#### Méthode A : Via Supabase Dashboard (Recommandé)

1. Allez sur votre Supabase Dashboard
2. Naviguez vers **Authentication > Users**
3. Cliquez sur **Add User**
4. Créez les utilisateurs suivants :

**Administrateur:**
- Email: `admin@ecole.fr`
- Password: `Demo123!`
- Rôle: admin

**Enseignant:**
- Email: `prof@ecole.fr`
- Password: `Demo123!`
- Rôle: teacher

**Élève:**
- Email: `eleve@ecole.fr`
- Password: `Demo123!`
- Rôle: student

**Parent:**
- Email: `parent@ecole.fr`
- Password: `Demo123!`
- Rôle: parent

5. Pour chaque utilisateur créé, vous devez également :
   - Insérer une ligne dans la table `profiles` avec le bon rôle
   - Si c'est un élève : insérer dans `students`
   - Si c'est un enseignant : insérer dans `teachers`
   - Si c'est un parent : insérer dans `parents`

#### Méthode B : Via SQL (Plus Rapide)

Exécutez ce script SQL dans Supabase SQL Editor après avoir créé les utilisateurs Auth :

```sql
-- Remplacez les UUIDs par les vrais IDs des utilisateurs créés

-- Admin
INSERT INTO profiles (id, email, first_name, last_name, role)
VALUES ('uuid-de-admin', 'admin@ecole.fr', 'Jean', 'Dupont', 'admin');

-- Enseignant
INSERT INTO profiles (id, email, first_name, last_name, role)
VALUES ('uuid-de-prof', 'prof@ecole.fr', 'Marie', 'Martin', 'teacher');

INSERT INTO teachers (id)
VALUES ('uuid-de-prof');

-- Élève
INSERT INTO profiles (id, email, first_name, last_name, role)
VALUES ('uuid-de-eleve', 'eleve@ecole.fr', 'Pierre', 'Dubois', 'student');

INSERT INTO students (id, date_of_birth, class_id)
VALUES ('uuid-de-eleve', '2010-05-15',
  (SELECT id FROM classes WHERE name = '6ème A' LIMIT 1));

-- Parent
INSERT INTO profiles (id, email, first_name, last_name, role)
VALUES ('uuid-de-parent', 'parent@ecole.fr', 'Sophie', 'Bernard', 'parent');

INSERT INTO parents (id)
VALUES ('uuid-de-parent');

-- Lier le parent à l'élève
INSERT INTO parent_student (parent_id, student_id, relationship)
VALUES ('uuid-de-parent', 'uuid-de-eleve', 'Mère');
```

### 3. Lancer l'Application

```bash
# Installer les dépendances (si pas déjà fait)
npm install

# Lancer le serveur de développement
npm run dev
```

### 4. Se Connecter

1. Ouvrez votre navigateur sur `http://localhost:5173`
2. Utilisez un des comptes créés pour vous connecter
3. Explorez les différentes fonctionnalités selon le rôle

## Fonctionnalités Disponibles

### Administrateur
- ✅ Dashboard avec statistiques
- ✅ Navigation complète
- 🚧 Gestion des utilisateurs (à venir)
- 🚧 Gestion des classes et matières (à venir)
- ✅ Interface de base

### Enseignant
- ✅ Dashboard avec statistiques personnelles
- ✅ Navigation par fonctionnalité
- 🚧 Publication de cours (à venir)
- 🚧 Création de devoirs (à venir)
- 🚧 Saisie de notes (à venir)
- ✅ Interface de base

### Élève
- ✅ Dashboard avec vue d'ensemble
- ✅ Affichage de la classe
- 🚧 Consultation des cours (à venir)
- 🚧 Visualisation des devoirs (à venir)
- 🚧 Consultation des notes (à venir)
- ✅ Interface de base

### Parent
- ✅ Dashboard parent
- ✅ Affichage des enfants liés
- 🚧 Suivi détaillé de la scolarité (à venir)
- 🚧 Communication avec l'équipe éducative (à venir)
- ✅ Interface de base

## Structure de la Base de Données

### Tables Principales

1. **profiles** : Informations de base de tous les utilisateurs
2. **students** : Données spécifiques aux élèves
3. **teachers** : Données spécifiques aux enseignants
4. **parents** : Données spécifiques aux parents
5. **classes** : Classes de l'établissement
6. **subjects** : Matières enseignées
7. **courses** : Cours et ressources pédagogiques
8. **assignments** : Devoirs
9. **grades** : Notes des élèves
10. **messages** : Messagerie interne
11. **announcements** : Annonces
12. **forums** : Forums de discussion
13. **events** : Événements et calendrier
14. **polls** : Sondages

### Sécurité

Toutes les tables sont protégées par Row Level Security (RLS) :
- Les élèves ne voient que leurs propres données
- Les parents ne voient que les données de leurs enfants
- Les enseignants voient les données de leurs classes
- Les administrateurs ont un accès complet

## Prochaines Étapes de Développement

1. **Phase 1 (Complétée)** ✅
   - Schéma de base de données
   - Authentification
   - Dashboards de base
   - Navigation

2. **Phase 2 (À Venir)**
   - Gestion complète des utilisateurs
   - Interface de gestion des classes et matières
   - Publication et consultation de cours

3. **Phase 3 (À Venir)**
   - Système de devoirs complet
   - Gestion des notes
   - Messagerie interne

4. **Phase 4 (À Venir)**
   - Forums de discussion
   - Système d'annonces
   - Emploi du temps interactif
   - Statistiques avancées

## Support

Pour toute question :
1. Consultez la documentation Supabase
2. Vérifiez les logs de la console du navigateur
3. Examinez les politiques RLS dans Supabase Dashboard

## Conseils de Développement

- Utilisez les DevTools du navigateur pour déboguer
- Consultez la console Supabase pour voir les requêtes SQL
- Testez avec différents rôles pour vérifier les permissions
- Respectez les conventions de nommage existantes
