
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useCommunityPostInteractions = (postId: string) => {
  const [likes, setLikes] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const loadInteractions = async () => {
    setLoading(true);
    try {
      // Get likes count
      const { count, error: likesError } = await supabase
        .from('community_post_likes')
        .select('*', { count: 'exact', head: true })
        .eq('post_id', postId);

      if (likesError) throw likesError;
      setLikes(count || 0);

      // Check if user liked the post
      if (user) {
        const { data, error: userLikeError } = await supabase
          .from('community_post_likes')
          .select('id')
          .eq('post_id', postId)
          .eq('user_id', user.id)
          .maybeSingle();

        if (userLikeError) throw userLikeError;
        setIsLiked(!!data);
      }
    } catch (error) {
      console.error('Error loading post interactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleLike = async () => {
    if (!user) {
      toast({
        title: "Требуется авторизация",
        description: "Для оценки поста необходимо войти в систему",
        variant: "destructive"
      });
      return;
    }

    try {
      if (isLiked) {
        // Remove like
        const { error } = await supabase
          .from('community_post_likes')
          .delete()
          .eq('post_id', postId)
          .eq('user_id', user.id);

        if (error) throw error;
        setIsLiked(false);
        setLikes(prev => Math.max(0, prev - 1));
      } else {
        // Add like
        const { error } = await supabase
          .from('community_post_likes')
          .insert({
            post_id: postId,
            user_id: user.id
          });

        if (error) throw error;
        setIsLiked(true);
        setLikes(prev => prev + 1);
      }
    } catch (error: any) {
      console.error('Error toggling like:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось обновить оценку",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    loadInteractions();
  }, [postId, user]);

  return {
    likes,
    isLiked,
    loading,
    toggleLike
  };
};
