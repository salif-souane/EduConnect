import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { CheckCircle2, Plus, Edit, Trash2, BookMarked } from 'lucide-react';

type Assignment = {
  id: string;
  title: string;
  description: string | null;
  instructions: string | null;
  due_date: string;
  class_id: string;
  subject_id: string;
  teacher_id: string;
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

export default function AssignmentsManagement() {
  const { user } = useAuth();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [instructions, setInstructions] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [classId, setClassId] = useState('');
  const [subjectId, setSubjectId] = useState('');

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

      // Load assignments for the current teacher
      const { data: assignmentsData, error: assignmentsError } = await supabase
        .from('assignments')
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
        .order('due_date', { ascending: true });

      if (assignmentsError) throw assignmentsError;
      setAssignments(assignmentsData || []);

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
    setInstructions('');
    setDueDate('');
    setClassId('');
    setSubjectId('');
    setEditingId(null);
    setShowForm(false);
  };

  const startEdit = (assignment: Assignment) => {
    setEditingId(assignment.id);
    setTitle(assignment.title);
    setDescription(assignment.description || '');
    setInstructions(assignment.instructions || '');
    setDueDate(assignment.due_date.split('T')[0]);
    setClassId(assignment.class_id);
    setSubjectId(assignment.subject_id);
    setShowForm(true);
  };

  const createAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      const assignmentData = {
        title,
        description: description || null,
        instructions: instructions || null,
        due_date: dueDate,
        class_id: classId,
        subject_id: subjectId,
        teacher_id: user.id,
      };

      if (editingId) {
        const { error } = await supabase
          .from('assignments')
          .update(assignmentData)
          .eq('id', editingId);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('assignments')
          .insert(assignmentData);
        if (error) throw error;
      }

      await loadData();
      resetForm();
      alert(editingId ? 'Devoir mis à jour avec succès' : 'Devoir créé avec succès');
    } catch (error) {
      console.error('Error saving assignment:', error);
      const message = error instanceof Error ? error.message : String(error);
      alert('Erreur lors de la sauvegarde: ' + message);
    }
  };

  const deleteAssignment = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce devoir ?')) return;

    try {
      const { error } = await supabase
        .from('assignments')
        .delete()
        .eq('id', id);
      if (error) throw error;

      setAssignments(assignments.filter(a => a.id !== id));
      alert('Devoir supprimé avec succès');
    } catch (error) {
      console.error('Error deleting assignment:', error);
      const message = error instanceof Error ? error.message : String(error);
      alert('Erreur lors de la suppression: ' + message);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const isOverdue = (dueDate: string) => {
    return new Date(dueDate) < new Date() && new Date().toDateString() !== new Date(dueDate).toDateString();
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
  <span className="text-green-500">devoirs</span>
</h2>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          <Plus className="w-5 h-5" />
          <span>Nouveau devoir</span>
        </button>
      </div>

      {showForm && (
        <div className="mb-6 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold mb-4">
            {editingId ? 'Modifier le devoir' : 'Créer un devoir'}
          </h3>
          <form onSubmit={createAssignment} className="space-y-4">
            <div>
              <label htmlFor="assignment-title" className="block text-sm font-medium text-gray-700 mb-1">
                Titre du devoir
              </label>
              <input
                id="assignment-title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="assignment-class" className="block text-sm font-medium text-gray-700 mb-1">
                  Classe
                </label>
                <select
                  id="assignment-class"
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
                <label htmlFor="assignment-subject" className="block text-sm font-medium text-gray-700 mb-1">
                  Matière
                </label>
                <select
                  id="assignment-subject"
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
              <label htmlFor="assignment-duedate" className="block text-sm font-medium text-gray-700 mb-1">
                Date limite
              </label>
              <input
                id="assignment-duedate"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label htmlFor="assignment-description" className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                id="assignment-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Description courte du devoir"
              />
            </div>

            <div>
              <label htmlFor="assignment-instructions" className="block text-sm font-medium text-gray-700 mb-1">
                Instructions détaillées
              </label>
              <textarea
                id="assignment-instructions"
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                rows={6}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Instructions détaillées du devoir"
              />
            </div>

            <div className="flex space-x-3">
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                {editingId ? 'Mettre à jour' : 'Créer'}
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
        {assignments.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <BookMarked className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Aucun devoir
            </h3>
            <p className="text-gray-600">
              Créez votre premier devoir pour donner du travail à vos élèves.
            </p>
          </div>
        ) : (
          assignments.map((assignment) => (
            <div
              key={assignment.id}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <CheckCircle2 className="w-5 h-5 text-blue-600" />
                    <h3 className="text-lg font-semibold text-gray-900">
                      {assignment.title}
                    </h3>
                    <span className="px-2 py-1 text-xs bg-blue-100 text-blue-600 rounded-full">
                      {assignment.classes?.name}
                    </span>
                    <span className="px-2 py-1 text-xs bg-green-100 text-green-600 rounded-full">
                      {assignment.subjects?.name}
                    </span>
                  </div>

                  {assignment.description && (
                    <p className="text-gray-600 mb-3">
                      {assignment.description}
                    </p>
                  )}

                  {assignment.instructions && (
                    <div className="bg-gray-50 rounded-lg p-4 mb-3">
                      <p className="text-sm text-gray-700 line-clamp-3">
                        {assignment.instructions}
                      </p>
                    </div>
                  )}

                  <div className="flex items-center space-x-4 text-sm">
                    <span className={`font-medium ${isOverdue(assignment.due_date) ? 'text-red-600' : 'text-gray-600'}`}>
                      Limite: {formatDate(assignment.due_date)}
                    </span>
                  </div>
                </div>

                <div className="flex items-center space-x-2 ml-4">
                  <button
                    onClick={() => startEdit(assignment)}
                    className="p-2 text-gray-400 hover:text-blue-600 transition"
                    title="Modifier"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => deleteAssignment(assignment.id)}
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
