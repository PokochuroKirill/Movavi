
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Users, Calendar, Settings, Plus, Edit } from 'lucide-react';
import { Community, CommunityMember, CommunityPost } from '@/types/database';
import { formatDate } from '@/utils/dateUtils';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import CommunityPostForm from './CommunityPostForm';
import CommunityEditForm from './CommunityEditForm';
import CommunityManagementActions from './CommunityManagementActions';

interface CommunityDetailViewProps {
  community: Community | null;
  currentUserMembership?: CommunityMember | null;
  members: CommunityMember[];
  posts: CommunityPost[];
  isLoading: boolean;
  onJoinCommunity: () => void;
  onLeaveCommunity: () => void;
  onRefresh: () => void;
  canManage: boolean;
  userId?: string;
}

const CommunityDetailView: React.FC<CommunityDetailViewProps> = ({
  community,
  currentUserMembership,
  members,
  posts,
  isLoading,
  onJoinCommunity,
  onLeaveCommunity,
  onRefresh,
  canManage,
  userId
}) => {
  const [isPostDialogOpen, setIsPostDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  // Add null safety checks
  const isCreator = userId && community ? userId === community.creator_id : false;
  const isMember = !!currentUserMembership;

  const handlePostSuccess = () => {
    setIsPostDialogOpen(false);
    onRefresh();
  };

  const handleEditSuccess = () => {
    setIsEditDialogOpen(false);
    onRefresh();
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Add null check for community
  if (!community) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Сообщество не найдено
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          Возможно, сообщество было удалено или у вас нет доступа к нему.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Community Header */}
      <Card>
        <div 
          className="h-48 bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 rounded-t-lg relative"
          style={{
            backgroundImage: community.banner_url ? `url(${community.banner_url})` : undefined,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        >
          <div className="absolute inset-0 bg-black/20 rounded-t-lg" />
        </div>
        
        <CardHeader className="relative">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <Avatar className="h-20 w-20 border-4 border-white -mt-10 relative z-10">
                <AvatarImage src={community.avatar_url || undefined} />
                <AvatarFallback className="text-2xl">
                  {community.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              
              <div className="mt-2">
                <CardTitle className="text-3xl mb-2">{community.name}</CardTitle>
                <CardDescription className="text-base max-w-2xl">
                  {community.description}
                </CardDescription>
                
                <div className="flex items-center gap-4 mt-4 text-sm text-gray-600 dark:text-gray-400">
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    <span>{community.members_count || 0} участников</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    <span>Создано {formatDate(community.created_at)}</span>
                  </div>
                </div>

                {/* Topics */}
                {community.topics && community.topics.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-4">
                    {community.topics.map((topic, index) => (
                      <Badge key={index} variant="secondary">
                        {topic}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 mt-2">
              {/* Edit Button - только для создателя */}
              {isCreator && (
                <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Edit className="h-4 w-4 mr-1" />
                      Редактировать
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
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
              )}

              {/* Management Actions */}
              {canManage && userId && (
                <CommunityManagementActions
                  communityId={community.id}
                  isCreator={isCreator}
                  userId={userId}
                  username={currentUserMembership?.profiles?.username || ''}
                  canManage={canManage}
                />
              )}

              {/* Join/Leave Button */}
              {!isMember ? (
                <Button onClick={onJoinCommunity} className="gradient-bg text-white">
                  <Plus className="h-4 w-4 mr-1" />
                  Присоединиться
                </Button>
              ) : (
                <Button onClick={onLeaveCommunity} variant="outline">
                  Покинуть
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Create Post Section */}
      {isMember && (
        <Card>
          <CardContent className="pt-6">
            <Dialog open={isPostDialogOpen} onOpenChange={setIsPostDialogOpen}>
              <DialogTrigger asChild>
                <Button className="w-full gradient-bg text-white">
                  <Plus className="h-4 w-4 mr-2" />
                  Создать пост
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Создать пост в сообществе</DialogTitle>
                </DialogHeader>
                <CommunityPostForm 
                  communityId={community.id}
                  onPostCreated={handlePostSuccess}
                />
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>
      )}

      {/* Posts Section */}
      <Card>
        <CardHeader>
          <CardTitle>Посты сообщества</CardTitle>
        </CardHeader>
        <CardContent>
          {posts.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              Пока нет постов в этом сообществе
            </div>
          ) : (
            <div className="space-y-4">
              {posts.map((post) => (
                <div key={post.id} className="border rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-lg">{post.title}</h3>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {formatDate(post.created_at)}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2 mb-3">
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={post.profiles?.avatar_url || undefined} />
                      <AvatarFallback>
                        {post.profiles?.username?.charAt(0).toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {post.profiles?.full_name || post.profiles?.username || 'Аноним'}
                    </span>
                  </div>
                  
                  <p className="text-gray-700 dark:text-gray-300 line-clamp-3">
                    {post.content}
                  </p>
                  
                  <div className="flex items-center gap-4 mt-3 text-sm text-gray-500 dark:text-gray-400">
                    <span>{post.likes_count || 0} лайков</span>
                    <span>{post.comments_count || 0} комментариев</span>
                  </div>
                </div>
              ))}
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
            {members.map((member) => (
              <div key={member.id} className="flex items-center gap-3 p-3 border rounded-lg">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={member.profiles?.avatar_url || undefined} />
                  <AvatarFallback>
                    {member.profiles?.username?.charAt(0).toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">
                    {member.profiles?.full_name || member.profiles?.username || 'Аноним'}
                  </p>
                  <div className="flex items-center gap-2">
                    <Badge 
                      variant={
                        member.user_id === community.creator_id ? "default" : 
                        member.role === "admin" ? "destructive" : 
                        member.role === "moderator" ? "secondary" : "outline"
                      }
                      className="text-xs"
                    >
                      {member.user_id === community.creator_id ? "Создатель" : 
                       member.role === "admin" ? "Админ" : 
                       member.role === "moderator" ? "Модератор" : "Участник"}
                    </Badge>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CommunityDetailView;
