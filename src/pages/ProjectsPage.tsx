
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Plus } from 'lucide-react';
import ProjectCard from '@/components/ProjectCard';
import ProjectFilters from '@/components/ProjectFilters';
import { Project } from '@/types/database';

const ProjectsPage = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [selectedTech, setSelectedTech] = useState<string[]>([]);
  const [availableTech, setAvailableTech] = useState<string[]>([]);
  const { toast } = useToast();
  const { user } = useAuth();
  
  useEffect(() => {
    fetchProjects();
    fetchAvailableTech();
  }, [search, sortBy, selectedTech]);
  
  const fetchProjects = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('projects')
        .select(`
          *,
          profiles:user_id(username, full_name, avatar_url)
        `);
      
      if (search) {
        query = query.ilike('title', `%${search}%`);
      }
      
      if (selectedTech.length > 0) {
        query = query.contains('technologies', selectedTech);
      }
      
      switch (sortBy) {
        case 'newest':
          query = query.order('created_at', { ascending: false });
          break;
        case 'oldest':
          query = query.order('created_at', { ascending: true });
          break;
        case 'most-liked':
          query = query.order('likes_count', { ascending: false });
          break;
        default:
          query = query.order('created_at', { ascending: false });
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      if (!data) {
        setProjects([]);
        return;
      }
      
      const projectsWithData = data.map(project => ({
        ...project,
        author: project.profiles?.full_name || project.profiles?.username || 'Неизвестный автор',
        authorAvatar: project.profiles?.avatar_url,
      }));
      
      setProjects(projectsWithData);
    } catch (error: any) {
      console.error('Error fetching projects:', error.message);
      toast({
        title: 'Ошибка',
        description: 'Не удалось загрузить проекты',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };
  
  const fetchAvailableTech = async () => {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('technologies');
      
      if (error) throw error;
      
      const allTech = new Set<string>();
      data.forEach(project => {
        if (project.technologies) {
          project.technologies.forEach(tech => allTech.add(tech));
        }
      });
      
      setAvailableTech(Array.from(allTech));
    } catch (error: any) {
      console.error('Error fetching available technologies:', error.message);
      toast({
        title: 'Ошибка',
        description: 'Не удалось загрузить технологии',
        variant: 'destructive',
      });
    }
  };
  
  const applyFilters = () => {
    fetchProjects();
  };
  
  const resetFilters = () => {
    setSearch('');
    setSortBy('newest');
    setSelectedTech([]);
    fetchProjects();
  };
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-20">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-3xl font-bold">Проекты</h1>
          {user && (
            <Link to="/projects/create">
              <Button className="gradient-bg text-white">
                <Plus className="h-4 w-4 mr-2" /> Создать проект
              </Button>
            </Link>
          )}
        </div>
        
        <div className="flex flex-col md:flex-row gap-6">
          <div className="w-full md:w-64 shrink-0">
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle>Фильтры</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="sort">Сортировка</Label>
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger id="sort">
                      <SelectValue placeholder="Выберите сортировку" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectItem value="newest">Сначала новые</SelectItem>
                        <SelectItem value="oldest">Сначала старые</SelectItem>
                        <SelectItem value="most-liked">Популярные</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>

                <ProjectFilters 
                  technologies={selectedTech} 
                  setTechnologies={setSelectedTech} 
                  availableTechnologies={availableTech} 
                />

                <Button 
                  onClick={applyFilters} 
                  className="w-full gradient-bg text-white"
                >
                  Применить фильтры
                </Button>
                <Button 
                  onClick={resetFilters} 
                  variant="outline" 
                  className="w-full"
                >
                  Сбросить
                </Button>
              </CardContent>
            </Card>
          </div>
          
          <div className="w-full">
            <div className="mb-8 flex items-center justify-between">
              <Input
                type="search"
                placeholder="Поиск проектов..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="max-w-md"
              />
            </div>
            
            {loading ? (
              <div className="flex justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-devhub-purple" />
              </div>
            ) : projects.length === 0 ? (
              <p className="text-gray-500 text-center py-12">
                Нет проектов для отображения.
              </p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {projects.map(project => (
                  <ProjectCard
                    key={project.id}
                    id={project.id}
                    title={project.title}
                    description={project.description}
                    technologies={project.technologies || []}
                    author={project.author || ''}
                    authorAvatar={project.authorAvatar || ''}
                    imageUrl={project.image_url || undefined}
                    likes={project.likes_count || 0}
                    comments={project.comments_count || 0}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ProjectsPage;
