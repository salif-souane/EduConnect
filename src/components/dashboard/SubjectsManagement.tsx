import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';

type SubjectRow = {
  id: string;
  name: string;
  code: string | null;
  description: string | null;
  created_at: string;
};

export default function SubjectsManagement() {
  const [subjects, setSubjects] = useState<SubjectRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editCode, setEditCode] = useState('');

  useEffect(() => { load(); }, [page, pageSize]);

  const load = async () => {
    setLoading(true);
    try {
      const { count, error: countErr } = await supabase.from('subjects').select('id', { count: 'exact', head: true });
      if (countErr) throw countErr;
      setTotalCount(count || 0);

      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;
      const { data, error } = await supabase.from('subjects').select('*').order('created_at', { ascending: false }).range(from, to);
      if (error) throw error;
      setSubjects(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const createSubject = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { data, error } = await supabase.from('subjects').insert({ name, code, description: null }).select().single();
      if (error) throw error;
      setSubjects((s) => [data, ...s]);
      setName(''); setCode('');
    } catch (err) {
      console.error(err);
      alert('Erreur lors de la création de la matière');
    }
  };

  const deleteSubject = async (id: string) => {
    if (!confirm('Supprimer cette matière ?')) return;
    try {
      const { error } = await supabase.from('subjects').delete().eq('id', id);
      if (error) throw error;
      setSubjects((s) => s.filter((x) => x.id !== id));
    } catch (err) {
      console.error(err);
      alert('Erreur lors de la suppression de la matière');
    }
  };

  const startEdit = (s: SubjectRow) => {
    setEditingId(s.id);
    setEditName(s.name);
    setEditCode(s.code || '');
  };

  const cancelEdit = () => setEditingId(null);

  const saveEdit = async (id: string) => {
    try {
      const { error } = await supabase.from('subjects').update({ name: editName, code: editCode || null }).eq('id', id);
      if (error) throw error;
      setSubjects((s) => s.map((x) => (x.id === id ? { ...x, name: editName, code: editCode } : x)));
      setEditingId(null);
    } catch (err) {
      console.error(err);
      alert('Erreur lors de la sauvegarde');
    }
  };

  if (loading) return <div>Chargement des matières…</div>;

  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-bold">Gestion des matières</h2>
      </div>

      <form onSubmit={createSubject} className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-3">
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nom de la matière" required className="px-3 py-2 border rounded" />
        <input value={code} onChange={(e) => setCode(e.target.value)} placeholder="Code (ex: MATH)" className="px-3 py-2 border rounded" />
        <button className="px-4 py-2 bg-blue-600 text-white rounded">Créer</button>
      </form>

      <div className="mb-4 flex items-center justify-between">
        <div className="text-sm text-gray-600">Total: {totalCount}</div>
        <div className="flex items-center space-x-2">
          <label className="text-sm">Par page:</label>
          <select value={pageSize} onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1); }} className="px-2 py-1 border rounded">
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
        <ul className="space-y-3">
          {subjects.map((s) => (
            <li key={s.id} className="flex items-center justify-between">
              <div>
                {editingId === s.id ? (
                  <div className="space-y-2">
                    <input value={editName} onChange={(e) => setEditName(e.target.value)} className="px-2 py-1 border rounded w-full" />
                    <div className="flex space-x-2">
                      <input value={editCode} onChange={(e) => setEditCode(e.target.value)} className="px-2 py-1 border rounded" />
                    </div>
                    <div className="flex space-x-2">
                      <button onClick={() => saveEdit(s.id)} className="px-3 py-1 bg-green-600 text-white rounded">Sauver</button>
                      <button onClick={cancelEdit} className="px-3 py-1 border rounded">Annuler</button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="font-medium">{s.name} {s.code ? `(${s.code})` : ''}</div>
                    <div className="text-sm text-gray-500">{s.description}</div>
                  </>
                )}
              </div>
              <div className="flex items-center space-x-4">
                <div className="text-sm text-gray-500">{new Date(s.created_at).toLocaleDateString()}</div>
                <div className="flex space-x-2">
                  <button onClick={() => startEdit(s)} className="text-blue-600">Éditer</button>
                  <button className="text-red-600" onClick={() => deleteSubject(s.id)}>Supprimer</button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
