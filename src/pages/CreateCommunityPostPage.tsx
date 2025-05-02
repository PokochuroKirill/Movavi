
import { useState } from 'react';
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

const CreateCommunityPostPage = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: "Требуется авторизация",
        description: "Для создания публикации необходимо войти в систему",
        variant: "destructive",
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
      // Проверяем, является ли пользователь членом сообщества
      const { data: memberData, error: memberError } = await supabase
        .from('community_members')
        .select()
        .eq('community_id', id)
        .eq('user_id', user.id)
        .single();
        
      if (memberError || !memberData) {
        toast({
          title: "Ошибка",
          description: "Вы должны быть участником сообщества, чтобы создавать публикации",
          variant: "destructive"
        });
        setSubmitting(false);
        return;
      }
      
      // Создаем публикацию
      const { data, error } = await supabase
        .from('community_posts')
        .insert({
          title,
          content,
          user_id: user.id,
          community_id: id,
        })
        .select()
        .single();
      
      if (error) {
        console.error('Error creating post:', error);
        throw error;
      }
      
      // Обновляем счетчик постов в сообществе
      await supabase
        .from('communities')
        .update({ posts_count: supabase.rpc('increment', { row_id: id, table_name: 'communities', column_name: 'posts_count' }) })
        .eq('id', id);
      
      toast({
        description: "Публикация успешно создана",
      });
      
      navigate(`/communities/${id}`);
      
    } catch (err: any) {
      console.error('Error:', err);
      setError(err.message || 'Произошла ошибка при создании публикации');
      toast({
        title: "Ошибка",
        description: "Не удалось создать публикацию",
        variant: "destructive"
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
          <h1 className="text-3xl font-bold mb-6">Создать публикацию</h1>
          
          <Card>
            <CardHeader>
              <CardTitle>Новая публикация в сообществе</CardTitle>
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
                    onClick={() => navigate(`/communities/${id}`)}
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
                        Публикация...
                      </>
                    ) : "Опубликовать"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default CreateCommunityPostPage;
