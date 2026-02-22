import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import Sidebar from './layout/Sidebar';
import AdminDashboard from './dashboard/AdminDashboard';
import TeacherDashboard from './dashboard/TeacherDashboard';
import StudentDashboard from './dashboard/StudentDashboard';
import ParentDashboard from './dashboard/ParentDashboard';
import PlaceholderView from './common/PlaceholderView';
import UsersManagement from './dashboard/UsersManagement';
import ClassesManagement from './dashboard/ClassesManagement';
import SubjectsManagement from './dashboard/SubjectsManagement';
import AnnouncementsManagement from './dashboard/AnnouncementsManagement';
import AnnouncementsView from './dashboard/AnnouncementsView';
import MessagesManagement from './dashboard/MessagesManagement';
import CoursesManagement from './dashboard/CoursesManagement';
import CoursesView from './dashboard/CoursesView';
import AssignmentsManagement from './dashboard/AssignmentsManagement';
import AssignmentsView from './dashboard/AssignmentsView';
import GradesManagement from './dashboard/GradesManagement';
import GradesView from './dashboard/GradesView';
import ScheduleManagement from './dashboard/ScheduleManagement';
import ScheduleView from './dashboard/ScheduleView';
import ForumsManagement from './dashboard/ForumsManagement';
import ForumsView from './dashboard/ForumsView';
import StatisticsManagement from './dashboard/StatisticsManagement';

export default function MainApp() {
  const { profile } = useAuth();
  const [currentView, setCurrentView] = useState('dashboard');

  const renderView = () => {
    if (currentView === 'dashboard') {
      switch (profile?.role) {
        case 'admin':
          return <AdminDashboard />;
        case 'teacher':
          return <TeacherDashboard />;
        case 'student':
          return <StudentDashboard />;
        case 'parent':
          return <ParentDashboard />;
        default:
          return <PlaceholderView title="Dashboard" />;
      }
    }

    // Admin-specific views
    if (profile?.role === 'admin') {
      switch (currentView) {
        case 'users':
          return <UsersManagement />;
        case 'classes':
          return <ClassesManagement />;
        case 'subjects':
          return <SubjectsManagement />;
        case 'schedules':
          return <ScheduleManagement />;
        case 'announcements':
          return <AnnouncementsManagement />;
        case 'messages':
          return <MessagesManagement />;
        case 'forums':
          return <ForumsManagement />;
        case 'statistics':
          return <StatisticsManagement />;
        default:
          return <PlaceholderView title={currentView} />;
      }
    }

    // Teacher-specific views
    if (profile?.role === 'teacher') {
      switch (currentView) {
        case 'courses':
          return <CoursesManagement />;
        case 'assignments':
          return <AssignmentsManagement />;
        case 'grades':
          return <GradesManagement />;
        case 'announcements':
          return <AnnouncementsManagement />;
        case 'messages':
          return <MessagesManagement />;
        case 'forums':
          return <ForumsManagement />;
        case 'statistics':
          return <PlaceholderView title={currentView} />;
        default:
          return <PlaceholderView title={currentView} />;
      }
    }

    // Student-specific views
    if (profile?.role === 'student') {
      switch (currentView) {
        case 'courses':
          return <CoursesView />;
        case 'assignments':
          return <AssignmentsView />;
        case 'grades':
          return <GradesView />;
        case 'schedules':
          return <ScheduleView />;
        case 'messages':
          return <MessagesManagement />;
        case 'announcements':
          return <AnnouncementsView />;
        case 'forums':
          return <ForumsView />;
        default:
          return <PlaceholderView title={currentView} />;
      }
    }

    // Parent-specific views
    if (profile?.role === 'parent') {
      switch (currentView) {
        case 'children':
          return <PlaceholderView title="Suivi des enfants" />;
        case 'grades':
          return <GradesView />;
        case 'messages':
          return <MessagesManagement />;
        case 'schedules':
          return <ScheduleView />;
        case 'announcements':
          return <AnnouncementsView />;
        case 'forums':
          return <ForumsView />;
        default:
          return <PlaceholderView title={currentView} />;
      }
    }

    return <PlaceholderView title={currentView} />;
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar currentView={currentView} onViewChange={setCurrentView} />
      <div className="flex-1 overflow-auto">
        <div className="max-w-7xl mx-auto p-8">
          {renderView()}
        </div>
      </div>
    </div>
  );
}
