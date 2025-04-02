
import { useState, useEffect } from 'react';
import { Heart, MessageSquare, Share2, Bookmark, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface ProjectActionsProps {
  projectId: string;
  initialLikes?: number;
  initialComments?: number;
  isLiked?: boolean;
  isSaved?: boolean;
  onCommentCountChange?: (count: number) => void;
}

const ProjectActions = ({
  projectId,
  initialLikes = 0,
  initialComments = 0,
  isLiked = false,
  isSaved = false,
  onCommentCountChange
}: ProjectActionsProps) => {
  const [likes, setLikes] = useState(initialLikes);
  const [comments, setComments] = useState(initialComments);
  const [liked, setLiked] = useState(isLiked);
  const [saved, setSaved] = useState(isSaved);
  const { toast } = useToast();
  const { user } = useAuth();
  
  useEffect(() => {
    // Fetch initial like and save status when user is available
    const fetchUserInteractions = async () => {
      if (!user) return;
      
      try {
        // Check if user liked the project
        const { data: likeData, error: likeError } = await supabase
          .rpc('has_user_liked_project', { 
            project_id: projectId,
            user_id: user.id
          });
          
        if (likeError) throw likeError;
        setLiked(likeData || false);
        
        // Check if user saved the project
        const { data: saveData, error: saveError } = await supabase
          .rpc('has_user_saved_project', { 
            project_id: projectId,
            user_id: user.id
          });
          
        if (saveError) throw saveError;
        setSaved(saveData || false);
        
        // Get updated like count
        const { data: likesCount, error: countError } = await supabase
          .rpc('get_project_likes_count', { project_id: projectId });
          
        if (countError) throw countError;
        setLikes(likesCount || 0);
        
        // Get updated comment count
        const { count: commentCount, error: commentError } = await supabase
          .from('comments')
          .select('id', { count: 'exact', head: true })
          .eq('project_id', projectId);
          
        if (commentError) throw commentError;
        setComments(commentCount || 0);
        if (onCommentCountChange) onCommentCountChange(commentCount || 0);
        
      } catch (error) {
        console.error("Error fetching user interactions:", error);
      }
    };
    
    fetchUserInteractions();
  }, [projectId, user, onCommentCountChange]);

  const handleLike = async () => {
    if (!user) {
      toast({
        title: "Требуется авторизация",
        description: "Для оценки проекта необходимо войти",
        variant: "destructive"
      });
      return;
    }
    
    try {
      if (liked) {
        // Remove like
        const { error } = await supabase
          .from('project_likes')
          .delete()
          .eq('project_id', projectId)
          .eq('user_id', user.id);
          
        if (error) throw error;
        setLikes(prev => prev - 1);
        
        toast({
          title: "Оценка удалена",
          description: "Вы убрали оценку с проекта",
        });
      } else {
        // Add like
        const { error } = await supabase
          .from('project_likes')
          .insert({ project_id: projectId, user_id: user.id });
          
        if (error) throw error;
        setLikes(prev => prev + 1);
        
        toast({
          title: "Проект оценен",
          description: "Спасибо за вашу оценку!",
        });
      }
      
      setLiked(!liked);
    } catch (error) {
      console.error("Error toggling like:", error);
      toast({
        title: "Ошибка",
        description: "Не удалось обновить оценку",
        variant: "destructive"
      });
    }
  };

  const handleSave = async () => {
    if (!user) {
      toast({
        title: "Требуется авторизация",
        description: "Для сохранения проекта необходимо войти",
        variant: "destructive"
      });
      return;
    }
    
    try {
      if (saved) {
        // Remove from saved
        const { error } = await supabase
          .from('saved_projects')
          .delete()
          .eq('project_id', projectId)
          .eq('user_id', user.id);
          
        if (error) throw error;
        
        toast({
          title: "Проект удален из сохраненных",
          description: "Проект был удален из вашей коллекции",
        });
      } else {
        // Add to saved
        const { error } = await supabase
          .from('saved_projects')
          .insert({ project_id: projectId, user_id: user.id });
          
        if (error) throw error;
        
        toast({
          title: "Проект сохранен",
          description: "Проект добавлен в вашу коллекцию",
        });
      }
      
      setSaved(!saved);
    } catch (error) {
      console.error("Error toggling save:", error);
      toast({
        title: "Ошибка",
        description: "Не удалось обновить статус сохранения",
        variant: "destructive"
      });
    }
  };

  const handleShare = () => {
    // Copy the project URL to clipboard
    navigator.clipboard.writeText(window.location.href);
    toast({
      title: "Ссылка скопирована",
      description: "Ссылка на проект скопирована в буфер обмена",
    });
  };

  return (
    <div className="flex items-center space-x-2">
      <Button
        variant="ghost"
        size="sm"
        className={`flex items-center ${liked ? 'text-red-500 dark:text-red-400' : ''}`}
        onClick={handleLike}
      >
        <Heart className={`h-4 w-4 mr-1 ${liked ? 'fill-current' : ''}`} />
        <span>{likes}</span>
      </Button>
      
      <Button
        variant="ghost"
        size="sm"
        className="flex items-center"
      >
        <MessageSquare className="h-4 w-4 mr-1" />
        <span>{comments}</span>
      </Button>
      
      <Button
        variant="ghost"
        size="sm"
        className="flex items-center"
        onClick={handleShare}
      >
        <Share2 className="h-4 w-4" />
      </Button>
      
      <Button
        variant="ghost"
        size="sm"
        className={`flex items-center ${saved ? 'text-yellow-500 dark:text-yellow-400' : ''}`}
        onClick={handleSave}
      >
        <Bookmark className={`h-4 w-4 ${saved ? 'fill-current' : ''}`} />
      </Button>
    </div>
  );
};

export default ProjectActions;
