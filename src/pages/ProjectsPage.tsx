
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import Layout from '@/components/Layout';
import ProjectCard from '@/components/ProjectCard';
import { Project } from '@/types/database';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ru } from 'date-fns/locale';
import LoaderSpinner from '@/components/ui/LoaderSpinner';

const ProjectsPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTech, setSelectedTech] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [availableTech, setAvailableTech] = useState<string[]>([]);

  const fetchProjects = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('projects')
        .select(`
          *,
          profiles:user_id (
            id,
            username,
            full_name,
            avatar_url
          )
        `)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      setProjects(data || []);
    } catch (error: any) {
      console.error('Error fetching projects:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch projects',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  useEffect(() => {
    // Extract unique technologies from projects
    if (projects) {
      const techSet = new Set<string>();
      projects.forEach(project => {
        project.technologies?.forEach(tech => techSet.add(tech.toLowerCase()));
      });
      setAvailableTech(Array.from(techSet));
    }
  }, [projects]);

  const filteredProjects = React.useMemo(() => {
    let filtered = projects.filter(project => {
      // Search filter
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        return project.title.toLowerCase().includes(searchLower) ||
               project.description.toLowerCase().includes(searchLower) ||
               project.technologies?.some(tech => 
                 tech.toLowerCase().includes(searchLower)
               ) ||
               (project.profiles?.username?.toLowerCase().includes(searchLower)) ||
               (project.profiles?.full_name?.toLowerCase().includes(searchLower));
      }
      
      return true;
    });

    // Technology filter
    if (selectedTech && selectedTech !== 'all') {
      filtered = filtered.filter(project => 
        project.technologies?.some(tech => 
          tech.toLowerCase() === selectedTech.toLowerCase()
        )
      );
    }

    // Sort
    switch (sortBy) {
      case 'newest':
        filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        break;
      case 'oldest':
        filtered.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
        break;
      case 'popular':
        filtered.sort((a, b) => (b.likes_count || 0) - (a.likes_count || 0));
        break;
      case 'alphabetical':
        filtered.sort((a, b) => a.title.localeCompare(b.title));
        break;
      default:
        break;
    }

    return filtered;
  }, [projects, searchTerm, selectedTech, sortBy]);

  return (
    <Layout>
      <div className="container py-24 mt-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8">
          <div className="mb-4 md:mb-0">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Проекты сообщества
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Посмотрите проекты, созданные участниками DevHub
            </p>
          </div>
          {user && (
            <Button
              onClick={() => navigate('/projects/create')}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              <Plus className="mr-2 h-4 w-4" />
              Создать проект
            </Button>
          )}
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Input
            type="text"
            placeholder="Поиск проектов..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />

          <Select value={selectedTech} onValueChange={setSelectedTech}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Все технологии" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Все технологии</SelectItem>
              {availableTech.sort().map(tech => (
                <SelectItem key={tech} value={tech}>{tech}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Сортировать по: Новые" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Сначала новые</SelectItem>
              <SelectItem value="oldest">Сначала старые</SelectItem>
              <SelectItem value="popular">По популярности</SelectItem>
              <SelectItem value="alphabetical">По алфавиту</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Projects Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project) => (
            <ProjectCard 
              key={project.id}
              project={project}
            />
          ))}
        </div>

        {/* Empty State */}
        {filteredProjects.length === 0 && !loading && (
          <div className="text-center py-12">
            <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-4">
              Проекты не найдены
            </h2>
            <p className="text-gray-500 dark:text-gray-400">
              Попробуйте изменить параметры поиска
            </p>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center min-h-[200px]">
            <LoaderSpinner />
          </div>
        )}
      </div>
    </Layout>
  );
};

export default ProjectsPage;
