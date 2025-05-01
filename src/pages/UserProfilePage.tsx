
// Fix type errors by explicitly casting data to Profile
import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, Users } from 'lucide-react';
import ProjectCard from '@/components/ProjectCard';
import SnippetCard from '@/components/SnippetCard';
import ProfileHeader from '@/components/ProfileHeader';
import { Profile, Project, Snippet } from '@/types/database';
import {
  fetchProfileById,
  fetchUserProjects,
  fetchUserSnippets,
  isFollowingUser,
  followUser,
  unfollowUser,
  fetchFollowers,
  fetchFollowing,
  fetchFollowCounts
} from '@/hooks/useProfileQueries';
import { useToast } from '@/hooks/use-toast';

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

  useEffect(() => {
    if (!username) {
      navigate('/');
      return;
    }
    
    const loadProfile = async () => {
      setLoading(true);
      try {
        // First try to find by username
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('username', username)
          .single();

        if (error) {
          // If username not found, try by ID
          const { data: idData, error: idError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', username)
            .single();
            
          if (idError) {
            toast({
              title: 'Error',
              description: 'User profile not found',
              variant: 'destructive',
            });
            navigate('/');
            return;
          }
          
          setProfile(idData as Profile);
          await loadUserData(idData.id);
        } else {
          setProfile(data as Profile);
          await loadUserData(data.id);
        }
      } catch (error: any) {
        console.error('Error loading profile:', error);
        toast({
          title: 'Error',
          description: 'Failed to load user profile',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };
    
    loadProfile();
  }, [username, navigate]);

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
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setProjectsLoading(false);
      setSnippetsLoading(false);
    }
  };

  const handleFollowToggle = async () => {
    if (!user || !profile) {
      toast({
        title: 'Authentication required',
        description: 'Please log in to follow users',
        variant: 'destructive',
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
        variant: 'destructive',
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
        variant: 'destructive',
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
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-grow flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-devhub-purple" />
          <span className="ml-2 text-lg">Loading profile...</span>
        </div>
        <Footer />
      </div>
    );
  }

  const isOwnProfile = user && profile && user.id === profile.id;

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-grow container mx-auto px-4 py-20">
        <h1 className="text-3xl font-bold mb-8 mt-8">User Profile</h1>

        {profile && (
          <div className="mb-8">
            <ProfileHeader 
              profile={profile} 
              isCurrentUser={isOwnProfile} 
              onEditClick={() => navigate('/profile')} 
              followersCount={followersCount}
              followingCount={followingCount}
              onFollowersClick={loadFollowers}
              onFollowingClick={loadFollowing}
            />
            
            {!isOwnProfile && user && (
              <div className="flex justify-end mt-4">
                <Button 
                  onClick={handleFollowToggle} 
                  variant={isFollowing ? "outline" : "default"}
                  className={isFollowing ? "" : "gradient-bg text-white"}
                >
                  {isFollowing ? "Unfollow" : "Follow"}
                </Button>
              </div>
            )}
          </div>
        )}
        
        {showFollowers && (
          <Card className="mb-8">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Followers ({followers.length})</CardTitle>
              <Button variant="outline" onClick={() => setShowFollowers(false)}>Close</Button>
            </CardHeader>
            <CardContent>
              {followers.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {followers.map(follower => (
                    <Link key={follower.id} to={`/user/${follower.username || follower.id}`}>
                      <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                        <div className="w-12 h-12 rounded-full bg-gray-300 overflow-hidden">
                          {follower.avatar_url ? (
                            <img 
                              src={follower.avatar_url} 
                              alt={follower.username || ''} 
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <Users className="w-full h-full p-2 text-gray-500" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium">{follower.full_name || follower.username || 'User'}</p>
                          {follower.username && <p className="text-sm text-gray-500">@{follower.username}</p>}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="text-center py-6 text-gray-500">No followers yet</p>
              )}
            </CardContent>
          </Card>
        )}
        
        {showFollowing && (
          <Card className="mb-8">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Following ({following.length})</CardTitle>
              <Button variant="outline" onClick={() => setShowFollowing(false)}>Close</Button>
            </CardHeader>
            <CardContent>
              {following.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {following.map(followedUser => (
                    <Link key={followedUser.id} to={`/user/${followedUser.username || followedUser.id}`}>
                      <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                        <div className="w-12 h-12 rounded-full bg-gray-300 overflow-hidden">
                          {followedUser.avatar_url ? (
                            <img 
                              src={followedUser.avatar_url} 
                              alt={followedUser.username || ''} 
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <Users className="w-full h-full p-2 text-gray-500" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium">{followedUser.full_name || followedUser.username || 'User'}</p>
                          {followedUser.username && <p className="text-sm text-gray-500">@{followedUser.username}</p>}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="text-center py-6 text-gray-500">Not following anyone yet</p>
              )}
            </CardContent>
          </Card>
        )}

        <Tabs defaultValue="projects" className="w-full max-w-4xl mx-auto">
          <TabsList className="mb-6">
            <TabsTrigger value="projects">Projects</TabsTrigger>
            <TabsTrigger value="snippets">Snippets</TabsTrigger>
          </TabsList>
          
          <TabsContent value="projects">
            <Card>
              <CardHeader>
                <CardTitle>Projects</CardTitle>
              </CardHeader>
              <CardContent>
                {projectsLoading ? (
                  <p className="text-center py-10 text-gray-500">
                    <Loader2 className="h-8 w-8 animate-spin text-devhub-purple mx-auto mb-2" />
                    Loading projects...
                  </p>
                ) : userProjects.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {userProjects.map(project => (
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
                ) : (
                  <p className="text-center py-10 text-gray-500">
                    No projects to display
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="snippets">
            <Card>
              <CardHeader>
                <CardTitle>Code Snippets</CardTitle>
              </CardHeader>
              <CardContent>
                {snippetsLoading ? (
                  <p className="text-center py-10 text-gray-500">
                    <Loader2 className="h-8 w-8 animate-spin text-devhub-purple mx-auto mb-2" />
                    Loading snippets...
                  </p>
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
                        created_at={snippet.created_at}
                      />
                    ))}
                  </div>
                ) : (
                  <p className="text-center py-10 text-gray-500">
                    No code snippets to display
                  </p>
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

export default UserProfilePage;
