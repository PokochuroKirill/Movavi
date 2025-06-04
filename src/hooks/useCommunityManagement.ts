
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Community } from '@/types/database';

export function useCommunityManagement() {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const updateCommunity = async (
    communityId: string,
    updates: Partial<Community>
  ): Promise<boolean> => {
    setLoading(true);
    
    try {
      const { error } = await supabase
        .from('communities')
        .update(updates)
        .eq('id', communityId);

      if (error) throw error;

      toast({
        title: "Сообщество обновлено",
        description: "Изменения успешно сохранены",
      });

      return true;
    } catch (error: any) {
      console.error('Error updating community:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось обновить сообщество",
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const deleteCommunity = async (communityId: string): Promise<boolean> => {
    setLoading(true);
    
    try {
      // Delete community posts first
      const { error: postsError } = await supabase
        .from('community_posts')
        .delete()
        .eq('community_id', communityId);

      if (postsError) throw postsError;

      // Delete community members
      const { error: membersError } = await supabase
        .from('community_members')
        .delete()
        .eq('community_id', communityId);

      if (membersError) throw membersError;

      // Delete community
      const { error } = await supabase
        .from('communities')
        .delete()
        .eq('id', communityId);

      if (error) throw error;

      toast({
        title: "Сообщество удалено",
        description: "Сообщество успешно удалено",
      });

      return true;
    } catch (error: any) {
      console.error('Error deleting community:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось удалить сообщество",
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    updateCommunity,
    deleteCommunity,
    loading
  };
}
