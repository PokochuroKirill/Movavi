
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import ProjectCard from '@/components/ProjectCard';
import SnippetCard from '@/components/SnippetCard';
import { useRecommendations } from '@/hooks/useAnalytics';

interface RecommendationSystemProps {
  userId?: string;
}

const RecommendationSystem = ({ userId }: RecommendationSystemProps) => {
  const { recommendedProjects, recommendedSnippets, isLoading, error } = useRecommendations(userId);
  const [activeTab, setActiveTab] = useState<'projects' | 'snippets'>('projects');

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-12">
        <Loader2 className="h-12 w-12 animate-spin text-devhub-purple" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-12">
        <p className="text-red-500">Ошибка загрузки рекомендаций</p>
      </div>
    );
  }

  const hasRecommendations = recommendedProjects.length > 0 || recommendedSnippets.length > 0;

  if (!hasRecommendations) {
    return (
      <div className="space-y-12">
        <h2 className="text-3xl font-bold text-center mb-8">Рекомендации</h2>
        <Card>
          <CardContent className="py-10 text-center text-gray-500">
            {userId ? 
              "На основе вашей активности мы пока не можем предложить рекомендации. Продолжайте добавлять проекты и сниппеты, чтобы получить персонализированные предложения." :
              "Для получения персонализированных рекомендаций, пожалуйста, войдите в систему."}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-12">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold mb-8">Персональные рекомендации</h2>
        <div className="flex space-x-2 mb-8">
          <button 
            onClick={() => setActiveTab('projects')}
            className={`px-4 py-2 rounded-md ${activeTab === 'projects' ? 'bg-devhub-purple text-white' : 'bg-gray-100 dark:bg-gray-800'}`}
          >
            Проекты
          </button>
          <button 
            onClick={() => setActiveTab('snippets')}
            className={`px-4 py-2 rounded-md ${activeTab === 'snippets' ? 'bg-devhub-purple text-white' : 'bg-gray-100 dark:bg-gray-800'}`}
          >
            Сниппеты
          </button>
        </div>
      </div>

      {activeTab === 'projects' && recommendedProjects.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {recommendedProjects.map(project => (
            <ProjectCard
              key={project.id}
              project={project}
            />
          ))}
        </div>
      )}

      {activeTab === 'projects' && recommendedProjects.length === 0 && (
        <Card>
          <CardContent className="py-10 text-center text-gray-500">
            У нас пока нет рекомендаций по проектам для вас. Попробуйте добавить больше своих проектов или указать используемые технологии в профиле.
          </CardContent>
        </Card>
      )}

      {activeTab === 'snippets' && recommendedSnippets.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {recommendedSnippets.map(snippet => (
            <SnippetCard
              key={snippet.id}
              snippet={snippet}
            />
          ))}
        </div>
      )}

      {activeTab === 'snippets' && recommendedSnippets.length === 0 && (
        <Card>
          <CardContent className="py-10 text-center text-gray-500">
            У нас пока нет рекомендаций по сниппетам для вас. Попробуйте добавить больше сниппетов или указать предпочитаемые языки программирования в профиле.
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default RecommendationSystem;
