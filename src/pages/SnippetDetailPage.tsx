
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Calendar, ArrowLeft } from 'lucide-react';
import Layout from '@/components/Layout';
import { supabase } from '@/integrations/supabase/client';
import { Snippet } from '@/types/database';
import { formatDate } from '@/utils/dateUtils';
import SnippetActions from '@/components/SnippetActions';
import { useAuth } from '@/contexts/AuthContext';
import SnippetCommentSection from '@/components/SnippetCommentSection';
import CopyCodeButton from '@/components/CopyCodeButton';
import LoaderSpinner from '@/components/ui/LoaderSpinner';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';

const SnippetDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const [snippet, setSnippet] = useState<Snippet | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    const fetchSnippet = async () => {
      if (!id) {
        setError('ID сниппета не указан');
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('snippets')
          .select(`
            *,
            profiles:user_id (
              username,
              full_name,
              avatar_url
            )
          `)
          .eq('id', id)
          .single();

        if (error) throw error;

        setSnippet(data);
      } catch (err: any) {
        console.error('Error fetching snippet:', err);
        setError('Сниппет не найден');
      } finally {
        setLoading(false);
      }
    };

    fetchSnippet();
  }, [id]);

  if (loading) {
    return (
      <Layout>
        <div className="container max-w-4xl py-24 mt-8">
          <div className="flex justify-center items-center min-h-[400px]">
            <LoaderSpinner />
          </div>
        </div>
      </Layout>
    );
  }

  if (error || !snippet) {
    return (
      <Layout>
        <div className="container max-w-4xl py-24 mt-8">
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              {error || 'Сниппет не найден'}
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Возможно, сниппет был удален или у вас нет доступа к нему.
            </p>
            <Link to="/snippets">
              <Button variant="outline">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Вернуться к сниппетам
              </Button>
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container max-w-4xl py-24 mt-8">
        <div className="space-y-6">
          {/* Кнопка назад */}
          <Link to="/snippets">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Назад к сниппетам
            </Button>
          </Link>

          {/* Основная карточка сниппета */}
          <Card>
            <CardHeader>
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                <div className="flex-1">
                  <CardTitle className="text-2xl md:text-3xl mb-2">
                    {snippet.title}
                  </CardTitle>
                  <CardDescription className="text-base mb-4">
                    {snippet.description}
                  </CardDescription>
                  
                  {/* Язык программирования */}
                  <div className="flex items-center gap-2 mb-4">
                    <Badge variant="secondary">{snippet.language}</Badge>
                  </div>

                  {/* Теги */}
                  {snippet.tags && snippet.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {snippet.tags.map((tag, index) => (
                        <Badge key={index} variant="outline">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}

                  {/* Информация об авторе и дате */}
                  <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                    <div className="flex items-center gap-2">
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={snippet.profiles?.avatar_url || undefined} />
                        <AvatarFallback>
                          {snippet.profiles?.username?.charAt(0).toUpperCase() || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <span>
                        {snippet.profiles?.full_name || snippet.profiles?.username || 'Аноним'}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      <span>{formatDate(snippet.created_at)}</span>
                    </div>
                  </div>
                </div>

                {/* Действия со сниппетом */}
                <div className="flex items-center gap-2">
                  <SnippetActions snippetId={snippet.id} />
                </div>
              </div>
            </CardHeader>

            <CardContent>
              {/* Блок кода с кнопкой копирования */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Код</h3>
                  <CopyCodeButton code={snippet.code} />
                </div>
                
                <div className="relative">
                  <SyntaxHighlighter
                    language={snippet.language.toLowerCase()}
                    style={oneDark}
                    customStyle={{
                      borderRadius: '0.5rem',
                      fontSize: '0.875rem'
                    }}
                  >
                    {snippet.code}
                  </SyntaxHighlighter>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Комментарии */}
          <Card>
            <CardContent className="pt-6">
              <SnippetCommentSection snippetId={snippet.id} />
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default SnippetDetailPage;
