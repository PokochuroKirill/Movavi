
import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { 
  Users, 
  Calendar, 
  Settings, 
  Plus, 
  UserPlus, 
  UserMinus, 
  Trash2,
  Edit,
  SortAsc,
  SortDesc
} from 'lucide-react';
import { Community, CommunityMember, CommunityPost } from '@/types/database';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/AuthContext';
import CommunityEditForm from './CommunityEditForm';
import CommunityPostForm from './CommunityPostForm';
import CommunityPostCard from './CommunityPostCard';
import { useCommunityManagement } from '@/hooks/useCommunityManagement';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

interface CommunityDetailViewProps {
  community: Community;
  members: CommunityMember[];
  posts: CommunityPost[];
  isMember: boolean;
  currentUserMembership: CommunityMember | null;
  isOwner: boolean;
  isAdmin: boolean;
  onJoin: () => void;
  onLeave: () => void;
  onUpdate: () => void;
  loading: boolean;
}

const CommunityDetailView = ({
  community,
  members,
  posts,
  isMember,
  currentUserMembership,
  isOwner,
  isAdmin,
  onJoin,
  onLeave,
  onUpdate,
  loading
}: CommunityDetailViewProps) => {
  const { user } = useAuth();
  const { deleteCommunity } = useCommunityManagement();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isPostDialogOpen, setIsPostDialogOpen] = useState(false);
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest' | 'popular'>('newest');

  const handleEditSuccess = () => {
    setIsEditDialogOpen(false);
    onUpdate();
  };

  const handlePostSuccess = () => {
    setIsPostDialogOpen(false);
    onUpdate();
  };

  const handleDeleteCommunity = async () => {
    const success = await deleteCommunity(community.id);
    if (success) {
      window.location.href = '/communities';
    }
  };

  const sortedPosts = [...posts].sort((a, b) => {
    switch (sortOrder) {
      case 'oldest':
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      case 'popular':
        return (b.likes_count || 0) - (a.likes_count || 0);
      case 'newest':
      default:
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    }
  });

  const memberRole = currentUserMembership?.role;
  const canManage = isOwner || memberRole === 'admin' || memberRole === 'moderator';

  return (
    <div className="space-y-6">
      {/* Community Header */}
      <Card className="overflow-hidden">
        {community.banner_url && (
          <div className="h-48 bg-gradient-to-r from-blue-500 to-devhub-purple relative overflow-hidden">
            <img 
              src={community.banner_url} 
              alt="Community banner" 
              className="w-full h-full object-cover"
            />
          </div>
        )}
        
        <CardHeader className="flex flex-col md:flex-row gap-4 md:items-end relative">
          <div className={`${community.banner_url ? 'absolute -top-16 left-6' : ''} rounded-full bg-white dark:bg-gray-900 p-1.5 shadow-lg`}>
            <Avatar className="h-24 w-24">
              <AvatarImage src={community.avatar_url || ''} alt={community.name} />
              <AvatarFallback className="text-4xl bg-gradient-to-br from-indigo-500 to-purple-500 text-white">
                {community.name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </div>
          
          <div className={`${community.banner_url ? 'mt-10 md:mt-0' : ''} flex-grow`}>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <h1 className="text-2xl font-bold">{community.name}</h1>
              {community.is_public ? (
                <Badge variant="outline" className="bg-green-50 text-green-600 border-green-200">
                  Публичное
                </Badge>
              ) : (
                <Badge variant="outline" className="bg-orange-50 text-orange-600 border-orange-200">
                  Приватное
                </Badge>
              )}
            </div>
            
            <p className="text-gray-600 dark:text-gray-400 mb-4">{community.description}</p>
            
            <div className="flex flex-wrap gap-4 text-sm text-gray-500">
              <div className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                <span>{community.members_count || members.length} участников</span>
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                <span>Создано {format(new Date(community.created_at), 'dd MMMM yyyy', { locale: ru })}</span>
              </div>
            </div>
          </div>
          
          <div className="flex gap-2">
            {user && !isMember && (
              <Button
                onClick={onJoin}
                disabled={loading}
                className="bg-gradient-to-r from-blue-600 to-devhub-purple hover:opacity-90"
              >
                <UserPlus className="h-4 w-4 mr-2" />
                Присоединиться
              </Button>
            )}
            
            {user && isMember && !isOwner && (
              <Button
                variant="outline"
                onClick={onLeave}
                disabled={loading}
              >
                <UserMinus className="h-4 w-4 mr-2" />
                Покинуть
              </Button>
            )}
            
            {canManage && (
              <div className="flex gap-2">
                <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Edit className="h-4 w-4 mr-2" />
                      Редактировать
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Редактировать сообщество</DialogTitle>
                    </DialogHeader>
                    <CommunityEditForm 
                      community={community}
                      onUpdate={handleEditSuccess}
                      onCancel={() => setIsEditDialogOpen(false)}
                    />
                  </DialogContent>
                </Dialog>
                
                {isOwner && (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" size="sm">
                        <Trash2 className="h-4 w-4 mr-2" />
                        Удалить
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Удалить сообщество?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Это действие нельзя отменить. Все посты и участники будут удалены.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Отмена</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDeleteCommunity}>
                          Удалить
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}
              </div>
            )}
          </div>
        </CardHeader>
      </Card>

      {/* Topics */}
      {community.topics && community.topics.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Темы</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {community.topics.map((topic, index) => (
                <Badge key={index} variant="secondary">
                  {topic}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Posts Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Посты</CardTitle>
            <div className="flex items-center gap-2">
              <Select value={sortOrder} onValueChange={(value: any) => setSortOrder(value)}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Новые</SelectItem>
                  <SelectItem value="oldest">Старые</SelectItem>
                  <SelectItem value="popular">Популярные</SelectItem>
                </SelectContent>
              </Select>
              
              {isMember && (
                <Dialog open={isPostDialogOpen} onOpenChange={setIsPostDialogOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Создать пост
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Создать новый пост</DialogTitle>
                    </DialogHeader>
                    <CommunityPostForm 
                      communityId={community.id}
                      onPostCreated={handlePostSuccess}
                    />
                  </DialogContent>
                </Dialog>
              )}
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          {sortedPosts.length > 0 ? (
            <div className="space-y-4">
              {sortedPosts.map((post) => (
                <CommunityPostCard 
                  key={post.id} 
                  post={post} 
                  communityId={community.id}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p>В этом сообществе пока нет постов</p>
              {isMember && (
                <p className="text-sm mt-2">Будьте первым, кто создаст пост!</p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Members Section */}
      <Card>
        <CardHeader>
          <CardTitle>Участники ({members.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {members.slice(0, 12).map((member) => (
              <div key={member.id} className="flex items-center gap-3 p-3 rounded-lg border">
                <Avatar>
                  <AvatarImage src={member.profiles?.avatar_url || ''} />
                  <AvatarFallback>
                    {(member.profiles?.full_name || member.profiles?.username || 'U').charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">
                    {member.profiles?.full_name || member.profiles?.username || 'Неизвестный пользователь'}
                  </p>
                  <Badge variant="outline" className="text-xs">
                    {member.role === 'owner' ? 'Владелец' : 
                     member.role === 'admin' ? 'Администратор' : 
                     member.role === 'moderator' ? 'Модератор' : 'Участник'}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
          {members.length > 12 && (
            <p className="text-center text-sm text-gray-500 mt-4">
              И еще {members.length - 12} участников...
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CommunityDetailView;
