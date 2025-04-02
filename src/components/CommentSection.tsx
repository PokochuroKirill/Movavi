
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Trash2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface Comment {
  id: string;
  author: string;
  author_id: string;
  authorAvatar?: string;
  content: string;
  createdAt: string;
}

interface CommentSectionProps {
  projectId: string;
  onCommentsChange?: (count: number) => void;
}

const CommentSection = ({ projectId, onCommentsChange }: CommentSectionProps) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    fetchComments();
  }, [projectId]);

  const fetchComments = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('comments')
        .select(`
          id,
          content,
          created_at,
          user_id,
          profiles (username, full_name, avatar_url)
        `)
        .eq('project_id', projectId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedComments = data.map(item => ({
        id: item.id,
        author_id: item.user_id,
        author: item.profiles?.full_name || item.profiles?.username || 'Неизвестный пользователь',
        authorAvatar: item.profiles?.avatar_url,
        content: item.content,
        createdAt: item.created_at
      }));

      setComments(formattedComments);
      if (onCommentsChange) onCommentsChange(formattedComments.length);
    } catch (error) {
      console.error("Error fetching comments:", error);
      toast({
        title: "Ошибка",
        description: "Не удалось загрузить комментарии",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

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
      const { data, error } = await supabase
        .from('comments')
        .insert({
          project_id: projectId,
          user_id: user.id,
          content: newComment,
        })
        .select(`
          id,
          content,
          created_at,
          user_id,
          profiles (username, full_name, avatar_url)
        `)
        .single();

      if (error) throw error;

      const newCommentObj: Comment = {
        id: data.id,
        author_id: data.user_id,
        author: data.profiles?.full_name || data.profiles?.username || user.email || 'Anonymous',
        authorAvatar: data.profiles?.avatar_url,
        content: data.content,
        createdAt: data.created_at
      };
      
      setComments([newCommentObj, ...comments]);
      setNewComment('');
      if (onCommentsChange) onCommentsChange(comments.length + 1);
      
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

  const handleDeleteComment = async (commentId: string) => {
    try {
      const { error } = await supabase
        .from('comments')
        .delete()
        .eq('id', commentId)
        .eq('user_id', user?.id);

      if (error) throw error;

      setComments(comments.filter(comment => comment.id !== commentId));
      if (onCommentsChange) onCommentsChange(comments.length - 1);
      
      toast({
        title: "Комментарий удален",
        description: "Ваш комментарий был успешно удален",
      });
    } catch (error) {
      console.error("Error deleting comment:", error);
      toast({
        title: "Ошибка",
        description: "Не удалось удалить комментарий",
        variant: "destructive"
      });
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
      
      {isLoading ? (
        <div className="text-center py-8">
          <p className="text-gray-500">Загрузка комментариев...</p>
        </div>
      ) : comments.length > 0 ? (
        <div className="space-y-6">
          {comments.map((comment) => (
            <div key={comment.id} className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center">
                  <Avatar className="h-8 w-8 mr-2">
                    <AvatarImage src={comment.authorAvatar} alt={comment.author} />
                    <AvatarFallback>{comment.author.substring(0, 2).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h4 className="font-medium text-sm">{comment.author}</h4>
                    <p className="text-xs text-gray-500">{formatDate(comment.createdAt)}</p>
                  </div>
                </div>
                
                {user && user.id === comment.author_id && (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="sm" className="text-gray-500 hover:text-red-500">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Удаление комментария</AlertDialogTitle>
                        <AlertDialogDescription>
                          Вы уверены, что хотите удалить этот комментарий? Это действие невозможно отменить.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Отмена</AlertDialogCancel>
                        <AlertDialogAction 
                          onClick={() => handleDeleteComment(comment.id)}
                          className="bg-red-500 hover:bg-red-600"
                        >
                          Удалить
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}
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
