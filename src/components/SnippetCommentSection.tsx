
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Trash2, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface SnippetCommentSectionProps {
  snippetId: string;
  onCommentsChange?: (count: number) => void;
}

interface Comment {
  id: string;
  content: string;
  created_at: string;
  snippet_id: string;
  user_id: string;
  profiles?: {
    username: string | null;
    full_name: string | null;
    avatar_url: string | null;
  };
}

const SnippetCommentSection = ({ snippetId, onCommentsChange }: SnippetCommentSectionProps) => {
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const loadComments = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('snippet_comments')
        .select(`
          id,
          content,
          created_at,
          snippet_id,
          user_id,
          profiles:user_id (username, full_name, avatar_url)
        `)
        .eq('snippet_id', snippetId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      // Type assertion to ensure we have the correct shape
      setComments(data as Comment[] || []);
      
      if (onCommentsChange) {
        onCommentsChange(data?.length || 0);
      }
    } catch (error) {
      console.error('Error loading comments:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось загрузить комментарии',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadComments();
    
    // Set up real-time subscription for new comments
    const channel = supabase
      .channel('public:snippet_comments')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'snippet_comments',
          filter: `snippet_id=eq.${snippetId}`
        }, 
        () => {
          loadComments();
        }
      )
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, [snippetId]);

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: 'Ошибка',
        description: 'Вы должны войти в систему, чтобы оставить комментарий',
        variant: 'destructive'
      });
      return;
    }
    
    if (!newComment.trim()) {
      toast({
        title: 'Ошибка',
        description: 'Комментарий не может быть пустым',
        variant: 'destructive'
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const { error } = await supabase
        .from('snippet_comments')
        .insert({
          content: newComment,
          snippet_id: snippetId,
          user_id: user.id
        });
        
      if (error) throw error;
      
      setNewComment('');
      loadComments();
      
      toast({
        description: 'Комментарий успешно добавлен'
      });
    } catch (error) {
      console.error('Error adding comment:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось добавить комментарий',
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from('snippet_comments')
        .delete()
        .eq('id', commentId)
        .eq('user_id', user.id);
        
      if (error) throw error;
      
      // Update local state
      setComments(comments.filter(comment => comment.id !== commentId));
      
      toast({
        description: 'Комментарий успешно удален'
      });
      
      if (onCommentsChange) {
        onCommentsChange(comments.length - 1);
      }
    } catch (error) {
      console.error('Error deleting comment:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось удалить комментарий',
        variant: 'destructive'
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
          disabled={isSubmitting || !user}
        />
        {!user && (
          <p className="text-sm text-gray-500 mb-2">Войдите в систему, чтобы оставить комментарий</p>
        )}
        <Button 
          type="submit" 
          className="gradient-bg text-white"
          disabled={isSubmitting || !user || !newComment.trim()}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Отправка...
            </>
          ) : (
            'Отправить'
          )}
        </Button>
      </form>
      
      {isLoading ? (
        <div className="text-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-devhub-purple mx-auto mb-2" />
          <p className="text-gray-500">Загрузка комментариев...</p>
        </div>
      ) : comments.length > 0 ? (
        <div className="space-y-6">
          {comments.map((comment) => (
            <div key={comment.id} className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center">
                  <Avatar className="h-8 w-8 mr-2">
                    <AvatarImage src={comment.profiles?.avatar_url || undefined} alt={comment.profiles?.username || ''} />
                    <AvatarFallback>
                      {(comment.profiles?.full_name || comment.profiles?.username || 'U')
                        .substring(0, 2)
                        .toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h4 className="font-medium text-sm">{comment.profiles?.full_name || comment.profiles?.username || 'Неизвестный пользователь'}</h4>
                    <p className="text-xs text-gray-500">{formatDate(comment.created_at)}</p>
                  </div>
                </div>
                
                {user && user.id === comment.user_id && (
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

export default SnippetCommentSection;
