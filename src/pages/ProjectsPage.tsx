
import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ProjectCard from '@/components/ProjectCard';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Plus, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import ProjectFilters, { ProjectFilters as FiltersType } from '@/components/ProjectFilters';

type Project = {
  id: string;
  title: string;
  description: string;
  author: string;
  authorAvatar?: string;
  stars: number;
  forks: number;
  views: number;
  tags: string[];
};

const ProjectsPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [projects, setProjects] = useState<Project[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<FiltersType>({
    technologies: [],
    sortBy: 'latest'
  });
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Extract all unique technologies from projects
  const availableTechnologies = useMemo(() => {
    const techSet = new Set<string>();
    projects.forEach(project => {
      project.tags.forEach(tag => {
        techSet.add(tag);
      });
    });
    return Array.from(techSet).sort();
  }, [projects]);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('projects')
          .select(`
            id, 
            title, 
            description, 
            technologies,
            profiles(username, full_name, avatar_url)
          `)
          .order('created_at', { ascending: false });

        if (error) throw error;

        if (data) {
          const formattedProjects = data.map(item => ({
            id: item.id,
            title: item.title,
            description: item.description,
            author: item.profiles?.full_name || item.profiles?.username || 'Неизвестный автор',
            authorAvatar: item.profiles?.avatar_url,
            stars: Math.floor(Math.random() * 100), // Временно, пока нет реальных данных
            forks: Math.floor(Math.random() * 30),  // Временно, пока нет реальных данных
            views: Math.floor(Math.random() * 1000), // Временно, пока нет реальных данных
            tags: item.technologies || []
          }));
          setProjects(formattedProjects);
          setFilteredProjects(formattedProjects);
        }
      } catch (error: any) {
        console.error('Ошибка при загрузке проектов:', error);
        toast({
          title: 'Ошибка',
          description: 'Не удалось загрузить проекты',
          variant: 'destructive'
        });
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, [toast]);

  // Apply filters and search whenever they change
  useEffect(() => {
    let result = [...projects];
    
    // Apply technology filters
    if (filters.technologies.length > 0) {
      result = result.filter(project => 
        filters.technologies.some(tech => project.tags.includes(tech))
      );
    }
    
    // Apply search query
    if (searchQuery.trim()) {
      result = result.filter(
        project => 
          project.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
          project.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          project.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }
    
    // Apply sorting
    switch (filters.sortBy) {
      case 'popular':
        result.sort((a, b) => b.stars - a.stars);
        break;
      case 'views':
        result.sort((a, b) => b.views - a.views);
        break;
      case 'latest':
      default:
        // Already sorted by created_at from the server
        break;
    }
    
    setFilteredProjects(result);
  }, [searchQuery, filters, projects]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Search is now handled by the useEffect
  };
  
  const handleFilterChange = (newFilters: FiltersType) => {
    setFilters(newFilters);
  };

  const handleAddProject = () => {
    if (!user) {
      toast({
        title: "Требуется авторизация",
        description: "Для создания проекта необходимо войти в систему",
        variant: "destructive"
      });
      navigate('/auth');
      return;
    }
    
    navigate('/projects/create');
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
            
            <Button 
              className="gradient-bg text-white mt-4 md:mt-0"
              onClick={handleAddProject}
            >
              <Plus className="h-4 w-4 mr-2" />
              Добавить проект
            </Button>
          </div>
          
          <div className="mb-8 space-y-4">
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
                Поиск
              </Button>
            </form>
            
            <ProjectFilters 
              onFilterChange={handleFilterChange}
              availableTechnologies={availableTechnologies}
            />
          </div>
          
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-devhub-purple" />
              <span className="ml-2 text-lg">Загрузка проектов...</span>
            </div>
          ) : filteredProjects.length > 0 ? (
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
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500 dark:text-gray-400 text-lg mb-4">
                {searchQuery || filters.technologies.length > 0 ? 
                  'Проекты не найдены. Попробуйте изменить параметры поиска.' : 
                  'Проектов пока нет. Создайте первый проект!'}
              </p>
              {!searchQuery && filters.technologies.length === 0 && (
                <Button 
                  className="gradient-bg text-white"
                  onClick={handleAddProject}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Создать проект
                </Button>
              )}
            </div>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default ProjectsPage;
