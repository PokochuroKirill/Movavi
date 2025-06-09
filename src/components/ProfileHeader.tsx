
import React from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Pencil, Users, UserPlus, ExternalLink } from 'lucide-react';
import { Profile } from '@/types/database';
import VerificationBadge from './VerificationBadge';
import SocialMediaLinks from './SocialMediaLinks';

interface ProfileHeaderProps {
  profile: Profile;
  isCurrentUser: boolean;
  onEditClick: () => void;
  followersCount: number;
  followingCount: number;
  onFollowersClick: () => void;
  onFollowingClick: () => void;
  isFollowing?: boolean;
  onFollowToggle?: () => Promise<void>;
}

const ProfileHeader: React.FC<ProfileHeaderProps> = ({
  profile,
  isCurrentUser,
  onEditClick,
  followersCount,
  followingCount,
  onFollowersClick,
  onFollowingClick,
  isFollowing = false,
  onFollowToggle
}) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-8 shadow-sm border border-gray-200 dark:border-gray-700">
      <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
        <Avatar className="h-24 w-24">
          <AvatarImage src={profile.avatar_url || undefined} />
          <AvatarFallback className="text-2xl">
            {profile.full_name ? profile.full_name.substring(0, 2).toUpperCase() : 
             profile.username ? profile.username.substring(0, 2).toUpperCase() : 'UN'}
          </AvatarFallback>
        </Avatar>
        
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              {profile.full_name || profile.username || 'Пользователь'}
            </h1>
            {profile.verification_type && (
              <VerificationBadge verificationType={profile.verification_type} />
            )}
          </div>
          
          {profile.username && (
            <p className="text-gray-600 dark:text-gray-400 mb-2">@{profile.username}</p>
          )}
          
          <div className="flex items-center gap-4 mb-4">
            <button
              onClick={onFollowersClick}
              className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              <span className="font-semibold">{followersCount}</span> подписчиков
            </button>
            <button
              onClick={onFollowingClick}
              className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              <span className="font-semibold">{followingCount}</span> подписок
            </button>
          </div>
          
          {profile.bio && (
            <p className="text-gray-700 dark:text-gray-300 mb-4">{profile.bio}</p>
          )}

          <SocialMediaLinks
            github={profile.github}
            twitter={profile.twitter}
            linkedin={profile.linkedin}
            telegram={profile.telegram}
            discord={profile.discord}
            website={profile.website}
            className="mb-4"
          />
          
          {profile.is_pro && (
            <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white mb-4">
              PRO
            </Badge>
          )}
        </div>
        
        <div className="flex gap-2">
          {isCurrentUser ? (
            <Button onClick={onEditClick} variant="outline">
              <Pencil className="mr-2 h-4 w-4" />
              Редактировать профиль
            </Button>
          ) : (
            <Button 
              onClick={onFollowToggle}
              variant={isFollowing ? "outline" : "default"}
              className={!isFollowing ? "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700" : ""}
            >
              {isFollowing ? (
                <>
                  <Users className="mr-2 h-4 w-4" />
                  Отписаться
                </>
              ) : (
                <>
                  <UserPlus className="mr-2 h-4 w-4" />
                  Подписаться
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfileHeader;
