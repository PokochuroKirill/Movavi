
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Profile, Project, Snippet } from '@/types/database';
import { Loader2 } from 'lucide-react';
import ProjectCard from './ProjectCard';
import SnippetCard from './SnippetCard';
import ProfileHeader from './ProfileHeader';
import FollowersModal from './FollowersModal';

interface UserProfileViewProps {
  profile: Profile;
  isOwnProfile: boolean;
  onEditProfile?: () => void;
  onFollowToggle?: () => void;
  isFollowing?: boolean;
  followersCount: number;
  followingCount: number;
  onFollowersClick: () => void;
  onFollowingClick: () => void;
  showFollowers?: boolean;
  showFollowing?: boolean;
  followers?: Profile[];
  following?: Profile[];
  onCloseFollowers?: () => void;
  onCloseFollowing?: () => void;
  projects: Project[];
  snippets: Snippet[];
  projectsLoading: boolean;
  snippetsLoading: boolean;
  savedProjects?: Project[];
  savedSnippets?: Snippet[];
  savedLoading?: boolean;
}

const UserProfileView: React.FC<UserProfileViewProps> = ({
  profile,
  isOwnProfile,
  onEditProfile,
  onFollowToggle,
  isFollowing = false,
  followersCount,
  followingCount,
  onFollowersClick,
  onFollowingClick,
  showFollowers = false,
  showFollowing = false,
  followers = [],
  following = [],
  onCloseFollowers,
  onCloseFollowing,
  projects,
  snippets,
  projectsLoading,
  snippetsLoading,
  savedProjects = [],
  savedSnippets = [],
  savedLoading = false
}) => {
  
  const defaultTab = isOwnProfile && savedProjects.length + savedSnippets.length > 0 
    ? "favorites" 
    : "projects";
  
  return (
    <div className="space-y-6">
      {/* Profile header */}
      <ProfileHeader 
        profile={profile}
        isCurrentUser={isOwnProfile}
        onEditClick={isOwnProfile ? onEditProfile : undefined}
        followersCount={followersCount}
        followingCount={followingCount}
        onFollowersClick={onFollowersClick}
        onFollowingClick={onFollowingClick}
      />
      
      {/* Follow button for other profiles */}
      {!isOwnProfile && onFollowToggle && (
        <div className="flex justify-end mt-4">
          <Button 
            onClick={onFollowToggle}
            variant={isFollowing ? "outline" : "default"}
            className={isFollowing ? "" : "bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700"}
          >
            {isFollowing ? "Отписаться" : "Подписаться"}
          </Button>
        </div>
      )}
      
      {/* Modal windows for followers and following */}
      {showFollowers && followers && onCloseFollowers && (
        <Card className="mb-8">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Подписчики ({followers.length})</CardTitle>
            <Button variant="outline" onClick={onCloseFollowers}>Закрыть</Button>
          </CardHeader>
          <CardContent>
            <FollowersModal 
              isOpen={true}
              onClose={onCloseFollowers}
              userId={profile.id}
              type="followers"
            />
          </CardContent>
        </Card>
      )}
      
      {showFollowing && following && onCloseFollowing && (
        <Card className="mb-8">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Подписки ({following.length})</CardTitle>
            <Button variant="outline" onClick={onCloseFollowing}>Закрыть</Button>
          </CardHeader>
          <CardContent>
            <FollowersModal 
              isOpen={true}
              onClose={onCloseFollowing}
              userId={profile.id}
              type="following"
            />
          </CardContent>
        </Card>
      )}
      
      {/* Content tabs */}
      <Tabs defaultValue={defaultTab} className="w-full">
        <TabsList className="grid grid-cols-3">
          <TabsTrigger value="projects">Проекты</TabsTrigger>
          <TabsTrigger value="snippets">Сниппеты</TabsTrigger>
          {isOwnProfile && (
            <TabsTrigger value="favorites">Избранное</TabsTrigger>
          )}
        </TabsList>
        
        {/* Projects tab */}
        <TabsContent value="projects">
          {projectsLoading ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Loader2 className="h-8 w-8 animate-spin text-devhub-purple mx-auto mb-2" />
                <p className="text-gray-500">Загрузка проектов...</p>
              </CardContent>
            </Card>
          ) : projects.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.map(project => (
                <ProjectCard 
                  key={project.id}
                  id={project.id}
                  title={project.title}
                  description={project.description}
                  technologies={project.technologies || []}
                  author={project.author || project.profiles?.full_name || project.profiles?.username || 'Аноним'}
                  authorAvatar={project.authorAvatar || project.profiles?.avatar_url}
                  authorId={project.user_id}
                  authorUsername={project.profiles?.username}
                  imageUrl={project.image_url || undefined}
                />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-gray-500">
                  {isOwnProfile ? 'У вас пока нет проектов' : 'У пользователя пока нет проектов'}
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
        
        {/* Snippets tab */}
        <TabsContent value="snippets">
          {snippetsLoading ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Loader2 className="h-8 w-8 animate-spin text-devhub-purple mx-auto mb-2" />
                <p className="text-gray-500">Загрузка сниппетов...</p>
              </CardContent>
            </Card>
          ) : snippets.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {snippets.map(snippet => (
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
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-gray-500">
                  {isOwnProfile ? 'У вас пока нет сниппетов' : 'У пользователя пока нет сниппетов'}
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
        
        {/* Favorites tab (only for user's own profile) */}
        {isOwnProfile && (
          <TabsContent value="favorites">
            <div className="space-y-8">
              {/* Saved Projects */}
              <div>
                <h3 className="text-xl font-semibold mb-4">Избранные проекты</h3>
                {savedLoading ? (
                  <Card>
                    <CardContent className="py-12 text-center">
                      <Loader2 className="h-8 w-8 animate-spin text-devhub-purple mx-auto mb-2" />
                      <p className="text-gray-500">Загрузка избранных проектов...</p>
                    </CardContent>
                  </Card>
                ) : savedProjects.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {savedProjects.map(project => (
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
                        imageUrl={project.image_url || undefined}
                      />
                    ))}
                  </div>
                ) : (
                  <Card>
                    <CardContent className="py-8 text-center">
                      <p className="text-gray-500">У вас нет избранных проектов</p>
                    </CardContent>
                  </Card>
                )}
              </div>
              
              {/* Saved Snippets */}
              <div>
                <h3 className="text-xl font-semibold mb-4">Избранные сниппеты</h3>
                {savedLoading ? (
                  <Card>
                    <CardContent className="py-12 text-center">
                      <Loader2 className="h-8 w-8 animate-spin text-devhub-purple mx-auto mb-2" />
                      <p className="text-gray-500">Загрузка избранных сниппетов...</p>
                    </CardContent>
                  </Card>
                ) : savedSnippets.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {savedSnippets.map(snippet => (
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
                ) : (
                  <Card>
                    <CardContent className="py-8 text-center">
                      <p className="text-gray-500">У вас нет избранных сниппетов</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
};

export default UserProfileView;
