import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';

type RoleCounts = {
  admin: number;
  enseignant: number;
  eleve: number;
  parent: number;
};

type RecentUser = {
  id: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  role?: string;
  created_at?: string;
};

export default function StatisticsManagement() {
  const [loading, setLoading] = useState(true);
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalClasses, setTotalClasses] = useState(0);
  const [totalSubjects, setTotalSubjects] = useState(0);
  const [totalStudents, setTotalStudents] = useState(0);
  const [roleCounts, setRoleCounts] = useState<RoleCounts>({ admin: 0, enseignant: 0, eleve: 0, parent: 0 });
  const [recentUsers, setRecentUsers] = useState<RecentUser[]>([]);
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  useEffect(() => { load(); }, []);

  const load = async (options?: { start?: string; end?: string }) => {
    setLoading(true);
    try {
      const [usersRes, classesRes, subjectsRes, studentsRes, recentRes, adminRes, teacherRes, studentRes, parentRes] = await Promise.all([
        supabase.from('profiles').select('id', { count: 'exact', head: true }),
        supabase.from('classes').select('id', { count: 'exact', head: true }),
        supabase.from('subjects').select('id', { count: 'exact', head: true }),
        supabase.from('students').select('id', { count: 'exact', head: true }),
        (() => {
          let q = supabase.from('profiles').select('id, first_name, last_name, email, role, created_at').order('created_at', { ascending: false }).limit(50);
          if (options?.start) q = q.gte('created_at', options.start + 'T00:00:00');
          if (options?.end) q = q.lte('created_at', options.end + 'T23:59:59');
          return q;
        })(),
        supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('role', 'admin'),
        supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('role', 'enseignant'),
        supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('role', 'eleve'),
        supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('role', 'parent'),
      ]);

      setTotalUsers(usersRes.count || 0);
      setTotalClasses(classesRes.count || 0);
      setTotalSubjects(subjectsRes.count || 0);
      setTotalStudents(studentsRes.count || 0);

      setRecentUsers(recentRes.data || []);

      setRoleCounts({
        admin: adminRes.count || 0,
        enseignant: teacherRes.count || 0,
        eleve: studentRes.count || 0,
        parent: parentRes.count || 0,
      });
    } catch (err) {
      console.error('Erreur chargement statistiques détaillées', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Chargement des statistiques…</div>;

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-3xl font-bold mb-2">
  <span className="text-black">Statistiques</span>{" "}
  <span className="text-green-500">détaillées</span>
</h2>
         <div className="text-sm text-gray-600">Mise à jour automatique depuis Supabase</div>
      </div>

      <div className="mb-4 flex items-center space-x-3">
        <label className="text-sm">Du</label>
        <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="px-2 py-1 border rounded" />
        <label className="text-sm">au</label>
        <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="px-2 py-1 border rounded" />
        <button onClick={() => load(startDate || endDate ? { start: startDate, end: endDate } : undefined)} className="px-3 py-1 bg-blue-600 text-white rounded">Appliquer</button>
        <button onClick={() => exportCSV()} className="px-3 py-1 bg-gray-700 text-white rounded">Exporter CSV</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="p-4 bg-white rounded shadow">
          <div className="text-sm text-gray-500">Utilisateurs</div>
          <div className="text-2xl font-bold">{totalUsers}</div>
        </div>
        <div className="p-4 bg-white rounded shadow">
          <div className="text-sm text-gray-500">Élèves</div>
          <div className="text-2xl font-bold">{totalStudents}</div>
        </div>
        <div className="p-4 bg-white rounded shadow">
          <div className="text-sm text-gray-500">Classes</div>
          <div className="text-2xl font-bold">{totalClasses}</div>
        </div>
        <div className="p-4 bg-white rounded shadow">
          <div className="text-sm text-gray-500">Matières</div>
          <div className="text-2xl font-bold">{totalSubjects}</div>
        </div>
      </div>

      <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 bg-white rounded shadow">
          <h3 className="font-medium mb-2">Répartition par rôle</h3>
          <ul className="space-y-2">
            <li className="flex justify-between"><span>Administrateurs</span><span>{roleCounts.admin}</span></li>
            <li className="flex justify-between"><span>Enseignants</span><span>{roleCounts.enseignant}</span></li>
            <li className="flex justify-between"><span>Élèves</span><span>{roleCounts.eleve}</span></li>
            <li className="flex justify-between"><span>Parents</span><span>{roleCounts.parent}</span></li>
          </ul>
        </div>

        <div className="p-4 bg-white rounded shadow">
          <h3 className="font-medium mb-2">Inscriptions récentes</h3>
          <ul className="space-y-2 text-sm">
            {recentUsers.map((u) => (
              <li key={u.id} className="flex justify-between">
                <div>
                  <div className="font-medium">{u.first_name} {u.last_name}</div>
                  <div className="text-gray-500">{u.email}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-500">{u.role}</div>
                  <div className="text-xs text-gray-400">{new Date(u.created_at || '').toLocaleDateString()}</div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <h3 className="font-medium mb-2">Détails complets</h3>
        <p className="text-sm text-gray-500">Ici vous pourrez ajouter des filtres, exporter les données, ou afficher des graphiques temporels.</p>
      </div>
    </div>
  );
}

async function exportCSV() {
  try {
    const { data } = await supabase.from('profiles').select('id, first_name, last_name, email, role, created_at').order('created_at', { ascending: false }).limit(1000);
    const rows = (data || []).map((r: any) => ({
      id: r.id,
      first_name: r.first_name || '',
      last_name: r.last_name || '',
      email: r.email || '',
      role: r.role || '',
      created_at: r.created_at || '',
    }));

    if (rows.length === 0) {
      alert('Aucune donnée à exporter');
      return;
    }

    const header = Object.keys(rows[0]);
    const csv = [header.join(',')].concat(rows.map((row: any) => header.map((h) => `"${String(row[h]).replace(/"/g, '""')}"`).join(','))).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `statistics_export_${new Date().toISOString()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  } catch (err) {
    console.error('Erreur export CSV', err);
    alert('Erreur lors de l\'export CSV');
  }
}
