import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { CheckCircle2, Clock } from 'lucide-react';

type Assignment = {
  id: string;
  title: string;
  description: string | null;
  instructions: string | null;
  due_date: string;
  subjects?: {
    name: string;
  };
  profiles?: {
    first_name: string;
    last_name: string;
  };
};

type StudentData = {
  class_id: string | null;
};

export default function AssignmentsView() {
  const { user } = useAuth();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('all');

  const loadAssignments = useCallback(async () => {
    setLoading(true);
    try {
      if (!user?.id) {
        setLoading(false);
        return;
      }

      // Get student's class
      const { data: studentData } = await supabase
        .from('students')
        .select('class_id')
        .eq('id', user.id)
        .single() as { data: StudentData | null; error: any };

      if (!studentData || !studentData.class_id) {
        setLoading(false);
        return;
      }

      const classId = studentData.class_id;

      // Load assignments for student's class
      const { data: assignmentsData, error } = await supabase
        .from('assignments')
        .select(`
          *,
          subjects (
            name
          ),
          profiles (
            first_name,
            last_name
          )
        `)
        .eq('class_id', classId)
        .order('due_date', { ascending: true });

      if (error) throw error;
      setAssignments(assignmentsData || []);
    } catch (error) {
      console.error('Error loading assignments:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadAssignments();
  }, [loadAssignments]);

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

  const getDaysRemaining = (dueDate: string) => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const due = new Date(dueDate);
    due.setHours(0, 0, 0, 0);
    const diff = Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return diff;
  };

  const filteredAssignments = assignments.filter(a => {
    if (filter === 'pending') return !isOverdue(a.due_date) && new Date(a.due_date) > new Date();
    if (filter === 'completed') return isOverdue(a.due_date) || new Date(a.due_date) <= new Date();
    return true;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold">Mes devoirs</h2>
        <p className="text-gray-600 mt-2">Consultez vos devoirs et leurs échéances</p>
      </div>

      {selectedAssignment ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-6">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-2xl font-bold text-white mb-2">{selectedAssignment.title}</h3>
                <div className="flex items-center space-x-4 text-blue-100">
                  <span>{selectedAssignment.subjects?.name}</span>
                  <span>•</span>
                  <span>{selectedAssignment.profiles?.first_name} {selectedAssignment.profiles?.last_name}</span>
                </div>
              </div>
              <button
                onClick={() => setSelectedAssignment(null)}
                className="px-4 py-2 bg-white text-blue-600 rounded-lg hover:bg-blue-50 transition"
              >
                ← Retour
              </button>
            </div>
          </div>

          <div className="p-6 space-y-6">
            <div className={`p-4 rounded-lg ${isOverdue(selectedAssignment.due_date) ? 'bg-red-50 border border-red-200' : getDaysRemaining(selectedAssignment.due_date) <= 3 ? 'bg-orange-50 border border-orange-200' : 'bg-blue-50 border border-blue-200'}`}>
              <p className={`font-semibold ${isOverdue(selectedAssignment.due_date) ? 'text-red-700' : getDaysRemaining(selectedAssignment.due_date) <= 3 ? 'text-orange-700' : 'text-blue-700'}`}>
                Limite: {formatDate(selectedAssignment.due_date)}
                {!isOverdue(selectedAssignment.due_date) && (
                  <span className="ml-2 text-sm">({getDaysRemaining(selectedAssignment.due_date)} jour{getDaysRemaining(selectedAssignment.due_date) !== 1 ? 's' : ''} restant{getDaysRemaining(selectedAssignment.due_date) !== 1 ? 's' : ''})</span>
                )}
              </p>
            </div>

            {selectedAssignment.description && (
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Description</h4>
                <p className="text-gray-700">{selectedAssignment.description}</p>
              </div>
            )}

            {selectedAssignment.instructions && (
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Instructions détaillées</h4>
                <div className="bg-gray-50 rounded-lg p-6 text-gray-700 whitespace-pre-wrap">
                  {selectedAssignment.instructions}
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        <>
          <div className="mb-6 flex space-x-2">
            {(['all', 'pending', 'completed'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  filter === f
                    ? 'bg-blue-600 text-white'
                    : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
                }`}
              >
                {f === 'all' && 'Tous'}
                {f === 'pending' && 'En attente'}
                {f === 'completed' && 'Complétés'}
              </button>
            ))}
          </div>

          <div className="space-y-4">
            {filteredAssignments.length === 0 ? (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                <CheckCircle2 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Aucun devoir
                </h3>
                <p className="text-gray-600">
                  {filter === 'all' && 'Aucun devoir n\'est disponible pour le moment.'}
                  {filter === 'pending' && 'Aucun devoir en attente.'}
                  {filter === 'completed' && 'Aucun devoir complété.'}
                </p>
              </div>
            ) : (
              filteredAssignments.map((assignment) => (
                <div
                  key={assignment.id}
                  onClick={() => setSelectedAssignment(assignment)}
                  className={`bg-white rounded-xl shadow-sm border p-6 cursor-pointer hover:shadow-md transition ${
                    isOverdue(assignment.due_date) ? 'border-red-200' : getDaysRemaining(assignment.due_date) <= 3 ? 'border-orange-200' : 'border-gray-200'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <CheckCircle2 className={`w-5 h-5 ${
                          isOverdue(assignment.due_date) ? 'text-red-600' : getDaysRemaining(assignment.due_date) <= 3 ? 'text-orange-600' : 'text-blue-600'
                        }`} />
                        <h3 className="text-lg font-semibold text-gray-900">
                          {assignment.title}
                        </h3>
                      </div>

                      <div className="flex items-center space-x-2 mb-3">
                        <span className="px-2 py-1 text-xs bg-blue-100 text-blue-600 rounded-full">
                          {assignment.subjects?.name}
                        </span>
                        <span className="text-sm text-gray-600">
                          {assignment.profiles?.first_name} {assignment.profiles?.last_name}
                        </span>
                      </div>

                      {assignment.description && (
                        <p className="text-gray-600 line-clamp-2">
                          {assignment.description}
                        </p>
                      )}

                      <div className={`mt-3 flex items-center space-x-2 font-semibold ${
                        isOverdue(assignment.due_date) ? 'text-red-600' : getDaysRemaining(assignment.due_date) <= 3 ? 'text-orange-600' : 'text-gray-600'
                      }`}>
                        <Clock className="w-4 h-4" />
                        <span>
                          Limite: {formatDate(assignment.due_date)}
                          {!isOverdue(assignment.due_date) && (
                            <span className="text-sm ml-1">({getDaysRemaining(assignment.due_date)}j)</span>
                          )}
                        </span>
                      </div>
                    </div>

                    <div className="ml-4">
                      <button className="px-4 py-2 text-blue-600 font-medium hover:bg-blue-50 rounded-lg transition">
                        Voir →
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </>
      )}
    </div>
  );
}
