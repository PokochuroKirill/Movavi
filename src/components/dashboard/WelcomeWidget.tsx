
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Book, Code, FolderGit2, PlusCircle } from 'lucide-react';

interface WelcomeWidgetProps {
  username: string;
}

const WelcomeWidget: React.FC<WelcomeWidgetProps> = ({ username }) => {
  const [greeting, setGreeting] = useState('');
  const [recommendations, setRecommendations] = useState<string[]>([]);
  
  useEffect(() => {
    // Set greeting based on time of day
    const hour = new Date().getHours();
    
    if (hour >= 5 && hour < 12) {
      setGreeting('Доброе утро');
    } else if (hour >= 12 && hour < 18) {
      setGreeting('Добрый день');
    } else {
      setGreeting('Добрый вечер');
    }
    
    // Set random recommendations
    const allRecommendations = [
      'Поделитесь новым сниппетом кода',
      'Опубликуйте свой последний проект',
      'Присоединитесь к сообществу по вашим интересам',
      'Узнайте о новых трендах в разработке',
      'Обновите информацию в вашем профиле',
      'Исследуйте проекты других разработчиков',
      'Прочитайте статьи в блоге'
    ];
    
    // Select 3 random recommendations
    const randomRecommendations = allRecommendations
      .sort(() => 0.5 - Math.random())
      .slice(0, 3);
    
    setRecommendations(randomRecommendations);
  }, []);
  
  return (
    <Card className="w-full border-l-4 border-l-blue-500">
      <CardHeader>
        <CardTitle className="text-xl sm:text-2xl">{greeting}, {username}!</CardTitle>
        <CardDescription>Что бы вы хотели сделать сегодня?</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Button variant="outline" className="flex items-center justify-start space-x-2" asChild>
            <Link to="/snippets/create">
              <Code className="h-4 w-4" />
              <span>Создать сниппет</span>
            </Link>
          </Button>
          
          <Button variant="outline" className="flex items-center justify-start space-x-2" asChild>
            <Link to="/projects/create">
              <FolderGit2 className="h-4 w-4" />
              <span>Добавить проект</span>
            </Link>
          </Button>
          
          <Button variant="outline" className="flex items-center justify-start space-x-2" asChild>
            <Link to="/communities">
              <PlusCircle className="h-4 w-4" />
              <span>Найти сообщества</span>
            </Link>
          </Button>
        </div>
        
        <div className="mt-6">
          <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Рекомендации для вас:</h4>
          <ul className="list-disc pl-5 space-y-1">
            {recommendations.map((rec, index) => (
              <li key={index} className="text-sm text-gray-600 dark:text-gray-300">{rec}</li>
            ))}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default WelcomeWidget;
