import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, Github, ExternalLink, ArrowLeft } from 'lucide-react';
import ProjectActions from '@/components/ProjectActions';
import CommentSection from '@/components/CommentSection';
import { 
  hasUserLikedProject, 
  hasUserSavedProject, 
  getProjectLikesCount, 
  getProjectCommentsCount 
} from '@/hooks/useSupabaseQueries';

type Project = {
  id: string;
  title: string;
  description: string;
  content: string;
  github_url: string | null;
  live_url: string | null;
  technologies: string[] | null;
  created_at: string;
  author: string;
  authorId: string;
  authorAvatar?: string;
};

const ProjectDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [viewCount, setViewCount] = useState(0);
  const [likes, setLikes] = useState(0);
  const [comments, setComments] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    const fetchProject = async () => {
      try {
        if (!id) return;
        
        // Fetch project data
        const { data, error } = await supabase
          .from('projects')
          .select(`
            id, 
            title, 
            description,
            content,
            github_url,
            live_url,
            technologies,
            created_at,
            user_id,
            profiles(id, username, full_name, avatar_url)
          `)
          .eq('id', id)
          .single();

        if (error) throw error;

        if (data) {
          setProject({
            ...data,
            authorId: data.user_id,
            author: data.profiles?.full_name || data.profiles?.username || 'Неизвестный автор',
            authorAvatar: data.profiles?.avatar_url,
          });
          
          // Fetch likes count
          const likesData = await getProjectLikesCount(id);
          setLikes(likesData || 0);
          
          // Fetch comments count
          const commentsCount = await getProjectCommentsCount(id);
          setComments(commentsCount);
          
          // Check if user has liked or saved this project
          if (user) {
            const userLiked = await hasUserLikedProject(id, user.id);
            setIsLiked(userLiked || false);
            
            const userSaved = await hasUserSavedProject(id, user.id);
            setIsSaved(userSaved || false);
          }
          
          // Increment view count (for demo purposes, we're just using local state)
          setViewCount(Math.floor(Math.random() * 100) + 1);
        }
      } catch (error: any) {
        console.error('Ошибка при загрузке проекта:', error);
        toast({
          title: 'Ошибка',
          description: 'Не удалось загрузить проект',
          variant: 'destructive'
        });
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
  }, [id, toast, user]);

  const handleCommentCountChange = (count: number) => {
    setComments(count);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow pt-24 pb-16 flex justify-center items-center">
          <div className="flex flex-col items-center">
            <Loader2 className="h-10 w-10 animate-spin text-devhub-purple mb-4" />
            <p className="text-lg">Загрузка проекта...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow pt-24 pb-16">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-3xl font-bold mb-4">Проект не найден</h1>
            <p className="mb-8">Запрашиваемый проект не существует или был удален</p>
            <Link to="/projects">
              <Button className="gradient-bg text-white">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Вернуться к проектам
              </Button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <Link to="/projects" className="flex items-center text-gray-600 dark:text-gray-400 hover:text-devhub-purple mb-6">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Назад к проектам
          </Link>
          
          {loading ? (
            <div className="flex flex-col items-center">
              <Loader2 className="h-10 w-10 animate-spin text-devhub-purple mb-4" />
              <p className="text-lg">Загрузка проекта...</p>
            </div>
          ) : !project ? (
            <div className="text-center">
              <h1 className="text-3xl font-bold mb-4">Проект не найден</h1>
              <p className="mb-8">Запрашиваемый проект не существует или был удален</p>
              <Link to="/projects">
                <Button className="gradient-bg text-white">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Вернуться к проектам
                </Button>
              </Link>
            </div>
          ) : (
            <>
              <div className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-lg p-6 mb-8">
                <h1 className="text-3xl font-bold mb-2">{project.title}</h1>
                
                <p className="text-gray-600 dark:text-gray-300 text-lg mb-6">
                  {project.description}
                </p>
                
                <div className="flex flex-wrap gap-2 mb-6">
                  {project.technologies && project.technologies.map((tech) => (
                    <Badge key={tech} variant="outline" className="bg-devhub-purple/10 text-devhub-purple border-devhub-purple/20">
                      {tech}
                    </Badge>
                  ))}
                </div>
                
                <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
                  <div className="flex items-center">
                    <img 
                      src={project.authorAvatar || "/placeholder.svg"} 
                      alt={project.author} 
                      className="w-10 h-10 rounded-full mr-3 object-cover"
                    />
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{project.author}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {new Date(project.created_at).toLocaleDateString('ru-RU', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>
                  
                  <ProjectActions 
                    projectId={project.id} 
                    initialLikes={likes} 
                    initialComments={comments}
                    isLiked={isLiked}
                    isSaved={isSaved}
                    onCommentCountChange={handleCommentCountChange}
                  />
                </div>
                
                <div className="prose dark:prose-invert max-w-none mb-8">
                  {project.content.split('\n').map((paragraph, idx) => (
                    <p key={idx}>{paragraph}</p>
                  ))}
                </div>
                
                <div className="flex flex-wrap gap-4">
                  {project.github_url && (
                    <a href={project.github_url} target="_blank" rel="noopener noreferrer">
                      <Button variant="outline" className="flex items-center">
                        <Github className="mr-2 h-4 w-4" />
                        GitHub Repository
                      </Button>
                    </a>
                  )}
                  
                  {project.live_url && (
                    <a href={project.live_url} target="_blank" rel="noopener noreferrer">
                      <Button className="gradient-bg text-white flex items-center">
                        <ExternalLink className="mr-2 h-4 w-4" />
                        Открыть проект
                      </Button>
                    </a>
                  )}
                </div>
              </div>
              
              {/* Comments Section */}
              <div className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-lg p-6">
                <CommentSection 
                  projectId={project.id} 
                  onCommentsChange={handleCommentCountChange}
                />
              </div>
            </>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default ProjectDetailPage;
