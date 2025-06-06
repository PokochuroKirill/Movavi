
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import Layout from '@/components/Layout';
import UserProfileView from '@/components/UserProfileView';
import { Profile, Project, Snippet } from '@/types/database';
import { fetchProfileById, fetchProfileByUsername, fetchUserProjects, fetchUserSnippets, isFollowingUser, followUser, unfollowUser, fetchFollowers, fetchFollowing, fetchFollowCounts } from '@/hooks/useProfileQueries';

const UserProfilePage = () => {
  const { username } = useParams<{ username: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [profile, setProfile] = useState<Profile | null>(null);
  const [userProjects, setUserProjects] = useState<Project[]>([]);
  const [userSnippets, setUserSnippets] = useState<Snippet[]>([]);
  const [loading, setLoading] = useState(true);
  const [projectsLoading, setProjectsLoading] = useState(true);
  const [snippetsLoading, setSnippetsLoading] = useState(true);

  // Follow functionality
  const [isFollowing, setIsFollowing] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [showFollowers, setShowFollowers] = useState(false);
  const [showFollowing, setShowFollowing] = useState(false);
  const [followers, setFollowers] = useState<Profile[]>([]);
  const [following, setFollowing] = useState<Profile[]>([]);
  const [savedProjects, setSavedProjects] = useState<Project[]>([]);
  const [savedSnippets, setSavedSnippets] = useState<Snippet[]>([]);
  const [savedLoading, setSavedLoading] = useState(false);

  useEffect(() => {
    if (!username) {
      navigate('/');
      return;
    }
    
    const loadProfile = async () => {
      setLoading(true);
      try {
        // First try to find by username
        let profileData: Profile | null = null;
        
        profileData = await fetchProfileByUsername(username);
        
        if (!profileData) {
          // If username not found, try by ID
          profileData = await fetchProfileById(username);
          
          if (!profileData) {
            toast({
              title: 'Error',
              description: 'User profile not found',
              variant: 'destructive'
            });
            navigate('/');
            return;
          }
        }
        
        setProfile(profileData);
        await loadUserData(profileData.id);
      } catch (error: any) {
        console.error('Error loading profile:', error);
        toast({
          title: 'Error',
          description: 'Failed to load user profile',
          variant: 'destructive'
        });
      } finally {
        setLoading(false);
      }
    };
    
    loadProfile();
  }, [username, navigate, toast]);

  const loadUserData = async (profileId: string) => {
    setProjectsLoading(true);
    setSnippetsLoading(true);
    
    try {
      // Check if current user is following this profile
      if (user) {
        const following = await isFollowingUser(user.id, profileId);
        setIsFollowing(following);
      }

      // Get follow counts
      const counts = await fetchFollowCounts(profileId);
      setFollowersCount(counts.followers);
      setFollowingCount(counts.following);

      // Get projects
      const projects = await fetchUserProjects(profileId);
      setUserProjects(projects);

      // Get snippets
      const snippets = await fetchUserSnippets(profileId);
      setUserSnippets(snippets);
      
      // Load saved/favorite items if viewing own profile
      if (user && user.id === profileId) {
        await loadSavedItems(profileId);
      }
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
  
  const handleFollowToggle = async () => {
    if (!user || !profile) {
      toast({
        title: 'Authentication required',
        description: 'Please log in to follow users',
        variant: 'destructive'
      });
      navigate('/auth');
      return;
    }
    
    try {
      let success;
      
      if (isFollowing) {
        success = await unfollowUser(user.id, profile.id);
        if (success) {
          setIsFollowing(false);
          setFollowersCount(prev => prev - 1);
          toast({
            title: 'Unfollowed',
            description: `You are no longer following ${profile.username || 'this user'}`
          });
        }
      } else {
        success = await followUser(user.id, profile.id);
        if (success) {
          setIsFollowing(true);
          setFollowersCount(prev => prev + 1);
          toast({
            title: 'Following',
            description: `You are now following ${profile.username || 'this user'}`
          });
        }
      }
    } catch (error) {
      console.error('Error toggling follow:', error);
      toast({
        title: 'Error',
        description: 'Failed to update follow status',
        variant: 'destructive'
      });
    }
  };
  
  const loadFollowers = async () => {
    if (!profile) return;
    
    try {
      const followersList = await fetchFollowers(profile.id);
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
    if (!profile) return;
    
    try {
      const followingList = await fetchFollowing(profile.id);
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

  if (loading) {
    return (
      <Layout>
        <div className="container max-w-4xl py-24 mt-8">
          <div className="flex justify-center items-center min-h-[400px]">
            <Loader2 className="h-8 w-8 animate-spin text-devhub-purple mr-2" />
            <span className="text-lg">Загрузка профиля...</span>
          </div>
        </div>
      </Layout>
    );
  }

  const isOwnProfile = user && profile && user.id === profile.id;

  return (
    <Layout>
      <div className="container max-w-4xl py-24 mt-8">
        {profile && (
          <UserProfileView 
            profile={profile}
            isOwnProfile={isOwnProfile}
            onEditProfile={() => navigate('/profile')}
            onFollowToggle={handleFollowToggle}
            isFollowing={isFollowing}
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
            projects={userProjects}
            snippets={userSnippets}
            projectsLoading={projectsLoading}
            snippetsLoading={snippetsLoading}
            savedProjects={savedProjects}
            savedSnippets={savedSnippets}
            savedLoading={savedLoading}
          />
        )}
      </div>
    </Layout>
  );
};

export default UserProfilePage;
