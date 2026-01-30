import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { MessageSquare, Plus, Edit, Trash2 } from 'lucide-react';

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
};

type Class = {
  id: string;
  name: string;
};

export default function ForumsManagement() {
  const { user } = useAuth();
  const [forums, setForums] = useState<Forum[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingForum, setEditingForum] = useState<Forum | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    class_id: ''
  });

  const loadForums = useCallback(async () => {
    setLoading(true);
    try {
      const { data: forumsData, error } = await supabase
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

      if (error) throw error;
      setForums(forumsData || []);
    } catch (error) {
      console.error('Error loading forums:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadClasses = useCallback(async () => {
    try {
      const { data: classesData, error } = await supabase
        .from('classes')
        .select('id, name')
        .order('name');

      if (error) throw error;
      setClasses(classesData || []);
    } catch (error) {
      console.error('Error loading classes:', error);
    }
  }, []);

  useEffect(() => {
    loadForums();
    loadClasses();
  }, [loadForums, loadClasses]);

  const handleCreateForum = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) return;

    try {
      const forumData = {
        title: formData.title,
        description: formData.description || null,
        class_id: formData.class_id || null,
        created_by: user.id
      };

      const { error } = await supabase
        .from('forums')
        .insert([forumData]);

      if (error) throw error;

      setFormData({ title: '', description: '', class_id: '' });
      setShowCreateForm(false);
      loadForums();
    } catch (error) {
      console.error('Error creating forum:', error);
    }
  };

  const handleEditForum = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingForum) return;

    try {
      const forumData = {
        title: formData.title,
        description: formData.description || null,
        class_id: formData.class_id || null
      };

      const { error } = await supabase
        .from('forums')
        .update(forumData)
        .eq('id', editingForum.id);

      if (error) throw error;

      setFormData({ title: '', description: '', class_id: '' });
      setEditingForum(null);
      loadForums();
    } catch (error) {
      console.error('Error updating forum:', error);
    }
  };

  const handleDeleteForum = async (forumId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce forum ?')) return;

    try {
      const { error } = await supabase
        .from('forums')
        .delete()
        .eq('id', forumId);

      if (error) throw error;
      loadForums();
    } catch (error) {
      console.error('Error deleting forum:', error);
    }
  };

  const startEdit = (forum: Forum) => {
    setEditingForum(forum);
    setFormData({
      title: forum.title,
      description: forum.description || '',
      class_id: forum.class_id || ''
    });
  };

  const cancelEdit = () => {
    setEditingForum(null);
    setFormData({ title: '', description: '', class_id: '' });
  };

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
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold">Gestion des forums</h2>
          <p className="text-gray-600 mt-2">Créez et gérez les forums de discussion</p>
        </div>
        <button
          onClick={() => setShowCreateForm(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          <Plus className="w-4 h-4" />
          <span>Nouveau forum</span>
        </button>
      </div>

      {(showCreateForm || editingForum) && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <h3 className="text-lg font-semibold mb-4">
            {editingForum ? 'Modifier le forum' : 'Créer un nouveau forum'}
          </h3>

          <form onSubmit={editingForum ? handleEditForum : handleCreateForum} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Titre *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Classe (optionnel)
              </label>
              <select
                value={formData.class_id}
                onChange={(e) => setFormData({ ...formData, class_id: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Forum public (tous les utilisateurs)</option>
                {classes.map((cls) => (
                  <option key={cls.id} value={cls.id}>
                    {cls.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex space-x-3">
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                {editingForum ? 'Modifier' : 'Créer'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowCreateForm(false);
                  cancelEdit();
                }}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition"
              >
                Annuler
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="space-y-4">
        {forums.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <MessageSquare className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Aucun forum créé
            </h3>
            <p className="text-gray-600">
              Créez votre premier forum pour commencer les discussions.
            </p>
          </div>
        ) : (
          forums.map((forum) => (
            <div
              key={forum.id}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
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
                    <p className="text-gray-600 mb-3">
                      {forum.description}
                    </p>
                  )}

                  <div className="text-sm text-gray-500">
                    Créé le {formatDate(forum.created_at)}
                  </div>
                </div>

                <div className="flex space-x-2 ml-4">
                  <button
                    onClick={() => startEdit(forum)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                    title="Modifier"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteForum(forum.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
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