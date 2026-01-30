import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../../lib/supabase';
import type { Database, UserRole } from '../../lib/database.types';

type Profile = Database['public']['Tables']['profiles']['Row'];

export default function UsersManagement() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('Demo123!');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [role, setRole] = useState<UserRole>('student');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editFirstName, setEditFirstName] = useState('');
  const [editLastName, setEditLastName] = useState('');
  const [editRole, setEditRole] = useState<UserRole>('student');

  const loadProfiles = useCallback(async (pageNumber = 1) => {
    setLoading(true);
    try {
      // get total count
      const { count, error: countErr } = await supabase.from('profiles').select('id', { count: 'exact', head: true });
      if (countErr) throw countErr;
      setTotalCount(count || 0);

      const from = (pageNumber - 1) * pageSize;
      const to = from + pageSize - 1;
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })
        .range(from, to);
      if (error) throw error;
      setProfiles(data || []);
    } catch (err) {
      console.error('Error loading profiles:', err);
    } finally {
      setLoading(false);
    }
  }, [pageSize]);

  useEffect(() => {
    loadProfiles(page);
  }, [page, loadProfiles]);

  const createUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Create auth user
      const { data: signData, error: signError } = await supabase.auth.signUp({ 
        email, 
        password,
        options: {
          data: {
            first_name: firstName,
            last_name: lastName,
            role,
          }
        }
      });
      if (signError) throw signError;

      const userId = signData?.user?.id;
      if (!userId) throw new Error('User not returned from signUp');

      // Upsert profile (update if exists, insert if not)
      const { error: profileError } = await supabase.from('profiles').upsert(
        {
          id: userId,
          email,
          first_name: firstName || '',
          last_name: lastName || '',
          role,
        },
        { onConflict: 'id', ignoreDuplicates: false }
      );
      if (profileError) throw profileError;

      // Refresh list
      await loadProfiles(1);
      setEmail(''); setPassword('Demo123!'); setFirstName(''); setLastName(''); setRole('student');
      alert("Utilisateur créé. S'il y a une confirmation d'email activée, confirmez le compte via Dashboard.");
    } catch (err) {
      console.error('Error creating user:', err);
      alert('Erreur lors de la création de l\'utilisateur: ' + (err instanceof Error ? err.message : err));
    }
  };

  const deleteProfile = async (id: string) => {
    if (!confirm('Supprimer ce profil ? Cette action est irréversible.')) return;
    try {
      const { error } = await supabase.from('profiles').delete().eq('id', id);
      if (error) throw error;
      setProfiles((p) => p.filter((x) => x.id !== id));
    } catch (err) {
      console.error('Error deleting profile:', err);
      alert('Impossible de supprimer le profil. Voir la console.');
    }
  };

  const startEdit = (p: Profile) => {
    setEditingId(p.id);
    setEditFirstName(p.first_name);
    setEditLastName(p.last_name);
    setEditRole(p.role);
  };

  const cancelEdit = () => {
    setEditingId(null);
  };

  const saveEdit = async (id: string) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          first_name: editFirstName,
          last_name: editLastName,
          role: editRole,
        })
        .eq('id', id);
      if (error) throw error;
      setProfiles((p) =>
        p.map((x) =>
          x.id === id
            ? { ...x, first_name: editFirstName, last_name: editLastName, role: editRole }
            : x
        )
      );
      setEditingId(null);
    } catch (err) {
      console.error('Error saving profile:', err);
      alert('Impossible de sauvegarder les modifications. Voir la console.');
    }
  };

  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));


  if (loading) return <div>Chargement des utilisateurs…</div>;

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-bold">Gestion des utilisateurs</h2>
      </div>

      <form onSubmit={createUser} className="mb-6 grid grid-cols-1 md:grid-cols-5 gap-3">
        <input value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="Prénom" required className="px-3 py-2 border rounded" />
        <input value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="Nom" required className="px-3 py-2 border rounded" />
        <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" type="email" required className="px-3 py-2 border rounded" />
        <select value={role} onChange={(e) => setRole(e.target.value as UserRole)} className="px-3 py-2 border rounded">
          <option value="student">Élève</option>
          <option value="teacher">Enseignant</option>
          <option value="parent">Parent</option>
          <option value="admin">Admin</option>
        </select>
        <button className="px-4 py-2 bg-blue-600 text-white rounded">Créer utilisateur</button>
      </form>

      <div className="mb-4 flex items-center justify-between">
        <div className="text-sm text-gray-600">Total: {totalCount}</div>
        <div className="flex items-center space-x-2">
          <label htmlFor="pageSize" className="text-sm">Par page:</label>
          <select 
            id="pageSize"
            value={pageSize} 
            onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1); }} 
            className="px-2 py-1 border rounded"
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={25}>25</option>
          </select>
          <button disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))} className="px-3 py-1 border rounded">Préc</button>
          <span className="px-2">{page}/{totalPages}</span>
          <button disabled={page >= totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))} className="px-3 py-1 border rounded">Suiv</button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <table className="w-full text-left">
          <thead>
            <tr className="text-sm text-gray-500 border-b">
              <th className="py-2">Nom</th>
              <th className="py-2">Email</th>
              <th className="py-2">Rôle</th>
              <th className="py-2">Créé</th>
              <th className="py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {profiles.map((p) => (
              <tr key={p.id} className="border-b last:border-b-0">
                <td className="py-3">
                  {editingId === p.id ? (
                    <div className="flex space-x-2">
                      <input value={editFirstName} onChange={(e) => setEditFirstName(e.target.value)} className="px-2 py-1 border rounded" />
                      <input value={editLastName} onChange={(e) => setEditLastName(e.target.value)} className="px-2 py-1 border rounded" />
                    </div>
                  ) : (
                    <>{p.first_name} {p.last_name}</>
                  )}
                </td>
                <td className="py-3">{p.email}</td>
                <td className="py-3">
                  {editingId === p.id ? (
                    <select value={editRole} onChange={(e) => setEditRole(e.target.value as UserRole)} className="capitalize px-2 py-1 border rounded">
                      <option value="admin">admin</option>
                      <option value="teacher">teacher</option>
                      <option value="student">student</option>
                      <option value="parent">parent</option>
                    </select>
                  ) : (
                    <span className="capitalize">{p.role}</span>
                  )}
                </td>
                <td className="py-3">{new Date(p.created_at).toLocaleString()}</td>
                <td className="py-3">
                  {editingId === p.id ? (
                    <div className="flex items-center space-x-2">
                      <button onClick={() => saveEdit(p.id)} className="px-2 py-1 bg-green-600 text-white rounded">Sauver</button>
                      <button onClick={cancelEdit} className="px-2 py-1 border rounded">Annuler</button>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-3">
                      <button onClick={() => startEdit(p)} className="text-blue-600">Éditer</button>
                      <button onClick={() => deleteProfile(p.id)} className="text-red-600">Supprimer</button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
