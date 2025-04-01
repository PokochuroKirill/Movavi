
import { useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ProjectCard from '@/components/ProjectCard';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Filter, Plus } from 'lucide-react';

// Моковые данные для проектов
const mockProjects = [
  {
    id: '1',
    title: 'Easy React Components',
    description: 'Библиотека React компонентов с поддержкой Typescript, доступности и темной темы.',
    author: 'Алексей Петров',
    authorAvatar: 'https://i.pravatar.cc/300?img=1',
    stars: 243,
    forks: 57,
    views: 1892,
    tags: ['React', 'TypeScript', 'UI Library']
  },
  {
    id: '2',
    title: 'Python Data Analyzer',
    description: 'Инструмент для анализа данных на Python с визуализацией и машинным обучением.',
    author: 'Мария Иванова',
    authorAvatar: 'https://i.pravatar.cc/300?img=2',
    stars: 178,
    forks: 32,
    views: 1254,
    tags: ['Python', 'Data Science', 'ML']
  },
  {
    id: '3',
    title: 'Mobile Task Manager',
    description: 'Приложение для управления задачами с синхронизацией и напоминаниями.',
    author: 'Сергей Смирнов',
    authorAvatar: 'https://i.pravatar.cc/300?img=3',
    stars: 95,
    forks: 12,
    views: 723,
    tags: ['Flutter', 'Dart', 'Mobile App']
  },
  {
    id: '4',
    title: 'NodeJS API Starter',
    description: 'Стартовый шаблон для NodeJS API с аутентификацией, логированием и документацией.',
    author: 'Дмитрий Козлов',
    authorAvatar: 'https://i.pravatar.cc/300?img=4',
    stars: 321,
    forks: 89,
    views: 2411,
    tags: ['Node.js', 'Express', 'API']
  },
  {
    id: '5',
    title: 'Web Animation Library',
    description: 'Библиотека для создания сложных веб-анимаций с минимальным JavaScript.',
    author: 'Екатерина Новикова',
    authorAvatar: 'https://i.pravatar.cc/300?img=5',
    stars: 156,
    forks: 27,
    views: 1182,
    tags: ['JavaScript', 'Animation', 'CSS']
  },
  {
    id: '6',
    title: 'Smart Home Dashboard',
    description: 'Веб-интерфейс для управления умным домом с графиками и статистикой.',
    author: 'Андрей Соколов',
    authorAvatar: 'https://i.pravatar.cc/300?img=6',
    stars: 112,
    forks: 19,
    views: 847,
    tags: ['React', 'IoT', 'Dashboard']
  }
];

const ProjectsPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredProjects, setFilteredProjects] = useState(mockProjects);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (searchQuery.trim() === '') {
      setFilteredProjects(mockProjects);
      return;
    }
    
    const filtered = mockProjects.filter(
      project => 
        project.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
        project.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    );
    
    setFilteredProjects(filtered);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow pt-24 pb-16">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold mb-2">Проекты</h1>
              <p className="text-gray-600 dark:text-gray-300">
                Исследуйте и вдохновляйтесь проектами сообщества разработчиков
              </p>
            </div>
            
            <Button className="gradient-bg text-white mt-4 md:mt-0">
              <Plus className="h-4 w-4 mr-2" />
              Добавить проект
            </Button>
          </div>
          
          <div className="mb-8">
            <form onSubmit={handleSearch} className="flex gap-2">
              <div className="relative flex-grow">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input 
                  type="text" 
                  placeholder="Поиск проектов..." 
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Button type="submit" variant="outline">
                <Filter className="h-4 w-4 mr-2" />
                Фильтры
              </Button>
            </form>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map((project) => (
              <ProjectCard
                key={project.id}
                id={project.id}
                title={project.title}
                description={project.description}
                author={project.author}
                authorAvatar={project.authorAvatar}
                stars={project.stars}
                forks={project.forks}
                views={project.views}
                tags={project.tags}
              />
            ))}
          </div>
          
          {filteredProjects.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500 dark:text-gray-400 text-lg">
                Проекты не найдены. Попробуйте изменить параметры поиска.
              </p>
            </div>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default ProjectsPage;
