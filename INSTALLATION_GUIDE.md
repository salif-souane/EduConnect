# Guide d'Installation Complète

## 📋 Prérequis

- Node.js 18+ et npm
- Compte Supabase avec une base de données PostgreSQL
- Git
- Supabase CLI (optionnel mais recommandé)

---

## 🚀 Installation Étape par Étape

### 1️⃣ Cloner le projet
```bash
git clone <repo-url>
cd plateforme-educative
```

### 2️⃣ Installer les dépendances
```bash
npm install
```

### 3️⃣ Configurer Supabase

#### Méthode A : Via Supabase CLI (Recommandé)

```bash
# Installer la CLI Supabase (si pas déjà installée)
npm install -g supabase

# Vous connecter à Supabase
supabase login

# Lier votre projet Supabase
supabase link --project-ref xxxxx

# Exécuter les migrations
supabase db push
```

#### Méthode B : Manuellement via le Dashboard Supabase

1. Allez sur [https://app.supabase.com](https://app.supabase.com)
2. Sélectionnez votre projet
3. Allez à **SQL Editor**
4. Créez une **New Query**
5. Ouvrez le fichier `supabase/migrations/20260111234103_create_school_platform_schema.sql` dans un éditeur
6. Copiez-collez le contenu complet dans Supabase SQL Editor
7. Cliquez sur **Run**
8. Répétez l'opération avec `supabase/migrations/20260111234656_insert_demo_data.sql`

### 4️⃣ Configurer les variables d'environnement

Créez un fichier `.env.local` à la racine du projet:

```env
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

Vous trouverez ces valeurs dans:
- Dashboard Supabase → **Settings** → **API**
- Copiez l'URL du projet et la clé publique (anon)

### 5️⃣ Créer les utilisateurs de test

#### Via Supabase Dashboard (Interface):

1. Allez à **Authentication** → **Users**
2. Cliquez sur **Add user**
3. Créez les comptes suivants:

| Email | Rôle | Mot de passe |
|-------|------|-------------|
| admin@ecole.fr | admin | Demo123! |
| prof1@ecole.fr | teacher | Demo123! |
| eleve1@ecole.fr | student | Demo123! |
| parent1@ecole.fr | parent | Demo123! |

⚠️ **Important**: Les profils seront créés automatiquement lors de la création de l'utilisateur via Auth (grâce à la fonction trigger `create_profile_on_signup`)

#### Via le Frontend:

1. Démarrez l'application: `npm run dev`
2. Cliquez sur **S'inscrire**
3. Créez les comptes avec les emails ci-dessus

### 6️⃣ Vérifier que les données de démo sont bien insérées

Exécutez cette requête dans Supabase SQL Editor:

```sql
-- Vérifier les classes
SELECT COUNT(*) as nb_classes FROM classes;
-- Résultat attendu: 4

-- Vérifier les matières
SELECT COUNT(*) as nb_subjects FROM subjects;
-- Résultat attendu: 10

-- Vérifier les utilisateurs
SELECT COUNT(*) as nb_users FROM profiles;
-- Résultat attendu: nombre d'utilisateurs que vous avez créés
```

---

## ▶️ Lancer l'application

### Mode développement:
```bash
npm run dev
```

L'application sera disponible à `http://localhost:5173`

### Construire pour la production:
```bash
npm run build
npm run preview
```

---

## 🔑 Comptes de Test

Utilisez les identifiants suivants pour tester l'application:

### Admin
- **Email**: admin@ecole.fr
- **Mot de passe**: Demo123!
- **Accès**: Tous les menus, gestion complète

### Enseignant
- **Email**: prof1@ecole.fr
- **Mot de passe**: Demo123!
- **Accès**: Gestion des devoirs, notes, forum

### Élève
- **Email**: eleve1@ecole.fr
- **Mot de passe**: Demo123!
- **Accès**: Voir les cours, devoirs, notes

### Parent
- **Email**: parent1@ecole.fr
- **Mot de passe**: Demo123!
- **Accès**: Suivi de l'enfant

---

## ⚠️ Dépannage Courant

### Erreur 404 sur "subjects"
- **Cause**: Les migrations n'ont pas été exécutées
- **Solution**: Exécutez `supabase db push` ou copiez-collez la migration dans SQL Editor

### Erreur 400 sur "profiles"
- **Cause**: Les politiques RLS ne permettent pas l'accès
- **Solution**: Vérifiez que tous les `CREATE POLICY` ont été exécutés

### Les données de démo ne s'affichent pas
- **Cause**: La migration `insert_demo_data.sql` n'a pas été exécutée
- **Solution**: Exécutez le fichier de données de démo

### L'authentification ne fonctionne pas
- **Cause**: Les variables d'environnement ne sont pas correctes
- **Solution**: Vérifiez que `.env.local` contient les bonnes clés Supabase

---

## 📁 Structure du Projet

```
plateforme-educative/
├── src/
│   ├── components/
│   │   ├── auth/          # Composants d'authentification
│   │   ├── dashboard/     # Composants des tableaux de bord
│   │   ├── layout/        # Layout principal
│   │   └── common/        # Composants réutilisables
│   ├── contexts/          # Context API (Auth)
│   ├── lib/
│   │   ├── supabase.ts    # Configuration Supabase
│   │   └── database.types.ts  # Types générés
│   ├── App.tsx            # Composant principal
│   └── main.tsx           # Point d'entrée
├── supabase/
│   └── migrations/        # Migrations PostgreSQL
├── .env.local             # Variables d'environnement
└── package.json           # Dépendances
```

---

## 🔗 Ressources Utiles

- [Documentation Supabase](https://supabase.com/docs)
- [React Documentation](https://react.dev)
- [TypeScript Documentation](https://www.typescriptlang.org/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)

---

## ✅ Checklist de Vérification

- [ ] Node.js et npm installés
- [ ] Projet cloné et dépendances installées
- [ ] Variables d'environnement configurées
- [ ] Migrations Supabase exécutées
- [ ] Données de démo insérées
- [ ] Utilisateurs de test créés
- [ ] Application démarre sans erreur (`npm run dev`)
- [ ] Connexion possible avec les comptes de test
- [ ] Données visibles dans les tableaux de bord

---

**Si vous rencontrez des problèmes, consultez [TROUBLESHOOTING.md](TROUBLESHOOTING.md)**
