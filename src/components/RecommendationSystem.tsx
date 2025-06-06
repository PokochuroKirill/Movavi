
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import ProjectCard from './ProjectCard';
import SnippetCard from './SnippetCard';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

const RecommendationSystem = () => {
  const { user } = useAuth();

  const { data: recommendedProjects = [] } = useQuery({
    queryKey: ['recommended-projects', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .rpc('get_recommended_projects', { p_user_id: user.id });
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
  });

  const { data: recommendedSnippets = [] } = useQuery({
    queryKey: ['recommended-snippets', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .rpc('get_recommended_snippets', { p_user_id: user.id });
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
  });

  if (!user) {
    return null;
  }

  return (
    <div className="space-y-8">
      {recommendedProjects.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Рекомендуемые проекты</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recommendedProjects.slice(0, 6).map((project: any) => (
                <ProjectCard
                  key={project.id}
                  id={project.id}
                  title={project.title}
                  description={project.description}
                  technologies={project.technologies || []}
                  author={project.profiles?.full_name || project.profiles?.username || 'Аноним'}
                  authorAvatar={project.profiles?.avatar_url}
                  authorId={project.user_id}
                  authorUsername={project.profiles?.username}
                  imageUrl={project.image_url}
                />
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {recommendedSnippets.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Рекомендуемые сниппеты</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recommendedSnippets.slice(0, 6).map((snippet: any) => (
                <SnippetCard
                  key={snippet.id}
                  id={snippet.id}
                  title={snippet.title}
                  description={snippet.description}
                  language={snippet.language}
                  tags={snippet.tags || []}
                  author={snippet.profiles?.full_name || snippet.profiles?.username || 'Аноним'}
                  authorAvatar={snippet.profiles?.avatar_url}
                  authorId={snippet.user_id}
                  authorUsername={snippet.profiles?.username}
                />
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default RecommendationSystem;
