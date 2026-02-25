import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';

type ClassRow = {
  id: string;
  name: string;
  level: string;
  academic_year: string;
  created_at: string;
};

export default function ClassesManagement() {
  const [classes, setClasses] = useState<ClassRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [level, setLevel] = useState('');
  const [year, setYear] = useState('2024-2025');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editLevel, setEditLevel] = useState('');
  const [editYear, setEditYear] = useState('2024-2025');

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    try {
      const { count, error: countErr } = await supabase.from('classes').select('id', { count: 'exact', head: true });
      if (countErr) throw countErr;
      setTotalCount(count || 0);

      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;
      const { data, error } = await supabase.from('classes').select('*').order('created_at', { ascending: false }).range(from, to);
      if (error) throw error;
      setClasses(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const createClass = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { data, error } = await supabase
        .from('classes')
        .insert({
          name: name,
          level: level,
          academic_year: year
        })
        .select()
        .single();
      if (error) throw error;
      if (data) {
        setClasses((c) => [data, ...c]);
      }
      setName(''); 
      setLevel('');
    } catch (err) {
      console.error(err);
      alert('Erreur lors de la création de la classe');
    }
  };

  const startEdit = (c: ClassRow) => {
    setEditingId(c.id);
    setEditName(c.name);
    setEditLevel(c.level);
    setEditYear(c.academic_year);
  };

  const cancelEdit = () => setEditingId(null);

  const saveEdit = async (id: string) => {
    try {
      const { error } = await supabase
        .from('classes')
        .update({
          name: editName,
          level: editLevel,
          academic_year: editYear
        })
        .eq('id', id);
      if (error) throw error;
      setClasses((c) => c.map((x) => (x.id === id ? { ...x, name: editName, level: editLevel, academic_year: editYear } : x)));
      setEditingId(null);
    } catch (err) {
      console.error(err);
      alert('Erreur lors de la sauvegarde');
    }
  };

  const deleteClass = async (id: string) => {
    if (!confirm('Supprimer cette classe ?')) return;
    try {
      const { error } = await supabase.from('classes').delete().eq('id', id);
      if (error) throw error;
      setClasses((c) => c.filter((x) => x.id !== id));
    } catch (err) {
      console.error(err);
      alert('Erreur lors de la suppression de la classe');
    }
  };

  if (loading) return <div>Chargement des classes…</div>;

  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-bold">Gestion des classes</h2>
      </div>

      <form onSubmit={createClass} className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-3">
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nom de la classe" required className="px-3 py-2 border rounded" />
        <input value={level} onChange={(e) => setLevel(e.target.value)} placeholder="Niveau (ex: 6ème)" required className="px-3 py-2 border rounded" />
        <input value={year} onChange={(e) => setYear(e.target.value)} placeholder="Année scolaire" required className="px-3 py-2 border rounded" />
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
          {classes.map((c) => (
            <li key={c.id} className="flex items-center justify-between">
              <div>
                {editingId === c.id ? (
                  <div className="space-y-2">
                    <input value={editName} onChange={(e) => setEditName(e.target.value)} className="px-2 py-1 border rounded w-full" />
                    <div className="flex space-x-2">
                      <input value={editLevel} onChange={(e) => setEditLevel(e.target.value)} className="px-2 py-1 border rounded" />
                      <input value={editYear} onChange={(e) => setEditYear(e.target.value)} className="px-2 py-1 border rounded" />
                    </div>
                    <div className="flex space-x-2">
                      <button onClick={() => saveEdit(c.id)} className="px-3 py-1 bg-green-600 text-white rounded">Sauver</button>
                      <button onClick={cancelEdit} className="px-3 py-1 border rounded">Annuler</button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="font-medium">{c.name}</div>
                    <div className="text-sm text-gray-500">{c.level} — {c.academic_year}</div>
                  </>
                )}
              </div>
              <div className="flex items-center space-x-4">
                <div className="text-sm text-gray-500">{new Date(c.created_at).toLocaleDateString()}</div>
                <div className="flex space-x-2">
                  <button onClick={() => startEdit(c)} className="text-blue-600">Éditer</button>
                  <button className="text-red-600" onClick={() => deleteClass(c.id)}>Supprimer</button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
