
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import Layout from '@/components/Layout';
import UserProfileView from '@/components/UserProfileView';
import { Profile, Project, Snippet } from '@/types/database';
import LoaderSpinner from '@/components/ui/LoaderSpinner';

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

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!username) return;

      setLoading(true);
      try {
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('username', username)
          .single();

        if (profileError) throw profileError;
        setProfile(profileData);

        if (profileData) {
          const [projectsData, snippetsData, followersData, followingData] = await Promise.all([
            supabase
              .from('projects')
              .select('*')
              .eq('user_id', profileData.id)
              .order('created_at', { ascending: false }),
            supabase
              .from('snippets')
              .select('*')
              .eq('user_id', profileData.id)
              .order('created_at', { ascending: false }),
            supabase.rpc('count_followers', { user_id: profileData.id }),
            supabase.rpc('count_following', { user_id: profileData.id })
          ]);

          setProjects(projectsData.data || []);
          setSnippets(snippetsData.data || []);
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

  const handleFollowersClick = () => {
    setShowFollowers(true);
  };

  const handleFollowingClick = () => {
    setShowFollowing(true);
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
        <div className="container mx-auto px-4 py-24">
          <div className="flex justify-center items-center min-h-[400px]">
            <LoaderSpinner size={32} />
          </div>
        </div>
      </Layout>
    );
  }

  if (!profile) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-24">
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
      <div className="container mx-auto px-4 py-24">
        <UserProfileView
          profile={profile}
          projects={projects}
          snippets={snippets}
          isFollowing={isFollowing}
          followersCount={followersCount}
          followingCount={followingCount}
          onFollowToggle={async () => {
            setIsFollowing(!isFollowing);
            setFollowersCount(prev => isFollowing ? prev - 1 : prev + 1);
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
