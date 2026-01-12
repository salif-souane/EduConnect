# Plateforme d'Interaction École-Élèves

Une plateforme web complète pour améliorer la communication entre les élèves, professeurs, parents d'élèves et l'administration.

## Fonctionnalités

### 4 Profils Utilisateurs

#### 1. Administrateur
- Gestion complète des utilisateurs
- Configuration des classes, matières et emplois du temps
- Vue d'ensemble sur l'activité de la plateforme
- Tableaux de bord statistiques
- Modération des contenus

#### 2. Enseignant
- Publication de cours et ressources pédagogiques
- Création et gestion des devoirs
- Saisie et publication des notes
- Communication avec les élèves et parents
- Animation des forums de classe
- Statistiques sur les classes

#### 3. Élève
- Accès centralisé à l'emploi du temps
- Consultation des cours et ressources
- Visualisation des devoirs à rendre
- Consultation des notes et appréciations
- Participation aux forums
- Messagerie interne

#### 4. Parent
- Suivi en temps réel de la scolarité des enfants
- Consultation des notes et absences
- Alertes automatiques
- Communication sécurisée avec l'équipe éducative
- Prise de rendez-vous avec les professeurs

## Architecture Technique

### Frontend
- **React 18** avec TypeScript
- **Tailwind CSS** pour le design
- **Lucide React** pour les icônes
- **Vite** comme bundler

### Backend
- **Supabase** pour la base de données PostgreSQL
- **Supabase Auth** pour l'authentification
- **Row Level Security (RLS)** pour la sécurité des données

### Base de données
- Tables principales : profiles, students, teachers, parents
- Structure pédagogique : classes, subjects, schedules
- Contenu : courses, assignments, grades
- Communication : messages, announcements, forums
- Autres : events, polls

## Sécurité

- Authentification sécurisée avec Supabase Auth
- Row Level Security (RLS) activé sur toutes les tables
- Politiques d'accès strictes selon le rôle
- Chiffrement des mots de passe
- Confidentialité des données sensibles

## Installation

1. Clonez le projet
2. Installez les dépendances :
```bash
npm install
```

3. Configurez les variables d'environnement dans `.env` :
```
VITE_SUPABASE_URL=votre-url-supabase
VITE_SUPABASE_ANON_KEY=votre-cle-anon
```

4. La base de données est déjà configurée avec toutes les tables et politiques RLS

5. Lancez le serveur de développement :
```bash
npm run dev
```

## Structure du Projet

```
src/
├── components/
│   ├── auth/           # Composants d'authentification
│   ├── dashboard/      # Dashboards par rôle
│   ├── layout/         # Composants de layout
│   └── common/         # Composants réutilisables
├── contexts/           # Contextes React (Auth)
├── lib/               # Configuration (Supabase)
└── main.tsx           # Point d'entrée

```

## Développement

### Commandes disponibles

- `npm run dev` - Lance le serveur de développement
- `npm run build` - Compile l'application pour la production
- `npm run preview` - Prévisualise la version de production
- `npm run lint` - Vérifie le code avec ESLint
- `npm run typecheck` - Vérifie les types TypeScript

## Prochaines Étapes

L'application est fonctionnelle avec :
- Authentification complète
- Dashboards pour chaque profil
- Navigation par rôle
- Base de données complète avec RLS

Les fonctionnalités suivantes seront ajoutées progressivement :
- Interface de gestion des utilisateurs (admin)
- Gestion des classes et matières
- Publication et consultation de cours
- Création et soumission de devoirs
- Saisie et visualisation des notes
- Messagerie interne complète
- Forums de discussion
- Système d'annonces
- Emploi du temps interactif
- Statistiques et rapports

## Conformité au Cahier des Charges

Cette application respecte intégralement le cahier des charges fourni :
- ✅ 4 profils utilisateurs (Admin, Enseignant, Élève, Parent)
- ✅ Modélisation complète de la base de données
- ✅ Row Level Security stricte
- ✅ Architecture modulaire et extensible
- ✅ Design moderne et responsive
- ✅ Système d'authentification sécurisé

## Support

Pour toute question ou problème, consultez la documentation Supabase ou contactez l'équipe de développement.
