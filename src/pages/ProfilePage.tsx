import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import Layout from '@/components/Layout';
import UserProfileView from '@/components/UserProfileView';
import EditProfileForm from '@/components/EditProfileForm';
import { fetchProfileById, fetchUserProjects, fetchUserSnippets, fetchFollowers, fetchFollowing, fetchFollowCounts } from '@/hooks/useProfileQueries';
import { Profile, Project, Snippet } from '@/types/database';

const ProfilePage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [followers, setFollowers] = useState<Profile[]>([]);
  const [following, setFollowing] = useState<Profile[]>([]);
  const [showFollowers, setShowFollowers] = useState(false);
  const [showFollowing, setShowFollowing] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [projects, setProjects] = useState<Project[]>([]);
  const [snippets, setSnippets] = useState<Snippet[]>([]);
  const [projectsLoading, setProjectsLoading] = useState(true);
  const [snippetsLoading, setSnippetsLoading] = useState(true);
  const [savedProjects, setSavedProjects] = useState<Project[]>([]);
  const [savedSnippets, setSavedSnippets] = useState<Snippet[]>([]);
  const [savedLoading, setSavedLoading] = useState(false);
  
  const { 
    data: profile, 
    isLoading, 
    error, 
    refetch 
  } = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: () => fetchProfileById(user?.id || ''),
    enabled: !!user?.id
  });

  useEffect(() => {
    if (user?.id && profile) {
      loadUserData(user.id);
    }
  }, [user, profile]);

  const loadUserData = async (userId: string) => {
    setProjectsLoading(true);
    setSnippetsLoading(true);
    setSavedLoading(true);
    
    try {
      // Get follow counts
      const counts = await fetchFollowCounts(userId);
      setFollowersCount(counts.followers);
      setFollowingCount(counts.following);

      // Get projects
      const userProjects = await fetchUserProjects(userId);
      setProjects(userProjects);

      // Get snippets
      const userSnippets = await fetchUserSnippets(userId);
      setSnippets(userSnippets);
      
      // Get saved/favorite items
      await loadSavedItems(userId);
      
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setProjectsLoading(false);
      setSnippetsLoading(false);
    }
  };
  
  const loadSavedItems = async (userId: string) => {
    setSavedLoading(true);
    try {
      // Get saved projects
      const { data: savedProjectsData } = await supabase
        .from('saved_projects')
        .select(`
          project_id,
          projects:project_id (
            *,
            profiles:user_id (
              username,
              full_name,
              avatar_url
            )
          )
        `)
        .eq('user_id', userId);
        
      // Get saved snippets
      const { data: savedSnippetsData } = await supabase
        .from('saved_snippets')
        .select(`
          snippet_id,
          snippets:snippet_id (
            *,
            profiles:user_id (
              username,
              full_name,
              avatar_url
            )
          )
        `)
        .eq('user_id', userId);
      
      const projects = savedProjectsData?.map(item => item.projects) || [];
      const snippets = savedSnippetsData?.map(item => item.snippets) || [];
      
      setSavedProjects(projects as Project[]);
      setSavedSnippets(snippets as Snippet[]);
    } catch (error) {
      console.error("Error loading saved items:", error);
    } finally {
      setSavedLoading(false);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleProfileUpdate = async (data?: Partial<Profile>) => {
    try {
      if (data && user) {
        const { error } = await supabase
          .from('profiles')
          .update(data)
          .eq('id', user.id);

        if (error) throw error;

        toast({
          title: "Профиль обновлен",
          description: "Ваш профиль был успешно обновлен"
        });
        
        await refetch();
      }
      setIsEditing(false);
    } catch (error: any) {
      toast({
        title: "Ошибка",
        description: error.message || "Не удалось обновить профиль",
        variant: "destructive"
      });
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
  };
  
  const loadFollowers = async () => {
    if (!user) return;
    
    try {
      const followersList = await fetchFollowers(user.id);
      setFollowers(followersList);
      setShowFollowers(true);
      setShowFollowing(false);
    } catch (error) {
      console.error('Error loading followers:', error);
      toast({
        title: 'Error',
        description: 'Failed to load followers',
        variant: 'destructive'
      });
    }
  };
  
  const loadFollowing = async () => {
    if (!user) return;
    
    try {
      const followingList = await fetchFollowing(user.id);
      setFollowing(followingList);
      setShowFollowing(true);
      setShowFollowers(false);
    } catch (error) {
      console.error('Error loading following:', error);
      toast({
        title: 'Error',
        description: 'Failed to load following',
        variant: 'destructive'
      });
    }
  };

  const handleDeleteProject = async (projectId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', projectId)
        .eq('user_id', user.id);

      if (error) throw error;

      // Обновляем список проектов
      setProjects(projects.filter(project => project.id !== projectId));
      
      toast({
        title: "Проект удален",
        description: "Ваш проект был успешно удален"
      });
    } catch (error: any) {
      toast({
        title: "Ошибка",
        description: error.message || "Не удалось удалить проект",
        variant: "destructive"
      });
    }
  };

  const handleDeleteSnippet = async (snippetId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('snippets')
        .delete()
        .eq('id', snippetId)
        .eq('user_id', user.id);

      if (error) throw error;

      // Обновляем список сниппетов
      setSnippets(snippets.filter(snippet => snippet.id !== snippetId));
      
      toast({
        title: "Сниппет удален",
        description: "Ваш сниппет был успешно удален"
      });
    } catch (error: any) {
      toast({
        title: "Ошибка",
        description: error.message || "Не удалось удалить сниппет",
        variant: "destructive"
      });
    }
  };

  if (isLoading) {
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

  if (error || !profile) {
    return (
      <Layout>
        <div className="container max-w-4xl py-24 mt-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-red-600">Ошибка загрузки профиля</h1>
            <p className="text-gray-600 mt-2">Попробуйте обновить страницу</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container max-w-4xl py-24 mt-8">
        {isEditing ? (
          <EditProfileForm 
            profile={profile}
            onSave={handleProfileUpdate}
            onCancel={handleCancel}
          />
        ) : (
          <UserProfileView 
            profile={profile}
            isOwnProfile={true}
            onEditProfile={handleEdit}
            followersCount={followersCount}
            followingCount={followingCount}
            onFollowersClick={loadFollowers}
            onFollowingClick={loadFollowing}
            showFollowers={showFollowers}
            showFollowing={showFollowing}
            followers={followers}
            following={following}
            onCloseFollowers={() => setShowFollowers(false)}
            onCloseFollowing={() => setShowFollowing(false)}
            projects={projects}
            snippets={snippets}
            projectsLoading={projectsLoading}
            snippetsLoading={snippetsLoading}
            savedProjects={savedProjects}
            savedSnippets={savedSnippets}
            savedLoading={savedLoading}
            onDeleteProject={handleDeleteProject}
            onDeleteSnippet={handleDeleteSnippet}
          />
        )}
      </div>
    </Layout>
  );
};

export default ProfilePage;
