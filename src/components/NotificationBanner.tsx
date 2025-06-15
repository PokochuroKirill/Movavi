
import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { X, Bell, CheckCircle, AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  action_url: string | null;
  created_at: string;
}

const NotificationBanner: React.FC = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: notifications, isLoading } = useQuery({
    queryKey: ['active-notifications', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase.rpc('get_active_notifications_for_user', {
        p_user_id: user.id
      });
      
      if (error) throw error;
      return data as Notification[];
    },
    enabled: !!user,
  });

  const dismissNotificationMutation = useMutation({
    mutationFn: async (notificationId: string) => {
      const { error } = await supabase
        .from('dismissed_notifications')
        .insert({
          user_id: user?.id,
          notification_id: notificationId
        });
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['active-notifications'] });
    },
  });

  const getIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'error':
        return <AlertTriangle className="w-5 h-5 text-red-600" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-600" />;
      default:
        return <Bell className="w-5 h-5 text-blue-600" />;
    }
  };

  const getAlertVariant = (type: string) => {
    switch (type) {
      case 'error':
        return 'destructive';
      default:
        return 'default';
    }
  };

  const handleDismiss = (notificationId: string) => {
    dismissNotificationMutation.mutate(notificationId);
  };

  if (isLoading || !notifications?.length) {
    return null;
  }

  return (
    <div className="space-y-4 mb-6">
      {notifications.map((notification) => (
        <Alert key={notification.id} variant={getAlertVariant(notification.type)} className="relative">
          <div className="flex items-start gap-3">
            {getIcon(notification.type)}
            <div className="flex-1">
              <h4 className="font-semibold text-sm">{notification.title}</h4>
              <AlertDescription className="mt-1">
                {notification.message}
              </AlertDescription>
              {notification.action_url && (
                <a 
                  href={notification.action_url}
                  className="text-sm underline mt-2 inline-block hover:no-underline"
                >
                  Подробнее
                </a>
              )}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleDismiss(notification.id)}
              className="absolute top-2 right-2 h-6 w-6 p-0"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </Alert>
      ))}
    </div>
  );
};

export default NotificationBanner;
