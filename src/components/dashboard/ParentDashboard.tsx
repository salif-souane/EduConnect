import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { Users, GraduationCap, Bell, Calendar } from 'lucide-react';

interface ChildData {
  id: string;
  profiles: {
    first_name: string;
    last_name: string;
  };
  classes: {
    name: string;
  } | null;
}

export default function ParentDashboard() {
  const { user } = useAuth();
  const [children, setChildren] = useState<ChildData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadChildren();
    }
  }, [user]);

  const loadChildren = async () => {
    try {
      const { data, error } = await supabase
        .from('parent_student')
        .select(`
          student_id,
          students!inner(
            id,
            class_id,
            profiles!inner(first_name, last_name),
            classes(name)
          )
        `)
        .eq('parent_id', user!.id);

      if (error) throw error;

      const formattedChildren = data?.map((item) => ({
        id: item.students.id,
        profiles: item.students.profiles,
        classes: item.students.classes,
      })) || [];

      setChildren(formattedChildren);
    } catch (error) {
      console.error('Error loading children:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Enfants',
      value: children.length,
      icon: Users,
      color: 'bg-blue-500',
    },
    {
      title: 'Nouvelles notes',
      value: 0,
      icon: GraduationCap,
      color: 'bg-green-500',
    },
    {
      title: 'Annonces',
      value: 0,
      icon: Bell,
      color: 'bg-orange-500',
    },
    {
      title: 'Rendez-vous',
      value: 0,
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
          Espace parent
        </h2>
        <p className="text-gray-600">
          Suivez la scolarité de vos enfants
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
            Mes enfants
          </h3>
          {children.length > 0 ? (
            <div className="space-y-3">
              {children.map((child) => (
                <div
                  key={child.id}
                  className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
                >
                  <p className="font-medium text-gray-900">
                    {child.profiles.first_name} {child.profiles.last_name}
                  </p>
                  <p className="text-sm text-gray-600">
                    {child.classes?.name || 'Classe non assignée'}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-600 text-sm">
              Aucun enfant associé à votre compte.
            </p>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Dernières activités
          </h3>
          <p className="text-gray-600 text-sm">
            Les activités récentes de vos enfants apparaîtront ici.
          </p>
        </div>
      </div>
    </div>
  );
}
