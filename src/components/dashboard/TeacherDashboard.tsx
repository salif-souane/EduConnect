import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { BookOpen, ClipboardList, Users, Bell } from 'lucide-react';

interface Stats {
  coursesCount: number;
  assignmentsCount: number;
  classesCount: number;
  announcementsCount: number;
}

export default function TeacherDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<Stats>({
    coursesCount: 0,
    assignmentsCount: 0,
    classesCount: 0,
    announcementsCount: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadStats();
    }
  }, [user]);

  const loadStats = async () => {
    try {
      const [coursesRes, assignmentsRes, classesRes, announcementsRes] = await Promise.all([
        supabase.from('courses').select('id', { count: 'exact', head: true }).eq('teacher_id', user!.id),
        supabase.from('assignments').select('id', { count: 'exact', head: true }).eq('teacher_id', user!.id),
        supabase.from('teacher_subjects').select('class_id', { count: 'exact', head: true }).eq('teacher_id', user!.id),
        supabase.from('announcements').select('id', { count: 'exact', head: true }).eq('author_id', user!.id),
      ]);

      setStats({
        coursesCount: coursesRes.count || 0,
        assignmentsCount: assignmentsRes.count || 0,
        classesCount: classesRes.count || 0,
        announcementsCount: announcementsRes.count || 0,
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Cours publiés',
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
      title: 'Classes',
      value: stats.classesCount,
      icon: Users,
      color: 'bg-orange-500',
    },
    {
      title: 'Annonces',
      value: stats.announcementsCount,
      icon: Bell,
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
          Tableau de bord enseignant
        </h2>
        <p className="text-gray-600">
          Gérez vos cours, devoirs et communications
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
            Actions rapides
          </h3>
          <div className="space-y-2">
            <button className="w-full text-left px-4 py-3 bg-blue-50 hover:bg-blue-100 rounded-lg transition">
              <p className="font-medium text-blue-900">Publier un cours</p>
              <p className="text-sm text-blue-700">Ajouter du contenu pédagogique</p>
            </button>
            <button className="w-full text-left px-4 py-3 bg-green-50 hover:bg-green-100 rounded-lg transition">
              <p className="font-medium text-green-900">Créer un devoir</p>
              <p className="text-sm text-green-700">Assigner un nouveau devoir</p>
            </button>
            <button className="w-full text-left px-4 py-3 bg-purple-50 hover:bg-purple-100 rounded-lg transition">
              <p className="font-medium text-purple-900">Saisir des notes</p>
              <p className="text-sm text-purple-700">Évaluer les élèves</p>
            </button>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Devoirs à corriger
          </h3>
          <p className="text-gray-600 text-sm">
            Consultez vos devoirs pour voir ceux qui nécessitent une correction.
          </p>
        </div>
      </div>
    </div>
  );
}
