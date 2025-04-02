
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";

interface Comment {
  id: string;
  author: string;
  authorAvatar?: string;
  content: string;
  createdAt: string;
}

interface CommentSectionProps {
  projectId: string;
  initialComments?: Comment[];
}

const CommentSection = ({ projectId, initialComments = [] }: CommentSectionProps) => {
  const [comments, setComments] = useState<Comment[]>(initialComments);
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: "Требуется авторизация",
        description: "Для публикации комментария необходимо войти в систему",
        variant: "destructive"
      });
      return;
    }

    if (!newComment.trim()) {
      toast({
        title: "Ошибка",
        description: "Комментарий не может быть пустым",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // In a real implementation, we would save the comment to the database
      // For now, we'll just add it to the local state with a fake ID
      const newCommentObj: Comment = {
        id: `temp-${Date.now()}`,
        author: user.user_metadata?.full_name || user.email || 'Anonymous',
        authorAvatar: user.user_metadata?.avatar_url,
        content: newComment,
        createdAt: new Date().toISOString()
      };
      
      setComments([newCommentObj, ...comments]);
      setNewComment('');
      
      toast({
        title: "Комментарий опубликован",
        description: "Ваш комментарий был успешно опубликован",
      });
    } catch (error) {
      console.error("Error submitting comment:", error);
      toast({
        title: "Ошибка",
        description: "Не удалось опубликовать комментарий",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  return (
    <div className="mt-8">
      <h3 className="text-xl font-bold mb-4">Комментарии</h3>
      
      <form onSubmit={handleSubmitComment} className="mb-6">
        <Textarea
          placeholder="Напишите комментарий..."
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          className="mb-2"
          disabled={isSubmitting}
        />
        <Button 
          type="submit" 
          className="gradient-bg text-white"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Отправка...' : 'Отправить'}
        </Button>
      </form>
      
      {comments.length > 0 ? (
        <div className="space-y-6">
          {comments.map((comment) => (
            <div key={comment.id} className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4">
              <div className="flex items-center mb-2">
                <Avatar className="h-8 w-8 mr-2">
                  <AvatarImage src={comment.authorAvatar} alt={comment.author} />
                  <AvatarFallback>{comment.author.substring(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div>
                  <h4 className="font-medium text-sm">{comment.author}</h4>
                  <p className="text-xs text-gray-500">{formatDate(comment.createdAt)}</p>
                </div>
              </div>
              <p className="text-gray-700 dark:text-gray-300">{comment.content}</p>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500">
          Нет комментариев. Будьте первым кто оставит комментарий!
        </div>
      )}
    </div>
  );
};

export default CommentSection;
