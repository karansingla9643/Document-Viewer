
import { DocumentProvider } from '@/contexts/DocumentContext';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { Dashboard } from '@/components/Dashboard';
import { AuthPage } from '@/components/AuthPage';

const AppContent = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return <AuthPage />;
  }

  return (
    <DocumentProvider>
      <Dashboard />
    </DocumentProvider>
  );
};

const Index = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

export default Index;
