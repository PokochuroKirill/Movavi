
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useCommunityCreationLimit = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const checkCommunityLimit = async (userId: string): Promise<boolean> => {
    setLoading(true);
    try {
      const { count, error } = await supabase
        .from('communities')
        .select('id', { count: 'exact', head: true })
        .eq('creator_id', userId);

      if (error) throw error;

      if (count && count >= 3) {
        toast({
          title: "Достигнут лимит сообществ",
          description: "Вы можете создать максимум 3 сообщества",
          variant: "destructive"
        });
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error checking community limit:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось проверить лимит сообществ",
        variant: "destructive"
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  return { checkCommunityLimit, loading };
};
