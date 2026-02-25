import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Clock, Plus, Edit, Trash2, Calendar } from 'lucide-react';

type Schedule = {
  id: string;
  class_id: string;
  subject_id: string;
  teacher_id: string;
  day_of_week: number; // 0 = Monday, 6 = Sunday
  start_time: string;
  end_time: string;
  room_number: string | null;
  created_at: string;
  classes?: {
    name: string;
  };
  subjects?: {
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

type Subject = {
  id: string;
  name: string;
};

type Teacher = {
  id: string;
  profiles?: {
    first_name: string;
    last_name: string;
  } | {
    first_name: string;
    last_name: string;
  }[];
};

const DAYS = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];

export default function ScheduleManagement() {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form state
  const [classId, setClassId] = useState('');
  const [subjectId, setSubjectId] = useState('');
  const [teacherId, setTeacherId] = useState('');
  const [dayOfWeek, setDayOfWeek] = useState('0');
  const [startTime, setStartTime] = useState('08:00');
  const [endTime, setEndTime] = useState('09:00');
  const [roomNumber, setRoomNumber] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      // Load all schedules
      const { data: schedulesData, error: schedulesError } = await supabase
        .from('schedules')
        .select(`
          *,
          classes (
            name
          ),
          subjects (
            name
          ),
          profiles (
            first_name,
            last_name
          )
        `)
        .order('day_of_week')
        .order('start_time');

      if (schedulesError) throw schedulesError;
      setSchedules(schedulesData || []);

      // Load data for dropdowns
      const [classesRes, subjectsRes, teachersRes] = await Promise.all([
        supabase.from('classes').select('id, name').order('name'),
        supabase.from('subjects').select('id, name').order('name'),
        supabase
          .from('teachers')
          .select('id, profiles!inner(first_name, last_name)')
          .order('profiles.first_name')
      ]);

      setClasses(classesRes.data || []);
      setSubjects(subjectsRes.data || []);
      setTeachers(teachersRes.data || []);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setClassId('');
    setSubjectId('');
    setTeacherId('');
    setDayOfWeek('0');
    setStartTime('08:00');
    setEndTime('09:00');
    setRoomNumber('');
    setEditingId(null);
    setShowForm(false);
  };

  const startEdit = (schedule: Schedule) => {
    setEditingId(schedule.id);
    setClassId(schedule.class_id);
    setSubjectId(schedule.subject_id);
    setTeacherId(schedule.teacher_id);
    setDayOfWeek(schedule.day_of_week.toString());
    setStartTime(schedule.start_time);
    setEndTime(schedule.end_time);
    setRoomNumber(schedule.room_number || '');
    setShowForm(true);
  };

  const createSchedule = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const scheduleData = {
        class_id: classId,
        subject_id: subjectId,
        teacher_id: teacherId,
        day_of_week: Number.parseInt(dayOfWeek, 10),
        start_time: startTime,
        end_time: endTime,
        room_number: roomNumber || null,
      };

      if (editingId) {
        const { error } = await supabase
          .from('schedules')
          .update(scheduleData)
          .eq('id', editingId);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('schedules')
          .insert(scheduleData);
        if (error) throw error;
      }

      await loadData();
      resetForm();
      alert(editingId ? 'Emploi du temps mis à jour avec succès' : 'Créneaux ajoutés avec succès');
    } catch (error) {
      console.error('Error saving schedule:', error);
      const message = error instanceof Error ? error.message : String(error);
      alert('Erreur lors de la sauvegarde: ' + message);
    }
  };

  const deleteSchedule = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce créneau ?')) return;

    try {
      const { error } = await supabase
        .from('schedules')
        .delete()
        .eq('id', id);
      if (error) throw error;

      setSchedules(schedules.filter(s => s.id !== id));
      alert('Créneau supprimé avec succès');
    } catch (error) {
      console.error('Error deleting schedule:', error);
      const message = error instanceof Error ? error.message : String(error);
      alert('Erreur lors de la suppression: ' + message);
    }
  };

  const schedulesByDay = DAYS.reduce((acc, _, dayIndex) => {
    acc[dayIndex] = schedules.filter(s => s.day_of_week === dayIndex);
    return acc;
  }, {} as Record<number, Schedule[]>);

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
        <h2 className="text-2xl font-bold">Gestion de l'emploi du temps</h2>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          <Plus className="w-5 h-5" />
          <span>Ajouter un créneau</span>
        </button>
      </div>

      {showForm && (
        <div className="mb-6 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold mb-4">
            {editingId ? 'Modifier le créneau' : 'Ajouter un créneau'}
          </h3>
          <form onSubmit={createSchedule} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="schedule-class" className="block text-sm font-medium text-gray-700 mb-1">
                  Classe
                </label>
                <select
                  id="schedule-class"
                  value={classId}
                  onChange={(e) => setClassId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="">Sélectionner une classe</option>
                  {classes.map((cls) => (
                    <option key={cls.id} value={cls.id}>
                      {cls.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="schedule-subject" className="block text-sm font-medium text-gray-700 mb-1">
                  Matière
                </label>
                <select
                  id="schedule-subject"
                  value={subjectId}
                  onChange={(e) => setSubjectId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="">Sélectionner une matière</option>
                  {subjects.map((subject) => (
                    <option key={subject.id} value={subject.id}>
                      {subject.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="schedule-teacher" className="block text-sm font-medium text-gray-700 mb-1">
                  Enseignant
                </label>
                <select
                  id="schedule-teacher"
                  value={teacherId}
                  onChange={(e) => setTeacherId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="">Sélectionner un enseignant</option>
                  {teachers.map((teacher) => {
                    const profile = Array.isArray(teacher.profiles)
                      ? teacher.profiles[0]
                      : teacher.profiles;
                    return (
                      <option key={teacher.id} value={teacher.id}>
                        {profile?.first_name} {profile?.last_name}
                      </option>
                    );
                  })}
                </select>
              </div>

              <div>
                <label htmlFor="schedule-day" className="block text-sm font-medium text-gray-700 mb-1">
                  Jour
                </label>
                <select
                  id="schedule-day"
                  value={dayOfWeek}
                  onChange={(e) => setDayOfWeek(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  {DAYS.map((day, index) => (
                    <option key={index} value={index.toString()}>
                      {day}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label htmlFor="schedule-start" className="block text-sm font-medium text-gray-700 mb-1">
                  Heure de début
                </label>
                <input
                  id="schedule-start"
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label htmlFor="schedule-end" className="block text-sm font-medium text-gray-700 mb-1">
                  Heure de fin
                </label>
                <input
                  id="schedule-end"
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label htmlFor="schedule-room" className="block text-sm font-medium text-gray-700 mb-1">
                  Salle (optionnel)
                </label>
                <input
                  id="schedule-room"
                  type="text"
                  value={roomNumber}
                  onChange={(e) => setRoomNumber(e.target.value)}
                  placeholder="Ex: 101"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="flex space-x-3">
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                {editingId ? 'Mettre à jour' : 'Ajouter'}
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

      {schedules.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Aucun créneau horaire
          </h3>
          <p className="text-gray-600">
            Commencez à ajouter des créneaux horaires pour les classes.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {DAYS.map((day, dayIndex) => (
            <div key={dayIndex} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
                <h3 className="text-lg font-semibold text-white flex items-center space-x-2">
                  <Calendar className="w-5 h-5" />
                  <span>{day}</span>
                </h3>
              </div>
              
              {schedulesByDay[dayIndex].length === 0 ? (
                <div className="p-6 text-center text-gray-500">
                  Aucun créneau programmé
                </div>
              ) : (
                <div className="divide-y">
                  {schedulesByDay[dayIndex].map((schedule) => (
                    <div key={schedule.id} className="p-6 hover:bg-gray-50 transition">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <Clock className="w-5 h-5 text-blue-600" />
                            <span className="font-semibold text-gray-900">
                              {schedule.start_time} - {schedule.end_time}
                            </span>
                            <span className="px-2 py-1 text-xs bg-blue-100 text-blue-600 rounded-full">
                              {schedule.subjects?.name}
                            </span>
                            <span className="px-2 py-1 text-xs bg-green-100 text-green-600 rounded-full">
                              {schedule.classes?.name}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 ml-8">
                            Prof: {schedule.profiles?.first_name} {schedule.profiles?.last_name}
                          </p>
                          {schedule.room_number && (
                            <p className="text-sm text-gray-600 ml-8">
                              Salle: {schedule.room_number}
                            </p>
                          )}
                        </div>

                        <div className="flex items-center space-x-2 ml-4">
                          <button
                            onClick={() => startEdit(schedule)}
                            className="p-2 text-gray-400 hover:text-blue-600 transition"
                            title="Modifier"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => deleteSchedule(schedule.id)}
                            className="p-2 text-gray-400 hover:text-red-600 transition"
                            title="Supprimer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
