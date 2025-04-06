
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { Project, Snippet } from '@/types/database';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ProjectCard from './ProjectCard';
import SnippetCard from './SnippetCard';
import { Loader2 } from 'lucide-react';

interface RecommendationSystemProps {
  userId?: string;
}

const RecommendationSystem = ({ userId }: RecommendationSystemProps) => {
  const [recommendedProjects, setRecommendedProjects] = useState<Project[]>([]);
  const [recommendedSnippets, setRecommendedSnippets] = useState<Snippet[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecommendations = async () => {
      setLoading(true);
      try {
        // If user is logged in, fetch recommendations based on their interests
        if (userId) {
          // Get user's viewed/liked projects to understand their interests
          const { data: userLikes } = await supabase
            .from('project_likes')
            .select('project_id')
            .eq('user_id', userId);
          
          const likedProjectIds = userLikes?.map(like => like.project_id) || [];
          
          // Fetch projects with similar technologies
          if (likedProjectIds.length > 0) {
            const { data: projectData } = await supabase
              .from('projects')
              .select(`
                *,
                profiles:user_id(username, full_name, avatar_url)
              `)
              .not('id', 'in', `(${likedProjectIds.join(',')})`)
              .limit(5);

            if (projectData) {
              const projectsWithCounts = await Promise.all(projectData.map(async (project) => {
                const { data: likesCount } = await supabase
                  .rpc('get_project_likes_count', { project_id: project.id });
                
                const { count: commentsCount } = await supabase
                  .from('comments')
                  .select('id', { count: 'exact', head: true })
                  .eq('project_id', project.id);
                
                return {
                  ...project,
                  author: project.profiles?.full_name || project.profiles?.username || 'Неизвестный автор',
                  authorUsername: project.profiles?.username,
                  authorAvatar: project.profiles?.avatar_url,
                  likes_count: likesCount || 0,
                  comments_count: commentsCount || 0,
                  authorId: project.user_id
                } as Project;
              }));

              setRecommendedProjects(projectsWithCounts);
            }
          } else {
            // If no liked projects, show most popular
            const { data: popularProjects } = await supabase
              .from('projects')
              .select(`
                *,
                profiles:user_id(username, full_name, avatar_url)
              `)
              .limit(5);

            if (popularProjects) {
              const projectsWithCounts = await Promise.all(popularProjects.map(async (project) => {
                const { data: likesCount } = await supabase
                  .rpc('get_project_likes_count', { project_id: project.id });
                
                const { count: commentsCount } = await supabase
                  .from('comments')
                  .select('id', { count: 'exact', head: true })
                  .eq('project_id', project.id);
                
                return {
                  ...project,
                  author: project.profiles?.full_name || project.profiles?.username || 'Неизвестный автор',
                  authorUsername: project.profiles?.username,
                  authorAvatar: project.profiles?.avatar_url,
                  likes_count: likesCount || 0,
                  comments_count: commentsCount || 0,
                  authorId: project.user_id
                } as Project;
              }));

              setRecommendedProjects(projectsWithCounts);
            }
          }

          // Similar approach for snippets
          const { data: userSnippetLikes } = await supabase
            .from('snippet_likes')
            .select('snippet_id')
            .eq('user_id', userId);
          
          const likedSnippetIds = userSnippetLikes?.map(like => like.snippet_id) || [];
          
          // Fetch snippets with similar tags or languages
          const { data: snippetData } = await supabase
            .from('snippets')
            .select(`
              *,
              profiles:user_id(username, full_name, avatar_url)
            `)
            .limit(5);

          if (snippetData) {
            const snippetsWithCounts = await Promise.all(snippetData.map(async (snippet) => {
              const { data: likesCount } = await supabase
                .rpc('get_snippet_likes_count', { snippet_id: snippet.id });
              
              const { count: commentsCount } = await supabase
                .from('snippet_comments')
                .select('id', { count: 'exact', head: true })
                .eq('snippet_id', snippet.id);
              
              return {
                ...snippet,
                author: snippet.profiles?.full_name || snippet.profiles?.username || 'Неизвестный автор',
                authorUsername: snippet.profiles?.username,
                authorAvatar: snippet.profiles?.avatar_url,
                likes_count: likesCount || 0,
                comments_count: commentsCount || 0,
                authorId: snippet.user_id
              } as Snippet;
            }));

            setRecommendedSnippets(snippetsWithCounts);
          }
        } else {
          // For non-logged in users, show popular content
          const { data: popularProjects } = await supabase
            .from('projects')
            .select(`
              *,
              profiles:user_id(username, full_name, avatar_url)
            `)
            .order('created_at', { ascending: false })
            .limit(5);

          if (popularProjects) {
            const projectsWithCounts = await Promise.all(popularProjects.map(async (project) => {
              const { data: likesCount } = await supabase
                .rpc('get_project_likes_count', { project_id: project.id });
              
              const { count: commentsCount } = await supabase
                .from('comments')
                .select('id', { count: 'exact', head: true })
                .eq('project_id', project.id);
              
              return {
                ...project,
                author: project.profiles?.full_name || project.profiles?.username || 'Неизвестный автор',
                authorUsername: project.profiles?.username,
                authorAvatar: project.profiles?.avatar_url,
                likes_count: likesCount || 0,
                comments_count: commentsCount || 0,
                authorId: project.user_id
              } as Project;
            }));

            setRecommendedProjects(projectsWithCounts);
          }

          const { data: popularSnippets } = await supabase
            .from('snippets')
            .select(`
              *,
              profiles:user_id(username, full_name, avatar_url)
            `)
            .order('created_at', { ascending: false })
            .limit(5);

          if (popularSnippets) {
            const snippetsWithCounts = await Promise.all(popularSnippets.map(async (snippet) => {
              const { data: likesCount } = await supabase
                .rpc('get_snippet_likes_count', { snippet_id: snippet.id });
              
              const { count: commentsCount } = await supabase
                .from('snippet_comments')
                .select('id', { count: 'exact', head: true })
                .eq('snippet_id', snippet.id);
              
              return {
                ...snippet,
                author: snippet.profiles?.full_name || snippet.profiles?.username || 'Неизвестный автор',
                authorUsername: snippet.profiles?.username,
                authorAvatar: snippet.profiles?.avatar_url,
                likes_count: likesCount || 0,
                comments_count: commentsCount || 0,
                authorId: snippet.user_id
              } as Snippet;
            }));

            setRecommendedSnippets(snippetsWithCounts);
          }
        }
      } catch (error) {
        console.error('Ошибка при загрузке рекомендаций:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, [userId]);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Рекомендации для вас</CardTitle>
        </CardHeader>
        <CardContent className="h-40 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-devhub-purple" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Рекомендации для вас</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="projects">
          <TabsList className="mb-4">
            <TabsTrigger value="projects">Проекты</TabsTrigger>
            <TabsTrigger value="snippets">Сниппеты</TabsTrigger>
          </TabsList>
          
          <TabsContent value="projects">
            {recommendedProjects.length > 0 ? (
              <div className="grid grid-cols-1 gap-4">
                {recommendedProjects.slice(0, 3).map((project) => (
                  <ProjectCard
                    key={project.id}
                    id={project.id}
                    title={project.title}
                    description={project.description}
                    technologies={project.technologies || []}
                    author={project.author || ''}
                    authorAvatar={project.authorAvatar}
                    authorUsername={project.profiles?.username}
                    authorId={project.user_id}
                    imageUrl={project.image_url || undefined}
                    likes={project.likes_count}
                    comments={project.comments_count}
                  />
                ))}
              </div>
            ) : (
              <p className="text-center py-6 text-gray-500">Нет доступных рекомендаций по проектам</p>
            )}
          </TabsContent>
          
          <TabsContent value="snippets">
            {recommendedSnippets.length > 0 ? (
              <div className="grid grid-cols-1 gap-4">
                {recommendedSnippets.slice(0, 3).map((snippet) => (
                  <SnippetCard
                    key={snippet.id}
                    id={snippet.id}
                    title={snippet.title}
                    description={snippet.description}
                    language={snippet.language}
                    tags={snippet.tags || []}
                    author={snippet.author}
                    authorAvatar={snippet.authorAvatar}
                    authorUsername={snippet.profiles?.username}
                    authorId={snippet.user_id}
                    created_at={snippet.created_at}
                  />
                ))}
              </div>
            ) : (
              <p className="text-center py-6 text-gray-500">Нет доступных рекомендаций по сниппетам</p>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default RecommendationSystem;
