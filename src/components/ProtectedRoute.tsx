
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import LoaderSpinner from "@/components/ui/LoaderSpinner";

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <LoaderSpinner size="lg" className="mb-4" />
        <p className="text-lg">Загрузка...</p>
      </div>
    );
  }

  if (!user) {
    // Save the current path to redirect back after authentication
    return <Navigate to="/auth" state={{ from: location.pathname }} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
