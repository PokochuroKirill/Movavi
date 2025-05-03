
import React, { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import SubscriptionManagement from '@/components/admin/SubscriptionManagement';
import { ShieldAlert } from 'lucide-react';

const AdminPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!user) {
        navigate('/auth');
        return;
      }

      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('is_admin')
          .eq('id', user.id)
          .single();

        if (error) throw error;
        
        if (!data?.is_admin) {
          toast({
            title: "Доступ запрещен",
            description: "У вас нет прав администратора для доступа к этой странице",
            variant: "destructive"
          });
          navigate('/');
          return;
        }

        setIsAdmin(true);
      } catch (error) {
        console.error("Error checking admin status:", error);
        navigate('/');
      } finally {
        setLoading(false);
      }
    };

    checkAdminStatus();
  }, [user, navigate, toast]);

  if (loading) {
    return (
      <Layout>
        <div className="container py-10 flex items-center justify-center">
          <p>Загрузка...</p>
        </div>
      </Layout>
    );
  }

  if (!isAdmin) {
    return null; // Will be redirected by useEffect
  }

  return (
    <Layout>
      <div className="container max-w-5xl py-10">
        <div className="flex items-center mb-8">
          <ShieldAlert className="h-8 w-8 mr-3 text-red-500" />
          <h1 className="text-3xl font-bold">Панель администратора</h1>
        </div>

        <Tabs defaultValue="subscriptions">
          <TabsList className="mb-6">
            <TabsTrigger value="subscriptions">Подписки</TabsTrigger>
            <TabsTrigger value="users">Пользователи</TabsTrigger>
            <TabsTrigger value="content">Контент</TabsTrigger>
          </TabsList>
          
          <TabsContent value="subscriptions">
            <SubscriptionManagement />
          </TabsContent>
          
          <TabsContent value="users">
            <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-10 text-center">
              <p className="text-gray-500 dark:text-gray-400">
                Управление пользователями будет доступно в ближайшем обновлении
              </p>
            </div>
          </TabsContent>
          
          <TabsContent value="content">
            <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-10 text-center">
              <p className="text-gray-500 dark:text-gray-400">
                Управление контентом будет доступно в ближайшем обновлении
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default AdminPage;
