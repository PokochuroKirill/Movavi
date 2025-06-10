
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
  const [loading, setLoading] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);

  useEffect(() => {
    const checkAdminAccess = async () => {
      if (!user) {
        navigate('/auth');
        return;
      }
      
      try {
        // Получаем профиль пользователя
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('username')
          .eq('id', user.id)
          .single();

        if (error) {
          console.error('Error fetching profile:', error);
          toast({
            title: 'Ошибка',
            description: 'Не удалось проверить права доступа',
            variant: 'destructive'
          });
          navigate('/');
          return;
        }

        // Проверяем, что username = "devhub" (без @)
        if (profile?.username === 'devhub') {
          setHasAccess(true);
        } else {
          toast({
            title: 'Доступ запрещен',
            description: 'У вас нет прав для доступа к этой странице',
            variant: 'destructive'
          });
          navigate('/');
          return;
        }
      } catch (error) {
        console.error('Error checking admin access:', error);
        navigate('/');
      } finally {
        setLoading(false);
      }
    };

    checkAdminAccess();
  }, [user, navigate, toast]);

  if (loading) {
    return (
      <Layout>
        <div className="container py-10 flex items-center justify-center">
          <div className="flex items-center space-x-2">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            <p>Проверка доступа...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (!hasAccess) {
    return null; // Пользователь уже перенаправлен
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
