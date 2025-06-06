
import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Project } from '@/types/database';
import { Search, Filter, Plus, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import Layout from '@/components/Layout';
import ProjectCard from '@/components/ProjectCard';

const ProjectsPage = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTechnologies, setSelectedTechnologies] = useState<string[]>([]);
  const [availableTechnologies, setAvailableTechnologies] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    fetchProjects();
  }, []);

  useEffect(() => {
    filterProjects();
  }, [projects, searchTerm, selectedTechnologies]);

  const fetchProjects = async () => {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select(`
          *,
          profiles:user_id (
            username,
            full_name,
            avatar_url
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setProjects(data || []);
      
      // Собираем все уникальные технологии
      const technologies = new Set<string>();
      data?.forEach(project => {
        if (project.technologies && Array.isArray(project.technologies)) {
          project.technologies.forEach(tech => {
            if (tech) technologies.add(tech);
          });
        }
      });
      setAvailableTechnologies(Array.from(technologies).sort());
      
    } catch (error: any) {
      console.error('Error fetching projects:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось загрузить проекты',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const filterProjects = () => {
    let filtered = projects;

    // Поиск по названию и описанию
    if (searchTerm) {
      filtered = filtered.filter(project =>
        project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Фильтр по технологиям
    if (selectedTechnologies.length > 0) {
      filtered = filtered.filter(project =>
        selectedTechnologies.some(tech =>
          project.technologies?.includes(tech)
        )
      );
    }

    setFilteredProjects(filtered);
  };

  const toggleTechnology = (tech: string) => {
    setSelectedTechnologies(prev =>
      prev.includes(tech)
        ? prev.filter(t => t !== tech)
        : [...prev, tech]
    );
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedTechnologies([]);
  };

  if (loading) {
    return (
      <Layout>
        <div className="container max-w-7xl py-24 mt-8">
          <div className="flex justify-center items-center min-h-[400px]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container max-w-7xl py-24 mt-8">
        <div className="space-y-8">
          {/* Заголовок и кнопка создания */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
                Проекты
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Изучайте проекты разработчиков и делитесь своими идеями
              </p>
            </div>
            {user && (
              <Link to="/projects/create">
                <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white gap-2">
                  <Plus className="h-4 w-4" />
                  Создать проект
                </Button>
              </Link>
            )}
          </div>

          {/* Поиск и фильтры */}
          <Card>
            <CardHeader>
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Поиск проектов..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setShowFilters(!showFilters)}
                    className="gap-2"
                  >
                    <Filter className="h-4 w-4" />
                    Фильтры
                  </Button>
                  {(searchTerm || selectedTechnologies.length > 0) && (
                    <Button variant="outline" onClick={clearFilters} className="gap-2">
                      <X className="h-4 w-4" />
                      Очистить
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>
            
            {showFilters && (
              <CardContent className="border-t">
                <div className="space-y-4">
                  <h3 className="font-medium text-gray-900 dark:text-white">Технологии</h3>
                  <div className="flex flex-wrap gap-2">
                    {availableTechnologies.map(tech => (
                      <Badge
                        key={tech}
                        variant={selectedTechnologies.includes(tech) ? "default" : "outline"}
                        className="cursor-pointer hover:bg-blue-100 dark:hover:bg-blue-900"
                        onClick={() => toggleTechnology(tech)}
                      >
                        {tech}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            )}
          </Card>

          {/* Результаты поиска */}
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Найдено проектов: {filteredProjects.length}
            </h2>
          </div>

          {/* Список проектов */}
          {filteredProjects.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-gray-500 dark:text-gray-400 mb-4">
                  {projects.length === 0 
                    ? 'Пока нет проектов' 
                    : 'Проекты не найдены. Попробуйте изменить параметры поиска.'
                  }
                </p>
                {user && projects.length === 0 && (
                  <Link to="/projects/create">
                    <Button>Создать первый проект</Button>
                  </Link>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProjects.map((project) => (
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
          )}
        </div>
      </div>
    </Layout>
  );
};

export default ProjectsPage;
