
import { useEffect } from 'react';
import { Heart, MessageSquare, Share2, Bookmark } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useProjectInteractions } from '@/hooks/useSupabaseQueries';

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
  const { toast } = useToast();
  const { 
    likes, 
    comments, 
    liked, 
    saved, 
    loadInteractions, 
    handleLike, 
    handleSave, 
    setCommentsCount 
  } = useProjectInteractions(projectId);
  
  useEffect(() => {
    // Initialize with passed values
    setCommentsCount(initialComments);
    
    // Then fetch latest data
    loadInteractions();
  }, [projectId]);
  
  // Sync comment count changes with parent
  useEffect(() => {
    if (onCommentCountChange) {
      onCommentCountChange(comments);
    }
  }, [comments, onCommentCountChange]);

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
