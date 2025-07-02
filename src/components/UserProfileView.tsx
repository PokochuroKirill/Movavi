import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Profile, Project, Snippet } from '@/types/database';
import ProjectCard from './ProjectCard';
import SnippetCard from './SnippetCard';
import ProfileHeader from './ProfileHeader';
import FollowersModal from './FollowersModal';
import { useNavigate } from 'react-router-dom';
import LoaderSpinner from "@/components/ui/LoaderSpinner";

interface UserProfileViewProps {
  profile: Profile;
  isOwnProfile: boolean;
  onEditProfile: () => void;
  followersCount: number;
  followingCount: number;
  onFollowersClick: () => void;
  onFollowingClick: () => void;
  showFollowers: boolean;
  showFollowing: boolean;
  followers: Profile[];
  following: Profile[];
  onCloseFollowers: () => void;
  onCloseFollowing: () => void;
  projects: Project[];
  snippets: Snippet[];
  projectsLoading: boolean;
  snippetsLoading: boolean;
  savedProjects?: Project[];
  savedSnippets?: Snippet[];
  savedLoading?: boolean;
  onDeleteProject?: (projectId: string) => void;
  onDeleteSnippet?: (snippetId: string) => void;
  isFollowing?: boolean;
  onFollowToggle?: () => Promise<void>;
}

const UserProfileView: React.FC<UserProfileViewProps> = ({
  profile,
  isOwnProfile,
  onEditProfile,
  followersCount,
  followingCount,
  onFollowersClick,
  onFollowingClick,
  showFollowers,
  showFollowing,
  followers,
  following,
  onCloseFollowers,
  onCloseFollowing,
  projects,
  snippets,
  projectsLoading,
  snippetsLoading,
  savedProjects = [],
  savedSnippets = [],
  savedLoading = false,
  onDeleteProject,
  onDeleteSnippet,
  isFollowing = false,
  onFollowToggle
}) => {
  const navigate = useNavigate();

  return (
    <div>
      <ProfileHeader 
        profile={profile} 
        isCurrentUser={isOwnProfile}
        onEditClick={onEditProfile}
        followersCount={followersCount}
        followingCount={followingCount}
        onFollowersClick={onFollowersClick}
        onFollowingClick={onFollowingClick}
        isFollowing={isFollowing}
        onFollowToggle={onFollowToggle}
      />

      <FollowersModal
        isOpen={showFollowers}
        onClose={onCloseFollowers}
        userId={profile.id}
        type="followers"
        show={showFollowers}
        followers={followers}
        title="Подписчики"
      />
      
      <FollowersModal
        isOpen={showFollowing}
        onClose={onCloseFollowing}
        userId={profile.id}
        type="following"
        show={showFollowing}
        followers={following}
        title="Подписки"
      />
      
      <Tabs defaultValue="projects" className="mt-8">
        <TabsList className="grid grid-cols-3 w-full max-w-md mx-auto">
          <TabsTrigger value="projects">Проекты</TabsTrigger>
          <TabsTrigger value="snippets">Сниппеты</TabsTrigger>
          <TabsTrigger value="saved">Избранное</TabsTrigger>
        </TabsList>
        
        <TabsContent value="projects" className="mt-6">
          {projectsLoading ? (
            <div className="flex justify-center items-center min-h-[200px]">
              <LoaderSpinner size="lg" />
            </div>
          ) : projects.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {projects.map((project) => (
                <ProjectCard 
                  key={project.id} 
                  project={project} 
                  showDeleteButton={isOwnProfile && !!onDeleteProject}
                  onDelete={onDeleteProject}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              {isOwnProfile ? (
                <>
                  <p className="mb-4">У вас пока нет проектов</p>
                  <Button 
                    onClick={() => navigate('/projects/create')}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  >
                    Создать проект
                  </Button>
                </>
              ) : (
                <p>У этого пользователя пока нет проектов</p>
              )}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="snippets" className="mt-6">
          {snippetsLoading ? (
            <div className="flex justify-center items-center min-h-[200px]">
              <LoaderSpinner size="lg" />
            </div>
          ) : snippets.length > 0 ? (
            <div className="grid grid-cols-1 gap-4">
              {snippets.map((snippet) => (
                <SnippetCard 
                  key={snippet.id} 
                  snippet={snippet} 
                  showDeleteButton={isOwnProfile && !!onDeleteSnippet}
                  onDelete={onDeleteSnippet}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              {isOwnProfile ? (
                <>
                  <p className="mb-4">У вас пока нет сниппетов</p>
                  <Button 
                    onClick={() => navigate('/snippets/create')}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  >
                    Создать сниппет
                  </Button>
                </>
              ) : (
                <p>У этого пользователя пока нет сниппетов</p>
              )}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="saved" className="mt-6">
          {savedLoading ? (
            <div className="flex justify-center items-center min-h-[200px]">
              <LoaderSpinner size="lg" />
            </div>
          ) : (savedProjects.length > 0 || savedSnippets.length > 0) ? (
            <div className="space-y-6">
              {savedProjects.map((project) => (
                <ProjectCard key={`saved-project-${project.id}`} project={project} />
              ))}
              {savedSnippets.map((snippet) => (
                <SnippetCard key={`saved-snippet-${snippet.id}`} snippet={snippet} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <p>У вас пока нет избранных элементов</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default UserProfileView;
