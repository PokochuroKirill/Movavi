
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface ProtectedRouteProps {
  children: React.ReactNode;
  adminOnly?: boolean;
}

const ProtectedRoute = ({ children, adminOnly = false }: ProtectedRouteProps) => {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  
  if (!user) {
    toast({
      title: "Требуется авторизация",
      description: "Пожалуйста, войдите в систему для доступа к этой странице",
      variant: "destructive",
    });
    
    return <Navigate to="/auth" replace />;
  }
  
  if (adminOnly && !profile?.is_admin) {
    toast({
      title: "Доступ запрещен",
      description: "У вас нет прав для доступа к этой странице",
      variant: "destructive",
    });
    
    return <Navigate to="/" replace />;
  }
  
  return <>{children}</>;
};

export default ProtectedRoute;
