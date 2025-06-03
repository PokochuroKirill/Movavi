import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Calendar, Users, MessageSquare, Edit, UserMinus, AlertTriangle } from 'lucide-react';
import { Community, CommunityMember } from '@/types/database';
import { formatDateInRussian } from '@/utils/dateUtils';
import CommunityManagementActions from './CommunityManagementActions';
import CommunityEditForm from './CommunityEditForm';

interface CommunityDetailViewProps {
  community: Community | null;
  members: CommunityMember[];
  isMember: boolean;
  memberRole?: string;
  isCreator: boolean;
  isLoading: boolean;
  onJoin: () => Promise<void>;
  onLeave: () => Promise<void>;
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

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <p>Загрузка...</p>
      </div>
    );
  }

  if (!community) {
    return (
      <div className="text-center py-12">
        <h2>Сообщество не найдено</h2>
        <p>Возможно, сообщество было удалено или у вас нет доступа к нему.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Community Header */}
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
            <div className="flex-1">
              {/* Avatar and Basic Info */}
              <div className="flex items-start gap-4 mb-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={community.avatar_url || undefined} />
                  <AvatarFallback className="text-lg">
                    {community.name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <CardTitle className="text-2xl md:text-3xl mb-2">
                    {community.name}
                  </CardTitle>
                  <CardDescription className="text-base mb-4">
                    {community.description}
                  </CardDescription>
                </div>
              </div>

              {/* Topics */}
              {community.topics && community.topics.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {community.topics.map((topic, index) => (
                    <Badge key={index} variant="secondary">
                      {topic}
                    </Badge>
                  ))}
                </div>
              )}

              {/* Community Stats */}
              <div className="flex items-center gap-6 text-sm text-gray-600 dark:text-gray-400">
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <span>Создано {formatDateInRussian(community.created_at)}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  <span>{community.members_count || 0} участников</span>
                </div>
                <div className="flex items-center gap-1">
                  <MessageSquare className="h-4 w-4" />
                  <span>{community.posts_count || 0} постов</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              {isCreator && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditing(true)}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Редактировать
                </Button>
              )}
              
              {!isMember ? (
                <Button onClick={onJoin} disabled={isLoading}>
                  Присоединиться
                </Button>
              ) : !isCreator ? (
                <Button variant="outline" onClick={onLeave} disabled={isLoading}>
                  <UserMinus className="h-4 w-4 mr-2" />
                  Покинуть
                </Button>
              ) : null}

              {(isCreator || memberRole === 'moderator') && (
                <CommunityManagementActions 
                  communityId={community.id}
                  isCreator={isCreator}
                />
              )}
            </div>
          </div>
        </CardHeader>

        {/* Community Banner */}
        {community.banner_url && (
          <div className="px-6 pb-6">
            <div className="w-full h-48 rounded-lg overflow-hidden">
              <img 
                src={community.banner_url} 
                alt={community.name}
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        )}
      </Card>

      {/* Edit Form Modal */}
      {isEditing && (
        <CommunityEditForm
          community={community}
          onClose={() => setIsEditing(false)}
          onSuccess={() => {
            setIsEditing(false);
            window.location.reload();
          }}
        />
      )}

      {/* Members Section */}
      <Card>
        <CardHeader>
          <CardTitle>Участники ({members.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {members.map((member) => (
              <div key={member.id} className="flex items-center gap-3 p-3 rounded-lg border">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={member.profiles?.avatar_url || undefined} />
                  <AvatarFallback>
                    {member.profiles?.username?.charAt(0).toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="font-medium">
                    {member.profiles?.full_name || member.profiles?.username || 'Аноним'}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {member.role === 'creator' ? 'Создатель' : 
                     member.role === 'moderator' ? 'Модератор' : 'Участник'}
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
