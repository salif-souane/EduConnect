import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { Clock, Calendar } from 'lucide-react';

type Schedule = {
  id: string;
  class_id: string;
  subject_id: string;
  teacher_id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  room: string | null;
  subjects?: {
    name: string;
  };
  profiles?: {
    first_name: string;
    last_name: string;
  };
};

type StudentData = {
  class_id: string | null;
};

const DAYS = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];

export default function ScheduleView() {
  const { user } = useAuth();
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(true);

  const loadSchedule = useCallback(async () => {
    setLoading(true);
    try {
      if (!user?.id) {
        setLoading(false);
        return;
      }

      // Get student's class
      // @ts-ignore
      const result = await supabase.from('students').select('class_id').eq('id', user.id).single() as { data: StudentData | null; error: any };
      
      const studentData = result.data;

      if (!studentData || !studentData.class_id) {
        setLoading(false);
        return;
      }

      const classId = studentData.class_id;

      // Load schedules for student's class
      const { data: schedulesData, error } = await supabase
        .from('schedules')
        .select(`
          *,
          subjects (
            name
          ),
          profiles (
            first_name,
            last_name
          )
        `)
        .eq('class_id', classId)
        .order('day_of_week')
        .order('start_time');

      if (error) throw error;
      setSchedules(schedulesData || []);
    } catch (error) {
      console.error('Error loading schedule:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadSchedule();
  }, [loadSchedule]);

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
        <h2 className="text-3xl font-bold mb-2">
  <span className="text-black">Mon emploi du </span>{" "}
  <span className="text-green-500">temps</span>
</h2>
      </div>

      {schedules.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Aucun emploi du temps disponible
          </h3>
          <p className="text-gray-600">
            Votre emploi du temps sera affiché ici une fois configuré.
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
                  Pas de cours programmé
                </div>
              ) : (
                <div className="divide-y">
                  {schedulesByDay[dayIndex].map((schedule) => (
                    <div key={schedule.id} className="p-6 hover:bg-gray-50 transition">
                      <div className="space-y-3">
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center space-x-2 bg-blue-50 px-4 py-2 rounded-lg">
                            <Clock className="w-5 h-5 text-blue-600" />
                            <span className="font-semibold text-gray-900">
                              {schedule.start_time} - {schedule.end_time}
                            </span>
                          </div>
                          <span className="px-3 py-1 text-sm font-semibold bg-blue-100 text-blue-700 rounded-full">
                            {schedule.subjects?.name}
                          </span>
                        </div>

                        <div className="ml-2 space-y-1 text-sm">
                          <p className="text-gray-700">
                            <span className="font-medium">Professeur:</span> {schedule.profiles?.first_name} {schedule.profiles?.last_name}
                          </p>
                          {schedule.room && (
                            <p className="text-gray-600">
                              <span className="font-medium">Salle:</span> {schedule.room}
                            </p>
                          )}
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
