
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ProjectCard from '@/components/ProjectCard';
import ProjectFilters from '@/components/ProjectFilters';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Loader2, PlusCircle, Search, X } from 'lucide-react';
import { Project } from '@/types/database';

const ProjectsPage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [projects, setProjects] = useState<Project[]>([]);
  const [displayedProjects, setDisplayedProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTech, setSelectedTech] = useState<string[]>([]);
  const [availableTechnologies, setAvailableTechnologies] = useState<string[]>([]);
  
  useEffect(() => {
    fetchProjects();
  }, []);
  
  const fetchProjects = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('projects')
        .select(`
          *,
          profiles:user_id(username, full_name, avatar_url)
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      if (data) {
        // Process projects data
        const projectsWithCounts = await Promise.all(data.map(async (project) => {
          // Get likes count
          const { data: likesCount } = await supabase
            .rpc('get_project_likes_count', { project_id: project.id });
          
          // Get comments count
          const { count: commentsCount } = await supabase
            .from('comments')
            .select('id', { count: 'exact', head: true })
            .eq('project_id', project.id);
          
          return {
            ...project,
            author: project.profiles?.full_name || project.profiles?.username || 'Unknown Author',
            authorAvatar: project.profiles?.avatar_url,
            likes_count: likesCount || 0,
            comments_count: commentsCount || 0
          };
        }));
        
        // Extract all unique technologies
        const techs = new Set<string>();
        projectsWithCounts.forEach(project => {
          if (Array.isArray(project.technologies)) {
            project.technologies.forEach(tech => techs.add(tech));
          }
        });
        
        setProjects(projectsWithCounts as Project[]);
        setDisplayedProjects(projectsWithCounts as Project[]);
        setAvailableTechnologies(Array.from(techs));
      }
    } catch (error: any) {
      console.error("Error fetching projects:", error);
      toast({
        title: "Error",
        description: "Failed to load projects",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Filter projects based on search and tech filters
  const filterProjects = () => {
    let filtered = [...projects];
    
    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(project => 
        project.title.toLowerCase().includes(query) || 
        project.description.toLowerCase().includes(query)
      );
    }
    
    // Apply tech filter
    if (selectedTech.length > 0) {
      filtered = filtered.filter(project => 
        selectedTech.every(tech => 
          project.technologies?.includes(tech)
        )
      );
    }
    
    setDisplayedProjects(filtered);
  };
  
  // Effect to filter projects when search or tech selection changes
  useEffect(() => {
    filterProjects();
  }, [searchQuery, selectedTech, projects]);
  
  // Handle tech filter changes
  const handleTechFilterChange = (techs: string[]) => {
    setSelectedTech(techs);
  };
  
  // Clear all filters
  const clearFilters = () => {
    setSearchQuery('');
    setSelectedTech([]);
  };
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-grow py-12 container mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Explore Projects</h1>
          {user && (
            <Link to="/projects/create">
              <Button>
                <PlusCircle className="mr-2 h-4 w-4" />
                Create Project
              </Button>
            </Link>
          )}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="md:col-span-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
              <Input
                className="pl-9"
                placeholder="Search projects by title or description..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button 
                  className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500 hover:text-gray-700"
                  onClick={() => setSearchQuery('')}
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
          
          <div className="md:col-span-1">
            <ProjectFilters 
              selectedTech={selectedTech} 
              onTechChange={handleTechFilterChange} 
              availableTech={availableTechnologies}
            />
          </div>
        </div>
        
        {(searchQuery || selectedTech.length > 0) && (
          <div className="mb-4 flex items-center">
            <div className="text-sm text-gray-500">
              {displayedProjects.length} {displayedProjects.length === 1 ? 'result' : 'results'} found
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={clearFilters}
              className="ml-4 text-sm"
            >
              Clear filters
            </Button>
          </div>
        )}
        
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-devhub-purple mr-2" />
            <span>Loading projects...</span>
          </div>
        ) : displayedProjects.length === 0 ? (
          <div className="text-center py-20">
            <h2 className="text-2xl font-semibold mb-4">No projects found</h2>
            <p className="text-gray-500 mb-6">
              {searchQuery || selectedTech.length > 0 ? 
                "Try changing your search criteria or clearing filters." : 
                "Be the first to share your project with the community!"
              }
            </p>
            {user && (
              <Link to="/projects/create">
                <Button>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Create Project
                </Button>
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayedProjects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default ProjectsPage;
