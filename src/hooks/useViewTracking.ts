
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export const useViewTracking = () => {
  const { user } = useAuth();

  const trackProjectView = async (projectId: string) => {
    try {
      const { error } = await supabase.rpc('increment_project_views', {
        project_id: projectId,
        user_id: user?.id || null
      });
      
      if (error) {
        console.error('Error tracking project view:', error);
      }
    } catch (error) {
      console.error('Error tracking project view:', error);
    }
  };

  const trackSnippetView = async (snippetId: string) => {
    try {
      const { error } = await supabase.rpc('increment_snippet_views', {
        snippet_id: snippetId,
        user_id: user?.id || null
      });
      
      if (error) {
        console.error('Error tracking snippet view:', error);
      }
    } catch (error) {
      console.error('Error tracking snippet view:', error);
    }
  };

  return {
    trackProjectView,
    trackSnippetView
  };
};
