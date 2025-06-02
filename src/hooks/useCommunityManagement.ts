
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

export function useCommunityManagement(communityId: string) {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  // Удаление сообщества (только создатель)
  const deleteCommunity = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.rpc('delete_community', {
        community_id: communityId
      });

      if (error) throw error;

      if (data) {
        toast({
          title: "Сообщество удалено",
          description: "Сообщество было успешно удалено"
        });
        navigate('/communities');
        return true;
      } else {
        toast({
          title: "Ошибка",
          description: "У вас нет прав для удаления этого сообщества",
          variant: "destructive"
        });
        return false;
      }
    } catch (error: any) {
      console.error('Error deleting community:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось удалить сообщество",
        variant: "destructive"
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Блокировка пользователя
  const banUser = async (userId: string, reason?: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.rpc('ban_user_from_community', {
        p_community_id: communityId,
        p_user_id: userId,
        p_reason: reason
      });

      if (error) throw error;

      if (data) {
        toast({
          title: "Пользователь заблокирован",
          description: "Пользователь был исключен из сообщества"
        });
        return true;
      } else {
        toast({
          title: "Ошибка",
          description: "Не удалось заблокировать пользователя",
          variant: "destructive"
        });
        return false;
      }
    } catch (error: any) {
      console.error('Error banning user:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось заблокировать пользователя",
        variant: "destructive"
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Разблокировка пользователя
  const unbanUser = async (userId: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.rpc('unban_user_from_community', {
        p_community_id: communityId,
        p_user_id: userId
      });

      if (error) throw error;

      if (data) {
        toast({
          title: "Пользователь разблокирован",
          description: "Пользователь может снова присоединиться к сообществу"
        });
        return true;
      } else {
        toast({
          title: "Ошибка",
          description: "Не удалось разблокировать пользователя",
          variant: "destructive"
        });
        return false;
      }
    } catch (error: any) {
      console.error('Error unbanning user:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось разблокировать пользователя",
        variant: "destructive"
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    deleteCommunity,
    banUser,
    unbanUser,
    loading
  };
}
