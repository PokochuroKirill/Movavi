import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Trash2, Send, MessageCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import LoaderSpinner from '@/components/ui/LoaderSpinner';

interface CommentSectionProps {
  projectId: string;
  onCommentsChange?: (count: number) => void;
}

interface Comment {
  id: string;
  content: string;
  created_at: string;
  project_id: string;
  user_id: string;
  profiles?: {
    username: string | null;
    full_name: string | null;
    avatar_url: string | null;
  };
}

const CommentSection = ({ projectId, onCommentsChange }: CommentSectionProps) => {
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
        .from('comments')
        .select(`
          id,
          content,
          created_at,
          project_id,
          user_id,
          profiles!inner(username, full_name, avatar_url)
        `)
        .eq('project_id', projectId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      const formattedComments: Comment[] = (data || []).map(item => {
        let profileData = null;
        
        if (Array.isArray(item.profiles)) {
          profileData = item.profiles[0];
        } else if (item.profiles) {
          profileData = item.profiles;
        }
        
        profileData = profileData || { username: null, full_name: null, avatar_url: null };
        
        return {
          id: item.id,
          content: item.content,
          created_at: item.created_at,
          project_id: item.project_id,
          user_id: item.user_id,
          profiles: profileData
        };
      });
      
      setComments(formattedComments);
      
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
    
    const channel = supabase
      .channel('public:comments')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'comments',
          filter: `project_id=eq.${projectId}`
        }, 
        () => {
          loadComments();
        }
      )
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, [projectId]);

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
      const { error, data } = await supabase
        .from('comments')
        .insert({
          content: newComment,
          project_id: projectId,
          user_id: user.id
        })
        .select(`
          id,
          content,
          created_at,
          project_id,
          user_id,
          profiles!inner(username, full_name, avatar_url)
        `)
        .single();
        
      if (error) throw error;
      
      setNewComment('');
      
      toast({
        title: 'Успешно!',
        description: 'Комментарий добавлен'
      });
      
      loadComments();
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
        .from('comments')
        .delete()
        .eq('id', commentId)
        .eq('user_id', user.id);
        
      if (error) throw error;
      
      setComments(comments.filter(comment => comment.id !== commentId));
      
      toast({
        title: 'Успешно!',
        description: 'Комментарий удален'
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
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-6">
        <MessageCircle className="h-5 w-5 text-primary" />
        <h3 className="text-xl font-semibold">Комментарии</h3>
        <span className="text-sm text-muted-foreground">({comments.length})</span>
      </div>
      
      <form onSubmit={handleSubmitComment} className="space-y-4">
        <div className="space-y-2">
          <Textarea
            placeholder="Напишите ваш комментарий..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            className="min-h-[100px] resize-none"
            disabled={isSubmitting || !user}
          />
          {!user && (
            <p className="text-sm text-muted-foreground">
              Войдите в систему, чтобы оставить комментарий
            </p>
          )}
        </div>
        <div className="flex justify-end">
          <Button 
            type="submit" 
            size="sm"
            disabled={isSubmitting || !user || !newComment.trim()}
            className="gap-2"
          >
            {isSubmitting ? (
              <>
                <LoaderSpinner size="sm" />
                Отправка...
              </>
            ) : (
              <>
                <Send className="h-4 w-4" />
                Отправить
              </>
            )}
          </Button>
        </div>
      </form>
      
      <div className="space-y-4">
        {isLoading ? (
          <div className="flex flex-col items-center py-8">
            <LoaderSpinner size="md" className="mb-2" />
            <p className="text-muted-foreground">Загрузка комментариев...</p>
          </div>
        ) : comments.length > 0 ? (
          comments.map((comment) => (
            <div key={comment.id} className="bg-muted/30 rounded-lg p-4 border border-border/50">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={comment.profiles?.avatar_url || undefined} />
                    <AvatarFallback className="bg-primary/10 text-primary text-xs">
                      {(comment.profiles?.full_name || comment.profiles?.username || 'U')
                        .substring(0, 2)
                        .toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium text-sm">
                      {comment.profiles?.full_name || comment.profiles?.username || 'Пользователь'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(comment.created_at)}
                    </p>
                  </div>
                </div>
                
                {user && user.id === comment.user_id && (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Удалить комментарий?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Это действие нельзя отменить. Комментарий будет удален навсегда.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Отмена</AlertDialogCancel>
                        <AlertDialogAction 
                          onClick={() => handleDeleteComment(comment.id)}
                          className="bg-destructive hover:bg-destructive/90"
                        >
                          Удалить
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}
              </div>
              <p className="text-sm leading-relaxed whitespace-pre-wrap">
                {comment.content}
              </p>
            </div>
          ))
        ) : (
          <div className="text-center py-12 border-2 border-dashed border-border rounded-lg">
            <MessageCircle className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-muted-foreground font-medium">Пока нет комментариев</p>
            <p className="text-sm text-muted-foreground">Будьте первым, кто оставит комментарий!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CommentSection;