import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Users, School, BookOpen, TrendingUp } from 'lucide-react';

interface Stats {
  totalUsers: number;
  totalClasses: number;
  totalSubjects: number;
  totalStudents: number;
}

interface Profile {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  created_at: string;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({
    totalUsers: 0,
    totalClasses: 0,
    totalSubjects: 0,
    totalStudents: 0,
  });
  const [recentUsers, setRecentUsers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const [usersRes, classesRes, subjectsRes, studentsRes, recentUsersRes] = await Promise.all([
        supabase.from('profiles').select('id', { count: 'exact', head: true }),
        supabase.from('classes').select('id', { count: 'exact', head: true }),
        supabase.from('subjects').select('id', { count: 'exact', head: true }),
        supabase.from('students').select('id', { count: 'exact', head: true }),
        supabase
          .from('profiles')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(5),
      ]);

      setStats({
        totalUsers: usersRes.count || 0,
        totalClasses: classesRes.count || 0,
        totalSubjects: subjectsRes.count || 0,
        totalStudents: studentsRes.count || 0,
      });
      setRecentUsers(recentUsersRes.data || []);
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Utilisateurs totaux',
      value: stats.totalUsers,
      icon: Users,
      color: 'bg-blue-500',
    },
    {
      title: 'Élèves',
      value: stats.totalStudents,
      icon: Users,
      color: 'bg-green-500',
    },
    {
      title: 'Classes',
      value: stats.totalClasses,
      icon: School,
      color: 'bg-orange-500',
    },
    {
      title: 'Matières',
      value: stats.totalSubjects,
      icon: BookOpen,
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
          Tableau de bord administrateur
        </h2>
        <p className="text-gray-600">
          Vue d'ensemble de la plateforme éducative
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.title}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`${card.color} p-3 rounded-lg`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <TrendingUp className="w-5 h-5 text-green-500" />
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
            Utilisateurs récents
          </h3>
          {recentUsers.length === 0 ? (
            <p className="text-gray-600 text-sm">Aucun utilisateur créé pour le moment</p>
          ) : (
            <div className="space-y-3">
              {recentUsers.map((user) => (
                <div key={user.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{user.first_name} {user.last_name}</p>
                    <p className="text-sm text-gray-600">{user.email}</p>
                  </div>
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 capitalize">
                    {user.role}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Actions rapides
          </h3>
          <div className="space-y-2">
            <button className="w-full text-left px-4 py-3 bg-blue-50 hover:bg-blue-100 rounded-lg transition">
              <p className="font-medium text-blue-900">Ajouter un utilisateur</p>
              <p className="text-sm text-blue-700">Créer un nouveau compte</p>
            </button>
            <button className="w-full text-left px-4 py-3 bg-green-50 hover:bg-green-100 rounded-lg transition">
              <p className="font-medium text-green-900">Créer une classe</p>
              <p className="text-sm text-green-700">Ajouter une nouvelle classe</p>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
