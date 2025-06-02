
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, Copy, ExternalLink, Github } from 'lucide-react';
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle, 
  AlertDialogTrigger 
} from "@/components/ui/alert-dialog";
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import ProjectActions from '@/components/ProjectActions';
import CommentSection from '@/components/CommentSection';

interface Project {
  id: string;
  title: string;
  description: string;
  content: string;
  technologies: string[];
  image_url?: string;
  github_url?: string;
  live_url?: string;
  created_at: string;
  updated_at: string;
  user_id: string;
  profiles?: {
    username: string | null;
    full_name: string | null;
    avatar_url: string | null;
  };
}

const ProjectDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const fetchProject = async () => {
      try {
        if (!id) return;
        
        const { data, error } = await supabase
          .from('projects')
          .select(`
            id, 
            title, 
            description, 
            content, 
            technologies, 
            image_url,
            github_url,
            live_url,
            created_at, 
            updated_at,
            user_id, 
            profiles(username, full_name, avatar_url)
          `)
          .eq('id', id)
          .single();

        if (error) throw error;
        setProject(data as Project);
      } catch (error: any) {
        console.error('Error fetching project:', error);
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
  }, [id, toast]);

  const handleDelete = async () => {
    if (!project || !user) return;
    
    try {
      setIsDeleting(true);
      
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', project.id)
        .eq('user_id', user.id);
        
      if (error) throw error;
      
      toast({
        description: 'Проект успешно удален'
      });
      
      navigate('/projects');
    } catch (error: any) {
      console.error('Error deleting project:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось удалить проект',
        variant: 'destructive'
      });
    } finally {
      setIsDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-grow flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-devhub-purple" />
          <span className="ml-2 text-lg">Загрузка проекта...</span>
        </div>
        <Footer />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-grow flex items-center justify-center flex-col p-4">
          <h2 className="text-2xl font-bold mb-4">Проект не найден</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Запрошенный проект не существует или был удален
          </p>
          <Button onClick={() => navigate('/projects')}>
            Вернуться к списку проектов
          </Button>
        </div>
        <Footer />
      </div>
    );
  }

  const isOwnProject = user && user.id === project.user_id;

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
            <h1 className="text-3xl font-bold mb-2 md:mb-0">{project.title}</h1>
            
            {isOwnProject && (
              <div className="flex space-x-2">
                <Button 
                  variant="outline" 
                  onClick={() => navigate(`/projects/${project.id}/edit`)}
                >
                  Редактировать
                </Button>
                
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive">
                      Удалить
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Удалить проект?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Это действие нельзя отменить. Проект будет безвозвратно удален.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Отмена</AlertDialogCancel>
                      <AlertDialogAction 
                        onClick={handleDelete}
                        className="bg-red-500 hover:bg-red-600"
                        disabled={isDeleting}
                      >
                        {isDeleting ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Удаление...
                          </>
                        ) : (
                          'Удалить'
                        )}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            )}
          </div>
          
          <div className="flex flex-wrap items-center gap-4 mb-6">
            <div className="flex items-center">
              <Avatar className="h-8 w-8 mr-2">
                <AvatarImage src={project.profiles?.avatar_url || undefined} />
                <AvatarFallback>
                  {(project.profiles?.full_name || project.profiles?.username || 'U')
                    .substring(0, 2)
                    .toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <span>{project.profiles?.full_name || project.profiles?.username || 'Неизвестный пользователь'}</span>
            </div>
            
            <div className="flex items-center">
              <span className="text-sm text-gray-600 dark:text-gray-300">
                {format(new Date(project.created_at), 'dd MMMM yyyy', { locale: ru })}
              </span>
            </div>

            <ProjectActions
              projectId={project.id}
            />
          </div>
          
          <Card className="mb-6">
            <CardContent className="pt-6">
              <p className="whitespace-pre-wrap">{project.description}</p>
            </CardContent>
          </Card>
          
          {project.image_url && (
            <Card className="mb-6">
              <CardContent className="p-0">
                <img 
                  src={project.image_url} 
                  alt={project.title}
                  className="w-full h-auto rounded-lg"
                />
              </CardContent>
            </Card>
          )}
          
          <Card className="mb-6">
            <CardContent className="pt-6">
              <h3 className="text-lg font-semibold mb-4">О проекте</h3>
              <div className="whitespace-pre-wrap">{project.content}</div>
            </CardContent>
          </Card>
          
          {project.technologies && project.technologies.length > 0 && (
            <div className="mb-6">
              <p className="text-sm font-medium mb-2">Технологии:</p>
              <div className="flex flex-wrap gap-2">
                {project.technologies.map((tech, index) => (
                  <Badge key={index} variant="secondary">
                    {tech}
                  </Badge>
                ))}
              </div>
            </div>
          )}
          
          <div className="flex gap-4 mb-8">
            {project.github_url && (
              <Button variant="outline" asChild>
                <a href={project.github_url} target="_blank" rel="noopener noreferrer">
                  <Github className="h-4 w-4 mr-2" />
                  GitHub
                </a>
              </Button>
            )}
            
            {project.live_url && (
              <Button variant="outline" asChild>
                <a href={project.live_url} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Демо
                </a>
              </Button>
            )}
          </div>
          
          <CommentSection projectId={project.id} />
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ProjectDetailPage;
