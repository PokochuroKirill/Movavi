
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, Copy, Pencil, Trash2, User, Calendar } from 'lucide-react';
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle, 
  AlertDialogTrigger 
} from "@/components/ui/alert-dialog";
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';

interface Snippet {
  id: string;
  title: string;
  description: string;
  code: string;
  language: string;
  tags: string[] | null;
  created_at: string;
  user_id: string;
  profiles: {
    username: string | null;
    full_name: string | null;
    avatar_url: string | null;
  } | null;
}

const SnippetDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const [snippet, setSnippet] = useState<Snippet | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const fetchSnippet = async () => {
      try {
        if (!id) return;
        
        const { data, error } = await supabase
          .from('snippets')
          .select(`
            id, 
            title, 
            description, 
            code, 
            language, 
            tags, 
            created_at, 
            user_id, 
            profiles(username, full_name, avatar_url)
          `)
          .eq('id', id)
          .single();

        if (error) throw error;
        setSnippet(data as Snippet);
      } catch (error: any) {
        console.error('Error fetching snippet:', error);
        toast({
          title: 'Ошибка',
          description: 'Не удалось загрузить фрагмент кода',
          variant: 'destructive'
        });
      } finally {
        setLoading(false);
      }
    };

    fetchSnippet();
  }, [id, toast]);

  const handleCopyCode = () => {
    if (!snippet) return;
    navigator.clipboard.writeText(snippet.code);
    toast({
      description: 'Код скопирован в буфер обмена'
    });
  };

  const handleDelete = async () => {
    if (!snippet || !user) return;
    
    try {
      setIsDeleting(true);
      
      const { error } = await supabase
        .from('snippets')
        .delete()
        .eq('id', snippet.id)
        .eq('user_id', user.id);
        
      if (error) throw error;
      
      toast({
        description: 'Фрагмент кода успешно удален'
      });
      
      navigate('/snippets');
    } catch (error: any) {
      console.error('Error deleting snippet:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось удалить фрагмент кода',
        variant: 'destructive'
      });
    } finally {
      setIsDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-grow flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-devhub-purple" />
          <span className="ml-2 text-lg">Загрузка фрагмента кода...</span>
        </div>
        <Footer />
      </div>
    );
  }

  if (!snippet) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-grow flex items-center justify-center flex-col p-4">
          <h2 className="text-2xl font-bold mb-4">Фрагмент кода не найден</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Запрошенный фрагмент кода не существует или был удален
          </p>
          <Button onClick={() => navigate('/snippets')}>
            Вернуться к списку фрагментов
          </Button>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
            <h1 className="text-3xl font-bold mb-2 md:mb-0">{snippet.title}</h1>
            
            {user && user.id === snippet.user_id && (
              <div className="flex space-x-2">
                <Button 
                  variant="outline" 
                  onClick={() => navigate(`/snippets/edit/${snippet.id}`)}
                >
                  <Pencil className="h-4 w-4 mr-2" />
                  Редактировать
                </Button>
                
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive">
                      <Trash2 className="h-4 w-4 mr-2" />
                      Удалить
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Удалить фрагмент кода?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Это действие нельзя отменить. Фрагмент кода будет безвозвратно удален.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Отмена</AlertDialogCancel>
                      <AlertDialogAction 
                        onClick={handleDelete}
                        className="bg-red-500 hover:bg-red-600"
                        disabled={isDeleting}
                      >
                        {isDeleting ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Удаление...
                          </>
                        ) : (
                          'Удалить'
                        )}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            )}
          </div>
          
          <div className="flex flex-wrap items-center text-sm text-gray-600 dark:text-gray-300 mb-6">
            <div className="flex items-center mr-6 mb-2">
              <User className="h-4 w-4 mr-1" />
              <span>{snippet.profiles?.full_name || snippet.profiles?.username || 'Неизвестный пользователь'}</span>
            </div>
            
            <div className="flex items-center mb-2">
              <Calendar className="h-4 w-4 mr-1" />
              <span>{format(new Date(snippet.created_at), 'dd.MM.yyyy')}</span>
            </div>
          </div>
          
          {snippet.description && (
            <Card className="mb-6">
              <CardContent className="pt-6">
                <p className="whitespace-pre-wrap">{snippet.description}</p>
              </CardContent>
            </Card>
          )}
          
          <div className="mb-2">
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <span className="text-sm font-medium mr-2">Язык:</span>
                <Badge variant="outline" className="capitalize">
                  {snippet.language}
                </Badge>
              </div>
              
              <Button variant="ghost" size="sm" onClick={handleCopyCode}>
                <Copy className="h-4 w-4 mr-2" />
                Копировать код
              </Button>
            </div>
          </div>
          
          <Card className="mb-6">
            <CardContent className="p-0">
              <pre className="p-4 overflow-x-auto font-mono text-sm">
                <code>{snippet.code}</code>
              </pre>
            </CardContent>
          </Card>
          
          {snippet.tags && snippet.tags.length > 0 && (
            <div>
              <p className="text-sm font-medium mb-2">Теги:</p>
              <div className="flex flex-wrap gap-2">
                {snippet.tags.map((tag, index) => (
                  <Badge key={index} variant="secondary">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default SnippetDetailPage;
