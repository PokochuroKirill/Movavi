
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';

const EditCommunityPostPage = () => {
  const { id, postId } = useParams<{ id: string; postId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchPost = async () => {
      if (!user) {
        navigate('/auth');
        return;
      }
      
      try {
        setLoading(true);
        
        // Fetch post data
        const { data: post, error: postError } = await supabase
          .from('community_posts')
          .select('*')
          .eq('id', postId)
          .single();
        
        if (postError) throw postError;
        
        // Check if user is authorized to edit this post
        if (post.user_id !== user.id) {
          // Check if user is a moderator or admin
          const { data: member, error: memberError } = await supabase
            .from('community_members')
            .select('role')
            .eq('community_id', id)
            .eq('user_id', user.id)
            .single();
          
          if (memberError || (member?.role !== 'admin' && member?.role !== 'moderator')) {
            toast({
              title: 'Доступ запрещен',
              description: 'У вас нет прав на редактирование этого поста',
              variant: 'destructive'
            });
            navigate(`/communities/${id}/post/${postId}`);
            return;
          }
        }
        
        setTitle(post.title);
        setContent(post.content);
      } catch (err: any) {
        console.error('Error fetching post:', err);
        toast({
          title: 'Ошибка',
          description: 'Не удалось загрузить пост',
          variant: 'destructive'
        });
        navigate(`/communities/${id}`);
      } finally {
        setLoading(false);
      }
    };
    
    fetchPost();
  }, [id, postId, user, navigate, toast]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: 'Требуется авторизация',
        description: 'Для редактирования публикации необходимо войти в систему',
        variant: 'destructive',
      });
      navigate('/auth');
      return;
    }
    
    if (!title.trim() || !content.trim()) {
      setError('Пожалуйста, заполните все поля');
      return;
    }
    
    setSubmitting(true);
    setError(null);
    
    try {
      const { error: updateError } = await supabase
        .from('community_posts')
        .update({
          title,
          content,
          updated_at: new Date().toISOString(),
        })
        .eq('id', postId);
      
      if (updateError) throw updateError;
      
      toast({
        description: 'Публикация успешно обновлена',
      });
      
      navigate(`/communities/${id}/post/${postId}`);
    } catch (err: any) {
      console.error('Error updating post:', err);
      setError(err.message || 'Произошла ошибка при обновлении публикации');
      toast({
        title: 'Ошибка',
        description: 'Не удалось обновить публикацию',
        variant: 'destructive'
      });
    } finally {
      setSubmitting(false);
    }
  };
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <div className="flex-grow container mx-auto px-4 py-20">
        <div className="max-w-3xl mx-auto mt-8">
          <h1 className="text-3xl font-bold mb-6">Редактировать публикацию</h1>
          
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-devhub-purple" />
              <span className="ml-2">Загрузка...</span>
            </div>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Редактирование публикации в сообществе</CardTitle>
              </CardHeader>
              <CardContent>
                {error && (
                  <Alert variant="destructive" className="mb-6">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
                
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="title">Заголовок</Label>
                    <Input
                      id="title"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Введите заголовок публикации"
                      disabled={submitting}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="content">Содержание</Label>
                    <Textarea
                      id="content"
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      placeholder="Введите содержание публикации"
                      className="min-h-[200px]"
                      disabled={submitting}
                      required
                    />
                  </div>
                  
                  <div className="flex justify-end gap-4">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => navigate(`/communities/${id}/post/${postId}`)}
                      disabled={submitting}
                    >
                      Отмена
                    </Button>
                    <Button 
                      type="submit"
                      disabled={submitting}
                      className="gradient-bg text-white"
                    >
                      {submitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Сохранение...
                        </>
                      ) : "Сохранить изменения"}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default EditCommunityPostPage;
