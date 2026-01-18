import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { Bell, Plus, Edit, Trash2 } from 'lucide-react';

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

type Class = {
  id: string;
  name: string;
};

export default function AnnouncementsManagement() {
  const { user, profile } = useAuth();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form state
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [targetRole, setTargetRole] = useState<string | null>('all');
  const [targetClassId, setTargetClassId] = useState<string>('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      // Load announcements
      const { data: announcementsData, error: announcementsError } = await supabase
        .from('announcements')
        .select(`
          *,
          profiles!announcements_author_id_fkey (
            first_name,
            last_name
          ),
          classes (
            name
          )
        `)
        .order('published_at', { ascending: false });

      if (announcementsError) throw announcementsError;
      setAnnouncements(announcementsData || []);

      // Load classes for the dropdown
      const { data: classesData, error: classesError } = await supabase
        .from('classes')
        .select('id, name')
        .order('name');

      if (classesError) throw classesError;
      setClasses(classesData || []);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setTitle('');
    setContent('');
    setTargetRole('all');
    setTargetClassId('');
    setEditingId(null);
    setShowForm(false);
  };

  const startEdit = (announcement: Announcement) => {
    setEditingId(announcement.id);
    setTitle(announcement.title);
    setContent(announcement.content);
    setTargetRole(announcement.target_role);
    setTargetClassId(announcement.target_class_id || '');
    setShowForm(true);
  };

  const getTargetRoleLabel = (role: string) => {
    switch (role) {
      case 'all':
        return 'Tous';
      case 'student':
        return 'Élèves';
      case 'teacher':
        return 'Enseignants';
      case 'parent':
        return 'Parents';
      default:
        return role;
    }
  };

  const createAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      const announcementData = {
        title,
        content,
        author_id: user.id,
        target_role: targetRole,
        target_class_id: targetClassId || null,
      };

      if (editingId) {
        const { error } = await supabase
          .from('announcements')
          // @ts-expect-error Supabase type generation issue
          .update(announcementData)
          .eq('id', editingId);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('announcements')
          // @ts-expect-error Supabase type generation issue
          .insert(announcementData);
        if (error) throw error;
      }

      await loadData();
      resetForm();
      alert(editingId ? 'Annonce mise à jour avec succès' : 'Annonce créée avec succès');
    } catch (error) {
      console.error('Error saving announcement:', error);
      const message = error instanceof Error ? error.message : String(error);
      alert('Erreur lors de la sauvegarde: ' + message);
    }
  };

  const deleteAnnouncement = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette annonce ?')) return;

    try {
      const { error } = await supabase
        .from('announcements')
        .delete()
        .eq('id', id);
      if (error) throw error;

      setAnnouncements(announcements.filter(a => a.id !== id));
      alert('Annonce supprimée avec succès');
    } catch (error) {
      console.error('Error deleting announcement:', error);
      const message = error instanceof Error ? error.message : String(error);
      alert('Erreur lors de la suppression: ' + message);
    }
  };

  const canEdit = (announcement: Announcement) => {
    return profile?.role === 'admin' || announcement.author_id === user?.id;
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
        <h2 className="text-2xl font-bold">Gestion des annonces</h2>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          <Plus className="w-5 h-5" />
          <span>Nouvelle annonce</span>
        </button>
      </div>

      {showForm && (
        <div className="mb-6 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold mb-4">
            {editingId ? 'Modifier l\'annonce' : 'Créer une annonce'}
          </h3>
          <form onSubmit={createAnnouncement} className="space-y-4">
            <div>
              <label htmlFor="announcement-title" className="block text-sm font-medium text-gray-700 mb-1">
                Titre
              </label>
              <input
                id="announcement-title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label htmlFor="announcement-content" className="block text-sm font-medium text-gray-700 mb-1">
                Contenu
              </label>
              <textarea
                id="announcement-content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="announcement-role" className="block text-sm font-medium text-gray-700 mb-1">
                  Destinataires
                </label>
                <select
                  id="announcement-role"
                  value={targetRole || ''}
                  onChange={(e) => setTargetRole(e.target.value || null)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">Tous</option>
                  <option value="student">Élèves</option>
                  <option value="teacher">Enseignants</option>
                  <option value="parent">Parents</option>
                </select>
              </div>

              <div>
                <label htmlFor="announcement-class" className="block text-sm font-medium text-gray-700 mb-1">
                  Classe spécifique (optionnel)
                </label>
                <select
                  id="announcement-class"
                  value={targetClassId}
                  onChange={(e) => setTargetClassId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Toutes les classes</option>
                  {classes.map((cls) => (
                    <option key={cls.id} value={cls.id}>
                      {cls.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex space-x-3">
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                {editingId ? 'Mettre à jour' : 'Publier'}
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
        {announcements.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
            <Bell className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Aucune annonce
            </h3>
            <p className="text-gray-600">
              Créez votre première annonce pour communiquer avec la communauté.
            </p>
          </div>
        ) : (
          announcements.map((announcement) => (
            <div
              key={announcement.id}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <Bell className="w-5 h-5 text-blue-600" />
                    <h3 className="text-lg font-semibold text-gray-900">
                      {announcement.title}
                    </h3>
                    <span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full capitalize">
                      {getTargetRoleLabel(announcement.target_role)}
                    </span>
                    {announcement.classes && (
                      <span className="px-2 py-1 text-xs bg-blue-100 text-blue-600 rounded-full">
                        {announcement.classes.name}
                      </span>
                    )}
                  </div>
                  <p className="text-gray-600 mb-3 whitespace-pre-wrap">
                    {announcement.content}
                  </p>
                  <div className="text-sm text-gray-500">
                    Par {announcement.profiles?.first_name} {announcement.profiles?.last_name} •
                    Le {new Date(announcement.published_at).toLocaleDateString('fr-FR')}
                  </div>
                </div>

                {canEdit(announcement) && (
                  <div className="flex items-center space-x-2 ml-4">
                    <button
                      onClick={() => startEdit(announcement)}
                      className="p-2 text-gray-400 hover:text-blue-600 transition"
                      title="Modifier"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => deleteAnnouncement(announcement.id)}
                      className="p-2 text-gray-400 hover:text-red-600 transition"
                      title="Supprimer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
