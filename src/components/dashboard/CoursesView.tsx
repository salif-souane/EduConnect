import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { BookOpen, Download } from 'lucide-react';

type Course = {
  id: string;
  title: string;
  description: string | null;
  content: string | null;
  file_url: string | null;
  published_at: string;
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

export default function CoursesView() {
  const { user } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);

  const loadCourses = useCallback(async () => {
    setLoading(true);
    try {
      if (!user?.id) {
        setLoading(false);
        return;
      }

      // Get student's class
      const result = await supabase
        .from('students')
        .select('class_id')
        .eq('id', user.id)
        .single() as { data: StudentData | null; error: any };
      
      const studentData = result.data;

      if (!studentData || !studentData.class_id) {
        setLoading(false);
        return;
      }

      const classId = studentData.class_id;

      // Load courses for student's class
      const { data: coursesData, error } = await supabase
        .from('courses')
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
        .order('published_at', { ascending: false });

      if (error) throw error;
      setCourses(coursesData || []);
    } catch (error) {
      console.error('Error loading courses:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadCourses();
  }, [loadCourses]);

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
  <span className="text-black">Mes</span>{" "}
  <span className="text-green-500">cours</span>
</h2>
        <p className="text-gray-600 mt-2">Accédez aux cours publiés par vos professeurs</p>
      </div>

      {selectedCourse ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-6">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-2xl font-bold text-white mb-2">{selectedCourse.title}</h3>
                <div className="flex items-center space-x-4 text-blue-100">
                  <span>{selectedCourse.subjects?.name}</span>
                  <span>•</span>
                  <span>{selectedCourse.profiles?.first_name} {selectedCourse.profiles?.last_name}</span>
                </div>
              </div>
              <button
                onClick={() => setSelectedCourse(null)}
                className="px-4 py-2 bg-white text-blue-600 rounded-lg hover:bg-blue-50 transition"
              >
                ← Retour
              </button>
            </div>
          </div>

          <div className="p-6 space-y-6">
            {selectedCourse.description && (
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Description</h4>
                <p className="text-gray-700">{selectedCourse.description}</p>
              </div>
            )}

            {selectedCourse.content && (
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Contenu du cours</h4>
                <div className="bg-gray-50 rounded-lg p-6 text-gray-700 whitespace-pre-wrap">
                  {selectedCourse.content}
                </div>
              </div>
            )}

            {selectedCourse.file_url && (
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Ressources</h4>
                <a
                  href={selectedCourse.file_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-2 px-4 py-3 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition"
                >
                  <Download className="w-5 h-5" />
                  <span>Télécharger la ressource</span>
                </a>
              </div>
            )}

            <div className="border-t pt-4 text-sm text-gray-500">
              Publié le {new Date(selectedCourse.published_at).toLocaleDateString('fr-FR')}
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {courses.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
              <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Aucun cours disponible
              </h3>
              <p className="text-gray-600">
                Les cours des professeurs seront affichés ici.
              </p>
            </div>
          ) : (
            courses.map((course) => (
              <div
                key={course.id}
                onClick={() => setSelectedCourse(course)}
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 cursor-pointer hover:shadow-md hover:border-blue-300 transition"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <BookOpen className="w-5 h-5 text-blue-600" />
                      <h3 className="text-lg font-semibold text-gray-900">
                        {course.title}
                      </h3>
                    </div>

                    <div className="flex items-center space-x-2 mb-3">
                      <span className="px-2 py-1 text-xs bg-blue-100 text-blue-600 rounded-full">
                        {course.subjects?.name}
                      </span>
                      <span className="text-sm text-gray-600">
                        {course.profiles?.first_name} {course.profiles?.last_name}
                      </span>
                    </div>

                    {course.description && (
                      <p className="text-gray-600 line-clamp-2">
                        {course.description}
                      </p>
                    )}

                    <div className="mt-3 text-sm text-gray-500">
                      Publié le {new Date(course.published_at).toLocaleDateString('fr-FR')}
                    </div>
                  </div>

                  <div className="ml-4">
                    <button className="px-4 py-2 text-blue-600 font-medium hover:bg-blue-50 rounded-lg transition">
                      Consulter →
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
