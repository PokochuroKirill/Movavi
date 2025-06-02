
import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Users, 
  MessageSquare, 
  Calendar, 
  Plus, 
  UserPlus, 
  UserMinus, 
  Shield, 
  Lock,
  Trash2 
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { Community, CommunityMember } from '@/types/database';
import { formatDistanceToNow } from 'date-fns';
import { ru } from 'date-fns/locale';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import CommunityManagementActions from './CommunityManagementActions';
import { useAuth } from '@/contexts/AuthContext';

interface CommunityDetailViewProps {
  community: Community | null;
  members: CommunityMember[];
  isMember: boolean;
  memberRole: string | null;
  isCreator: boolean;
  isLoading: boolean;
  onJoin: () => void;
  onLeave: () => void;
}

const CommunityDetailView: React.FC<CommunityDetailViewProps> = ({
  community,
  members,
  isMember,
  memberRole,
  isCreator,
  isLoading,
  onJoin,
  onLeave
}) => {
  const { user } = useAuth();

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-64 w-full" />
        <div className="flex items-center gap-4">
          <Skeleton className="h-12 w-12 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
        </div>
      </div>
    );
  }

  if (!community) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold mb-2">Сообщество не найдено</h2>
        <p className="text-gray-500 dark:text-gray-400 mb-4">
          Запрошенное сообщество не существует или было удалено
        </p>
        <Link to="/communities">
          <Button>Вернуться к списку сообществ</Button>
        </Link>
      </div>
    );
  }

  const canManage = memberRole === 'admin' || memberRole === 'moderator' || isCreator;

  return (
    <div className="space-y-6">
      {/* Community header */}
      <div className="relative">
        {/* Banner */}
        <div className="h-48 bg-gradient-to-r from-blue-600 to-devhub-purple rounded-lg overflow-hidden">
          {community.banner_url && (
            <img 
              src={community.banner_url} 
              alt={`${community.name} banner`} 
              className="w-full h-full object-cover"
            />
          )}
        </div>

        {/* Community info overlay */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-6 text-white">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16 border-4 border-white">
              <AvatarImage src={community.avatar_url || ''} alt={community.name} />
              <AvatarFallback className="text-2xl bg-blue-600">
                {community.name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold">{community.name}</h1>
                {!community.is_public && (
                  <Badge variant="outline" className="border-amber-500 text-amber-500">
                    <Lock className="h-3 w-3 mr-1" /> Частное
                  </Badge>
                )}
              </div>
              <div className="text-sm text-gray-200 flex items-center gap-4 mt-1">
                <div className="flex items-center">
                  <Users className="h-4 w-4 mr-1" />
                  {community.members_count || members.length} участников
                </div>
                <div className="flex items-center">
                  <MessageSquare className="h-4 w-4 mr-1" />
                  {community.posts_count || 0} постов
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Action bar */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          {community.creator?.username && (
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Создатель: {community.creator.full_name || community.creator.username}
            </div>
          )}
          <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center">
            <Calendar className="h-4 w-4 mr-1" />
            Создано {formatDistanceToNow(new Date(community.created_at), { addSuffix: true, locale: ru })}
          </div>
        </div>
        
        <div className="flex gap-2">
          {isMember ? (
            <>
              <Link to={`/communities/${community.id}/post/create`}>
                <Button>
                  <Plus className="h-4 w-4 mr-1" />
                  Создать пост
                </Button>
              </Link>
              {isCreator ? (
                <CommunityManagementActions
                  communityId={community.id}
                  userId={user?.id || ''}
                  username="Сообщество"
                  isCreator={true}
                  canManage={true}
                />
              ) : (
                <Button variant="outline" onClick={onLeave}>
                  <UserMinus className="h-4 w-4 mr-1" />
                  Покинуть
                </Button>
              )}
            </>
          ) : (
            <Button onClick={onJoin}>
              <UserPlus className="h-4 w-4 mr-1" />
              Присоединиться
            </Button>
          )}
        </div>
      </div>

      <Separator />

      <Tabs defaultValue="about" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="about">О сообществе</TabsTrigger>
          <TabsTrigger value="members">Участники</TabsTrigger>
          <TabsTrigger value="posts">Посты</TabsTrigger>
        </TabsList>
        
        <TabsContent value="about">
          <Card>
            <CardHeader>
              <CardTitle>Описание</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                {community.description}
              </p>
              
              {community.topics && community.topics.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-lg font-medium mb-2">Темы</h3>
                  <div className="flex flex-wrap gap-2">
                    {community.topics.map((topic, index) => (
                      <Badge key={index} variant="secondary">
                        {topic}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="members">
          <Card>
            <CardHeader>
              <CardTitle>Участники сообщества</CardTitle>
              <CardDescription>
                Всего участников: {community.members_count || members.length}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {members.map((member) => (
                  <div key={member.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={member.profiles?.avatar_url || ''} alt={member.profiles?.username || ''} />
                        <AvatarFallback>
                          {(member.profiles?.username?.[0] || 'U').toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <Link to={`/user/${member.profiles?.username}`} className="font-medium hover:underline">
                          {member.profiles?.full_name || member.profiles?.username || 'Пользователь'}
                        </Link>
                        <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
                          {member.role === 'admin' && (
                            <Badge variant="outline" className="border-blue-500 text-blue-500">
                              <Shield className="h-3 w-3 mr-1" /> Администратор
                            </Badge>
                          )}
                          {member.role === 'moderator' && (
                            <Badge variant="outline" className="border-green-500 text-green-500">
                              <Shield className="h-3 w-3 mr-1" /> Модератор
                            </Badge>
                          )}
                          {member.role === 'member' && (
                            <span>Участник</span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {member.user_id === community.creator_id && (
                        <Badge variant="outline" className="border-purple-500 text-purple-500">Создатель</Badge>
                      )}
                      {canManage && member.user_id !== community.creator_id && member.user_id !== user?.id && (
                        <CommunityManagementActions
                          communityId={community.id}
                          userId={member.user_id}
                          username={member.profiles?.username || 'Пользователь'}
                          isCreator={false}
                          canManage={true}
                        />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="posts">
          <div className="space-y-4">
            {isMember ? (
              <>
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold">Посты сообщества</h2>
                  <Link to={`/communities/${community.id}/post/create`}>
                    <Button>
                      <Plus className="h-4 w-4 mr-1" /> Создать пост
                    </Button>
                  </Link>
                </div>

                <div className="rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 p-6 text-center">
                  <MessageSquare className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium mb-2">Будьте первым, кто поделится контентом</h3>
                  <p className="text-gray-500 dark:text-gray-400 mb-4">
                    Создайте новый пост, чтобы начать обсуждение в этом сообществе
                  </p>
                  <Link to={`/communities/${community.id}/post/create`}>
                    <Button>
                      <Plus className="h-4 w-4 mr-1" /> Создать пост
                    </Button>
                  </Link>
                </div>
              </>
            ) : (
              <div className="rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 p-6 text-center">
                <Lock className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium mb-2">Присоединитесь к сообществу</h3>
                <p className="text-gray-500 dark:text-gray-400 mb-4">
                  Чтобы просматривать и создавать посты, вам необходимо присоединиться к сообществу
                </p>
                <Button onClick={onJoin}>
                  <UserPlus className="h-4 w-4 mr-1" /> Присоединиться
                </Button>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CommunityDetailView;
