import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { BarChart3, Plus, Edit, Trash2 } from 'lucide-react';

type Grade = {
  id: string;
  student_id: string;
  subject_id: string;
  grade: number;
  comments: string | null;
  graded_at: string;
  teacher_id: string;
  profiles?: {
    first_name: string;
    last_name: string;
  };
  subjects?: {
    name: string;
  };
};

type Student = {
  id: string;
  profiles?: {
    first_name: string;
    last_name: string;
  } | {
    first_name: string;
    last_name: string;
  }[];
};

type Subject = {
  id: string;
  name: string;
};

export default function GradesManagement() {
  const { user } = useAuth();
  const [grades, setGrades] = useState<Grade[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form state
  const [studentId, setStudentId] = useState('');
  const [subjectId, setSubjectId] = useState('');
  const [grade, setGrade] = useState('');
  const [comments, setComments] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      if (!user?.id) {
        setLoading(false);
        return;
      }

      // Load grades for the current teacher
      const { data: gradesData, error: gradesError } = await supabase
        .from('grades')
        .select(`
          *,
          profiles (
            first_name,
            last_name
          ),
          subjects (
            name
          )
        `)
        .eq('teacher_id', user.id)
        .order('graded_at', { ascending: false });

      if (gradesError) throw gradesError;
      setGrades(gradesData || []);

      // Load students and subjects for dropdowns
      const [studentsRes, subjectsRes] = await Promise.all([
        supabase
          .from('students')
          .select('id, profiles!inner(first_name, last_name)')
          .order('profiles.first_name'),
        supabase.from('subjects').select('id, name').order('name')
      ]);

      setStudents(studentsRes.data || []);
      setSubjects(subjectsRes.data || []);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setStudentId('');
    setSubjectId('');
    setGrade('');
    setComments('');
    setEditingId(null);
    setShowForm(false);
  };

  const startEdit = (g: Grade) => {
    setEditingId(g.id);
    setStudentId(g.student_id);
    setSubjectId(g.subject_id);
    setGrade(g.grade.toString());
    setComments(g.comments || '');
    setShowForm(true);
  };

  const createGrade = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      const gradeValue = Number.parseFloat(grade);
      if (Number.isNaN(gradeValue) || gradeValue < 0 || gradeValue > 20) {
        alert('La note doit être un nombre entre 0 et 20');
        return;
      }

      const gradeData = {
        student_id: studentId,
        subject_id: subjectId,
        grade: gradeValue,
        comments: comments || null,
        teacher_id: user.id,
        graded_at: new Date().toISOString(),
      };

      if (editingId) {
        const { error } = await supabase
          .from('grades')
          .update(gradeData)
          .eq('id', editingId);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('grades')
          .insert(gradeData);
        if (error) throw error;
      }

      await loadData();
      resetForm();
      alert(editingId ? 'Note mise à jour avec succès' : 'Note enregistrée avec succès');
    } catch (error) {
      console.error('Error saving grade:', error);
      const message = error instanceof Error ? error.message : String(error);
      alert('Erreur lors de la sauvegarde: ' + message);
    }
  };

  const deleteGrade = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette note ?')) return;

    try {
      const { error } = await supabase
        .from('grades')
        .delete()
        .eq('id', id);
      if (error) throw error;

      setGrades(grades.filter(g => g.id !== id));
      alert('Note supprimée avec succès');
    } catch (error) {
      console.error('Error deleting grade:', error);
      const message = error instanceof Error ? error.message : String(error);
      alert('Erreur lors de la suppression: ' + message);
    }
  };

  const getGradeColor = (score: number) => {
    if (score >= 16) return 'text-green-600';
    if (score >= 12) return 'text-blue-600';
    if (score >= 10) return 'text-orange-600';
    return 'text-red-600';
  };

  const getGradeBackground = (score: number) => {
    if (score >= 16) return 'bg-green-100';
    if (score >= 12) return 'bg-blue-100';
    if (score >= 10) return 'bg-orange-100';
    return 'bg-red-100';
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
  <span className="text-green-500">notes</span>
</h2>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          <Plus className="w-5 h-5" />
          <span>Ajouter une note</span>
        </button>
      </div>

      {showForm && (
        <div className="mb-6 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold mb-4">
            {editingId ? 'Modifier la note' : 'Ajouter une note'}
          </h3>
          <form onSubmit={createGrade} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="grade-student" className="block text-sm font-medium text-gray-700 mb-1">
                  Élève
                </label>
                <select
                  id="grade-student"
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="">Sélectionner un élève</option>
                  {students.map((student) => {
                    const profile = Array.isArray(student.profiles) 
                      ? student.profiles[0] 
                      : student.profiles;
                    return (
                      <option key={student.id} value={student.id}>
                        {profile?.first_name} {profile?.last_name}
                      </option>
                    );
                  })}
                </select>
              </div>

              <div>
                <label htmlFor="grade-subject" className="block text-sm font-medium text-gray-700 mb-1">
                  Matière
                </label>
                <select
                  id="grade-subject"
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
              <label htmlFor="grade-value" className="block text-sm font-medium text-gray-700 mb-1">
                Note (0-20)
              </label>
              <input
                id="grade-value"
                type="number"
                min="0"
                max="20"
                step="0.5"
                value={grade}
                onChange={(e) => setGrade(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label htmlFor="grade-comments" className="block text-sm font-medium text-gray-700 mb-1">
                Commentaires
              </label>
              <textarea
                id="grade-comments"
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Commentaires sur la performance de l'élève (optionnel)"
              />
            </div>

            <div className="flex space-x-3">
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                {editingId ? 'Mettre à jour' : 'Enregistrer'}
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
        {grades.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <BarChart3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Aucune note
            </h3>
            <p className="text-gray-600">
              Commencez à enregistrer les notes des élèves.
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <table className="w-full text-left">
              <thead>
                <tr className="text-sm font-medium text-gray-700 border-b bg-gray-50">
                  <th className="px-6 py-3">Élève</th>
                  <th className="px-6 py-3">Matière</th>
                  <th className="px-6 py-3">Note</th>
                  <th className="px-6 py-3">Commentaires</th>
                  <th className="px-6 py-3">Date</th>
                  <th className="px-6 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {grades.map((g) => (
                  <tr key={g.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4 text-sm text-gray-900 font-medium">
                      {g.profiles?.first_name} {g.profiles?.last_name}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {g.subjects?.name}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center justify-center w-10 h-10 rounded-lg font-bold ${getGradeBackground(g.grade)} ${getGradeColor(g.grade)}`}>
                        {g.grade}/20
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate">
                      {g.comments || '-'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(g.graded_at).toLocaleDateString('fr-FR')}
                    </td>
                    <td className="px-6 py-4 flex items-center space-x-2">
                      <button
                        onClick={() => startEdit(g)}
                        className="p-2 text-gray-400 hover:text-blue-600 transition"
                        title="Modifier"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => deleteGrade(g.id)}
                        className="p-2 text-gray-400 hover:text-red-600 transition"
                        title="Supprimer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
