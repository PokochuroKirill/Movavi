
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { format, subDays } from 'date-fns';

interface ActivityData {
  date: string;
  snippets: number;
  projects: number;
  comments: number;
}

interface EngagementData {
  name: string;
  value: number;
  color: string;
}

export const useUserAnalytics = (userId: string | undefined) => {
  const [isLoading, setIsLoading] = useState(true);
  const [activityData, setActivityData] = useState<ActivityData[]>([]);
  const [engagementData, setEngagementData] = useState<EngagementData[]>([]);

  useEffect(() => {
    const fetchAnalytics = async () => {
      if (!userId) {
        setIsLoading(false);
        return;
      }
      
      setIsLoading(true);
      
      try {
        // In a real implementation, we would fetch this data from Supabase
        // For now, we'll generate mock data for demonstration
        
        // Activity data - last 30 days
        const mockActivityData: ActivityData[] = Array.from({ length: 30 }).map((_, i) => {
          const date = format(subDays(new Date(), 29 - i), 'dd.MM');
          return {
            date,
            snippets: Math.floor(Math.random() * 5),
            projects: Math.floor(Math.random() * 3),
            comments: Math.floor(Math.random() * 10),
          };
        });
        
        // Community engagement data
        const mockEngagementData: EngagementData[] = [
          { name: 'Frontend', value: Math.floor(Math.random() * 50) + 10, color: '#0088FE' },
          { name: 'Backend', value: Math.floor(Math.random() * 40) + 10, color: '#00C49F' },
          { name: 'DevOps', value: Math.floor(Math.random() * 30) + 5, color: '#FFBB28' },
          { name: 'Mobile', value: Math.floor(Math.random() * 20) + 5, color: '#FF8042' },
          { name: 'AI/ML', value: Math.floor(Math.random() * 25) + 5, color: '#8884d8' }
        ];
        
        setActivityData(mockActivityData);
        setEngagementData(mockEngagementData);
      } catch (error) {
        console.error('Error fetching user analytics:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnalytics();
  }, [userId]);

  return {
    isLoading,
    activityData,
    engagementData
  };
};
