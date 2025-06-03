
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Calendar, Users, FileText, Settings, Plus, Edit } from 'lucide-react';
import { Community, CommunityMember } from '@/types/database';
import { formatDate } from '@/utils/dateUtils';
import CommunityManagementActions from './CommunityManagementActions';
import CommunityEditForm from './CommunityEditForm';
import { useNavigate } from 'react-router-dom';

interface CommunityDetailViewProps {
  community: Community | null;
  members: CommunityMember[];
  isMember: boolean;
  memberRole?: string;
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
  const [isEditing, setIsEditing] = useState(false);
  const navigate = useNavigate();

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
  };

  const handleUpdateComplete = () => {
    setIsEditing(false);
    // Обновление произойдет через refetch в родительском компоненте
    window.location.reload();
  };

  if (isLoading) {
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
        <p className="text-gray-600 dark:text-gray-400">
          Возможно, сообщество было удалено или у вас нет доступа к нему.
        </p>
      </div>
    );
  }

  if (isEditing) {
    return (
      <CommunityEditForm
        community={community}
        onUpdate={handleUpdateComplete}
        onCancel={handleEditToggle}
      />
    );
  }

  const canManage = isCreator || memberRole === 'admin' || memberRole === 'moderator';

  return (
    <div className="space-y-6">
      {/* Баннер сообщества */}
      {community.banner_url && (
        <div className="w-full h-48 md:h-64 rounded-lg overflow-hidden">
          <img 
            src={community.banner_url} 
            alt={`Баннер ${community.name}`}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {/* Основная информация о сообществе */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={community.avatar_url || undefined} />
                <AvatarFallback className="text-lg">
                  {community.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="text-2xl mb-2">{community.name}</CardTitle>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  {community.description}
                </p>
                
                {/* Темы сообщества */}
                {community.topics && community.topics.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {community.topics.map((topic, index) => (
                      <Badge key={index} variant="secondary">
                        {topic}
                      </Badge>
                    ))}
                  </div>
                )}

                {/* Статистика */}
                <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    <span>{community.members_count || 0} участников</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <FileText className="h-4 w-4" />
                    <span>{community.posts_count || 0} постов</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    <span>Создано {formatDate(community.created_at)}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Кнопка редактирования для создателя */}
              {isCreator && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleEditToggle}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Редактировать
                </Button>
              )}

              {/* Кнопка управления */}
              {canManage && (
                <CommunityManagementActions
                  communityId={community.id}
                  userId={community.creator_id}
                  username={community.creator?.username || 'Пользователь'}
                  isCreator={isCreator}
                  canManage={canManage}
                />
              )}

              {/* Кнопки вступления/выхода */}
              {!isCreator && (
                isMember ? (
                  <Button variant="outline" onClick={onLeave}>
                    Покинуть сообщество
                  </Button>
                ) : (
                  <Button onClick={onJoin} className="gradient-bg text-white">
                    Присоединиться
                  </Button>
                )
              )}

              {/* Кнопка создания поста */}
              {isMember && (
                <Button 
                  onClick={() => navigate(`/communities/${community.id}/create-post`)}
                  className="gradient-bg text-white"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Создать пост
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Информация о создателе */}
      {community.creator && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Создатель сообщества</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <Avatar>
                <AvatarImage src={community.creator.avatar_url || undefined} />
                <AvatarFallback>
                  {community.creator.username?.charAt(0).toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">
                  {community.creator.full_name || community.creator.username}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  @{community.creator.username}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Список участников */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            Участники ({members.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {members.map((member) => (
              <div key={member.id} className="flex items-center gap-3 p-3 rounded-lg border">
                <Avatar>
                  <AvatarImage src={member.profiles?.avatar_url || undefined} />
                  <AvatarFallback>
                    {member.profiles?.username?.charAt(0).toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="font-medium text-sm">
                    {member.profiles?.full_name || member.profiles?.username}
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    @{member.profiles?.username}
                  </p>
                  <Badge variant="outline" className="text-xs mt-1">
                    {member.role === 'admin' ? 'Администратор' : 
                     member.role === 'moderator' ? 'Модератор' : 'Участник'}
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
