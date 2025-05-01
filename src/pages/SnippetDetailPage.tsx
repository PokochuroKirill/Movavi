
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, Copy, User, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import SnippetActions from '@/components/SnippetActions';
import SnippetCommentSection from '@/components/SnippetCommentSection';
import { Snippet } from '@/types/database';

const SnippetDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const [snippet, setSnippet] = useState<Snippet | null>(null);
  const [loading, setLoading] = useState(true);
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
            updated_at,
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
            
            {/* Edit and Delete buttons removed from here */}
          </div>
          
          <div className="flex flex-wrap items-center gap-4 mb-6">
            <div className="flex items-center">
              <Avatar className="h-8 w-8 mr-2">
                <AvatarImage src={snippet.profiles?.avatar_url || undefined} />
                <AvatarFallback>
                  {(snippet.profiles?.full_name || snippet.profiles?.username || 'U')
                    .substring(0, 2)
                    .toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <span>{snippet.profiles?.full_name || snippet.profiles?.username || 'Неизвестный пользователь'}</span>
            </div>
            
            <div className="flex items-center">
              <Calendar className="h-4 w-4 mr-1" />
              <span className="text-sm text-gray-600 dark:text-gray-300">
                {format(new Date(snippet.created_at), 'dd MMMM yyyy', { locale: ru })}
              </span>
            </div>

            <SnippetActions
              snippetId={snippet.id}
            />
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
            <div className="mb-8">
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
          
          <SnippetCommentSection snippetId={snippet.id} />
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default SnippetDetailPage;
