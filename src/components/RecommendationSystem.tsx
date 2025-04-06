
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import ProjectCard from '@/components/ProjectCard';
import SnippetCard from '@/components/SnippetCard';
import { Project, Snippet } from '@/types/database';
import { useToast } from '@/hooks/use-toast';

interface RecommendationSystemProps {
  userId?: string;
}

const RecommendationSystem = ({ userId }: RecommendationSystemProps) => {
  const [popularProjects, setPopularProjects] = useState<Project[]>([]);
  const [popularSnippets, setPopularSnippets] = useState<Snippet[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    const fetchRecommendations = async () => {
      setIsLoading(true);
      try {
        // Fetch popular projects
        const { data: projectsData, error: projectsError } = await supabase
          .from('projects')
          .select(`
            id, 
            title, 
            description, 
            technologies,
            content,
            created_at,
            updated_at,
            user_id,
            image_url,
            profiles:user_id(username, full_name, avatar_url)
          `)
          .limit(4);

        if (projectsError) throw projectsError;

        // Add popularity metrics to projects
        const projectsWithMetrics = await Promise.all((projectsData || []).map(async (project) => {
          // Get likes count
          const { data: likesCount } = await supabase
            .rpc('get_project_likes_count', { project_id: project.id });
          
          // Get comments count
          const { count: commentsCount } = await supabase
            .from('comments')
            .select('id', { count: 'exact', head: true })
            .eq('project_id', project.id);
          
          return {
            ...project,
            author: project.profiles?.full_name || project.profiles?.username || 'Unnamed Author',
            authorId: project.user_id,
            authorUsername: project.profiles?.username || '',
            authorAvatar: project.profiles?.avatar_url,
            likes: likesCount || 0,
            comments: commentsCount || 0,
            popularityScore: (likesCount || 0) * 2 + (commentsCount || 0) * 3 // Score formula
          } as Project;
        }));

        // Sort projects by popularity score
        projectsWithMetrics.sort((a, b) => (b.popularityScore || 0) - (a.popularityScore || 0));
        setPopularProjects(projectsWithMetrics);

        // Fetch popular snippets
        const { data: snippetsData, error: snippetsError } = await supabase
          .from('snippets')
          .select(`
            id, 
            title, 
            description, 
            language,
            code,
            tags,
            created_at,
            updated_at,
            user_id,
            profiles:user_id(username, full_name, avatar_url)
          `)
          .limit(4);

        if (snippetsError) throw snippetsError;

        // Add popularity metrics to snippets
        const snippetsWithMetrics = await Promise.all((snippetsData || []).map(async (snippet) => {
          // Get likes count
          const { data: likesCount } = await supabase
            .rpc('get_snippet_likes_count', { snippet_id: snippet.id });
          
          // Get comments count
          const { count: commentsCount } = await supabase
            .from('snippet_comments')
            .select('id', { count: 'exact', head: true })
            .eq('snippet_id', snippet.id);
          
          return {
            ...snippet,
            author: snippet.profiles?.full_name || snippet.profiles?.username || 'Unnamed Author',
            authorId: snippet.user_id,
            authorUsername: snippet.profiles?.username || '',
            authorAvatar: snippet.profiles?.avatar_url,
            likes: likesCount || 0,
            comments: commentsCount || 0,
            popularityScore: (likesCount || 0) * 2 + (commentsCount || 0) * 3 // Score formula
          } as Snippet;
        }));

        // Sort snippets by popularity score
        snippetsWithMetrics.sort((a, b) => (b.popularityScore || 0) - (a.popularityScore || 0));
        setPopularSnippets(snippetsWithMetrics);
      } catch (error) {
        console.error('Error fetching recommendations:', error);
        toast({
          title: 'Ошибка',
          description: 'Не удалось загрузить рекомендации',
          variant: 'destructive'
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchRecommendations();
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-12">
        <Loader2 className="h-12 w-12 animate-spin text-devhub-purple" />
      </div>
    );
  }

  return (
    <div className="space-y-12">
      <div>
        <h2 className="text-3xl font-bold text-center mb-8">Популярные проекты</h2>
        {popularProjects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {popularProjects.map(project => (
              <ProjectCard
                key={project.id}
                id={project.id}
                title={project.title}
                description={project.description}
                technologies={project.technologies || []}
                author={project.author || ''}
                authorAvatar={project.authorAvatar}
                imageUrl={project.image_url}
                likes={project.likes}
                comments={project.comments}
              />
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="py-10 text-center text-gray-500">
              Проекты пока не найдены. Станьте первым, кто добавит проект!
            </CardContent>
          </Card>
        )}
      </div>

      <div>
        <h2 className="text-3xl font-bold text-center mb-8">Популярные сниппеты</h2>
        {popularSnippets.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {popularSnippets.map(snippet => (
              <SnippetCard
                key={snippet.id}
                id={snippet.id}
                title={snippet.title}
                description={snippet.description}
                language={snippet.language}
                tags={snippet.tags || []}
                created_at={snippet.created_at}
              />
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="py-10 text-center text-gray-500">
              Сниппеты пока не найдены. Станьте первым, кто добавит сниппет!
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default RecommendationSystem;
