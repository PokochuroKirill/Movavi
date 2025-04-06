
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';
import ProjectCard from './ProjectCard';
import SnippetCard from './SnippetCard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Project, Snippet } from '@/types/database';
import { useToast } from '@/hooks/use-toast';

const RecommendationSystem = () => {
  const [popularProjects, setPopularProjects] = useState<Project[]>([]);
  const [popularSnippets, setPopularSnippets] = useState<Snippet[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const loadRecommendations = async () => {
      setIsLoading(true);
      
      try {
        // Fetch popular projects with likes and comments count
        const { data: projectsData, error: projectsError } = await supabase
          .from('projects')
          .select(`
            id, 
            title, 
            description, 
            technologies,
            created_at,
            user_id,
            image_url,
            profiles:user_id(username, full_name, avatar_url)
          `);

        if (projectsError) throw projectsError;

        // Fetch projects' likes and comments count
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
            author: project.profiles?.full_name || project.profiles?.username || 'Неизвестный автор',
            authorId: project.user_id,
            authorUsername: project.profiles?.username,
            authorAvatar: project.profiles?.avatar_url,
            likes: likesCount || 0,
            comments: commentsCount || 0,
            popularityScore: (likesCount || 0) * 2 + (commentsCount || 0) * 3 // Score formula
          };
        }));

        // Sort projects by popularity score
        const sortedProjects = projectsWithMetrics.sort((a, b) => 
          (b.popularityScore || 0) - (a.popularityScore || 0)
        ).slice(0, 5); // Get top 5
        
        setPopularProjects(sortedProjects);

        // Fetch popular snippets with likes and comments count
        const { data: snippetsData, error: snippetsError } = await supabase
          .from('snippets')
          .select(`
            id, 
            title, 
            description, 
            language,
            tags,
            created_at,
            user_id,
            profiles:user_id(username, full_name, avatar_url)
          `);

        if (snippetsError) throw snippetsError;

        // Fetch snippets' likes and comments count
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
            author: snippet.profiles?.full_name || snippet.profiles?.username || 'Неизвестный автор',
            authorId: snippet.user_id,
            authorUsername: snippet.profiles?.username,
            authorAvatar: snippet.profiles?.avatar_url,
            likes: likesCount || 0,
            comments: commentsCount || 0,
            popularityScore: (likesCount || 0) * 2 + (commentsCount || 0) * 3 // Score formula
          };
        }));

        // Sort snippets by popularity score
        const sortedSnippets = snippetsWithMetrics.sort((a, b) => 
          (b.popularityScore || 0) - (a.popularityScore || 0)
        ).slice(0, 5); // Get top 5

        setPopularSnippets(sortedSnippets);
      } catch (error) {
        console.error('Ошибка при загрузке рекомендаций:', error);
        toast({
          title: 'Ошибка',
          description: 'Не удалось загрузить рекомендации',
          variant: 'destructive'
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadRecommendations();
  }, [toast]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-40">
        <Loader2 className="h-8 w-8 animate-spin text-devhub-purple" />
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md">
      <h2 className="text-2xl font-bold mb-6">Рекомендации для вас</h2>
      
      <Tabs defaultValue="projects">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="projects">Популярные проекты</TabsTrigger>
          <TabsTrigger value="snippets">Популярные сниппеты</TabsTrigger>
        </TabsList>
        
        <TabsContent value="projects">
          {popularProjects.length > 0 ? (
            <div className="grid grid-cols-1 gap-4">
              {popularProjects.map((project) => (
                <ProjectCard
                  key={project.id}
                  id={project.id}
                  title={project.title}
                  description={project.description}
                  author={project.author}
                  authorAvatar={project.authorAvatar}
                  authorId={project.authorId}
                  authorUsername={project.authorUsername}
                  likes={project.likes}
                  comments={project.comments}
                  technologies={project.technologies}
                  imageUrl={project.image_url}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              Нет доступных проектов для отображения
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="snippets">
          {popularSnippets.length > 0 ? (
            <div className="grid grid-cols-1 gap-4">
              {popularSnippets.map((snippet) => (
                <SnippetCard
                  key={snippet.id}
                  id={snippet.id}
                  title={snippet.title}
                  description={snippet.description}
                  language={snippet.language}
                  tags={snippet.tags || []}
                  created_at={snippet.created_at}
                  author={snippet.author}
                  authorAvatar={snippet.authorAvatar}
                  authorId={snippet.authorId}
                  authorUsername={snippet.authorUsername}
                  likes={snippet.likes}
                  comments={snippet.comments}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              Нет доступных сниппетов для отображения
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default RecommendationSystem;
