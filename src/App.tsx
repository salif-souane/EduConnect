import { useAuth } from './contexts/AuthContext';
import LoginForm from './components/auth/LoginForm';
import MainApp from './components/MainApp';

function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return <LoginForm />;
  }

  return <MainApp />;
}

export default App;
