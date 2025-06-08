
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Users, Calendar, MessageCircle, Heart, Plus, Settings, Edit } from 'lucide-react';
import { Community, CommunityMember, CommunityPost } from '@/types/database';
import { formatDistanceToNow } from 'date-fns';
import { ru } from 'date-fns/locale';
import { Link } from 'react-router-dom';
import CreateCommunityPostDialog from './CreateCommunityPostDialog';
import CommunityEditForm from './CommunityEditForm';

interface CommunityDetailViewProps {
  community: Community | null;
  currentUserMembership: CommunityMember | null;
  members: CommunityMember[];
  posts: CommunityPost[];
  loading: boolean;
  onJoinCommunity: () => Promise<void>;
  onLeaveCommunity: () => Promise<void>;
  onRefresh: () => Promise<void>;
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
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);

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
        <h1 className="text-2xl font-bold text-red-600">Сообщество не найдено</h1>
        <p className="text-gray-600 mt-2">Возможно, сообщество было удалено или не существует</p>
      </div>
    );
  }

  const handlePostCreated = async () => {
    setShowCreatePost(false);
    await onRefresh();
  };

  const handleCommunityUpdated = async () => {
    setShowEditDialog(false);
    await onRefresh();
  };

  return (
    <div className="space-y-8">
      {/* Заголовок сообщества */}
      <Card>
        <CardContent className="pt-6">
          {community.banner_url && (
            <div className="h-48 rounded-lg overflow-hidden mb-6">
              <img 
                src={community.banner_url} 
                alt={community.name}
                className="w-full h-full object-cover"
              />
            </div>
          )}
          
          <div className="flex flex-col md:flex-row gap-6">
            <Avatar className="h-20 w-20">
              <AvatarImage src={community.avatar_url || undefined} />
              <AvatarFallback className="text-2xl">
                {community.name.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                <div>
                  <h1 className="text-3xl font-bold mb-2">{community.name}</h1>
                  <p className="text-gray-600 dark:text-gray-300 mb-4">
                    {community.description}
                  </p>
                  
                  <div className="flex flex-wrap gap-2 mb-4">
                    {community.topics?.map((topic, index) => (
                      <Badge key={index} variant="outline">{topic}</Badge>
                    ))}
                  </div>
                  
                  <div className="flex items-center gap-6 text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      <span>{community.members_count || 0} участников</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MessageCircle className="h-4 w-4" />
                      <span>{community.posts_count || 0} постов</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      <span>
                        Создано {formatDistanceToNow(new Date(community.created_at), { 
                          addSuffix: true, 
                          locale: ru 
                        })}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  {userId && currentUserMembership ? (
                    <>
                      <Button
                        onClick={() => setShowCreatePost(true)}
                        className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Создать пост
                      </Button>
                      <Button
                        variant="outline"
                        onClick={onLeaveCommunity}
                      >
                        Покинуть
                      </Button>
                      {canManage && (
                        <Button 
                          variant="outline" 
                          size="icon"
                          onClick={() => setShowEditDialog(true)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      )}
                    </>
                  ) : userId ? (
                    <Button
                      onClick={onJoinCommunity}
                      className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                    >
                      Присоединиться
                    </Button>
                  ) : null}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Контент сообщества */}
      <Tabs defaultValue="posts" className="w-full">
        <TabsList>
          <TabsTrigger value="posts">Посты</TabsTrigger>
          <TabsTrigger value="members">Участники</TabsTrigger>
        </TabsList>
        
        <TabsContent value="posts" className="mt-6">
          {posts.length > 0 ? (
            <div className="space-y-8">
              {posts.map((post) => (
                <Link 
                  key={post.id} 
                  to={`/communities/${community.id}/posts/${post.id}`}
                >
                  <Card className="hover:shadow-md transition-shadow cursor-pointer">
                    <CardHeader>
                      <div className="flex items-start gap-4">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={post.profiles?.avatar_url || undefined} />
                          <AvatarFallback>
                            {post.profiles?.full_name?.substring(0, 2) || 
                             post.profiles?.username?.substring(0, 2) || 'UN'}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-semibold">
                              {post.profiles?.full_name || post.profiles?.username || 'Пользователь'}
                            </h4>
                            <span className="text-gray-500 text-sm">
                              {formatDistanceToNow(new Date(post.created_at), { 
                                addSuffix: true, 
                                locale: ru 
                              })}
                            </span>
                          </div>
                          <CardTitle className="text-lg mb-2">{post.title}</CardTitle>
                          <p className="text-gray-600 dark:text-gray-300 line-clamp-2">
                            {post.content}
                          </p>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <Heart className="h-4 w-4" />
                          <span>{post.likes_count || 0}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <MessageCircle className="h-4 w-4" />
                          <span>{post.comments_count || 0}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-gray-500 mb-4">
                  В сообществе пока нет постов
                </p>
                {currentUserMembership && (
                  <Button
                    onClick={() => setShowCreatePost(true)}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Создать первый пост
                  </Button>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>
        
        <TabsContent value="members" className="mt-6">
          <div className="grid gap-4">
            {members.map((member) => (
              <Card key={member.id}>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={member.profiles?.avatar_url || undefined} />
                        <AvatarFallback>
                          {member.profiles?.full_name?.substring(0, 2) || 
                           member.profiles?.username?.substring(0, 2) || 'UN'}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h4 className="font-semibold">
                          {member.profiles?.full_name || member.profiles?.username || 'Пользователь'}
                        </h4>
                        {member.profiles?.username && (
                          <p className="text-sm text-gray-500">@{member.profiles.username}</p>
                        )}
                      </div>
                    </div>
                    <Badge variant={member.role === 'admin' ? 'default' : 'secondary'}>
                      {member.role === 'admin' ? 'Администратор' : 
                       member.role === 'moderator' ? 'Модератор' : 'Участник'}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Диалог создания поста */}
      <CreateCommunityPostDialog
        open={showCreatePost}
        onClose={() => setShowCreatePost(false)}
        communityId={community.id}
        onPostCreated={handlePostCreated}
      />

      {/* Диалог редактирования сообщества */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Редактировать сообщество</DialogTitle>
          </DialogHeader>
          <CommunityEditForm
            community={community}
            onUpdate={handleCommunityUpdated}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CommunityDetailView;
