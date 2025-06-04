
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Users, Calendar, Settings, Plus, Edit, Heart, MessageCircle, Clock } from 'lucide-react';
import { Community, CommunityMember, CommunityPost } from '@/types/database';
import { formatDate } from '@/utils/dateUtils';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import CommunityPostForm from './CommunityPostForm';
import CommunityEditForm from './CommunityEditForm';
import CommunityManagementActions from './CommunityManagementActions';
import UserProfileLink from '../UserProfileLink';
import { Link } from 'react-router-dom';

interface CommunityDetailViewProps {
  community: Community | null;
  currentUserMembership?: CommunityMember | null;
  members: CommunityMember[];
  posts: CommunityPost[];
  loading: boolean;
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
  loading,
  onJoinCommunity,
  onLeaveCommunity,
  onRefresh,
  canManage,
  userId
}) => {
  const [isPostDialogOpen, setIsPostDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'likes'>('newest');

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

  // Сортировка постов
  const sortedPosts = [...posts].sort((a, b) => {
    switch (sortBy) {
      case 'newest':
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      case 'oldest':
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      case 'likes':
        return (b.likes_count || 0) - (a.likes_count || 0);
      default:
        return 0;
    }
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

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
      <Card className="overflow-hidden">
        <div 
          className="h-48 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 relative"
          style={{
            backgroundImage: community.banner_url ? `url(${community.banner_url})` : undefined,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        >
          <div className="absolute inset-0 bg-black/30" />
        </div>
        
        <CardHeader className="relative pb-4">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
            <div className="flex flex-col md:flex-row items-start gap-4">
              <Avatar className="h-24 w-24 border-4 border-white shadow-lg -mt-12 relative z-10">
                <AvatarImage src={community.avatar_url || undefined} />
                <AvatarFallback className="text-2xl bg-gradient-to-br from-blue-500 to-purple-500 text-white">
                  {community.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              
              <div className="space-y-3 flex-1">
                <div>
                  <CardTitle className="text-3xl mb-2 text-gray-900 dark:text-white">{community.name}</CardTitle>
                  <CardDescription className="text-base text-gray-600 dark:text-gray-300 leading-relaxed">
                    {community.description}
                  </CardDescription>
                </div>
                
                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    <span>{community.members_count || 0} участников</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    <span>Создано {formatDate(community.created_at)}</span>
                  </div>
                </div>

                {community.topics && community.topics.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {community.topics.map((topic, index) => (
                      <Badge key={index} variant="secondary" className="bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400">
                        {topic}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              {isCreator && (
                <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm" className="gap-2">
                      <Edit className="h-4 w-4" />
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
                    />
                  </DialogContent>
                </Dialog>
              )}

              {canManage && userId && (
                <CommunityManagementActions
                  communityId={community.id}
                  isCreator={isCreator}
                  userId={userId}
                  username={currentUserMembership?.profiles?.username || ''}
                  canManage={canManage}
                />
              )}

              {!isMember ? (
                <Button onClick={onJoinCommunity} className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white gap-2">
                  <Plus className="h-4 w-4" />
                  Присоединиться
                </Button>
              ) : !isCreator && (
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
                <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white gap-2">
                  <Plus className="h-4 w-4" />
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
          <div className="flex justify-between items-center">
            <CardTitle>Посты сообщества</CardTitle>
            <Select value={sortBy} onValueChange={(value: 'newest' | 'oldest' | 'likes') => setSortBy(value)}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Сначала новые</SelectItem>
                <SelectItem value="oldest">Сначала старые</SelectItem>
                <SelectItem value="likes">По лайкам</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {sortedPosts.length === 0 ? (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
              Пока нет постов в этом сообществе
            </div>
          ) : (
            <div className="space-y-4">
              {sortedPosts.map((post) => (
                <Link key={post.id} to={`/communities/${community.id}/posts/${post.id}`}>
                  <div className="border rounded-lg p-6 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-all duration-200 cursor-pointer hover:shadow-md">
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="font-semibold text-xl text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                        {post.title}
                      </h3>
                      <div className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400">
                        <Clock className="h-4 w-4" />
                        {formatDate(post.created_at)}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3 mb-4">
                      <UserProfileLink 
                        username={post.profiles?.username}
                        fullName={post.profiles?.full_name}
                        avatarUrl={post.profiles?.avatar_url}
                        userId={post.user_id}
                        className="text-sm"
                      />
                    </div>
                    
                    <div 
                      className="text-gray-700 dark:text-gray-300 mb-4 line-clamp-3"
                      dangerouslySetInnerHTML={{ __html: post.content }}
                    />
                    
                    <div className="flex items-center gap-6 text-sm text-gray-500 dark:text-gray-400">
                      <div className="flex items-center gap-1">
                        <Heart className="h-4 w-4" />
                        <span>{post.likes_count || 0} лайков</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MessageCircle className="h-4 w-4" />
                        <span>{post.comments_count || 0} комментариев</span>
                      </div>
                    </div>
                  </div>
                </Link>
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
              <div key={member.id} className="flex items-center gap-3 p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                <UserProfileLink 
                  username={member.profiles?.username}
                  fullName={member.profiles?.full_name}
                  avatarUrl={member.profiles?.avatar_url}
                  userId={member.user_id}
                  className="flex items-center gap-3"
                />
                <div className="ml-auto">
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
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CommunityDetailView;
