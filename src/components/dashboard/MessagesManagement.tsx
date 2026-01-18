import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { MessageSquare, Send, Inbox, Eye, EyeOff, Trash2, Plus } from 'lucide-react';

type Message = {
  id: string;
  sender_id: string;
  recipient_id: string;
  subject: string;
  content: string;
  read: boolean;
  read_at: string | null;
  sent_at: string;
  sender_profile?: {
    first_name: string;
    last_name: string;
  };
  recipient_profile?: {
    first_name: string;
    last_name: string;
  };
};

export default function MessagesManagement() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCompose, setShowCompose] = useState(false);

  // Compose form state
  const [recipientId, setRecipientId] = useState('');
  const [subject, setSubject] = useState('');
  const [content, setContent] = useState('');
  const [users, setUsers] = useState<{id: string, name: string}[]>([]);

  useEffect(() => {
    loadMessages();
    loadUsers();
  }, []);

  const loadMessages = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('messages')
        .select(`
          *,
          sender_profile:profiles!messages_sender_id_fkey (
            first_name,
            last_name
          ),
          recipient_profile:profiles!messages_recipient_id_fkey (
            first_name,
            last_name
          )
        `)
        .or(`sender_id.eq.${user.id},recipient_id.eq.${user.id}`)
        .order('sent_at', { ascending: false });

      if (error) throw error;
      setMessages(data || []);
    } catch (error) {
      console.error('Error loading messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, first_name, last_name')
        .neq('id', user?.id);

      if (error) throw error;

      const userList = (data || []).map((u: any) => ({
        id: u.id,
        name: `${u.first_name} ${u.last_name}`
      }));
      setUsers(userList);
    } catch (error) {
      console.error('Error loading users:', error);
    }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !recipientId || !subject || !content) return;

    try {
      const { error } = await supabase
        .from('messages')
        .insert({
          sender_id: user.id,
          recipient_id: recipientId,
          subject,
          content,
        } as any);

      if (error) throw error;

      await loadMessages();
      setShowCompose(false);
      setRecipientId('');
      setSubject('');
      setContent('');
      alert('Message envoyé avec succès');
    } catch (error: any) {
      console.error('Error sending message:', error);
      alert('Erreur lors de l\'envoi: ' + (error.message || error));
    }
  };

  const markAsRead = async (messageId: string) => {
    try {
      const { error } = await supabase
        .from('messages')
        .update({ read: true, read_at: new Date().toISOString() })
        .eq('id', messageId)
        .eq('recipient_id', user?.id);

      if (error) throw error;

      setMessages(messages.map(msg =>
        msg.id === messageId ? { ...msg, read: true, read_at: new Date().toISOString() } : msg
      ));
    } catch (error) {
      console.error('Error marking message as read:', error);
    }
  };

  const deleteMessage = async (messageId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce message ?')) return;

    try {
      const { error } = await supabase
        .from('messages')
        .delete()
        .eq('id', messageId);

      if (error) throw error;

      setMessages(messages.filter(msg => msg.id !== messageId));
    } catch (error) {
      console.error('Error deleting message:', error);
      alert('Erreur lors de la suppression du message');
    }
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
        <h2 className="text-2xl font-bold">Messages privés</h2>
        <button
          onClick={() => setShowCompose(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          <Plus className="w-5 h-5" />
          <span>Nouveau message</span>
        </button>
      </div>

      {showCompose && (
        <div className="mb-6 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold mb-4">Nouveau message</h3>
          <form onSubmit={sendMessage} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Destinataire
              </label>
              <select
                value={recipientId}
                onChange={(e) => setRecipientId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="">Sélectionner un destinataire</option>
                {users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Sujet
              </label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Message
              </label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div className="flex space-x-3">
              <button
                type="submit"
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                <Send className="w-4 h-4" />
                <span>Envoyer</span>
              </button>
              <button
                type="button"
                onClick={() => setShowCompose(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
              >
                Annuler
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        {messages.length === 0 ? (
          <div className="p-12 text-center">
            <MessageSquare className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Aucun message
            </h3>
            <p className="text-gray-600">
              Vous n'avez encore reçu aucun message. Envoyez-en un pour commencer !
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {messages.map((message) => {
              const isSender = message.sender_id === user?.id;
              const otherUser = isSender
                ? message.recipient_profile
                : message.sender_profile;

              return (
                <div
                  key={message.id}
                  className={`p-6 hover:bg-gray-50 transition ${
                    !message.read && !isSender ? 'bg-blue-50' : ''
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="font-medium text-gray-900">
                          {isSender ? 'À' : 'De'} {otherUser?.first_name} {otherUser?.last_name}
                        </h3>
                        {!message.read && !isSender && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                            Non lu
                          </span>
                        )}
                      </div>
                      <h4 className="font-medium text-gray-800 mb-1">
                        {message.subject}
                      </h4>
                      <p className="text-gray-600 text-sm mb-2 line-clamp-2">
                        {message.content}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(message.sent_at).toLocaleString('fr-FR')}
                      </p>
                    </div>

                    <div className="flex items-center space-x-2 ml-4">
                      {!message.read && !isSender && (
                        <button
                          onClick={() => markAsRead(message.id)}
                          className="p-2 text-gray-400 hover:text-blue-600 transition"
                          title="Marquer comme lu"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={() => deleteMessage(message.id)}
                        className="p-2 text-gray-400 hover:text-red-600 transition"
                        title="Supprimer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
