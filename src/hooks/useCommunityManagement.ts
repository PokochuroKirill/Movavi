
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useCommunityManagement = (communityId: string) => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const deleteCommunity = async (): Promise<boolean> => {
    setLoading(true);
    try {
      console.log('Attempting to delete community:', communityId);
      
      const { data, error } = await supabase
        .rpc('delete_community', { community_id: communityId });

      if (error) {
        console.error('Error calling delete_community function:', error);
        throw error;
      }

      if (data === false) {
        throw new Error('У вас нет прав для удаления этого сообщества');
      }

      console.log('Community deleted successfully');
      
      toast({
        title: "Сообщество удалено",
        description: "Сообщество и все связанные данные были удалены"
      });
      
      navigate('/communities');
      return true;
    } catch (error: any) {
      console.error('Error deleting community:', error);
      toast({
        title: "Ошибка удаления",
        description: error.message || "Не удалось удалить сообщество",
        variant: "destructive"
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const banUser = async (userId: string, reason?: string): Promise<boolean> => {
    setLoading(true);
    try {
      console.log('Attempting to ban user:', userId, 'from community:', communityId);
      
      const { data, error } = await supabase
        .rpc('ban_user_from_community', {
          p_community_id: communityId,
          p_user_id: userId,
          p_reason: reason
        });

      if (error) {
        console.error('Error calling ban_user_from_community function:', error);
        throw error;
      }

      if (data === false) {
        throw new Error('У вас нет прав для блокировки пользователей в этом сообществе');
      }

      console.log('User banned successfully');
      
      toast({
        title: "Пользователь заблокирован",
        description: "Пользователь был исключен из сообщества и заблокирован"
      });
      
      return true;
    } catch (error: any) {
      console.error('Error banning user:', error);
      toast({
        title: "Ошибка блокировки",
        description: error.message || "Не удалось заблокировать пользователя",
        variant: "destructive"
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const unbanUser = async (userId: string): Promise<boolean> => {
    setLoading(true);
    try {
      console.log('Attempting to unban user:', userId, 'from community:', communityId);
      
      const { data, error } = await supabase
        .rpc('unban_user_from_community', {
          p_community_id: communityId,
          p_user_id: userId
        });

      if (error) {
        console.error('Error calling unban_user_from_community function:', error);
        throw error;
      }

      if (data === false) {
        throw new Error('У вас нет прав для разблокировки пользователей в этом сообществе');
      }

      console.log('User unbanned successfully');
      
      toast({
        title: "Пользователь разблокирован",
        description: "Пользователь был разблокирован и может снова присоединиться к сообществу"
      });
      
      return true;
    } catch (error: any) {
      console.error('Error unbanning user:', error);
      toast({
        title: "Ошибка разблокировки",
        description: error.message || "Не удалось разблокировать пользователя",
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
};
