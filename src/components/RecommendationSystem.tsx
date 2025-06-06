
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ProjectCard from './ProjectCard';
import SnippetCard from './SnippetCard';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Project, Snippet } from '@/types/database';

interface RecommendedProject extends Project {
  relevance_score: number;
}

interface RecommendedSnippet extends Snippet {
  relevance_score: number;
}

const RecommendationSystem = () => {
  const { user } = useAuth();

  const { data: recommendedProjects, isLoading: projectsLoading } = useQuery({
    queryKey: ['recommended-projects', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .rpc('get_recommended_projects', { p_user_id: user.id });
      
      if (error) throw error;
      return data as RecommendedProject[] || [];
    },
    enabled: !!user?.id
  });

  const { data: recommendedSnippets, isLoading: snippetsLoading } = useQuery({
    queryKey: ['recommended-snippets', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .rpc('get_recommended_snippets', { p_user_id: user.id });
      
      if (error) throw error;
      return data as RecommendedSnippet[] || [];
    },
    enabled: !!user?.id
  });

  if (!user) {
    return null;
  }

  const hasRecommendations = (recommendedProjects && recommendedProjects.length > 0) || 
                             (recommendedSnippets && recommendedSnippets.length > 0);

  if (!hasRecommendations && !projectsLoading && !snippetsLoading) {
    return null;
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-xl font-bold">Рекомендации для вас</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="projects" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="projects">Проекты</TabsTrigger>
            <TabsTrigger value="snippets">Сниппеты</TabsTrigger>
          </TabsList>
          
          <TabsContent value="projects" className="mt-4">
            {projectsLoading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : recommendedProjects && recommendedProjects.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {recommendedProjects.slice(0, 4).map((project) => (
                  <ProjectCard
                    key={project.id}
                    id={project.id}
                    title={project.title}
                    description={project.description}
                    imageUrl={project.image_url}
                    technologies={project.technologies}
                    authorId={project.user_id}
                  />
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-500 py-8">
                Пока нет рекомендаций проектов. Создайте больше проектов, чтобы получить персональные рекомендации!
              </p>
            )}
          </TabsContent>
          
          <TabsContent value="snippets" className="mt-4">
            {snippetsLoading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : recommendedSnippets && recommendedSnippets.length > 0 ? (
              <div className="space-y-4">
                {recommendedSnippets.slice(0, 4).map((snippet) => (
                  <SnippetCard
                    key={snippet.id}
                    id={snippet.id}
                    title={snippet.title}
                    description={snippet.description}
                    language={snippet.language}
                    tags={snippet.tags}
                    authorId={snippet.user_id}
                  />
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-500 py-8">
                Пока нет рекомендаций сниппетов. Создайте больше сниппетов, чтобы получить персональные рекомендации!
              </p>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default RecommendationSystem;
