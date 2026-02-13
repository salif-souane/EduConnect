import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { BarChart3, TrendingUp } from 'lucide-react';

type Grade = {
  id: string;
  grade: number;
  comments: string | null;
  graded_at: string;
  subjects?: {
    name: string;
  };
  profiles?: {
    first_name: string;
    last_name: string;
  };
};

export default function GradesView() {
  const { user } = useAuth();
  const [grades, setGrades] = useState<Grade[]>([]);
  const [loading, setLoading] = useState(true);

  const loadGrades = useCallback(async () => {
    setLoading(true);
    try {
      if (!user?.id) {
        setLoading(false);
        return;
      }

      // Load grades for the current student
      const { data: gradesData, error } = await supabase
        .from('grades')
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
        .eq('student_id', user.id)
        .order('graded_at', { ascending: false });

      if (error) throw error;
      setGrades(gradesData || []);
    } catch (error) {
      console.error('Error loading grades:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadGrades();
  }, [loadGrades]);

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

  const getGradeBadge = (score: number) => {
    if (score >= 16) return 'Excellent';
    if (score >= 12) return 'Bon';
    if (score >= 10) return 'Moyen';
    return 'À améliorer';
  };

  const calculateAverage = (): string => {
    if (grades.length === 0) return '0';
    const sum = grades.reduce((acc, g) => acc + g.grade, 0);
    return (sum / grades.length).toFixed(2);
  };

  const calculateBySubject = () => {
    const bySubject: Record<string, { total: number; count: number }> = {};
    grades.forEach(g => {
      const subjectName = g.subjects?.name || 'Non spécifiée';
      if (!bySubject[subjectName]) {
        bySubject[subjectName] = { total: 0, count: 0 };
      }
      bySubject[subjectName].total += g.grade;
      bySubject[subjectName].count += 1;
    });

    return Object.entries(bySubject).map(([subject, data]) => ({
      subject,
      average: (data.total / data.count).toFixed(2),
      count: data.count
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const average = calculateAverage();
  const bySubject = calculateBySubject();

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold">Mes notes</h2>
        <p className="text-gray-600 mt-2">Consultez toutes vos évaluations</p>
      </div>

      {grades.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <BarChart3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Aucune note enregistrée
          </h3>
          <p className="text-gray-600">
            Vos notes apparaîtront ici une fois qu'elles seront enregistrées par vos professeurs.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Moyenne générale</p>
                  <p className={`text-3xl font-bold mt-2 ${getGradeColor(parseFloat(average))}`}>
                    {average}/20
                  </p>
                  <p className="text-sm text-gray-500 mt-2">
                    {grades.length} note{grades.length !== 1 ? 's' : ''}
                  </p>
                </div>
                <TrendingUp className={`w-12 h-12 ${getGradeColor(parseFloat(average))}`} />
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div>
                <p className="text-gray-600 text-sm font-medium mb-4">Statut</p>
                <div className={`inline-flex items-center px-4 py-2 rounded-lg font-semibold text-sm ${getGradeBackground(parseFloat(average))} ${getGradeColor(parseFloat(average))}`}>
                  {getGradeBadge(parseFloat(average))}
                </div>
              </div>
            </div>
          </div>

          {/* By Subject */}
          {bySubject.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Moyennes par matière</h3>
              <div className="space-y-3">
                {bySubject.sort((a, b) => parseFloat(b.average) - parseFloat(a.average)).map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">{item.subject}</p>
                      <p className="text-sm text-gray-600">{item.count} note{item.count !== 1 ? 's' : ''}</p>
                    </div>
                    <div className={`text-xl font-bold ${getGradeColor(parseFloat(item.average))}`}>
                      {item.average}/20
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* All Grades */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Historique des notes</h3>
            </div>
            <div className="divide-y">
              {grades.map((grade) => (
                <div key={grade.id} className="p-6 hover:bg-gray-50 transition">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900 mb-1">
                        {grade.subjects?.name}
                      </h4>
                      <p className="text-sm text-gray-600 mb-2">
                        Professeur: {grade.profiles?.first_name} {grade.profiles?.last_name}
                      </p>
                      {grade.comments && (
                        <p className="text-sm text-gray-700 bg-blue-50 rounded px-3 py-2 mt-2">
                          <span className="font-medium">Commentaire:</span> {grade.comments}
                        </p>
                      )}
                      <p className="text-xs text-gray-500 mt-2">
                        {new Date(grade.graded_at).toLocaleDateString('fr-FR')}
                      </p>
                    </div>

                    <div className="flex items-center justify-center ml-4">
                      <div className={`w-16 h-16 rounded-lg flex items-center justify-center font-bold text-lg ${getGradeBackground(grade.grade)} ${getGradeColor(grade.grade)}`}>
                        {grade.grade}/20
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
