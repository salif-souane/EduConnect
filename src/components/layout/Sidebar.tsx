import { useAuth } from '../../contexts/AuthContext';
import {
  Home,
  Users,
  BookOpen,
  Calendar,
  MessageSquare,
  Bell,
  Settings,
  FileText,
  GraduationCap,
  BarChart,
  LogOut,
  School,
  ClipboardList,
} from 'lucide-react';

interface SidebarProps {
  currentView: string;
  onViewChange: (view: string) => void;
}

export default function Sidebar({ currentView, onViewChange }: SidebarProps) {
  const { profile, signOut } = useAuth();

  const getMenuItems = () => {
    switch (profile?.role) {
      case 'admin':
        return [
          { id: 'dashboard', label: 'Tableau de bord', icon: Home },
          { id: 'users', label: 'Utilisateurs', icon: Users },
          { id: 'classes', label: 'Classes', icon: School },
          { id: 'subjects', label: 'Matières', icon: BookOpen },
          { id: 'schedules', label: 'Emplois du temps', icon: Calendar },
          { id: 'announcements', label: 'Annonces', icon: Bell },
          { id: 'statistics', label: 'Statistiques', icon: BarChart },
          { id: 'messages', label: 'Messages', icon: MessageSquare },
        ];
      case 'teacher':
        return [
          { id: 'dashboard', label: 'Tableau de bord', icon: Home },
          { id: 'my-classes', label: 'Mes classes', icon: School },
          { id: 'courses', label: 'Cours', icon: BookOpen },
          { id: 'assignments', label: 'Devoirs', icon: ClipboardList },
          { id: 'grades', label: 'Notes', icon: FileText },
          { id: 'announcements', label: 'Annonces', icon: Bell },
          { id: 'forums', label: 'Forums', icon: MessageSquare },
          { id: 'messages', label: 'Messages', icon: MessageSquare },
        ];
      case 'student':
        return [
          { id: 'dashboard', label: 'Tableau de bord', icon: Home },
          { id: 'schedules', label: 'Emploi du temps', icon: Calendar },
          { id: 'courses', label: 'Cours', icon: BookOpen },
          { id: 'assignments', label: 'Devoirs', icon: ClipboardList },
          { id: 'grades', label: 'Notes', icon: GraduationCap },
          { id: 'announcements', label: 'Annonces', icon: Bell },
          { id: 'forums', label: 'Forums', icon: MessageSquare },
          { id: 'messages', label: 'Messages', icon: MessageSquare },
        ];
      case 'parent':
        return [
          { id: 'dashboard', label: 'Tableau de bord', icon: Home },
          { id: 'children', label: 'Mes enfants', icon: Users },
          { id: 'schedules', label: 'Emploi du temps', icon: Calendar },
          { id: 'grades', label: 'Notes', icon: GraduationCap },
          { id: 'announcements', label: 'Annonces', icon: Bell },
          { id: 'forums', label: 'Forums', icon: MessageSquare },
          { id: 'messages', label: 'Messages', icon: MessageSquare },
          { id: 'appointments', label: 'Rendez-vous', icon: Calendar },
        ];
      default:
        return [];
    }
  };

  const menuItems = getMenuItems();

  return (
    <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          
          <div>
            <h1 className="text-lg font-bold text-gray-900">
  <span className="text-black ">KAARAAN</span>
  <span className="text-green-500">DULA</span>
</h1>
            <p className="text-xs text-gray-500 capitalize">{profile?.role}</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <nav className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => onViewChange(item.id)}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition ${
                  currentView === item.id
                    ? 'bg-blue-50 text-blue-700 font-medium'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      <div className="p-4 border-t border-gray-200">
        <div className="mb-3 p-3 bg-gray-50 rounded-lg">
          <p className="text-sm font-medium text-gray-900">
            {profile?.first_name} {profile?.last_name}
          </p>
          <p className="text-xs text-gray-500">{profile?.email}</p>
        </div>

        <button
          onClick={() => onViewChange('settings')}
          className={`w-full flex items-center space-x-3 px-4 py-2 rounded-lg transition mb-2 ${
            currentView === 'settings'
              ? 'bg-blue-50 text-blue-700'
              : 'text-gray-700 hover:bg-gray-50'
          }`}
        >
          <Settings className="w-5 h-5" />
          <span>Paramètres</span>
        </button>

        <button
          onClick={() => signOut()}
          className="w-full flex items-center space-x-3 px-4 py-2 rounded-lg text-red-600 hover:bg-red-50 transition"
        >
          <LogOut className="w-5 h-5" />
          <span>Déconnexion</span>
        </button>
      </div>
    </div>
  );
}
