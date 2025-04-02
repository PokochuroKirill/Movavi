
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/use-toast';
import ProjectCard from '@/components/ProjectCard';
import SnippetCard from '@/components/SnippetCard';

type Profile = {
  id: string;
  username: string | null;
  full_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  created_at: string;
};

type Project = {
  id: string;
  title: string;
  description: string;
  technologies: string[] | null;
  created_at: string;
  image_url: string | null;
  author: string;
  authorAvatar?: string;
  likes_count: number;
  comments_count: number;
};

type Snippet = {
  id: string;
  title: string;
  description: string;
  language: string;
  tags: string[] | null;
  created_at: string;
};

const ProfilePage = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [userProjects, setUserProjects] = useState<Project[]>([]);
  const [savedProjects, setSavedProjects] = useState<Project[]>([]);
  const [userSnippets, setUserSnippets] = useState<Snippet[]>([]);
  const [loading, setLoading] = useState(true);
  const [projectsLoading, setProjectsLoading] = useState(true);
  const [snippetsLoading, setSnippetsLoading] = useState(true);
  const [savedProjectsLoading, setSavedProjectsLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    full_name: '',
    bio: '',
  });
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
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user!.id)
        .single();

      if (error) throw error;

      setProfile(data);
      setFormData({
        username: data.username || '',
        full_name: data.full_name || '',
        bio: data.bio || '',
      });
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
      const { data, error } = await supabase
        .from('projects')
        .select(`
          *,
          profiles(username, full_name, avatar_url)
        `)
        .eq('user_id', user!.id);

      if (error) throw error;
      
      const projectsWithCounts = await Promise.all(data.map(async (project) => {
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
        };
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
      const { data, error } = await supabase
        .from('saved_projects')
        .select(`
          project_id
        `)
        .eq('user_id', user!.id);

      if (error) throw error;
      
      if (data.length > 0) {
        const projectIds = data.map(item => item.project_id);
        
        const { data: projectsData, error: projectsError } = await supabase
          .from('projects')
          .select(`
            *,
            profiles(username, full_name, avatar_url)
          `)
          .in('id', projectIds);
          
        if (projectsError) throw projectsError;
        
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
          };
        }));

        setSavedProjects(projectsWithCounts);
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

      setUserSnippets(data);
    } catch (error: any) {
      console.error('Error fetching user snippets:', error.message);
    } finally {
      setSnippetsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdating(true);

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          username: formData.username,
          full_name: formData.full_name,
          bio: formData.bio,
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
    } catch (error: any) {
      console.error('Error updating profile:', error.message);
      toast({
        title: 'Ошибка',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-grow flex items-center justify-center">
          <p>Загрузка профиля...</p>
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

        <Tabs defaultValue="profile" className="w-full max-w-4xl mx-auto">
          <TabsList className="mb-6">
            <TabsTrigger value="profile">Профиль</TabsTrigger>
            <TabsTrigger value="projects">Мои проекты</TabsTrigger>
            <TabsTrigger value="saved-projects">Сохраненные проекты</TabsTrigger>
            <TabsTrigger value="snippets">Мои сниппеты</TabsTrigger>
          </TabsList>
          
          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle>Информация профиля</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="username">Имя пользователя</Label>
                    <Input
                      id="username"
                      name="username"
                      value={formData.username}
                      onChange={handleInputChange}
                      placeholder="username"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="full_name">Полное имя</Label>
                    <Input
                      id="full_name"
                      name="full_name"
                      value={formData.full_name}
                      onChange={handleInputChange}
                      placeholder="Иван Иванов"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="bio">О себе</Label>
                    <Textarea
                      id="bio"
                      name="bio"
                      value={formData.bio}
                      onChange={handleInputChange}
                      placeholder="Расскажите о себе"
                      rows={4}
                    />
                  </div>
                  
                  <div className="pt-4">
                    <Button 
                      type="submit" 
                      className="gradient-bg text-white" 
                      disabled={updating}
                    >
                      {updating ? 'Сохранение...' : 'Сохранить изменения'}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
          
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
                  <p className="text-center py-10 text-gray-500">Загрузка проектов...</p>
                ) : userProjects.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {userProjects.map(project => (
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
                  <p className="text-center py-10 text-gray-500">Загрузка сохраненных проектов...</p>
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
                  <p className="text-center py-10 text-gray-500">Загрузка сниппетов...</p>
                ) : userSnippets.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {userSnippets.map(snippet => (
                      <SnippetCard
                        key={snippet.id}
                        id={snippet.id}
                        title={snippet.title}
                        description={snippet.description}
                        language={snippet.language}
                        tags={snippet.tags || []}
                        createdAt={snippet.created_at}
                      />
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
