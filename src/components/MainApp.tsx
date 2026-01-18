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
import MessagesManagement from './dashboard/MessagesManagement';

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
        case 'announcements':
          return <AnnouncementsManagement />;
        case 'messages':
          return <MessagesManagement />;
        case 'statistics':
          return <PlaceholderView title={currentView} />;
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
