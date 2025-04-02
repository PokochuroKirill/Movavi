
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import ProjectCard from '@/components/ProjectCard';
import SnippetCard from '@/components/SnippetCard';
import ProfileHeader from '@/components/ProfileHeader';
import EditProfileForm from '@/components/EditProfileForm';
import { Loader2 } from 'lucide-react';
import { Profile, Project, Snippet } from '@/types/database';

const ProfilePage = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [userProjects, setUserProjects] = useState<Project[]>([]);
  const [savedProjects, setSavedProjects] = useState<Project[]>([]);
  const [userSnippets, setUserSnippets] = useState<Snippet[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [projectsLoading, setProjectsLoading] = useState(true);
  const [snippetsLoading, setSnippetsLoading] = useState(true);
  const [savedProjectsLoading, setSavedProjectsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      fetchProfile();
      fetchUserProjects();
      fetchUserSnippets();
      fetchSavedProjects();
    }
  }, [user]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user!.id)
        .single();

      if (error) throw error;
      setProfile(data as Profile);
    } catch (error: any) {
      console.error('Error fetching profile:', error.message);
      toast({
        title: 'Ошибка',
        description: 'Не удалось загрузить профиль',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchUserProjects = async () => {
    setProjectsLoading(true);
    try {
      const { data: projectsData, error: projectsError } = await supabase
        .from('projects')
        .select(`
          *,
          profiles:user_id(username, full_name, avatar_url)
        `)
        .eq('user_id', user!.id);

      if (projectsError) throw projectsError;
      
      if (!projectsData) {
        setUserProjects([]);
        return;
      }
      
      const projectsWithCounts = await Promise.all(projectsData.map(async (project) => {
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
          author: project.profiles?.full_name || project.profiles?.username || 'Неизвестный автор',
          authorAvatar: project.profiles?.avatar_url,
          likes_count: likesCount || 0,
          comments_count: commentsCount || 0
        } as Project;
      }));

      setUserProjects(projectsWithCounts);
    } catch (error: any) {
      console.error('Error fetching user projects:', error.message);
    } finally {
      setProjectsLoading(false);
    }
  };

  const fetchSavedProjects = async () => {
    setSavedProjectsLoading(true);
    try {
      const { data: savedData, error: savedError } = await supabase
        .from('saved_projects')
        .select('project_id')
        .eq('user_id', user!.id);

      if (savedError) throw savedError;
      
      if (savedData && savedData.length > 0) {
        const projectIds = savedData.map(item => item.project_id);
        
        const { data: projectsData, error: projectsError } = await supabase
          .from('projects')
          .select(`
            *,
            profiles:user_id(username, full_name, avatar_url)
          `)
          .in('id', projectIds);
          
        if (projectsError) throw projectsError;
        
        if (!projectsData) {
          setSavedProjects([]);
          return;
        }
        
        const projectsWithCounts = await Promise.all(projectsData.map(async (project) => {
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
            author: project.profiles?.full_name || project.profiles?.username || 'Неизвестный автор',
            authorAvatar: project.profiles?.avatar_url,
            likes_count: likesCount || 0,
            comments_count: commentsCount || 0
          } as Project;
        }));

        setSavedProjects(projectsWithCounts);
      } else {
        setSavedProjects([]);
      }
    } catch (error: any) {
      console.error('Error fetching saved projects:', error.message);
    } finally {
      setSavedProjectsLoading(false);
    }
  };

  const fetchUserSnippets = async () => {
    setSnippetsLoading(true);
    try {
      const { data, error } = await supabase
        .from('snippets')
        .select('*')
        .eq('user_id', user!.id);

      if (error) throw error;

      setUserSnippets(data || []);
    } catch (error: any) {
      console.error('Error fetching user snippets:', error.message);
    } finally {
      setSnippetsLoading(false);
    }
  };

  const handleUpdateProfile = async (updatedData: Partial<Profile>) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          ...updatedData,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user!.id);

      if (error) throw error;

      toast({
        title: 'Успех',
        description: 'Профиль успешно обновлен',
      });
      
      // Обновляем данные профиля
      fetchProfile();
      setIsEditing(false);
    } catch (error: any) {
      console.error('Error updating profile:', error.message);
      toast({
        title: 'Ошибка',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handleDeleteProject = async (projectId: string) => {
    try {
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', projectId)
        .eq('user_id', user!.id);
      
      if (error) throw error;
      
      toast({
        description: 'Проект успешно удален'
      });
      
      // Обновляем список проектов
      fetchUserProjects();
    } catch (error: any) {
      console.error('Error deleting project:', error.message);
      toast({
        title: 'Ошибка',
        description: 'Не удалось удалить проект',
        variant: 'destructive'
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-grow flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-devhub-purple" />
          <span className="ml-2 text-lg">Загрузка профиля...</span>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-grow container mx-auto px-4 py-20">
        <h1 className="text-3xl font-bold mb-8 mt-8">Личный кабинет</h1>

        {profile && !isEditing && (
          <ProfileHeader 
            profile={profile} 
            isCurrentUser={true} 
            onEditClick={() => setIsEditing(true)} 
          />
        )}

        {profile && isEditing && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Редактирование профиля</CardTitle>
            </CardHeader>
            <CardContent>
              <EditProfileForm 
                profile={profile} 
                onUpdate={handleUpdateProfile} 
              />
            </CardContent>
          </Card>
        )}

        <Tabs defaultValue="projects" className="w-full max-w-4xl mx-auto">
          <TabsList className="mb-6">
            <TabsTrigger value="projects">Мои проекты</TabsTrigger>
            <TabsTrigger value="saved-projects">Сохраненные проекты</TabsTrigger>
            <TabsTrigger value="snippets">Мои сниппеты</TabsTrigger>
          </TabsList>
          
          {/* Tab Content */}
          <TabsContent value="projects">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Мои проекты</CardTitle>
                <Link to="/projects/create">
                  <Button className="gradient-bg text-white">
                    Создать проект
                  </Button>
                </Link>
              </CardHeader>
              <CardContent>
                {projectsLoading ? (
                  <p className="text-center py-10 text-gray-500">
                    <Loader2 className="h-8 w-8 animate-spin text-devhub-purple mx-auto mb-2" />
                    Загрузка проектов...
                  </p>
                ) : userProjects.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {userProjects.map(project => (
                      <div key={project.id} className="relative">
                        <ProjectCard
                          id={project.id}
                          title={project.title}
                          description={project.description}
                          technologies={project.technologies || []}
                          author={project.author}
                          authorAvatar={project.authorAvatar}
                          imageUrl={project.image_url || undefined}
                          likes={project.likes_count}
                          comments={project.comments_count}
                        />
                        <Button 
                          variant="destructive"
                          size="sm"
                          className="absolute top-2 right-2"
                          onClick={() => handleDeleteProject(project.id)}
                        >
                          Удалить
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-10">
                    <p className="text-muted-foreground mb-4">
                      У вас пока нет проектов. Создайте свой первый проект!
                    </p>
                    <Link to="/projects/create">
                      <Button className="gradient-bg text-white">
                        Создать проект
                      </Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="saved-projects">
            <Card>
              <CardHeader>
                <CardTitle>Сохраненные проекты</CardTitle>
              </CardHeader>
              <CardContent>
                {savedProjectsLoading ? (
                  <p className="text-center py-10 text-gray-500">
                    <Loader2 className="h-8 w-8 animate-spin text-devhub-purple mx-auto mb-2" />
                    Загрузка сохраненных проектов...
                  </p>
                ) : savedProjects.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {savedProjects.map(project => (
                      <ProjectCard
                        key={project.id}
                        id={project.id}
                        title={project.title}
                        description={project.description}
                        technologies={project.technologies || []}
                        author={project.author}
                        authorAvatar={project.authorAvatar}
                        imageUrl={project.image_url || undefined}
                        likes={project.likes_count}
                        comments={project.comments_count}
                      />
                    ))}
                  </div>
                ) : (
                  <p className="text-center py-10 text-gray-500">
                    У вас нет сохраненных проектов. Нажмите на иконку закладки на странице проекта, чтобы сохранить его.
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="snippets">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Мои сниппеты</CardTitle>
                <Link to="/snippets/create">
                  <Button className="gradient-bg text-white">
                    Создать сниппет
                  </Button>
                </Link>
              </CardHeader>
              <CardContent>
                {snippetsLoading ? (
                  <p className="text-center py-10 text-gray-500">
                    <Loader2 className="h-8 w-8 animate-spin text-devhub-purple mx-auto mb-2" />
                    Загрузка сниппетов...
                  </p>
                ) : userSnippets.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {userSnippets.map(snippet => (
                      <div key={snippet.id} className="relative">
                        <SnippetCard
                          id={snippet.id}
                          title={snippet.title}
                          description={snippet.description}
                          language={snippet.language}
                          tags={snippet.tags || []}
                          created_at={snippet.created_at}
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-10">
                    <p className="text-muted-foreground mb-4">
                      У вас пока нет сниппетов. Создайте свой первый сниппет!
                    </p>
                    <Link to="/snippets/create">
                      <Button className="gradient-bg text-white">
                        Создать сниппет
                      </Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
      <Footer />
    </div>
  );
};

export default ProfilePage;
