
import { useState } from 'react';
import { Heart, MessageSquare, Share2, Bookmark } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface ProjectActionsProps {
  projectId: string;
  initialLikes: number;
  initialComments: number;
  isLiked?: boolean;
  isSaved?: boolean;
}

const ProjectActions = ({
  projectId,
  initialLikes = 0,
  initialComments = 0,
  isLiked = false,
  isSaved = false
}: ProjectActionsProps) => {
  const [likes, setLikes] = useState(initialLikes);
  const [comments, setComments] = useState(initialComments);
  const [liked, setLiked] = useState(isLiked);
  const [saved, setSaved] = useState(isSaved);
  const { toast } = useToast();
  const { user } = useAuth();

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
      // Toggle like state
      if (liked) {
        setLikes(likes - 1);
        // Here would be API call to remove like
      } else {
        setLikes(likes + 1);
        // Here would be API call to add like
      }
      setLiked(!liked);
      
      // For now we'll just show a toast since we haven't created the likes table yet
      toast({
        title: liked ? "Вы убрали оценку" : "Вы оценили проект",
        description: liked ? "Оценка была убрана" : "Спасибо за вашу оценку!",
      });
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
    
    setSaved(!saved);
    toast({
      title: saved ? "Проект удален из сохраненных" : "Проект сохранен",
      description: saved ? "Проект был удален из коллекции" : "Проект добавлен в вашу коллекцию",
    });
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
