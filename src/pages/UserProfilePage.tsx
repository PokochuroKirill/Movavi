
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import Layout from '@/components/Layout';
import UserProfileView from '@/components/UserProfileView';
import { Profile, Project, Snippet } from '@/types/database';
import LoaderSpinner from '@/components/ui/LoaderSpinner';
import { useToast } from '@/hooks/use-toast';

const UserProfilePage = () => {
  const { username } = useParams<{ username: string }>();
  const { user: currentUser } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [snippets, setSnippets] = useState<Snippet[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [showFollowers, setShowFollowers] = useState(false);
  const [showFollowing, setShowFollowing] = useState(false);
  const [followers, setFollowers] = useState<Profile[]>([]);
  const [following, setFollowing] = useState<Profile[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!username) return;

      setLoading(true);
      try {
        // Проверяем, является ли параметр ID или username
        let query = supabase.from('profiles').select('*');
        
        if (username.startsWith('id/')) {
          // Если параметр начинается с 'id/', извлекаем UUID
          const userId = username.replace('id/', '');
          query = query.eq('id', userId);
        } else {
          // Иначе ищем по username
          query = query.eq('username', username);
        }

        const { data: profileData, error: profileError } = await query.single();

        if (profileError) {
          console.error('Profile error:', profileError);
          throw profileError;
        }
        
        setProfile(profileData);

        if (profileData) {
          const [projectsData, snippetsData, followersData, followingData] = await Promise.all([
            supabase
              .from('projects')
              .select(`
                *,
                profiles:user_id(username, full_name, avatar_url)
              `)
              .eq('user_id', profileData.id)
              .order('created_at', { ascending: false }),
            supabase
              .from('snippets')
              .select(`
                *,
                profiles:user_id(username, full_name, avatar_url)
              `)
              .eq('user_id', profileData.id)
              .order('created_at', { ascending: false }),
            supabase.rpc('count_followers', { user_id: profileData.id }),
            supabase.rpc('count_following', { user_id: profileData.id })
          ]);

          // Обрабатываем проекты с автором
          const processedProjects = (projectsData.data || []).map(project => ({
            ...project,
            author: project.profiles?.full_name || project.profiles?.username || 'Неизвестный автор',
            authorAvatar: project.profiles?.avatar_url
          }));

          // Обрабатываем сниппеты с автором
          const processedSnippets = (snippetsData.data || []).map(snippet => ({
            ...snippet,
            author: snippet.profiles?.full_name || snippet.profiles?.username || 'Неизвестный автор',
            authorAvatar: snippet.profiles?.avatar_url
          }));

          setProjects(processedProjects);
          setSnippets(processedSnippets);
          setFollowersCount(followersData.data || 0);
          setFollowingCount(followingData.data || 0);

          if (currentUser) {
            const { data: followData } = await supabase.rpc('check_if_following', {
              follower: currentUser.id,
              following: profileData.id
            });
            setIsFollowing(followData || false);
          }
        }
      } catch (error) {
        console.error('Error fetching user profile:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [username, currentUser]);

  const handleEditProfile = () => {
    // This is not own profile, so no edit functionality
  };

  const handleFollowersClick = async () => {
    // Только владелец профиля может видеть список подписчиков
    if (!currentUser || currentUser.id !== profile?.id) {
      toast({
        title: "Доступ ограничен",
        description: "Только владелец профиля может просматривать список подписчиков",
        variant: "destructive"
      });
      return;
    }

    try {
      const { data: followersData } = await supabase
        .from('user_follows')
        .select(`
          follower_id,
          profiles!user_follows_follower_id_fkey (
            id,
            username,
            full_name,
            avatar_url
          )
        `)
        .eq('following_id', profile?.id);
      
      const followersList = followersData?.map(item => item.profiles).filter(Boolean) || [];
      setFollowers(followersList as any[]);
      setShowFollowers(true);
    } catch (error) {
      console.error('Error loading followers:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось загрузить список подписчиков",
        variant: "destructive"
      });
    }
  };

  const handleFollowingClick = async () => {
    // Только владелец профиля может видеть список подписок
    if (!currentUser || currentUser.id !== profile?.id) {
      toast({
        title: "Доступ ограничен",
        description: "Только владелец профиля может просматривать список подписок",
        variant: "destructive"
      });
      return;
    }

    try {
      const { data: followingData } = await supabase
        .from('user_follows')
        .select(`
          following_id,
          profiles!user_follows_following_id_fkey (
            id,
            username,
            full_name,
            avatar_url
          )
        `)
        .eq('follower_id', profile?.id);
      
      const followingList = followingData?.map(item => item.profiles).filter(Boolean) || [];
      setFollowing(followingList as any[]);
      setShowFollowing(true);
    } catch (error) {
      console.error('Error loading following:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось загрузить список подписок",
        variant: "destructive"
      });
    }
  };

  const handleCloseFollowers = () => {
    setShowFollowers(false);
  };

  const handleCloseFollowing = () => {
    setShowFollowing(false);
  };

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-28">
          <div className="flex justify-center items-center min-h-[400px]">
            <LoaderSpinner size="md" />
          </div>
        </div>
      </Layout>
    );
  }

  if (!profile) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-28">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Пользователь не найден
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Пользователь с таким именем не существует.
            </p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-28">
        <UserProfileView
          profile={profile}
          projects={projects}
          snippets={snippets}
          isFollowing={isFollowing}
          followersCount={followersCount}
          followingCount={followingCount}
          onFollowToggle={async () => {
            if (!currentUser) {
              toast({
                title: "Требуется авторизация",
                description: "Войдите в систему, чтобы подписаться на пользователя",
                variant: "destructive"
              });
              return;
            }

            try {
              const { data, error } = await supabase.rpc('toggle_follow', {
                target_user_id: profile.id
              });

              if (error) throw error;

              setIsFollowing(data);
              setFollowersCount(prev => data ? prev + 1 : prev - 1);
              
              toast({
                description: data ? "Вы подписались на пользователя" : "Вы отписались от пользователя"
              });
            } catch (error: any) {
              console.error('Error toggling follow:', error);
              toast({
                title: "Ошибка",
                description: error.message || "Не удалось изменить статус подписки",
                variant: "destructive"
              });
            }
          }}
          isOwnProfile={currentUser?.id === profile.id}
          onEditProfile={handleEditProfile}
          onFollowersClick={handleFollowersClick}
          onFollowingClick={handleFollowingClick}
          showFollowers={showFollowers}
          showFollowing={showFollowing}
          followers={followers}
          following={following}
          onCloseFollowers={handleCloseFollowers}
          onCloseFollowing={handleCloseFollowing}
          projectsLoading={false}
          snippetsLoading={false}
        />
      </div>
    </Layout>
  );
};

export default UserProfilePage;
