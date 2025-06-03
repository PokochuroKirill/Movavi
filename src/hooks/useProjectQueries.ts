
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useProjectCreationLimits = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const checkProjectLimit = async (userId: string): Promise<boolean> => {
    setLoading(true);
    try {
      const { count, error } = await supabase
        .from('projects')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', userId);

      if (error) throw error;

      if (count && count >= 20) {
        toast({
          title: "Достигнут лимит проектов",
          description: "Вы можете создать максимум 20 проектов",
          variant: "destructive"
        });
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error checking project limit:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось проверить лимит проектов",
        variant: "destructive"
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  return { checkProjectLimit, loading };
};
