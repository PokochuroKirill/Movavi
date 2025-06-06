
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import EditProfileForm from '@/components/EditProfileForm';
import ProjectCard from '@/components/ProjectCard';
import SnippetCard from '@/components/SnippetCard';
import { supabase } from '@/integrations/supabase/client';
import { Profile, Project, Snippet } from '@/types/database';
import { formatDate } from '@/utils/dateUtils';
import { useToast } from '@/hooks/use-toast';

const ProfilePage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [snippets, setSnippets] = useState<Snippet[]>([]);
  const [savedProjects, setSavedProjects] = useState<Project[]>([]);
  const [savedSnippets, setSavedSnippets] = useState<Snippet[]>([]);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    fetchUserData();
  }, [user, navigate]);

  const fetchUserData = async () => {
    if (!user) return;

    try {
      // Получаем профиль пользователя
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileError) throw profileError;
      setProfile(profileData);

      // Получаем проекты пользователя
      const { data: projectsData, error: projectsError } = await supabase
        .from('projects')
        .select(`
          *,
          profiles:user_id (
            username,
            full_name,
            avatar_url
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (projectsError) throw projectsError;
      setProjects(projectsData || []);

      // Получаем сниппеты пользователя
      const { data: snippetsData, error: snippetsError } = await supabase
        .from('snippets')
        .select(`
          *,
          profiles:user_id (
            username,
            full_name,
            avatar_url
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (snippetsError) throw snippetsError;
      setSnippets(snippetsData || []);

      // Получаем сохраненные проекты
      const { data: savedProjectsData, error: savedProjectsError } = await supabase
        .from('saved_projects')
        .select(`
          projects (
            *,
            profiles:user_id (
              username,
              full_name,
              avatar_url
            )
          )
        `)
        .eq('user_id', user.id);

      if (savedProjectsError) throw savedProjectsError;
      setSavedProjects(savedProjectsData?.map(item => item.projects).filter(Boolean) || []);

      // Получаем сохраненные сниппеты
      const { data: savedSnippetsData, error: savedSnippetsError } = await supabase
        .from('saved_snippets')
        .select(`
          snippets (
            *,
            profiles:user_id (
              username,
              full_name,
              avatar_url
            )
          )
        `)
        .eq('user_id', user.id);

      if (savedSnippetsError) throw savedSnippetsError;
      setSavedSnippets(savedSnippetsData?.map(item => item.snippets).filter(Boolean) || []);

    } catch (error: any) {
      console.error('Error fetching user data:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось загрузить данные профиля',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEditProfile = () => {
    setEditMode(!editMode);
  };

  const handleProfileUpdate = () => {
    setEditMode(false);
    fetchUserData();
    toast({
      title: 'Профиль обновлен',
      description: 'Ваш профиль был успешно обновлен'
    });
  };

  if (loading) {
    return (
      <Layout>
        <div className="container max-w-4xl py-24 mt-8">
          <div className="flex justify-center items-center min-h-[400px]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!profile) {
    return (
      <Layout>
        <div className="container max-w-4xl py-24 mt-8">
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Профиль не найден
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Не удалось загрузить данные профиля
            </p>
          </div>
        </div>
      </Layout>
    );
  }

  if (editMode) {
    return (
      <Layout>
        <div className="container max-w-4xl py-24 mt-8">
          <Card>
            <CardHeader>
              <CardTitle>Редактировать профиль</CardTitle>
            </CardHeader>
            <CardContent>
              <EditProfileForm
                profile={profile}
                onUpdate={handleProfileUpdate}
                onCancel={() => setEditMode(false)}
              />
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container max-w-6xl py-24 mt-8">
        <div className="space-y-6">
          {/* Профиль пользователя */}
          <Card className="overflow-hidden">
            <div 
              className="h-48 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 relative"
              style={{
                backgroundImage: profile.banner_url ? `url(${profile.banner_url})` : undefined,
                backgroundSize: 'cover',
                backgroundPosition: 'center'
              }}
            >
              <div className="absolute inset-0 bg-black/30" />
            </div>
            
            <CardHeader className="relative pb-6">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                <div className="flex flex-col md:flex-row items-start gap-4">
                  <div className="w-24 h-24 rounded-full bg-white shadow-lg -mt-12 relative z-10 overflow-hidden border-4 border-white">
                    {profile.avatar_url ? (
                      <img 
                        src={profile.avatar_url} 
                        alt={profile.full_name || profile.username || ''} 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-2xl font-bold">
                        {(profile.full_name || profile.username || 'U').charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-3 flex-1">
                    <div>
                      <CardTitle className="text-3xl text-gray-900 dark:text-white mb-2">
                        {profile.full_name || profile.username}
                      </CardTitle>
                      {profile.username && profile.full_name && (
                        <p className="text-gray-600 dark:text-gray-400 mb-2">@{profile.username}</p>
                      )}
                      {profile.bio && (
                        <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                          {profile.bio}
                        </p>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                      <span>Зарегистрирован {formatDate(profile.created_at)}</span>
                    </div>

                    <div className="flex gap-6 text-sm">
                      <div>
                        <span className="font-semibold text-gray-900 dark:text-white">{projects.length}</span>
                        <span className="text-gray-500 dark:text-gray-400 ml-1">проектов</span>
                      </div>
                      <div>
                        <span className="font-semibold text-gray-900 dark:text-white">{snippets.length}</span>
                        <span className="text-gray-500 dark:text-gray-400 ml-1">сниппетов</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button onClick={handleEditProfile} className="gap-2">
                    Редактировать профиль
                  </Button>
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Вкладки с контентом */}
          <Tabs defaultValue="projects" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="projects">Мои проекты ({projects.length})</TabsTrigger>
              <TabsTrigger value="snippets">Мои сниппеты ({snippets.length})</TabsTrigger>
              <TabsTrigger value="saved-projects">Сохраненные проекты ({savedProjects.length})</TabsTrigger>
              <TabsTrigger value="saved-snippets">Сохраненные сниппеты ({savedSnippets.length})</TabsTrigger>
            </TabsList>
            
            <TabsContent value="projects" className="space-y-6">
              {projects.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center">
                    <p className="text-gray-500 dark:text-gray-400 mb-4">
                      У вас пока нет проектов
                    </p>
                    <Button onClick={() => navigate('/projects/create')}>
                      Создать первый проект
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {projects.map((project) => (
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
            </TabsContent>
            
            <TabsContent value="snippets" className="space-y-6">
              {snippets.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center">
                    <p className="text-gray-500 dark:text-gray-400 mb-4">
                      У вас пока нет сниппетов
                    </p>
                    <Button onClick={() => navigate('/snippets/create')}>
                      Создать первый сниппет
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {snippets.map((snippet) => (
                    <SnippetCard
                      key={snippet.id}
                      id={snippet.id}
                      title={snippet.title}
                      description={snippet.description}
                      language={snippet.language}
                      tags={snippet.tags || []}
                      author={snippet.profiles?.full_name || snippet.profiles?.username || 'Аноним'}
                      authorAvatar={snippet.profiles?.avatar_url}
                      authorId={snippet.user_id}
                      authorUsername={snippet.profiles?.username}
                    />
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="saved-projects" className="space-y-6">
              {savedProjects.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center">
                    <p className="text-gray-500 dark:text-gray-400">
                      У вас пока нет сохраненных проектов
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {savedProjects.map((project: any) => (
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
            </TabsContent>

            <TabsContent value="saved-snippets" className="space-y-6">
              {savedSnippets.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center">
                    <p className="text-gray-500 dark:text-gray-400">
                      У вас пока нет сохраненных сниппетов
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {savedSnippets.map((snippet: any) => (
                    <SnippetCard
                      key={snippet.id}
                      id={snippet.id}
                      title={snippet.title}
                      description={snippet.description}
                      language={snippet.language}
                      tags={snippet.tags || []}
                      author={snippet.profiles?.full_name || snippet.profiles?.username || 'Аноним'}
                      authorAvatar={snippet.profiles?.avatar_url}
                      authorId={snippet.user_id}
                      authorUsername={snippet.profiles?.username}
                    />
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </Layout>
  );
};

export default ProfilePage;
