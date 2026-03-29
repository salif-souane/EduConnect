import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { MessageSquare } from 'lucide-react';

type Forum = {
  id: string;
  title: string;
  description: string | null;
  class_id: string | null;
  created_by: string;
  created_at: string;
  classes?: {
    name: string;
  };
  profiles?: {
    first_name: string;
    last_name: string;
  };
  post_count?: number;
};

type StudentData = {
  class_id: string | null;
};

export default function ForumsView() {
  const { user, profile } = useAuth();
  const [forums, setForums] = useState<Forum[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedForum, setSelectedForum] = useState<Forum | null>(null);

  const loadForums = useCallback(async () => {
    setLoading(true);
    try {
      if (!user?.id) {
        setLoading(false);
        return;
      }

      let query = supabase
        .from('forums')
        .select(`
          *,
          classes (
            name
          ),
          profiles (
            first_name,
            last_name
          )
        `)
        .order('created_at', { ascending: false });

      // If user is a student, filter by their class or public forums
      if (profile?.role === 'student') {
        // @ts-ignore Supabase type inference issue
        const result = await supabase
          .from('students')
          .select('class_id')
          .eq('id', user.id)
          .single() as { data: StudentData | null; error: any };
        
        const studentData = result.data;

        if (studentData && studentData.class_id) {
          query = query.or(`class_id.is.null,class_id.eq.${studentData.class_id}`);
        } else {
          query = query.is('class_id', null);
        }
      }

      const { data: forumsData, error } = await query;

      if (error) throw error;
      setForums(forumsData || []);
    } catch (error) {
      console.error('Error loading forums:', error);
    } finally {
      setLoading(false);
    }
  }, [user, profile]);

  useEffect(() => {
    loadForums();
  }, [loadForums]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
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
        <h2 className="text-3xl font-bold mb-2">
  <span className="text-black">Forums de</span>{" "}
  <span className="text-green-500">discissions</span>
</h2>
        <p className="text-gray-600 mt-2">Échangez avec vos camarades et enseignants</p>
      </div>

      {selectedForum ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-6">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-2xl font-bold text-white mb-2">{selectedForum.title}</h3>
                <div className="flex items-center space-x-4 text-blue-100 text-sm">
                  <span>Créé par {selectedForum.profiles?.first_name} {selectedForum.profiles?.last_name}</span>
                  {selectedForum.classes && (
                    <>
                      <span>•</span>
                      <span>Classe: {selectedForum.classes.name}</span>
                    </>
                  )}
                </div>
              </div>
              <button
                onClick={() => setSelectedForum(null)}
                className="px-4 py-2 bg-white text-blue-600 rounded-lg hover:bg-blue-50 transition"
              >
                ← Retour
              </button>
            </div>
          </div>

          <div className="p-6">
            {selectedForum.description && (
              <p className="text-gray-700 mb-4">{selectedForum.description}</p>
            )}

            <div className="bg-gray-50 rounded-lg p-6 text-center">
              <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h4 className="text-lg font-medium text-gray-900 mb-2">Fonctionnalité en développement</h4>
              <p className="text-gray-600">
                Les discussions de forum seront bientôt disponibles dans cette section.
              </p>
            </div>

            <div className="border-t pt-4 text-sm text-gray-500 flex items-center space-x-2">
              <span>Créé le {formatDate(selectedForum.created_at)}</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {forums.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
              <MessageSquare className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Aucun forum disponible
              </h3>
              <p className="text-gray-600">
                Les forums de discussion apparaîtront ici.
              </p>
            </div>
          ) : (
            forums.map((forum) => (
              <div
                key={forum.id}
                onClick={() => setSelectedForum(forum)}
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 cursor-pointer hover:shadow-md hover:border-blue-300 transition"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <MessageSquare className="w-5 h-5 text-blue-600" />
                      <h3 className="text-lg font-semibold text-gray-900">
                        {forum.title}
                      </h3>
                    </div>

                    <div className="flex items-center space-x-2 mb-3">
                      <span className="px-2 py-1 text-xs bg-blue-100 text-blue-600 rounded-full">
                        {forum.classes ? `Classe: ${forum.classes.name}` : 'Public'}
                      </span>
                      <span className="text-sm text-gray-600">
                        Par {forum.profiles?.first_name} {forum.profiles?.last_name}
                      </span>
                    </div>

                    {forum.description && (
                      <p className="text-gray-600 line-clamp-2">
                        {forum.description}
                      </p>
                    )}

                    <div className="mt-3 text-sm text-gray-500">
                      Créé le {formatDate(forum.created_at)}
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
      )}
    </div>
  );
}