import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { BookOpen, Plus, Edit, Trash2 } from 'lucide-react';

type Course = {
  id: string;
  title: string;
  description: string | null;
  content: string | null;
  file_url: string | null;
  class_id: string;
  subject_id: string;
  teacher_id: string;
  published_at: string;
  created_at: string;
  classes?: {
    name: string;
  };
  subjects?: {
    name: string;
  };
};

type Class = {
  id: string;
  name: string;
};

type Subject = {
  id: string;
  name: string;
};

export default function CoursesManagement() {
  const { user } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [content, setContent] = useState('');
  const [classId, setClassId] = useState('');
  const [subjectId, setSubjectId] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      // Load courses for the current teacher
      if (!user?.id) {
        setLoading(false);
        return;
      }
      const { data: coursesData, error: coursesError } = await supabase
        .from('courses')
        .select(`
          *,
          classes (
            name
          ),
          subjects (
            name
          )
        `)
        .eq('teacher_id', user.id)
        .order('created_at', { ascending: false });

      if (coursesError) throw coursesError;
      setCourses(coursesData || []);

      // Load classes and subjects for dropdowns
      const [classesRes, subjectsRes] = await Promise.all([
        supabase.from('classes').select('id, name').order('name'),
        supabase.from('subjects').select('id, name').order('name')
      ]);

      setClasses(classesRes.data || []);
      setSubjects(subjectsRes.data || []);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setContent('');
    setClassId('');
    setSubjectId('');
    setEditingId(null);
    setShowForm(false);
  };

  const startEdit = (course: Course) => {
    setEditingId(course.id);
    setTitle(course.title);
    setDescription(course.description || '');
    setContent(course.content || '');
    setClassId(course.class_id);
    setSubjectId(course.subject_id);
    setShowForm(true);
  };

  const createCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      const courseData = {
        title,
        description: description || null,
        content: content || null,
        class_id: classId,
        subject_id: subjectId,
        teacher_id: user.id,
      };

      if (editingId) {
        const { error } = await supabase
          .from('courses')
          .update(courseData)
          .eq('id', editingId);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('courses')
          .insert(courseData);
        if (error) throw error;
      }

      await loadData();
      resetForm();
      alert(editingId ? 'Cours mis à jour avec succès' : 'Cours créé avec succès');
    } catch (error) {
      console.error('Error saving course:', error);
      const message = error instanceof Error ? error.message : String(error);
      alert('Erreur lors de la sauvegarde: ' + message);
    }
  };

  const deleteCourse = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce cours ?')) return;

    try {
      const { error } = await supabase
        .from('courses')
        .delete()
        .eq('id', id);
      if (error) throw error;

      setCourses(courses.filter(c => c.id !== id));
      alert('Cours supprimé avec succès');
    } catch (error) {
      console.error('Error deleting course:', error);
      const message = error instanceof Error ? error.message : String(error);
      alert('Erreur lors de la suppression: ' + message);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-3xl font-bold mb-2">
  <span className="text-black">Gestion des</span>{" "}
  <span className="text-green-500">cours</span>
</h2>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          <Plus className="w-5 h-5" />
          <span>Nouveau cours</span>
        </button>
      </div>

      {showForm && (
        <div className="mb-6 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold mb-4">
            {editingId ? 'Modifier le cours' : 'Créer un cours'}
          </h3>
          <form onSubmit={createCourse} className="space-y-4">
            <div>
              <label htmlFor="course-title" className="block text-sm font-medium text-gray-700 mb-1">
                Titre du cours
              </label>
              <input
                id="course-title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="course-class" className="block text-sm font-medium text-gray-700 mb-1">
                  Classe
                </label>
                <select
                  id="course-class"
                  value={classId}
                  onChange={(e) => setClassId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="">Sélectionner une classe</option>
                  {classes.map((cls) => (
                    <option key={cls.id} value={cls.id}>
                      {cls.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="course-subject" className="block text-sm font-medium text-gray-700 mb-1">
                  Matière
                </label>
                <select
                  id="course-subject"
                  value={subjectId}
                  onChange={(e) => setSubjectId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="">Sélectionner une matière</option>
                  {subjects.map((subject) => (
                    <option key={subject.id} value={subject.id}>
                      {subject.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="course-description" className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                id="course-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Description du cours (optionnel)"
              />
            </div>

            <div>
              <label htmlFor="course-content" className="block text-sm font-medium text-gray-700 mb-1">
                Contenu du cours
              </label>
              <textarea
                id="course-content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={6}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Contenu détaillé du cours"
              />
            </div>

            <div className="flex space-x-3">
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                {editingId ? 'Mettre à jour' : 'Publier'}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
              >
                Annuler
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="space-y-4">
        {courses.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Aucun cours
            </h3>
            <p className="text-gray-600">
              Créez votre premier cours pour partager du contenu avec vos élèves.
            </p>
          </div>
        ) : (
          courses.map((course) => (
            <div
              key={course.id}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <BookOpen className="w-5 h-5 text-blue-600" />
                    <h3 className="text-lg font-semibold text-gray-900">
                      {course.title}
                    </h3>
                    <span className="px-2 py-1 text-xs bg-blue-100 text-blue-600 rounded-full">
                      {course.classes?.name}
                    </span>
                    <span className="px-2 py-1 text-xs bg-green-100 text-green-600 rounded-full">
                      {course.subjects?.name}
                    </span>
                  </div>

                  {course.description && (
                    <p className="text-gray-600 mb-3">
                      {course.description}
                    </p>
                  )}

                  {course.content && (
                    <div className="bg-gray-50 rounded-lg p-4 mb-3">
                      <p className="text-sm text-gray-700 line-clamp-3">
                        {course.content}
                      </p>
                    </div>
                  )}

                  <div className="text-sm text-gray-500">
                    Publié le {new Date(course.published_at).toLocaleDateString('fr-FR')}
                  </div>
                </div>

                <div className="flex items-center space-x-2 ml-4">
                  <button
                    onClick={() => startEdit(course)}
                    className="p-2 text-gray-400 hover:text-blue-600 transition"
                    title="Modifier"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => deleteCourse(course.id)}
                    className="p-2 text-gray-400 hover:text-red-600 transition"
                    title="Supprimer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
