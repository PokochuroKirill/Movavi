
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Pencil, Trash2, AlertCircle } from 'lucide-react';
import { Profile, Project, Snippet } from '@/types/database';
import ProjectCard from './ProjectCard';
import SnippetCard from './SnippetCard';
import FollowersModal from './FollowersModal';
import ProfileHeader from './ProfileHeader';
import { useNavigate } from 'react-router-dom';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from '@/components/ui/dialog';

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
  onDeleteSnippet
}) => {
  const navigate = useNavigate();
  const [projectToDelete, setProjectToDelete] = useState<string | null>(null);
  const [snippetToDelete, setSnippetToDelete] = useState<string | null>(null);

  return (
    <div>
      <ProfileHeader 
        profile={profile} 
        isOwnProfile={isOwnProfile}
        onEditProfile={onEditProfile}
        followersCount={followersCount}
        followingCount={followingCount}
        onFollowersClick={onFollowersClick}
        onFollowingClick={onFollowingClick}
      />

      <FollowersModal 
        show={showFollowers} 
        followers={followers} 
        onClose={onCloseFollowers} 
        title="Подписчики" 
      />
      
      <FollowersModal 
        show={showFollowing} 
        followers={following} 
        onClose={onCloseFollowing} 
        title="Подписки" 
      />
      
      <Tabs defaultValue="projects" className="mt-8">
        <TabsList className="grid grid-cols-4 w-full max-w-md mx-auto">
          <TabsTrigger value="projects">Проекты</TabsTrigger>
          <TabsTrigger value="snippets">Сниппеты</TabsTrigger>
          <TabsTrigger value="saved">Избранное</TabsTrigger>
          <TabsTrigger value="about">Обо мне</TabsTrigger>
        </TabsList>
        
        <TabsContent value="projects" className="mt-6">
          {projectsLoading ? (
            <div className="flex justify-center items-center min-h-[200px]">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          ) : projects.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {projects.map((project) => (
                <div key={project.id} className="relative">
                  <ProjectCard project={project} />
                  
                  {isOwnProfile && onDeleteProject && (
                    <Button
                      variant="destructive"
                      size="sm"
                      className="absolute top-2 right-2 p-2 h-auto"
                      onClick={() => setProjectToDelete(project.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
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
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          ) : snippets.length > 0 ? (
            <div className="grid grid-cols-1 gap-4">
              {snippets.map((snippet) => (
                <div key={snippet.id} className="relative">
                  <SnippetCard snippet={snippet} />
                  
                  {isOwnProfile && onDeleteSnippet && (
                    <Button
                      variant="destructive"
                      size="sm"
                      className="absolute top-2 right-2 p-2 h-auto"
                      onClick={() => setSnippetToDelete(snippet.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
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
          <Tabs defaultValue="saved-projects">
            <TabsList className="mb-4">
              <TabsTrigger value="saved-projects">Проекты</TabsTrigger>
              <TabsTrigger value="saved-snippets">Сниппеты</TabsTrigger>
            </TabsList>
            
            <TabsContent value="saved-projects">
              {savedLoading ? (
                <div className="flex justify-center items-center min-h-[200px]">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                </div>
              ) : savedProjects.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {savedProjects.map((project) => (
                    <ProjectCard key={project.id} project={project} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <p>У вас пока нет избранных проектов</p>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="saved-snippets">
              {savedLoading ? (
                <div className="flex justify-center items-center min-h-[200px]">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                </div>
              ) : savedSnippets.length > 0 ? (
                <div className="grid grid-cols-1 gap-4">
                  {savedSnippets.map((snippet) => (
                    <SnippetCard key={snippet.id} snippet={snippet} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <p>У вас пока нет избранных сниппетов</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </TabsContent>
        
        <TabsContent value="about" className="mt-6">
          <Card className="p-6">
            {profile.bio ? (
              <div className="prose dark:prose-invert max-w-none">
                <h2>Обо мне</h2>
                <p>{profile.bio}</p>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                {isOwnProfile ? (
                  <div>
                    <p className="mb-4">Вы еще не добавили информацию о себе</p>
                    <Button 
                      onClick={onEditProfile}
                      className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                    >
                      <Pencil className="mr-2 h-4 w-4" />
                      Редактировать профиль
                    </Button>
                  </div>
                ) : (
                  <p>Пользователь еще не добавил информацию о себе</p>
                )}
              </div>
            )}
          </Card>
        </TabsContent>
      </Tabs>

      {/* Диалог подтверждения удаления проекта */}
      <Dialog open={!!projectToDelete} onOpenChange={() => setProjectToDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Подтверждение удаления</DialogTitle>
            <DialogDescription>
              Вы уверены, что хотите удалить этот проект? Это действие нельзя отменить.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setProjectToDelete(null)}>
              Отмена
            </Button>
            <Button 
              variant="destructive" 
              onClick={() => {
                onDeleteProject?.(projectToDelete!);
                setProjectToDelete(null);
              }}
            >
              Удалить
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Диалог подтверждения удаления сниппета */}
      <Dialog open={!!snippetToDelete} onOpenChange={() => setSnippetToDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Подтверждение удаления</DialogTitle>
            <DialogDescription>
              Вы уверены, что хотите удалить этот сниппет? Это действие нельзя отменить.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSnippetToDelete(null)}>
              Отмена
            </Button>
            <Button 
              variant="destructive" 
              onClick={() => {
                onDeleteSnippet?.(snippetToDelete!);
                setSnippetToDelete(null);
              }}
            >
              Удалить
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UserProfileView;
