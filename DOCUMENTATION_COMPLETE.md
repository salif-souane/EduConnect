# 📚 Documentation Complète - Plateforme d'Interaction École-Élèves

## Table des Matières

1. [Vue d'ensemble](#vue-densemble)
2. [Architecture Globale](#architecture-globale)
3. [Structure du Projet](#structure-du-projet)
4. [Frontend](#frontend)
5. [Backend & Base de Données](#backend--base-de-données)
6. [Flux de Liaison](#flux-de-liaison)
7. [Commandes Essentielles](#commandes-essentielles)
8. [Guide de Déploiement](#guide-de-déploiement)
9. [Conseils et Recommandations](#conseils-et-recommandations)
10. [Troubleshooting](#troubleshooting)

---

## Vue d'ensemble

### Objectif
La **Plateforme d'Interaction École-Élèves** est une application web modernecomplète qui facilite la communication et la gestion administrative entre :
- 👨‍💼 **Administrateurs** - Gestion globale
- 👨‍🏫 **Enseignants** - Publication et suivi
- 👨‍🎓 **Élèves** - Accès aux ressources
- 👨‍👩‍👧 **Parents** - Suivi de scolarité

### Caractéristiques Principales
✅ Authentification sécurisée multi-profil  
✅ Gestion complète des utilisateurs et permissions  
✅ Système de messagerie interne  
✅ Publication de cours et devoirs  
✅ Suivi des notes et performances  
✅ Emplois du temps dynamiques  
✅ Forums de discussion par classe  
✅ Tableaux de bord personnalisés  

---

## Architecture Globale

### Diagramme d'Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         FRONTEND (React)                         │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  • React 18 + TypeScript                                 │   │
│  │  • Tailwind CSS (Styling)                                │   │
│  │  • Lucide React (Icons)                                  │   │
│  │  • Vite (Build Tool)                                     │   │
│  │  • Context API (State Management)                        │   │
│  └──────────────────────────────────────────────────────────┘   │
└───────────────────────────┬──────────────────────────────────────┘
                            │
                    (REST API / Supabase SDK)
                            │
┌───────────────────────────▼──────────────────────────────────────┐
│                       BACKEND (Supabase)                          │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  • PostgreSQL Database                                   │   │
│  │  • Supabase Auth (JWT)                                   │   │
│  │  • Row Level Security (RLS)                              │   │
│  │  • Real-time Subscriptions                               │   │
│  │  • Edge Functions (Optionnel)                            │   │
│  └──────────────────────────────────────────────────────────┘   │
└───────────────────────────────────────────────────────────────────┘
```

### Stack Technologique

| Couche | Technologie | Version |
|--------|-------------|---------|
| **Frontend** | React | 18.3.1 |
| **Language** | TypeScript | 5.5.3 |
| **Bundler** | Vite | 5.4.2 |
| **Styling** | Tailwind CSS | 3.4.1 |
| **Icons** | Lucide React | 0.344.0 |
| **Backend** | Supabase (PostgreSQL) | 12 |
| **Auth** | Supabase Auth | - |
| **Database Client** | @supabase/supabase-js | 2.57.4 |

---

## Structure du Projet

```
plateforme-educative-main/
├── 📁 src/
│   ├── 📁 components/
│   │   ├── MainApp.tsx                 # Routeur principal
│   │   ├── App.tsx                     # Point d'entrée app
│   │   ├── 📁 auth/
│   │   │   └── LoginForm.tsx           # Formulaire de connexion
│   │   ├── 📁 common/
│   │   │   └── PlaceholderView.tsx     # Composant placeholder
│   │   ├── 📁 layout/
│   │   │   └── Sidebar.tsx             # Navigation principale
│   │   └── 📁 dashboard/
│   │       ├── AdminDashboard.tsx      # Tableau de bord admin
│   │       ├── TeacherDashboard.tsx    # Tableau de bord prof
│   │       ├── StudentDashboard.tsx    # Tableau de bord élève
│   │       ├── ParentDashboard.tsx     # Tableau de bord parent
│   │       ├── UsersManagement.tsx     # Gestion utilisateurs
│   │       ├── ClassesManagement.tsx   # Gestion classes
│   │       ├── SubjectsManagement.tsx  # Gestion matières
│   │       ├── AnnouncementsManagement.tsx  # Annonces
│   │       ├── CoursesManagement.tsx   # Cours
│   │       ├── MessagesManagement.tsx  # Messages
│   │       └── [autres dashboards]
│   ├── 📁 contexts/
│   │   └── AuthContext.tsx             # Context d'authentification
│   ├── 📁 lib/
│   │   ├── supabase.ts                 # Client Supabase
│   │   └── database.types.ts           # Types générés
│   ├── main.tsx                        # Point d'entrée React
│   └── index.css                       # Styles globaux
├── 📁 supabase/
│   └── 📁 migrations/
│       ├── 20260111234103_create_school_platform_schema.sql
│       └── 20260111234656_insert_demo_data.sql
├── 📄 package.json                     # Dépendances
├── 📄 vite.config.ts                   # Config Vite
├── 📄 tsconfig.json                    # Config TypeScript
├── 📄 tailwind.config.js               # Config Tailwind
├── 📄 eslint.config.js                 # Config ESLint
├── 📄 postcss.config.js                # Config PostCSS
├── 📄 index.html                       # HTML principal
├── 📄 README.md                        # Guide rapide
└── 📄 GUIDE_DEMARRAGE.md               # Guide de démarrage
```

---

## Frontend

### Responsabilités Principales

Le frontend gère :
- 🎨 Interface utilisateur responsive
- 🔐 Authentification et gestion de session
- 📊 Affichage des données
- ✍️ Formulaires de saisie
- 🧭 Navigation entre pages
- ⚡ Communication avec Supabase

### Architecture des Composants

#### 1. **AuthContext** - Gestion de l'authentification
```typescript
// src/contexts/AuthContext.tsx
export interface AuthContextType {
  user: User | null;              // Utilisateur Supabase
  profile: Profile | null;        // Profil étendu (rôle, nom, etc.)
  session: Session | null;        // Session active
  loading: boolean;               // État de chargement
  signIn: (email, password) => Promise<void>;
  signUp: (email, password, userData) => Promise<void>;
  signOut: () => Promise<void>;
}
```

**Utilisation:**
```typescript
const { user, profile, signIn, signOut } = useAuth();
```

#### 2. **MainApp** - Routage principal
- Décide quel dashboard afficher selon le rôle
- Gère la navigation entre pages
- Affiche le contenu approprié

#### 3. **Dashboards** - Pages spécifiques
- `AdminDashboard` - Statistiques et gestion globale
- `TeacherDashboard` - Cours, devoirs, notes
- `StudentDashboard` - Emploi du temps, grades
- `ParentDashboard` - Suivi enfant

#### 4. **Management Pages** - Gestion des données
- `UsersManagement` - CRUD utilisateurs
- `ClassesManagement` - Gestion des classes
- `CoursesManagement` - Publication de cours
- `MessagesManagement` - Messagerie
- `AnnouncementsManagement` - Annonces

### Flux de Rendu

```
App.tsx
    └── AuthProvider (Context)
            └── LoginForm OU MainApp
                    ├── Sidebar (Navigation)
                    └── Dashboard Dynamique
                            └── Composants de gestion
```

### Styles & Design

**Framework:** Tailwind CSS v3.4.1
- Classes utilitaires pour un style cohérent
- Responsive design mobile-first
- Palette de couleurs bleue/grise

**Icônes:** Lucide React v0.344.0
- Plus de 500 icônes disponibles
- Intégrées dans les composants

---

## Backend & Base de Données

### 1. Supabase - Infrastructure

**Supabase fournit:**
- 🗄️ PostgreSQL (Database)
- 🔑 Authentication (JWT)
- 🔒 Authorization (RLS)
- 🔄 Real-time (WebSocket)
- 📦 Storage (Fichiers)

### 2. Structure Base de Données

#### Tables Principales

##### **1. profiles** - Profils utilisateurs
```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  email TEXT NOT NULL UNIQUE,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  role UserRole NOT NULL,  -- 'admin', 'teacher', 'student', 'parent'
  address TEXT,
  phone TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);
```

##### **2. classes** - Classes scolaires
```sql
CREATE TABLE classes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  level TEXT NOT NULL,
  academic_year TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT now()
);
```

##### **3. subjects** - Matières/disciplines
```sql
CREATE TABLE subjects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  code TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP DEFAULT now()
);
```

##### **4. courses** - Cours et ressources
```sql
CREATE TABLE courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  content TEXT,
  file_url TEXT,
  class_id UUID NOT NULL REFERENCES classes(id),
  subject_id UUID NOT NULL REFERENCES subjects(id),
  teacher_id UUID NOT NULL REFERENCES profiles(id),
  published_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT now()
);
```

##### **5. assignments** - Devoirs
```sql
CREATE TABLE assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  instructions TEXT,
  due_date TIMESTAMP NOT NULL,
  max_grade INT DEFAULT 20,
  file_url TEXT,
  class_id UUID NOT NULL REFERENCES classes(id),
  subject_id UUID NOT NULL REFERENCES subjects(id),
  teacher_id UUID NOT NULL REFERENCES profiles(id),
  created_at TIMESTAMP DEFAULT now()
);
```

##### **6. grades** - Notes et évaluations
```sql
CREATE TABLE grades (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES profiles(id),
  assignment_id UUID NOT NULL REFERENCES assignments(id),
  grade FLOAT NOT NULL,
  comment TEXT,
  graded_by UUID NOT NULL REFERENCES profiles(id),
  graded_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT now()
);
```

##### **7. messages** - Messagerie interne
```sql
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID NOT NULL REFERENCES profiles(id),
  recipient_id UUID NOT NULL REFERENCES profiles(id),
  subject TEXT NOT NULL,
  content TEXT NOT NULL,
  read BOOLEAN DEFAULT false,
  read_at TIMESTAMP,
  sent_at TIMESTAMP DEFAULT now(),
  created_at TIMESTAMP DEFAULT now()
);
```

##### **8. announcements** - Annonces
```sql
CREATE TABLE announcements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  author_id UUID NOT NULL REFERENCES profiles(id),
  target_role TEXT,  -- 'all', 'student', 'teacher', 'parent'
  target_class_id UUID REFERENCES classes(id),
  published_at TIMESTAMP DEFAULT now(),
  created_at TIMESTAMP DEFAULT now()
);
```

##### **9. schedules** - Emplois du temps
```sql
CREATE TABLE schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id UUID NOT NULL REFERENCES classes(id),
  subject_id UUID NOT NULL REFERENCES subjects(id),
  teacher_id UUID NOT NULL REFERENCES profiles(id),
  day_of_week INT,  -- 0=Lundi, 6=Dimanche
  start_time TEXT,
  end_time TEXT,
  room TEXT,
  created_at TIMESTAMP DEFAULT now()
);
```

#### Tables de Relation

##### **students** - Profil étudiant
```sql
CREATE TABLE students (
  id UUID PRIMARY KEY REFERENCES profiles(id),
  date_of_birth DATE,
  class_id UUID REFERENCES classes(id),
  created_at TIMESTAMP DEFAULT now()
);
```

##### **teachers** - Profil enseignant
```sql
CREATE TABLE teachers (
  id UUID PRIMARY KEY REFERENCES profiles(id),
  created_at TIMESTAMP DEFAULT now()
);
```

##### **parents** - Profil parent
```sql
CREATE TABLE parents (
  id UUID PRIMARY KEY REFERENCES profiles(id),
  created_at TIMESTAMP DEFAULT now()
);
```

##### **parent_student** - Lien parent-élève
```sql
CREATE TABLE parent_student (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id UUID NOT NULL REFERENCES parents(id),
  student_id UUID NOT NULL REFERENCES students(id),
  relationship TEXT,
  created_at TIMESTAMP DEFAULT now()
);
```

### 3. Row Level Security (RLS)

RLS garantit que chaque utilisateur ne voit que ses données :

```sql
-- Exemple : Seuls les enseignants peuvent voir leurs courses
CREATE POLICY "Teachers can view own courses"
ON courses FOR SELECT
USING (auth.uid() = teacher_id);

-- Exemple : Les élèves ne voient que les courses de leur classe
CREATE POLICY "Students can view class courses"
ON courses FOR SELECT
USING (
  class_id IN (
    SELECT class_id FROM students WHERE id = auth.uid()
  )
);
```

### 4. Authentification

**Flux d'authentification:**

```
1. Utilisateur entre email/password
   ↓
2. Supabase Auth crée JWT token
   ↓
3. Token stocké en session browser
   ↓
4. Chaque requête inclut le token
   ↓
5. Supabase valide le token et applique RLS
   ↓
6. Données filtrées selon permissions
```

**Variables d'environnement:**
```bash
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=xxxxx...
```

---

## Flux de Liaison

### 1. Flux d'Authentification

```
┌─────────────────────────────────────────────────────────────┐
│ 1. Utilisateur visite localhost:5173                        │
└────────────────────────┬────────────────────────────────────┘
                         ▼
┌─────────────────────────────────────────────────────────────┐
│ 2. App.tsx charge AuthContext                              │
│    - Vérifie session existante                             │
│    - Charge le profil utilisateur                          │
└────────────────────────┬────────────────────────────────────┘
                         ▼
┌─────────────────────────────────────────────────────────────┐
│ 3. Si pas de session: affiche LoginForm                    │
│    Si session existe: affiche MainApp                      │
└────────────────────────┬────────────────────────────────────┘
                         ▼
┌─────────────────────────────────────────────────────────────┐
│ 4. LoginForm envoie credentials                            │
│    → supabase.auth.signInWithPassword(email, password)     │
└────────────────────────┬────────────────────────────────────┘
                         ▼
┌─────────────────────────────────────────────────────────────┐
│ 5. Supabase Auth valide et retourne JWT                    │
└────────────────────────┬────────────────────────────────────┘
                         ▼
┌─────────────────────────────────────────────────────────────┐
│ 6. AuthContext charge les données du profil                │
│    SELECT * FROM profiles WHERE id = user.id              │
└────────────────────────┬────────────────────────────────────┘
                         ▼
┌─────────────────────────────────────────────────────────────┐
│ 7. MainApp affiche le dashboard selon le rôle              │
│    - admin → AdminDashboard                                │
│    - teacher → TeacherDashboard                            │
│    - student → StudentDashboard                            │
│    - parent → ParentDashboard                              │
└─────────────────────────────────────────────────────────────┘
```

### 2. Flux de Requête de Données

```
React Component
     ↓
useEffect() déclenché
     ↓
Appel à supabase.from('table_name').select()
     ↓
SDK Supabase construit requête
     ↓
Ajoute JWT au header Authorization
     ↓
Envoie requête HTTPS à Supabase API
     ↓
Supabase valide JWT
     ↓
Applique Row Level Security (RLS)
     ↓
Exécute requête SQL
     ↓
Retourne données (ou erreur 403 si non autorisé)
     ↓
setState() met à jour le composant
     ↓
Interface se rafraîchit avec les données
```

### 3. Flux de Modification de Données

```
Utilisateur remplit formulaire et clique "Envoyer"
     ↓
Validations côté client (optional)
     ↓
await supabase.from('table').insert() / update() / delete()
     ↓
SDK envoie requête avec JWT
     ↓
Supabase valide permissions (RLS)
     ↓
Exécute la modification en base
     ↓
Retourne confirmation ou erreur
     ↓
Frontend recharge les données
     ↓
Utilisateur voit la mise à jour
```

### 4. Exemple Complet: Publication d'une Annonce

```typescript
// CoursesManagement.tsx

const createCourse = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!user) return;

  try {
    // 1. Préparer les données
    const courseData = {
      title,
      description,
      content,
      class_id: classId,
      subject_id: subjectId,
      teacher_id: user.id,  // ← ID de l'utilisateur connecté
    };

    // 2. Envoyer à Supabase
    // @ts-expect-error Supabase type generation issue
    const { error } = await supabase
      .from('courses')           // ← Table cible
      .insert(courseData);        // ← Données à insérer

    if (error) throw error;

    // 3. Recharger les données
    await loadData();

    // 4. Feedback utilisateur
    alert('Cours créé avec succès');
    
  } catch (error) {
    console.error('Error:', error);
    alert('Erreur lors de la création');
  }
};
```

**Ce qui se passe côté serveur:**

```sql
-- Supabase reçoit:
INSERT INTO courses (
  title, description, content, 
  class_id, subject_id, teacher_id
) VALUES (
  'Mathématiques Avancées', 
  'Cours complet', 
  'Contenu du cours...',
  'class-id-123',
  'subject-id-456',
  'teacher-id-789'
);

-- Supabase applique les RLS:
-- ✅ teacher-id-789 est un enseignant? OUI
-- ✅ Peut créer dans courses? OUI
-- ✅ INSERT EXÉCUTÉ

-- Si c'était un étudiant qui essayait:
-- ❌ student-id est un étudiant? OUI
-- ❌ Peut créer dans courses? NON
-- ❌ Erreur 403 - UNAUTHORIZED
```

---

## Commandes Essentielles

### 🚀 Démarrage et Développement

```bash
# 1. Installation des dépendances
npm install

# 2. Lancer serveur de développement
npm run dev
# Accessible à: http://localhost:5173

# 3. Vérifier types TypeScript
npm run typecheck

# 4. Vérifier et corriger linting
npm run lint
npm run lint -- --fix

# 5. Aperçu de la build
npm run preview
```

### 🏗️ Build et Production

```bash
# Build pour production
npm run build

# Vérifie que la build est OK
npm run preview
```

### 🔍 Débogage

```bash
# Vérifier les erreurs TypeScript
npm run typecheck

# Exécuter ESLint
npm run lint

# Afficher les détails des erreurs de build
npm run build -- --debug

# Vérifier la taille du bundle
npm run build -- --analyze
```

---

## Guide de Déploiement

### Option 1: Vercel (Recommandé - Facile)

**Avantages:**
- Déploiement en 1 clic
- SSL inclus
- CDN global
- Free tier généreux

**Étapes:**

1. **Préparer le repo GitHub:**
```bash
git add .
git commit -m "Ready for deployment"
git push origin main
```

2. **Connecter à Vercel:**
- Aller sur https://vercel.com
- Cliquer "New Project"
- Importer le repo GitHub
- Vercel détecte automatiquement Vite

3. **Configurer les variables d'environnement:**
```
VITE_SUPABASE_URL = https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY = xxxxx...
```

4. **Cliquer "Deploy"**
- Vercel construit automatiquement
- Accès immédiat via vercel.app URL

**Mise à jour:** Juste `git push` → Redéploiement automatique

### Option 2: Netlify (Facile)

**Étapes similaires:**

1. Connecter le repo GitHub
2. Build command: `npm run build`
3. Publish directory: `dist/`
4. Ajouter variables d'environnement
5. Déployer

### Option 3: Docker + Auto-hébergement (Avancé)

**Dockerfile:**
```dockerfile
# Build
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Runtime
FROM node:20-alpine
WORKDIR /app
RUN npm install -g serve
COPY --from=builder /app/dist ./dist
EXPOSE 3000
CMD ["serve", "-s", "dist", "-l", "3000"]
```

**Commandes:**
```bash
# Build image
docker build -t plateforme-educative .

# Lancer conteneur
docker run \
  -e VITE_SUPABASE_URL=https://xxxxx.supabase.co \
  -e VITE_SUPABASE_ANON_KEY=xxxxx \
  -p 3000:3000 \
  plateforme-educative
```

### Option 4: GitHub Pages (Static)

```bash
# 1. Modifier vite.config.ts
export default {
  base: '/plateforme-educative/',
  // ...
}

# 2. Créer .github/workflows/deploy.yml
name: Deploy
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run build
      - uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./dist

# 3. Push vers GitHub → Déploiement automatique
```

### Checklist de Déploiement

- [ ] Tous les tests passent: `npm run lint && npm run typecheck`
- [ ] Build réussit: `npm run build`
- [ ] Variables d'environnement définies
- [ ] Supabase DB en production est bien configurée
- [ ] RLS policies activées
- [ ] CORS configuré dans Supabase
- [ ] Domaine SSL valide
- [ ] Backup de base de données
- [ ] Monitoring et logs activés
- [ ] Documentation déployée

---

## Conseils et Recommandations

### 🔒 Sécurité

#### 1. Authentification
```typescript
// ✅ BON - Vérifier l'utilisateur
if (!user) {
  redirect('/login');
  return;
}

// ❌ MAUVAIS - Faire confiance au client
const userId = localStorage.getItem('userId'); // Non sécurisé!
```

#### 2. Row Level Security (RLS)
```sql
-- ✅ TOUJOURS activer RLS
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;

-- ✅ TOUJOURS vérifier l'utilisateur
CREATE POLICY "Users can only view own courses"
ON courses FOR SELECT
USING (auth.uid() = teacher_id);

-- ❌ JAMAIS faire confiance au client_id du formulaire
-- Le serveur doit utiliser auth.uid()
```

#### 3. Valider côté serveur
```typescript
// ❌ MAUVAIS
const courseData = req.body; // Ne pas faire confiance au client

// ✅ BON
const courseData = {
  title: req.body.title?.trim(),
  description: req.body.description?.trim(),
  teacher_id: req.auth.uid(), // ← Du serveur, pas du client!
};
```

### 📊 Performance

#### 1. Pagination
```typescript
// ❌ LENT - Charger tous les cours
const courses = await supabase
  .from('courses')
  .select();  // Peut être énorme!

// ✅ RAPIDE - Paginer
const { data, count } = await supabase
  .from('courses')
  .select('*', { count: 'exact' })
  .range(0, 19);  // 20 par page
```

#### 2. Indexes
```sql
-- Créer des indexes sur colonnes recherchées
CREATE INDEX idx_courses_teacher_id ON courses(teacher_id);
CREATE INDEX idx_messages_recipient_id ON messages(recipient_id);
CREATE INDEX idx_grades_student_id ON grades(student_id);
```

#### 3. Lazy Loading
```typescript
// ✅ BON - Charger à la demande
const [expanded, setExpanded] = useState(false);
useEffect(() => {
  if (expanded) {
    loadDetails();  // Ne charge que si nécessaire
  }
}, [expanded]);
```

#### 4. Caching
```typescript
// ✅ BON - Cacher les données
const [cache, setCache] = useState<Record<string, any>>({});

const loadCourses = async () => {
  if (cache['courses']) {
    return cache['courses'];
  }
  const data = await supabase.from('courses').select();
  setCache(prev => ({ ...prev, courses: data }));
};
```

### 🎨 UX/UI

#### 1. Feedback utilisateur
```typescript
// ✅ BON - Indiquer ce qui se passe
const [loading, setLoading] = useState(false);
const [error, setError] = useState<string | null>(null);
const [success, setSuccess] = useState(false);

return (
  <>
    {loading && <Spinner />}
    {error && <Alert type="error">{error}</Alert>}
    {success && <Alert type="success">Sauvegardé!</Alert>}
  </>
);
```

#### 2. Validation
```typescript
// ✅ BON - Valider avant l'envoi
if (!title.trim()) {
  setError('Le titre est requis');
  return;
}
if (title.length < 3) {
  setError('Le titre doit avoir au moins 3 caractères');
  return;
}
```

#### 3. Responsive
```html
<!-- ✅ BON - Mobile-first Tailwind -->
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {items.map(item => (...))}
</div>
```

### 📈 Scalabilité

#### 1. Structure pour croissance
```
Au lieu d'un grand AuthContext:
// ❌ Trop de logique dans un context
const [users, courses, messages, grades] = useState(...);

// ✅ Séparer en contextes
<AuthProvider>
  <CoursesProvider>
    <MessagesProvider>
      <App />
    </MessagesProvider>
  </CoursesProvider>
</AuthProvider>
```

#### 2. Utiliser les Migrations
```bash
# Supabase CLI
supabase migration new add_new_feature
supabase migration up

# Permet versioning et reversions
```

#### 3. Monitoring
```typescript
// Logger les erreurs
try {
  await supabase.from('courses').insert(data);
} catch (error) {
  console.error('Error:', error);
  // Envoyer à service monitoring (Sentry, DataDog, etc.)
}
```

### 📚 Maintenance

#### 1. Mise à jour des dépendances
```bash
# Vérifier les updates
npm outdated

# Mettre à jour en sécurité
npm update

# Mettre à jour majeure
npm install react@latest
```

#### 2. Documentation
```typescript
/**
 * Crée un nouveau cours
 * @param title - Titre du cours (min 3 caractères)
 * @param content - Contenu du cours
 * @returns Promise<Course> - Le cours créé
 * @throws Error si les validations échouent
 */
async function createCourse(title: string, content: string): Promise<Course> {
  // ...
}
```

#### 3. Tests (Future)
```typescript
// Ajouter des tests pour les fonctions critiques
test('createCourse should fail without title', () => {
  expect(() => createCourse('', 'content')).toThrow();
});
```

---

## Troubleshooting

### ❌ Problème: "Cannot find module @supabase/supabase-js"

**Solution:**
```bash
npm install @supabase/supabase-js
```

### ❌ Problème: "VITE_SUPABASE_URL is not defined"

**Solution:**
- Créer fichier `.env` à la racine
- Ajouter variables d'environnement
```bash
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=xxxxx...
```
- Relancer `npm run dev`

### ❌ Problème: "Row Level Security policy not found"

**Solution:**
- Vérifier que RLS est activée sur la table
- Vérifier que les policies existent
- Vérifier que `auth.uid()` retourne l'ID correct

### ❌ Problème: "CORS error when calling Supabase"

**Solution:**
- Vérifier que le domaine est dans CORS allowed
- Dans Supabase Dashboard → Project Settings → API
- Ajouter domaine à "Allowed origins"

### ❌ Problème: "Authentication token expired"

**Solution:**
- Redirection vers login automatique
- Supabase refresh les tokens automatiquement
- Si problème: `await supabase.auth.refreshSession()`

### ❌ Problème: "Build échoue avec erreurs TypeScript"

**Solution:**
```bash
# Vérifier les erreurs
npm run typecheck

# Corriger les types
npm run lint -- --fix

# Forcer la build malgré les erreurs (⚠️ non recommandé)
npm run build -- --force
```

### ❌ Problème: "Page blanche après déploiement"

**Checklist:**
- [ ] Variables d'environnement définies chez l'hébergeur
- [ ] Build réussit localement
- [ ] `npm run build && npm run preview` fonctionne
- [ ] Vérifier la console (F12) pour erreurs
- [ ] Vérifier les logs du serveur

### ✅ Déboguer efficacement

```typescript
// 1. Utiliser console.log()
console.log('User:', user);
console.log('Data:', data);

// 2. Vérifier Network tab (F12)
// - Vérifier requêtes Supabase
// - Vérifier status codes
// - Vérifier payloads

// 3. Utiliser debugger
// Dans le code:
debugger;
// F12 → Step through code

// 4. Vérifier React DevTools
// React DevTools extension
// Vérifier state et props
```

---

## Ressources Utiles

### 📚 Documentation Officielle
- [React 18 Docs](https://react.dev)
- [Supabase Docs](https://supabase.com/docs)
- [Tailwind CSS](https://tailwindcss.com)
- [Vite](https://vitejs.dev)
- [TypeScript](https://www.typescriptlang.org)

### 🎓 Tutoriels
- [Supabase + React Tutorial](https://supabase.com/docs/guides/getting-started/quickstarts/reactjs)
- [Tailwind CSS Tutorial](https://tailwindcss.com/docs/installation)

### 🛠️ Outils
- [Supabase Dashboard](https://app.supabase.com)
- [PostgreSQL Docs](https://www.postgresql.org/docs/)
- [Vercel Dashboard](https://vercel.com)

---

## Conclusion

Cette plateforme est conçue pour être :
- ✅ **Sécurisée** - Authentification JWT, RLS, HTTPS
- ✅ **Performante** - Vite, lazy loading, CDN
- ✅ **Maintenable** - Code typé, structure claire
- ✅ **Scalable** - Architecture modulaire

**Prochaines étapes recommandées:**
1. Ajouter des tests unitaires
2. Implémenter des Edge Functions Supabase
3. Ajouter des notifications temps réel
4. Optimiser les performances
5. Augmenter la couverture RLS
6. Ajouter un système de permissions plus fin

---

**Document généré le:** 18/01/2026  
**Version:** 1.0  
**Statut:** Production Ready
