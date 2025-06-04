
import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Project } from '@/types/database';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { ExternalLink, Github, Calendar, Eye, Heart, MessageCircle } from 'lucide-react';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import ProjectActions from '@/components/ProjectActions';
import CommentSection from '@/components/CommentSection';
import UserProfileLink from '@/components/UserProfileLink';
import { useProjectInteractions } from '@/hooks/useSupabaseQueries';
import { useViewTracking } from '@/hooks/useViewTracking';

const ProjectDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const { trackProjectView } = useViewTracking();
  const { likes, comments, liked, saved, handleLike, handleSave, loadInteractions } = useProjectInteractions(id || '');

  const { data: project, isLoading, error } = useQuery({
    queryKey: ['project', id],
    queryFn: async (): Promise<Project> => {
      if (!id) throw new Error('Project ID is required');
      
      const { data, error } = await supabase
        .from('projects')
        .select(`
          *,
          profiles:user_id(username, full_name, avatar_url)
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      return data as Project;
    },
    enabled: !!id,
  });

  useEffect(() => {
    if (project?.id) {
      trackProjectView(project.id);
      loadInteractions();
    }
  }, [project?.id]);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-64 w-full mb-4" />
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-3/4" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Card>
          <CardContent className="text-center py-8">
            <h2 className="text-2xl font-bold mb-2">Проект не найден</h2>
            <p className="text-gray-600 dark:text-gray-400">
              Запрошенный проект не существует или был удален.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-2xl mb-2">{project.title}</CardTitle>
              <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mb-4">
                <UserProfileLink
                  username={project.profiles?.username}
                  fullName={project.profiles?.full_name}
                  avatarUrl={project.profiles?.avatar_url}
                  userId={project.user_id}
                />
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <span>{format(new Date(project.created_at), 'dd MMMM yyyy', { locale: ru })}</span>
                </div>
              </div>
            </div>
            <ProjectActions 
              projectId={project.id}
              userId={project.user_id}
            />
          </div>
          
          {project.technologies && project.technologies.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {project.technologies.map((tech, index) => (
                <Badge key={index} variant="secondary">
                  {tech}
                </Badge>
              ))}
            </div>
          )}

          <div className="flex items-center gap-6 text-sm text-gray-500 dark:text-gray-400">
            <div className="flex items-center gap-1">
              <Eye className="h-4 w-4" />
              <span>{project.views_count || 0} просмотров</span>
            </div>
            <div className="flex items-center gap-1">
              <Heart className={`h-4 w-4 ${liked ? 'text-red-500 fill-current' : ''}`} />
              <span>{likes} лайков</span>
            </div>
            <div className="flex items-center gap-1">
              <MessageCircle className="h-4 w-4" />
              <span>{comments} комментариев</span>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {project.image_url && (
            <div className="mb-6 rounded-lg overflow-hidden">
              <img
                src={project.image_url}
                alt={project.title}
                className="w-full h-auto max-h-96 object-contain"
              />
            </div>
          )}

          <div className="prose prose-gray dark:prose-invert max-w-none mb-6">
            <p className="text-lg text-gray-700 dark:text-gray-300 mb-4">
              {project.description}
            </p>
            <div className="whitespace-pre-wrap text-gray-700 dark:text-gray-300">
              {project.content}
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button
              onClick={handleLike}
              variant={liked ? "default" : "outline"}
              className={liked ? "bg-red-500 hover:bg-red-600" : ""}
            >
              <Heart className={`h-4 w-4 mr-2 ${liked ? 'fill-current' : ''}`} />
              {liked ? 'Убрать лайк' : 'Лайк'} ({likes})
            </Button>

            <Button
              onClick={handleSave}
              variant={saved ? "default" : "outline"}
            >
              {saved ? 'Удалить из сохраненных' : 'Сохранить'}
            </Button>

            {project.github_url && (
              <Button variant="outline" asChild>
                <a href={project.github_url} target="_blank" rel="noopener noreferrer">
                  <Github className="h-4 w-4 mr-2" />
                  GitHub
                </a>
              </Button>
            )}

            {project.live_url && (
              <Button variant="outline" asChild>
                <a href={project.live_url} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Демо
                </a>
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <CommentSection projectId={project.id} />
    </div>
  );
};

export default ProjectDetailPage;
