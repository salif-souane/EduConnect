import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { BookOpen, ClipboardList, GraduationCap, Calendar } from 'lucide-react';

interface Stats {
  coursesCount: number;
  assignmentsCount: number;
  gradesCount: number;
  upcomingAssignments: number;
}

export default function StudentDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<Stats>({
    coursesCount: 0,
    assignmentsCount: 0,
    gradesCount: 0,
    upcomingAssignments: 0,
  });
  const [loading, setLoading] = useState(true);
  const [studentData, setStudentData] = useState<any>(null);

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    try {
      const { data: student } = await supabase
        .from('students')
        .select('*, classes(*)')
        .eq('id', user!.id)
        .maybeSingle();

      setStudentData(student);

      if (student?.class_id) {
        const [coursesRes, assignmentsRes, gradesRes] = await Promise.all([
          supabase
            .from('courses')
            .select('id', { count: 'exact', head: true })
            .eq('class_id', student.class_id),
          supabase
            .from('assignments')
            .select('id', { count: 'exact', head: true })
            .eq('class_id', student.class_id),
          supabase
            .from('grades')
            .select('id', { count: 'exact', head: true })
            .eq('student_id', user!.id),
        ]);

        const { count: upcomingCount } = await supabase
          .from('assignments')
          .select('id', { count: 'exact', head: true })
          .eq('class_id', student.class_id)
          .gte('due_date', new Date().toISOString());

        setStats({
          coursesCount: coursesRes.count || 0,
          assignmentsCount: assignmentsRes.count || 0,
          gradesCount: gradesRes.count || 0,
          upcomingAssignments: upcomingCount || 0,
        });
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Cours disponibles',
      value: stats.coursesCount,
      icon: BookOpen,
      color: 'bg-blue-500',
    },
    {
      title: 'Devoirs',
      value: stats.assignmentsCount,
      icon: ClipboardList,
      color: 'bg-green-500',
    },
    {
      title: 'Notes',
      value: stats.gradesCount,
      icon: GraduationCap,
      color: 'bg-orange-500',
    },
    {
      title: 'À venir',
      value: stats.upcomingAssignments,
      icon: Calendar,
      color: 'bg-purple-500',
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          Mon tableau de bord
        </h2>
        <p className="text-gray-600">
          {studentData?.classes?.name || 'Classe non assignée'}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.title}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
            >
              <div className={`${card.color} p-3 rounded-lg inline-block mb-4`}>
                <Icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-1">
                {card.value}
              </h3>
              <p className="text-sm text-gray-600">{card.title}</p>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Prochains devoirs
          </h3>
          <p className="text-gray-600 text-sm">
            Consultez la section Devoirs pour voir tous vos travaux à rendre.
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Dernières notes
          </h3>
          <p className="text-gray-600 text-sm">
            Consultez la section Notes pour voir vos résultats récents.
          </p>
        </div>
      </div>
    </div>
  );
}
