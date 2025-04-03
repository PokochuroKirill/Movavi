
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import ProjectCard from '@/components/ProjectCard';
import ProjectFilters from '@/components/ProjectFilters';
import { Loader2, Plus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Project } from '@/types/database';

const ProjectsPage = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTech, setSelectedTech] = useState<string[]>([]);
  const [availableTech, setAvailableTech] = useState<string[]>([]);

  useEffect(() => {
    fetchProjects();
  }, []);

  useEffect(() => {
    filterProjects();
  }, [searchTerm, selectedTech, projects]);

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('projects')
        .select(`
          *,
          profiles:user_id(username, full_name, avatar_url)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const projectsWithMetadata = await Promise.all((data || []).map(async (project) => {
        // Get likes count for each project
        const { data: likesCount } = await supabase
          .rpc('get_project_likes_count', { project_id: project.id });
        
        // Get comments count for each project
        const { count: commentsCount } = await supabase
          .from('comments')
          .select('id', { count: 'exact', head: true })
          .eq('project_id', project.id);
        
        return {
          ...project,
          author: project.profiles?.full_name || project.profiles?.username || 'Unnamed Author',
          authorAvatar: project.profiles?.avatar_url,
          likes_count: likesCount || 0,
          comments_count: commentsCount || 0
        } as Project;
      }));

      setProjects(projectsWithMetadata);

      // Extract all unique technologies
      const allTechnologies = projectsWithMetadata.reduce((acc: string[], project) => {
        if (project.technologies && Array.isArray(project.technologies)) {
          project.technologies.forEach((tech) => {
            if (!acc.includes(tech)) {
              acc.push(tech);
            }
          });
        }
        return acc;
      }, []);

      setAvailableTech(allTechnologies);
    } catch (error) {
      console.error('Error fetching projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterProjects = () => {
    let filtered = [...projects];

    // Filter by search term
    if (searchTerm) {
      const lowerSearchTerm = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (project) =>
          project.title.toLowerCase().includes(lowerSearchTerm) ||
          project.description.toLowerCase().includes(lowerSearchTerm)
      );
    }

    // Filter by selected technologies
    if (selectedTech.length > 0) {
      filtered = filtered.filter((project) => {
        if (!project.technologies) return false;
        return selectedTech.every((tech) => project.technologies?.includes(tech));
      });
    }

    setFilteredProjects(filtered);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleTechChange = (techs: string[]) => {
    setSelectedTech(techs);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow container mx-auto px-4 py-20">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10">
          <div>
            <h1 className="text-3xl font-bold mb-2">Projects</h1>
            <p className="text-gray-600 dark:text-gray-300 mb-4 md:mb-0">
              Discover and explore projects from the community
            </p>
          </div>
          
          <Link to="/projects/create">
            <Button className="gradient-bg text-white">
              <Plus className="mr-2 h-4 w-4" /> New Project
            </Button>
          </Link>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm mb-6">
              <div className="mb-4">
                <Input
                  placeholder="Search projects..."
                  value={searchTerm}
                  onChange={handleSearchChange}
                />
              </div>
              
              <ProjectFilters 
                availableTech={availableTech} 
                selectedTech={selectedTech}
                onTechChange={handleTechChange}
              />
            </div>
          </div>
          
          {/* Projects Grid */}
          <div className="lg:col-span-3">
            {loading ? (
              <div className="flex justify-center items-center py-20">
                <Loader2 className="h-10 w-10 animate-spin text-devhub-purple mr-2" />
                <p className="text-lg">Loading projects...</p>
              </div>
            ) : filteredProjects.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredProjects.map((project) => (
                  <ProjectCard 
                    key={project.id}
                    id={project.id}
                    title={project.title}
                    description={project.description}
                    technologies={project.technologies || []}
                    author={project.author || ''}
                    authorAvatar={project.authorAvatar}
                    imageUrl={project.image_url || undefined}
                    likes={project.likes_count}
                    comments={project.comments_count}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-20 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <p className="text-xl mb-4">No projects found</p>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  {searchTerm || selectedTech.length > 0 
                    ? "Try adjusting your filters or search term"
                    : "Be the first to share a project with the community!"}
                </p>
                {(searchTerm || selectedTech.length > 0) && (
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setSearchTerm('');
                      setSelectedTech([]);
                    }}
                  >
                    Clear Filters
                  </Button>
                )}
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
