
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Edit3, Save, X, ArrowLeft } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
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
        
        const { data: post, error: postError } = await supabase
          .from('community_posts')
          .select('*')
          .eq('id', postId)
          .single();
        
        if (postError) throw postError;
        
        if (post.user_id !== user.id) {
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
            navigate(`/communities/${id}/posts/${postId}`);
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
      
      navigate(`/communities/${id}/posts/${postId}`);
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
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-purple-900">
      <Navbar />
      
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-300/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-purple-300/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="flex-grow container mx-auto px-4 py-8 relative z-10">
        <div className="max-w-4xl mx-auto mt-20">
          {/* Header */}
          <div className="mb-8 text-center">
            <div className="bg-gradient-to-br from-blue-500 to-purple-600 w-16 h-16 rounded-2xl flex items-center justify-center mb-4 mx-auto shadow-2xl">
              <Edit3 className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold mb-2">
              <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-transparent bg-clip-text">
                Редактирование поста
              </span>
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              Внесите изменения в ваш пост в сообществе
            </p>
          </div>
          
          {loading ? (
            <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-2xl">
              <CardContent className="flex items-center justify-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600 mr-3" />
                <span className="text-lg">Загрузка поста...</span>
              </CardContent>
            </Card>
          ) : (
            <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-0 shadow-2xl">
              <CardHeader className="text-center pb-6">
                <Button
                  variant="ghost"
                  onClick={() => navigate(`/communities/${id}/posts/${postId}`)}
                  className="absolute top-4 left-4 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Назад к посту
                </Button>
              </CardHeader>
              <CardContent className="space-y-8">
                {error && (
                  <Alert variant="destructive" className="border-red-200 bg-red-50 dark:bg-red-900/20">
                    <AlertDescription className="text-red-800 dark:text-red-200">
                      {error}
                    </AlertDescription>
                  </Alert>
                )}
                
                <form onSubmit={handleSubmit} className="space-y-8">
                  <div className="space-y-3">
                    <Label htmlFor="title" className="text-lg font-semibold text-gray-700 dark:text-gray-200">
                      Заголовок публикации
                    </Label>
                    <Input
                      id="title"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Введите заголовок публикации"
                      disabled={submitting}
                      required
                      className="h-14 text-lg border-2 border-gray-200 dark:border-gray-600 focus:border-blue-500 rounded-xl bg-white/80 dark:bg-gray-700/80"
                    />
                  </div>
                  
                  <div className="space-y-3">
                    <Label htmlFor="content" className="text-lg font-semibold text-gray-700 dark:text-gray-200">
                      Содержание публикации
                    </Label>
                    <Textarea
                      id="content"
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      placeholder="Введите содержание публикации..."
                      className="min-h-[300px] text-lg border-2 border-gray-200 dark:border-gray-600 focus:border-blue-500 rounded-xl resize-none bg-white/80 dark:bg-gray-700/80"
                      disabled={submitting}
                      required
                    />
                  </div>
                  
                  <div className="flex justify-end gap-4 pt-6">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => navigate(`/communities/${id}/posts/${postId}`)}
                      disabled={submitting}
                      className="px-8 py-3 text-base border-2 hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                      <X className="mr-2 h-4 w-4" />
                      Отмена
                    </Button>
                    <Button 
                      type="submit"
                      disabled={submitting}
                      className="px-8 py-3 text-base bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg transform hover:scale-105 transition-all"
                    >
                      {submitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Сохранение...
                        </>
                      ) : (
                        <>
                          <Save className="mr-2 h-4 w-4" />
                          Сохранить изменения
                        </>
                      )}
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
