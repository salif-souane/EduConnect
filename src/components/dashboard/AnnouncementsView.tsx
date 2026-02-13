import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { Bell, Calendar } from 'lucide-react';

type Announcement = {
  id: string;
  title: string;
  content: string;
  target_role: 'all' | 'student' | 'parent' | 'teacher';
  target_class_id: string | null;
  published_at: string;
  author_id: string;
  profiles?: {
    first_name: string;
    last_name: string;
  };
  classes?: {
    name: string;
  };
};

type StudentData = {
  class_id: string | null;
};

export default function AnnouncementsView() {
  const { user, profile } = useAuth();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<Announcement | null>(null);

  const loadAnnouncements = useCallback(async () => {
    setLoading(true);
    try {
      if (!user?.id || !profile) {
        setLoading(false);
        return;
      }

      let query = supabase
        .from('announcements')
        .select(`
          *,
          profiles (
            first_name,
            last_name
          ),
          classes (
            name
          )
        `)
        .or(`target_role.eq.all,target_role.eq.${profile.role}`)
        .order('published_at', { ascending: false });

      // If user is a student, also filter by their class
      if (profile.role === 'student') {
        const { data: studentData } = await supabase
          .from('students')
          .select('class_id')
          .eq('id', user.id)
          .single<StudentData>();

        if (studentData && studentData.class_id) {
          query = query.or(`target_class_id.is.null,target_class_id.eq.${studentData.class_id}`);
        } else {
          query = query.is('target_class_id', null);
        }
      } else {
        query = query.or('target_class_id.is.null,target_class_id.not.is.null');
      }

      const { data: announcementsData, error } = await query;

      if (error) throw error;
      setAnnouncements(announcementsData || []);
    } catch (error) {
      console.error('Error loading announcements:', error);
    } finally {
      setLoading(false);
    }
  }, [user, profile]);

  useEffect(() => {
    loadAnnouncements();
  }, [loadAnnouncements]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTargetLabel = (announcement: Announcement) => {
    if (announcement.target_role === 'all') {
      return announcement.target_class_id ? `Classe: ${announcement.classes?.name}` : 'Tous';
    }
    const roleLabels = {
      student: 'Élèves',
      teacher: 'Enseignants',
      parent: 'Parents'
    };
    return announcement.target_class_id
      ? `${roleLabels[announcement.target_role]} - Classe: ${announcement.classes?.name}`
      : roleLabels[announcement.target_role];
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
      <div className="mb-6">
        <h2 className="text-2xl font-bold">Annonces</h2>
        <p className="text-gray-600 mt-2">Consultez les dernières annonces de l'établissement</p>
      </div>

      {selectedAnnouncement ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-6">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-2xl font-bold text-white mb-2">{selectedAnnouncement.title}</h3>
                <div className="flex items-center space-x-4 text-blue-100 text-sm">
                  <span>{selectedAnnouncement.profiles?.first_name} {selectedAnnouncement.profiles?.last_name}</span>
                  <span>•</span>
                  <span>{getTargetLabel(selectedAnnouncement)}</span>
                </div>
              </div>
              <button
                onClick={() => setSelectedAnnouncement(null)}
                className="px-4 py-2 bg-white text-blue-600 rounded-lg hover:bg-blue-50 transition"
              >
                ← Retour
              </button>
            </div>
          </div>

          <div className="p-6">
            <div className="bg-gray-50 rounded-lg p-6 text-gray-700 whitespace-pre-wrap mb-4">
              {selectedAnnouncement.content}
            </div>

            <div className="border-t pt-4 text-sm text-gray-500 flex items-center space-x-2">
              <Calendar className="w-4 h-4" />
              <span>Publié le {formatDate(selectedAnnouncement.published_at)}</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {announcements.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
              <Bell className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Aucune annonce
              </h3>
              <p className="text-gray-600">
                Les annonces de l'établissement apparaîtront ici.
              </p>
            </div>
          ) : (
            announcements.map((announcement) => (
              <div
                key={announcement.id}
                onClick={() => setSelectedAnnouncement(announcement)}
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 cursor-pointer hover:shadow-md hover:border-blue-300 transition"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <Bell className="w-5 h-5 text-blue-600" />
                      <h3 className="text-lg font-semibold text-gray-900">
                        {announcement.title}
                      </h3>
                    </div>

                    <div className="flex items-center space-x-2 mb-3">
                      <span className="px-2 py-1 text-xs bg-blue-100 text-blue-600 rounded-full">
                        {getTargetLabel(announcement)}
                      </span>
                      <span className="text-sm text-gray-600">
                        {announcement.profiles?.first_name} {announcement.profiles?.last_name}
                      </span>
                    </div>

                    <p className="text-gray-600 line-clamp-2 mb-3">
                      {announcement.content.length > 150
                        ? `${announcement.content.substring(0, 150)}...`
                        : announcement.content}
                    </p>

                    <div className="flex items-center space-x-2 text-sm text-gray-500">
                      <Calendar className="w-4 h-4" />
                      <span>{formatDate(announcement.published_at)}</span>
                    </div>
                  </div>

                  <div className="ml-4">
                    <button className="px-4 py-2 text-blue-600 font-medium hover:bg-blue-50 rounded-lg transition">
                      Lire →
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
