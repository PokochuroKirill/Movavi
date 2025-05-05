
import React, { useState, useEffect } from 'react';
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
  const [favoriteItems, setFavoriteItems] = useState<{projects: Project[], snippets: Snippet[]}>(
    {projects: [], snippets: []}
  );
  const [userSnippets, setUserSnippets] = useState<Snippet[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [projectsLoading, setProjectsLoading] = useState(true);
  const [snippetsLoading, setSnippetsLoading] = useState(true);
  const [favoritesLoading, setFavoritesLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      fetchProfile();
      fetchUserProjects();
      fetchUserSnippets();
      fetchFavorites();
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
        const { data: likesCount } = await supabase
          .rpc('get_project_likes_count', { project_id: project.id });
        
        const { count: commentsCount } = await supabase
          .from('comments')
          .select('id', { count: 'exact', head: true })
          .eq('project_id', project.id);
        
        return {
          ...project,
          author: project.profiles?.full_name || project.profiles?.username || 'Неизвестный автор',
          authorAvatar: project.profiles?.avatar_url,
          likes: likesCount || 0,
          comments: commentsCount || 0
        } as Project;
      }));

      setUserProjects(projectsWithCounts);
    } catch (error: any) {
      console.error('Error fetching user projects:', error.message);
    } finally {
      setProjectsLoading(false);
    }
  };

  const fetchFavorites = async () => {
    setFavoritesLoading(true);
    try {
      // Fetch favorite projects
      const { data: savedProjectsData, error: savedProjectsError } = await supabase
        .from('saved_projects')
        .select('project_id')
        .eq('user_id', user!.id);

      if (savedProjectsError) throw savedProjectsError;
      
      // Fetch favorite snippets
      const { data: savedSnippetsData, error: savedSnippetsError } = await supabase
        .from('saved_snippets')
        .select('snippet_id')
        .eq('user_id', user!.id);
        
      if (savedSnippetsError) throw savedSnippetsError;
      
      const favoriteProjects: Project[] = [];
      const favoriteSnippets: Snippet[] = [];
      
      // Get project details
      if (savedProjectsData && savedProjectsData.length > 0) {
        const projectIds = savedProjectsData.map(item => item.project_id);
        
        const { data: projectsData, error: projectsError } = await supabase
          .from('projects')
          .select(`
            *,
            profiles:user_id(username, full_name, avatar_url)
          `)
          .in('id', projectIds);
          
        if (projectsError) throw projectsError;
        
        if (projectsData) {
          const projectsWithCounts = await Promise.all(projectsData.map(async (project) => {
            const { data: likesCount } = await supabase
              .rpc('get_project_likes_count', { project_id: project.id });
            
            const { count: commentsCount } = await supabase
              .from('comments')
              .select('id', { count: 'exact', head: true })
              .eq('project_id', project.id);
            
            return {
              ...project,
              author: project.profiles?.full_name || project.profiles?.username || 'Неизвестный автор',
              authorAvatar: project.profiles?.avatar_url,
              likes: likesCount || 0,
              comments: commentsCount || 0
            } as Project;
          }));
          
          favoriteProjects.push(...projectsWithCounts);
        }
      }
      
      // Get snippet details
      if (savedSnippetsData && savedSnippetsData.length > 0) {
        const snippetIds = savedSnippetsData.map(item => item.snippet_id);
        
        const { data: snippetsData, error: snippetsError } = await supabase
          .from('snippets')
          .select(`
            *,
            profiles:user_id(username, full_name, avatar_url)
          `)
          .in('id', snippetIds);
          
        if (snippetsError) throw snippetsError;
        
        if (snippetsData) {
          const snippetsWithCounts = await Promise.all(snippetsData.map(async (snippet) => {
            const { data: likesCount } = await supabase
              .rpc('get_snippet_likes_count', { snippet_id: snippet.id });
            
            const { count: commentsCount } = await supabase
              .from('snippet_comments')
              .select('id', { count: 'exact', head: true })
              .eq('snippet_id', snippet.id);
            
            return {
              ...snippet,
              author: snippet.profiles?.full_name || snippet.profiles?.username || 'Неизвестный автор',
              authorAvatar: snippet.profiles?.avatar_url,
              likes: likesCount || 0,
              comments: commentsCount || 0
            } as Snippet;
          }));
          
          favoriteSnippets.push(...snippetsWithCounts);
        }
      }
      
      setFavoriteItems({
        projects: favoriteProjects,
        snippets: favoriteSnippets
      });
    } catch (error: any) {
      console.error('Error fetching favorites:', error.message);
    } finally {
      setFavoritesLoading(false);
    }
  };

  const fetchUserSnippets = async () => {
    setSnippetsLoading(true);
    try {
      const { data, error } = await supabase
        .from('snippets')
        .select(`
          *,
          profiles:user_id(username, full_name, avatar_url)
        `)
        .eq('user_id', user!.id);

      if (error) throw error;

      if (!data) {
        setUserSnippets([]);
        return;
      }
      
      const snippetsWithCounts = await Promise.all(data.map(async (snippet) => {
        const { data: likesCount } = await supabase
          .rpc('get_snippet_likes_count', { snippet_id: snippet.id });
        
        const { count: commentsCount } = await supabase
          .from('snippet_comments')
          .select('id', { count: 'exact', head: true })
          .eq('snippet_id', snippet.id);
        
        return {
          ...snippet,
          author: snippet.profiles?.full_name || snippet.profiles?.username || 'Неизвестный автор',
          authorAvatar: snippet.profiles?.avatar_url,
          likes: likesCount || 0,
          comments: commentsCount || 0
        } as Snippet;
      }));
      
      setUserSnippets(snippetsWithCounts);
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
      
      fetchUserProjects();
      fetchFavorites();
    } catch (error: any) {
      console.error('Error deleting project:', error.message);
      toast({
        title: 'Ошибка',
        description: 'Не удалось удалить проект',
        variant: 'destructive'
      });
    }
  };
  
  const handleDeleteSnippet = async (snippetId: string) => {
    try {
      const { error } = await supabase
        .from('snippets')
        .delete()
        .eq('id', snippetId)
        .eq('user_id', user!.id);
      
      if (error) throw error;
      
      toast({
        description: 'Сниппет успешно удален'
      });
      
      fetchUserSnippets();
      fetchFavorites();
    } catch (error: any) {
      console.error('Error deleting snippet:', error.message);
      toast({
        title: 'Ошибка',
        description: 'Не удалось удалить сниппет',
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

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-5">
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
          </div>

          <div className="lg:col-span-7">
            <Tabs defaultValue="projects" className="w-full">
              <TabsList className="mb-6">
                <TabsTrigger value="projects">Мои проекты</TabsTrigger>
                <TabsTrigger value="favorites">Избранное</TabsTrigger>
                <TabsTrigger value="snippets">Мои сниппеты</TabsTrigger>
              </TabsList>
              
              <TabsContent value="projects">
                <Card>
                  <CardHeader>
                    <CardTitle>Мои проекты</CardTitle>
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
                              author={project.author || ''}
                              authorAvatar={project.authorAvatar || ''}
                              imageUrl={project.image_url || undefined}
                              likes={project.likes}
                              comments={project.comments}
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
                      <p className="text-center py-10 text-gray-500">
                        У вас пока нет проектов. Вы можете создать проект на странице проектов.
                      </p>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="favorites">
                <Card>
                  <CardHeader>
                    <CardTitle>Избранное</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {favoritesLoading ? (
                      <p className="text-center py-10 text-gray-500">
                        <Loader2 className="h-8 w-8 animate-spin text-devhub-purple mx-auto mb-2" />
                        Загрузка избранного...
                      </p>
                    ) : (favoriteItems.projects.length > 0 || favoriteItems.snippets.length > 0) ? (
                      <>
                        {favoriteItems.projects.length > 0 && (
                          <>
                            <h3 className="text-lg font-semibold mb-4">Проекты</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                              {favoriteItems.projects.map(project => (
                                <ProjectCard
                                  key={project.id}
                                  id={project.id}
                                  title={project.title}
                                  description={project.description}
                                  technologies={project.technologies || []}
                                  author={project.author || ''}
                                  authorAvatar={project.authorAvatar || ''}
                                  imageUrl={project.image_url || undefined}
                                  likes={project.likes}
                                  comments={project.comments}
                                />
                              ))}
                            </div>
                          </>
                        )}
                        
                        {favoriteItems.snippets.length > 0 && (
                          <>
                            <h3 className="text-lg font-semibold mb-4">Сниппеты</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              {favoriteItems.snippets.map(snippet => (
                                <SnippetCard
                                  key={snippet.id}
                                  id={snippet.id}
                                  title={snippet.title}
                                  description={snippet.description}
                                  language={snippet.language}
                                  tags={snippet.tags || []}
                                  created_at={snippet.created_at}
                                />
                              ))}
                            </div>
                          </>
                        )}
                      </>
                    ) : (
                      <p className="text-center py-10 text-gray-500">
                        У вас нет избранных элементов. Нажмите на иконку закладки на странице проекта или сниппета, чтобы добавить их в избранное.
                      </p>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="snippets">
                <Card>
                  <CardHeader>
                    <CardTitle>Мои сниппеты</CardTitle>
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
                            <Button 
                              variant="destructive"
                              size="sm"
                              className="absolute top-2 right-2"
                              onClick={() => handleDeleteSnippet(snippet.id)}
                            >
                              Удалить
                            </Button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-center py-10 text-gray-500">
                        У вас пока нет сниппетов. Вы можете создать сниппет на странице сниппетов.
                      </p>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default ProfilePage;
