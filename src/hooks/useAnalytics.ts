
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Project, Snippet } from '@/types/database';
import { useToast } from '@/hooks/use-toast';

export interface AnalyticsData {
  date: string;
  count: number;
}

export function useAnalytics() {
  const [userCounts, setUserCounts] = useState<AnalyticsData[]>([]);
  const [snippetCounts, setSnippetCounts] = useState<AnalyticsData[]>([]);
  const [communityCounts, setCommunityCounts] = useState<AnalyticsData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchAnalyticsData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // Fetch user counts
        const { data: userData, error: userError } = await supabase
          .from('user_counts')
          .select('*')
          .order('date', { ascending: false })
          .limit(30);

        if (userError) throw userError;
        
        setUserCounts(userData?.map(item => ({
          date: item.date,
          count: item.new_users
        })) || []);

        // Fetch snippet counts
        const { data: snippetData, error: snippetError } = await supabase
          .from('snippet_counts')
          .select('*')
          .order('date', { ascending: false })
          .limit(30);

        if (snippetError) throw snippetError;
        
        setSnippetCounts(snippetData?.map(item => ({
          date: item.date,
          count: item.new_snippets
        })) || []);

        // Fetch community counts
        const { data: communityData, error: communityError } = await supabase
          .from('community_counts')
          .select('*')
          .order('date', { ascending: false })
          .limit(30);

        if (communityError) throw communityError;
        
        setCommunityCounts(communityData?.map(item => ({
          date: item.date,
          count: item.new_communities
        })) || []);

      } catch (err: any) {
        console.error('Error fetching analytics data:', err);
        setError(err.message || 'Failed to fetch analytics data');
        toast({
          title: 'Ошибка',
          description: 'Не удалось загрузить аналитические данные',
          variant: 'destructive'
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnalyticsData();
  }, []);

  return {
    userCounts,
    snippetCounts,
    communityCounts,
    isLoading,
    error
  };
}

export function useRecommendations(userId?: string) {
  const [recommendedProjects, setRecommendedProjects] = useState<Project[]>([]);
  const [recommendedSnippets, setRecommendedSnippets] = useState<Snippet[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchRecommendations = async () => {
      if (!userId) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        // Fetch recommended projects
        const { data: projectsData, error: projectsError } = await supabase
          .rpc('get_recommended_projects', { p_user_id: userId });

        if (projectsError) throw projectsError;
        
        // Enrich project data with author information
        const enrichedProjects = await Promise.all((projectsData || []).map(async (project) => {
          const { data: profileData } = await supabase
            .from('profiles')
            .select('username, full_name, avatar_url')
            .eq('id', project.user_id)
            .single();
            
          // Add the missing properties required by the Project type
          return {
            ...project,
            author: profileData?.full_name || profileData?.username || 'Неизвестный автор',
            authorAvatar: profileData?.avatar_url,
            // Add these missing properties to satisfy the Project type
            content: '', // Default empty content
            updated_at: project.created_at, // Use created_at as fallback for updated_at
            likes: 0,
            comments: 0
          } as Project;
        }));

        setRecommendedProjects(enrichedProjects);

        // Fetch recommended snippets
        const { data: snippetsData, error: snippetsError } = await supabase
          .rpc('get_recommended_snippets', { p_user_id: userId });

        if (snippetsError) throw snippetsError;
        
        // Enrich snippet data with author information
        const enrichedSnippets = await Promise.all((snippetsData || []).map(async (snippet) => {
          const { data: profileData } = await supabase
            .from('profiles')
            .select('username, full_name, avatar_url')
            .eq('id', snippet.user_id)
            .single();
            
          // Add the missing properties required by the Snippet type
          return {
            ...snippet,
            author: profileData?.full_name || profileData?.username || 'Неизвестный автор',
            authorAvatar: profileData?.avatar_url,
            // Add these missing properties to satisfy the Snippet type
            code: '', // Default empty code
            updated_at: snippet.created_at, // Use created_at as fallback for updated_at
            likes: 0,
            comments: 0
          } as Snippet;
        }));

        setRecommendedSnippets(enrichedSnippets);

      } catch (err: any) {
        console.error('Error fetching recommendations:', err);
        setError(err.message || 'Failed to fetch recommendations');
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
  }, [userId]);

  return {
    recommendedProjects,
    recommendedSnippets,
    isLoading,
    error
  };
}
