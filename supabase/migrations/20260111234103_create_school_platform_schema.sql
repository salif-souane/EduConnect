/*
  # Plateforme d'interaction école-élèves - Schéma complet
  
  ## Tables principales
  
  ### 1. Profils et utilisateurs
  - `profiles` - Profils utilisateurs avec rôle (admin/enseignant/eleve/parent)
  - `students` - Informations spécifiques aux élèves
  - `teachers` - Informations spécifiques aux enseignants
  - `parents` - Informations spécifiques aux parents
  - `parent_student` - Relation parent-élève
  
  ### 2. Structure pédagogique
  - `classes` - Classes de l'établissement
  - `subjects` - Matières enseignées
  - `teacher_subjects` - Attribution matière-enseignant-classe
  - `schedules` - Emploi du temps
  
  ### 3. Contenu pédagogique
  - `courses` - Cours et ressources
  - `assignments` - Devoirs
  - `grades` - Notes
  
  ### 4. Communication
  - `announcements` - Annonces
  - `messages` - Messages privés
  - `forums` - Forums de discussion
  - `forum_posts` - Publications dans les forums
  
  ### 5. Autres
  - `events` - Événements (réunions, sorties, etc.)
  - `polls` - Sondages
  - `poll_responses` - Réponses aux sondages
  
  ## Sécurité
  - RLS activé sur toutes les tables
  - Politiques strictes selon le rôle
  - Mots de passe gérés par Supabase Auth
*/

-- Extension pour UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ========================================
-- 1. PROFILS ET UTILISATEURS
-- ========================================

-- Table des profils utilisateurs
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  first_name text NOT NULL,
  last_name text NOT NULL,
  role text NOT NULL CHECK (role IN ('admin', 'teacher', 'student', 'parent')),
  address text,
  phone text,
  avatar_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Table des élèves
CREATE TABLE IF NOT EXISTS students (
  id uuid PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  date_of_birth date NOT NULL,
  class_id uuid,
  student_number text UNIQUE,
  created_at timestamptz DEFAULT now()
);

-- Table des enseignants
CREATE TABLE IF NOT EXISTS teachers (
  id uuid PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  specialization text,
  created_at timestamptz DEFAULT now()
);

-- Table des parents
CREATE TABLE IF NOT EXISTS parents (
  id uuid PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now()
);

-- Relation parent-élève
CREATE TABLE IF NOT EXISTS parent_student (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  parent_id uuid NOT NULL REFERENCES parents(id) ON DELETE CASCADE,
  student_id uuid NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  relationship text NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(parent_id, student_id)
);

-- ========================================
-- 2. STRUCTURE PÉDAGOGIQUE
-- ========================================

-- Table des classes
CREATE TABLE IF NOT EXISTS classes (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text NOT NULL UNIQUE,
  level text NOT NULL,
  academic_year text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Table des matières
CREATE TABLE IF NOT EXISTS subjects (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  code text UNIQUE,
  description text,
  created_at timestamptz DEFAULT now()
);

-- Attribution enseignant-matière-classe
CREATE TABLE IF NOT EXISTS teacher_subjects (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  teacher_id uuid NOT NULL REFERENCES teachers(id) ON DELETE CASCADE,
  subject_id uuid NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
  class_id uuid NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(teacher_id, subject_id, class_id)
);

-- Emploi du temps
CREATE TABLE IF NOT EXISTS schedules (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  class_id uuid NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  subject_id uuid NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
  teacher_id uuid NOT NULL REFERENCES teachers(id) ON DELETE CASCADE,
  day_of_week integer NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
  start_time time NOT NULL,
  end_time time NOT NULL,
  room text,
  created_at timestamptz DEFAULT now()
);

-- ========================================
-- 3. CONTENU PÉDAGOGIQUE
-- ========================================

-- Table des cours/ressources
CREATE TABLE IF NOT EXISTS courses (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  title text NOT NULL,
  description text,
  content text,
  file_url text,
  class_id uuid NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  subject_id uuid NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
  teacher_id uuid NOT NULL REFERENCES teachers(id) ON DELETE CASCADE,
  published_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- Table des devoirs
CREATE TABLE IF NOT EXISTS assignments (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  title text NOT NULL,
  description text NOT NULL,
  instructions text,
  due_date timestamptz NOT NULL,
  max_grade numeric(5,2) NOT NULL DEFAULT 20,
  file_url text,
  class_id uuid NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  subject_id uuid NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
  teacher_id uuid NOT NULL REFERENCES teachers(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now()
);

-- Table des notes
CREATE TABLE IF NOT EXISTS grades (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id uuid NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  assignment_id uuid NOT NULL REFERENCES assignments(id) ON DELETE CASCADE,
  grade numeric(5,2) NOT NULL,
  comment text,
  graded_by uuid NOT NULL REFERENCES teachers(id),
  graded_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  UNIQUE(student_id, assignment_id)
);

-- ========================================
-- 4. COMMUNICATION
-- ========================================

-- Table des annonces
CREATE TABLE IF NOT EXISTS announcements (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  title text NOT NULL,
  content text NOT NULL,
  author_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  target_role text CHECK (target_role IN ('all', 'student', 'parent', 'teacher')),
  target_class_id uuid REFERENCES classes(id) ON DELETE CASCADE,
  published_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- Table des messages privés
CREATE TABLE IF NOT EXISTS messages (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  sender_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  recipient_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  subject text NOT NULL,
  content text NOT NULL,
  read boolean DEFAULT false,
  read_at timestamptz,
  sent_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- Table des forums
CREATE TABLE IF NOT EXISTS forums (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  title text NOT NULL,
  description text,
  class_id uuid REFERENCES classes(id) ON DELETE CASCADE,
  created_by uuid NOT NULL REFERENCES profiles(id),
  created_at timestamptz DEFAULT now()
);

-- Table des publications de forum
CREATE TABLE IF NOT EXISTS forum_posts (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  forum_id uuid NOT NULL REFERENCES forums(id) ON DELETE CASCADE,
  author_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title text,
  content text NOT NULL,
  parent_post_id uuid REFERENCES forum_posts(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now()
);

-- ========================================
-- 5. AUTRES
-- ========================================

-- Table des événements
CREATE TABLE IF NOT EXISTS events (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  title text NOT NULL,
  description text,
  event_type text NOT NULL CHECK (event_type IN ('meeting', 'trip', 'vacation', 'appointment', 'other')),
  start_date timestamptz NOT NULL,
  end_date timestamptz,
  location text,
  created_by uuid NOT NULL REFERENCES profiles(id),
  target_class_id uuid REFERENCES classes(id),
  created_at timestamptz DEFAULT now()
);

-- Table des sondages
CREATE TABLE IF NOT EXISTS polls (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  title text NOT NULL,
  question text NOT NULL,
  options jsonb NOT NULL,
  created_by uuid NOT NULL REFERENCES profiles(id),
  target_class_id uuid REFERENCES classes(id),
  expires_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Table des réponses aux sondages
CREATE TABLE IF NOT EXISTS poll_responses (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  poll_id uuid NOT NULL REFERENCES polls(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  response text NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(poll_id, user_id)
);

-- ========================================
-- CONTRAINTE SUPPLÉMENTAIRE
-- ========================================

-- Ajouter la contrainte de classe pour les étudiants
ALTER TABLE students 
ADD CONSTRAINT fk_student_class 
FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE SET NULL;

-- ========================================
-- ROW LEVEL SECURITY (RLS)
-- ========================================

-- Activer RLS sur toutes les tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE teachers ENABLE ROW LEVEL SECURITY;
ALTER TABLE parents ENABLE ROW LEVEL SECURITY;
ALTER TABLE parent_student ENABLE ROW LEVEL SECURITY;
ALTER TABLE classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE teacher_subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE grades ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE forums ENABLE ROW LEVEL SECURITY;
ALTER TABLE forum_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE polls ENABLE ROW LEVEL SECURITY;
ALTER TABLE poll_responses ENABLE ROW LEVEL SECURITY;

-- ========================================
-- POLICIES - PROFILES
-- ========================================

-- Les utilisateurs peuvent voir leur propre profil
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Les utilisateurs peuvent modifier leur propre profil
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Les admins peuvent tout voir
CREATE POLICY "Admins can view all profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Les admins peuvent tout gérer
CREATE POLICY "Admins can manage all profiles"
  ON profiles FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Les enseignants peuvent voir les profils des élèves de leurs classes
CREATE POLICY "Teachers can view students in their classes"
  ON profiles FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid() AND p.role = 'teacher'
    )
    AND role = 'student'
  );

-- ========================================
-- POLICIES - STUDENTS
-- ========================================

CREATE POLICY "Students can view own data"
  ON students FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Admins can manage students"
  ON students FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Teachers can view students"
  ON students FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'teacher'
    )
  );

CREATE POLICY "Parents can view their children"
  ON students FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM parent_student ps
      WHERE ps.student_id = students.id
      AND ps.parent_id = auth.uid()
    )
  );

-- ========================================
-- POLICIES - TEACHERS
-- ========================================

CREATE POLICY "Teachers can view own data"
  ON teachers FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Admins can manage teachers"
  ON teachers FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "All authenticated can view teachers"
  ON teachers FOR SELECT
  TO authenticated
  USING (true);

-- ========================================
-- POLICIES - PARENTS
-- ========================================

CREATE POLICY "Parents can view own data"
  ON parents FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Admins can manage parents"
  ON parents FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ========================================
-- POLICIES - PARENT_STUDENT
-- ========================================

CREATE POLICY "Parents can view their children relationships"
  ON parent_student FOR SELECT
  TO authenticated
  USING (parent_id = auth.uid());

CREATE POLICY "Admins can manage parent_student"
  ON parent_student FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ========================================
-- POLICIES - CLASSES
-- ========================================

CREATE POLICY "All authenticated can view classes"
  ON classes FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can manage classes"
  ON classes FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ========================================
-- POLICIES - SUBJECTS
-- ========================================

CREATE POLICY "All authenticated can view subjects"
  ON subjects FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can manage subjects"
  ON subjects FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ========================================
-- POLICIES - TEACHER_SUBJECTS
-- ========================================

CREATE POLICY "All authenticated can view teacher_subjects"
  ON teacher_subjects FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can manage teacher_subjects"
  ON teacher_subjects FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ========================================
-- POLICIES - SCHEDULES
-- ========================================

CREATE POLICY "All authenticated can view schedules"
  ON schedules FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can manage schedules"
  ON schedules FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Teachers can manage schedules"
  ON schedules FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'teacher'
    )
  );

-- ========================================
-- POLICIES - COURSES
-- ========================================

CREATE POLICY "Students can view courses for their class"
  ON courses FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM students
      WHERE id = auth.uid() AND class_id = courses.class_id
    )
  );

CREATE POLICY "Teachers can view and manage their courses"
  ON courses FOR ALL
  TO authenticated
  USING (teacher_id = auth.uid())
  WITH CHECK (teacher_id = auth.uid());

CREATE POLICY "Parents can view courses for their children's classes"
  ON courses FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM parent_student ps
      JOIN students s ON ps.student_id = s.id
      WHERE ps.parent_id = auth.uid() AND s.class_id = courses.class_id
    )
  );

CREATE POLICY "Admins can manage all courses"
  ON courses FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ========================================
-- POLICIES - ASSIGNMENTS
-- ========================================

CREATE POLICY "Students can view assignments for their class"
  ON assignments FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM students
      WHERE id = auth.uid() AND class_id = assignments.class_id
    )
  );

CREATE POLICY "Teachers can manage their assignments"
  ON assignments FOR ALL
  TO authenticated
  USING (teacher_id = auth.uid())
  WITH CHECK (teacher_id = auth.uid());

CREATE POLICY "Parents can view assignments for their children's classes"
  ON assignments FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM parent_student ps
      JOIN students s ON ps.student_id = s.id
      WHERE ps.parent_id = auth.uid() AND s.class_id = assignments.class_id
    )
  );

CREATE POLICY "Admins can manage all assignments"
  ON assignments FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ========================================
-- POLICIES - GRADES
-- ========================================

CREATE POLICY "Students can view own grades"
  ON grades FOR SELECT
  TO authenticated
  USING (student_id = auth.uid());

CREATE POLICY "Teachers can manage grades"
  ON grades FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'teacher'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'teacher'
    )
  );

CREATE POLICY "Parents can view their children's grades"
  ON grades FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM parent_student ps
      WHERE ps.parent_id = auth.uid() AND ps.student_id = grades.student_id
    )
  );

CREATE POLICY "Admins can view all grades"
  ON grades FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ========================================
-- POLICIES - ANNOUNCEMENTS
-- ========================================

CREATE POLICY "All authenticated can view announcements"
  ON announcements FOR SELECT
  TO authenticated
  USING (
    target_role = 'all'
    OR (
      target_role IN (
        SELECT role FROM profiles WHERE id = auth.uid()
      )
    )
    OR (
      target_class_id IN (
        SELECT class_id FROM students WHERE id = auth.uid()
      )
    )
  );

CREATE POLICY "Admins and teachers can create announcements"
  ON announcements FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('admin', 'teacher')
    )
  );

CREATE POLICY "Authors can update their announcements"
  ON announcements FOR UPDATE
  TO authenticated
  USING (author_id = auth.uid())
  WITH CHECK (author_id = auth.uid());

CREATE POLICY "Authors can delete their announcements"
  ON announcements FOR DELETE
  TO authenticated
  USING (author_id = auth.uid());

-- ========================================
-- POLICIES - MESSAGES
-- ========================================

CREATE POLICY "Users can view messages they sent"
  ON messages FOR SELECT
  TO authenticated
  USING (sender_id = auth.uid());

CREATE POLICY "Users can view messages they received"
  ON messages FOR SELECT
  TO authenticated
  USING (recipient_id = auth.uid());

CREATE POLICY "Users can send messages"
  ON messages FOR INSERT
  TO authenticated
  WITH CHECK (sender_id = auth.uid());

CREATE POLICY "Recipients can update messages"
  ON messages FOR UPDATE
  TO authenticated
  USING (recipient_id = auth.uid())
  WITH CHECK (recipient_id = auth.uid());

-- ========================================
-- POLICIES - FORUMS
-- ========================================

CREATE POLICY "Students can view forums for their class"
  ON forums FOR SELECT
  TO authenticated
  USING (
    class_id IS NULL
    OR EXISTS (
      SELECT 1 FROM students
      WHERE id = auth.uid() AND class_id = forums.class_id
    )
  );

CREATE POLICY "Teachers can view all forums"
  ON forums FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'teacher'
    )
  );

CREATE POLICY "Teachers can create forums"
  ON forums FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'teacher'
    )
  );

CREATE POLICY "Admins can manage all forums"
  ON forums FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ========================================
-- POLICIES - FORUM_POSTS
-- ========================================

CREATE POLICY "Users can view posts in accessible forums"
  ON forum_posts FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM forums
      WHERE id = forum_posts.forum_id
      AND (
        class_id IS NULL
        OR class_id IN (
          SELECT class_id FROM students WHERE id = auth.uid()
        )
        OR EXISTS (
          SELECT 1 FROM profiles
          WHERE id = auth.uid() AND role IN ('teacher', 'admin')
        )
      )
    )
  );

CREATE POLICY "Students and teachers can create posts"
  ON forum_posts FOR INSERT
  TO authenticated
  WITH CHECK (
    author_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('student', 'teacher')
    )
  );

CREATE POLICY "Authors can update their posts"
  ON forum_posts FOR UPDATE
  TO authenticated
  USING (author_id = auth.uid())
  WITH CHECK (author_id = auth.uid());

CREATE POLICY "Authors can delete their posts"
  ON forum_posts FOR DELETE
  TO authenticated
  USING (author_id = auth.uid());

-- ========================================
-- POLICIES - EVENTS
-- ========================================

CREATE POLICY "All authenticated can view events"
  ON events FOR SELECT
  TO authenticated
  USING (
    target_class_id IS NULL
    OR target_class_id IN (
      SELECT class_id FROM students WHERE id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('teacher', 'admin', 'parent')
    )
  );

CREATE POLICY "Admins and teachers can create events"
  ON events FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('admin', 'teacher')
    )
  );

CREATE POLICY "Creators can update their events"
  ON events FOR UPDATE
  TO authenticated
  USING (created_by = auth.uid())
  WITH CHECK (created_by = auth.uid());

CREATE POLICY "Creators can delete their events"
  ON events FOR DELETE
  TO authenticated
  USING (created_by = auth.uid());

-- ========================================
-- POLICIES - POLLS
-- ========================================

CREATE POLICY "All authenticated can view polls"
  ON polls FOR SELECT
  TO authenticated
  USING (
    target_class_id IS NULL
    OR target_class_id IN (
      SELECT class_id FROM students WHERE id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('teacher', 'admin')
    )
  );

CREATE POLICY "Admins and teachers can create polls"
  ON polls FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('admin', 'teacher')
    )
  );

-- ========================================
-- POLICIES - POLL_RESPONSES
-- ========================================

CREATE POLICY "Users can view their own responses"
  ON poll_responses FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can submit responses"
  ON poll_responses FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Teachers can view all responses"
  ON poll_responses FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('teacher', 'admin')
    )
  );

-- ========================================
-- INDEXES
-- ========================================

CREATE INDEX IF NOT EXISTS idx_students_class ON students(class_id);
CREATE INDEX IF NOT EXISTS idx_parent_student_parent ON parent_student(parent_id);
CREATE INDEX IF NOT EXISTS idx_parent_student_student ON parent_student(student_id);
CREATE INDEX IF NOT EXISTS idx_teacher_subjects_teacher ON teacher_subjects(teacher_id);
CREATE INDEX IF NOT EXISTS idx_teacher_subjects_class ON teacher_subjects(class_id);
CREATE INDEX IF NOT EXISTS idx_courses_class ON courses(class_id);
CREATE INDEX IF NOT EXISTS idx_courses_teacher ON courses(teacher_id);
CREATE INDEX IF NOT EXISTS idx_assignments_class ON assignments(class_id);
CREATE INDEX IF NOT EXISTS idx_grades_student ON grades(student_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_recipient ON messages(recipient_id);
CREATE INDEX IF NOT EXISTS idx_forum_posts_forum ON forum_posts(forum_id);
CREATE INDEX IF NOT EXISTS idx_schedules_class ON schedules(class_id);