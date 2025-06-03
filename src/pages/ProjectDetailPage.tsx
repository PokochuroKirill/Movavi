import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Calendar, ExternalLink, Github, Heart, Eye, ArrowLeft } from 'lucide-react';
import Layout from '@/components/Layout';
import { supabase } from '@/integrations/supabase/client';
import { Project } from '@/types/database';
import { formatDate } from '@/utils/dateUtils';
import ProjectActions from '@/components/ProjectActions';
import { useAuth } from '@/contexts/AuthContext';

const ProjectDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    const fetchProject = async () => {
      if (!id) {
        setError('ID проекта не указан');
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('projects')
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

        setProject(data);
      } catch (err: any) {
        console.error('Error fetching project:', err);
        setError('Проект не найден');
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
  }, [id]);

  if (loading) {
    return (
      <Layout>
        <div className="container max-w-4xl py-24 mt-8">
          <div className="flex justify-center items-center min-h-[400px]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        </div>
      </Layout>
    );
  }

  if (error || !project) {
    return (
      <Layout>
        <div className="container max-w-4xl py-24 mt-8">
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              {error || 'Проект не найден'}
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Возможно, проект был удален или у вас нет доступа к нему.
            </p>
            <Link to="/projects">
              <Button variant="outline">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Вернуться к проектам
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
          <Link to="/projects">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Назад к проектам
            </Button>
          </Link>

          {/* Основная карточка проекта */}
          <Card>
            <CardHeader>
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                <div className="flex-1">
                  <CardTitle className="text-2xl md:text-3xl mb-2">
                    {project.title}
                  </CardTitle>
                  <CardDescription className="text-base mb-4">
                    {project.description}
                  </CardDescription>
                  
                  {/* Технологии */}
                  {project.technologies && project.technologies.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {project.technologies.map((tech, index) => (
                        <Badge key={index} variant="secondary">
                          {tech}
                        </Badge>
                      ))}
                    </div>
                  )}

                  {/* Информация об авторе и дате */}
                  <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                    <div className="flex items-center gap-2">
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={project.profiles?.avatar_url || undefined} />
                        <AvatarFallback>
                          {project.profiles?.username?.charAt(0).toUpperCase() || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <span>
                        {project.profiles?.full_name || project.profiles?.username || 'Аноним'}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      <span>{formatDate(project.created_at)}</span>
                    </div>
                  </div>
                </div>

                {/* Действия с проектом */}
                <div className="flex items-center gap-2">
                  <ProjectActions 
                    projectId={project.id}
                  />
                </div>
              </div>
            </CardHeader>

            {/* Изображение проекта */}
            {project.image_url && (
              <div className="px-6 pb-6">
                <div className="w-full rounded-lg overflow-hidden">
                  <img 
                    src={project.image_url} 
                    alt={project.title}
                    className="w-full h-auto object-cover"
                  />
                </div>
              </div>
            )}

            <CardContent>
              {/* Ссылки на проект */}
              <div className="flex flex-wrap gap-3 mb-6">
                {project.live_url && (
                  <a
                    href={project.live_url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button variant="outline" size="sm">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Демо
                    </Button>
                  </a>
                )}
                {project.github_url && (
                  <a
                    href={project.github_url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button variant="outline" size="sm">
                      <Github className="h-4 w-4 mr-2" />
                      GitHub
                    </Button>
                  </a>
                )}
              </div>

              {/* Содержание проекта */}
              <div className="prose prose-gray dark:prose-invert max-w-none">
                <div className="whitespace-pre-wrap">
                  {project.content}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Статистика */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-center gap-8 text-center">
                <div className="flex items-center gap-2">
                  <Heart className="h-5 w-5 text-red-500" />
                  <span className="font-medium">{project.likes_count || 0}</span>
                  <span className="text-sm text-gray-600 dark:text-gray-400">лайков</span>
                </div>
                <div className="flex items-center gap-2">
                  <Eye className="h-5 w-5 text-blue-500" />
                  <span className="font-medium">Просмотры</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default ProjectDetailPage;
